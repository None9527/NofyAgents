/* eslint-disable */
/**
 * ============================================================================
 * SettingsPanelsCapability.tsx — ZCode 3.7.6 Settings 大体量叶子分区（D8 Stage B3 · 第二批）
 *   技能（y1t）/ 子代理（H1t）/ 插件（I0t）/ 命令（G0t）/ Hooks（p2t）/ 自动化（d6）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 前序产物：Settings.tsx / Settings.report.md §1.2（本文件实体化其接口级叶子）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 * A. 技能分区（y1t，js 195992–197541 / jsx 157604–157969）
 *   y1t  → SkillsSettingsSection          分区根 (195992 / 157604)
 *   m1t  → skillEnabledFilterMatch        (195926 / 157535)
 *   h1t  → ResourceEnabledFilterSelect    (195930 / 157538)
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
 *   H1t  → SubagentsSettingsSection       分区根 (197542 / 158526)
 *   （接口级）：n9 SubagentRow (jsx 158134)、B1t BuiltInModelOverrideControl (jsx 158196)、
 *    V1t SubagentConfigForm (jsx 158301)、w1t 排序 (157977)、X7 isUserManaged (157980)、
 *    E1t builtInNameOf (157986)、D1t/O1t/k1t/A1t/j1t/M1t/N1t/P1t/Z7/Q7/F1t/$7/e9/I1t/t9
 *    助手群 (157989–158113)、L1t groupSubagents (158114)、Jq useWorkspaceConfigOptions、
 *    Hq buildModelSelectGroups、De subagents 能力刷新（跨 chunk）
 *
 * C. 插件分区（I0t，js 199994–200497 / jsx 159986–160319）
 *   I0t  → PluginsSettingsSection         分区根 (199994 / 159986)
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
 *   G0t  → CommandsSettingsSection        分区根 (200852 / 160523)
 *   L0t  → useCommandsStoreBridge         (200503 / 160320)
 *   m9   → isUserManagedCommand           (jsx 160369)
 *   R0t  → CommandScopeBadge              (jsx 160372)
 *   z0t  → CommandRow                     (200556 / 160383)
 *   B0t  → COMMAND_NAME_PATTERN          (jsx 160404)
 *   h9   → CommandFormLabel               (jsx 160407)
 *   U0t  → CommandStorageLevelSelect      (jsx 160412)
 *   W0t  → CommandForm                    (200703 / 160448)
 *   （接口级）：F6 commands store (142754)、ki/ft 命令类型守卫（跨 chunk）、
 *    Kte agentSource 常量、ZQt 命令分组 (jsx 155568)
 *
 * E. Hooks 分区（p2t，js 202032–202285 / jsx 161468–161624）
 *   p2t  → HooksSettingsSection           分区根 (202032 / 161468)
 *   t2t  → HookForm                       (201390 / 161023)
 *   Q0t  → FormLabelSlot                  (jsx 161013)
 *   $0t  → HOOK_EVENTS                    (jsx 161019)
 *   e2t  → customJsonOf                   (jsx 161020)
 *   y9   → HookFormField                  (jsx 161229)
 *   n2t  → HOOK_EVENT_ORDER               (jsx 161236)
 *   r2t  → HookScopeTabs                  (jsx 161237)
 *   i2t  → HookListByEvent                (201771 / 161256)
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
 *   d6   → AutomationsMain                分区根 (138823 / 115911)
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
 *   ZNt  → AutomationRowActionMenu        (138713 / 115876)
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

import * as React from "react";
import { LoaderCircle as SpinnerIcon, RefreshCw as RefreshIcon, PlusIcon, Trash2 as TrashIcon, PencilIcon, ExternalLinkIcon, ChevronDownIcon, CheckIcon, DownloadIcon, FolderOpenIcon, SearchIcon, TriangleAlert as AlertIcon, Settings2 as SettingsIcon, EllipsisIcon, PlayIcon, RotateCcw as RotateIcon, PauseIcon, PlayCircle as ResumeIcon, SquarePen as EditIcon, CircleCheck as AutomationStatusCompletedIcon, TriangleAlert as AutomationStatusFailedIcon, Sparkles as SkillIcon, SquareTerminal as CommandIcon, Bot as SubagentIcon, UserRound as UserScopeIcon, InfoIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { Button, ChevronRight as ChevronRightIcon } from './button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk；A0-S3b 增补：ChevronRight as ChevronRightIcon（button chunk 图标，pass-1 同源）
import { registerWorkspaceTask } from './FileTreePanel';
import { Input, Textarea, toast } from './ImeComposition';
import { splitCommandsByScope, splitSkillsByScope } from './McpHelpers';
import { RemoteSyncDialogs } from './Modals';
import { Badge } from './PaymentDeep';
import { BackLinkButton, ResourceGroupHeader, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Tabs, TabsList, TabsTrigger } from './Settings';
import { AddMarketplaceDialog, AutomationEditor, CreateSplitButton, KeepAwakeRow, OffPeakTaskEditor, PluginAdvancedSection, PluginDetail, PluginHookDetailsList, PluginInfoRow, PluginManageList, PluginSourcesDialog, PluginStoreGrid, PluginUninstallDialog, SubagentConfigForm, SubagentRow, buildPluginChatPrompt, buildStoreItems, builtInSubagentName, groupSubagents, isUserManagedSubagent, useUninstallFlow, type ConfigOption, type PluginHookDetail, type SelectGroupEntry } from './SettingsLeaves'; // A0-CLEANUP3 3b：SelectGroupEntry/ConfigOption/PluginHookDetail 属主为 SettingsLeaves（导出）
import { CommandsImportDialog, SkillsImportDialog } from './SettingsPanels';
import { useTaskStore, useTaskStore as taskStoreStatic } from './SkillStore'; // xe.getState()
import { useBaseServices, useServices } from './services';
import { useAutomationsStore } from './stores-tasks';
import { useCommandsStore, useHooksStore, usePluginsStore } from './stores-workspace';
import { cn } from './UtilsCn';
import { useZCodeIntl as useIntlContext } from './I18n';
import { t as logger } from './logger';
import { useConfirmDialog } from './Modals'; // U2
import { InfoTooltip as Tooltip } from './UsageStatsUiParts'; // Ia
import { useMcpStore as useMcpStoreStatic } from './stores-workspace'; // Ug（静态调用形态）
import { SETTINGS_CONTENT_CLASS as AUTOMATIONS_CONTENT_CLASS } from './Settings'; // H3 容器类
import { OffPeakCreateButton, SCHEDULED_TEMPLATES } from './ExtendedViews'; // INt / LNt（A0-CLEANUP B-31 接线）
import { DEFAULT_AGENT_NAME as COMMANDS_AGENT_SOURCE, providerIds } from './SrcSharedA'; // Kte（`zcodeAgent`）/ q=mo（A0-CLEANUP B-7）
import {
  isUserPreferenceSource as isFileBasedCommand, // ki（跨 chunk）
  isPluginPreferenceSource as isPluginCommand, // ft（跨 chunk）
  automationsWorkspaceKey as automationWorkspaceKey, // Ti
  OFFICIAL_PLUGIN_MARKETPLACE_IDS as OFFICIAL_MARKETPLACE_IDS, // cre（jsx 159308）
  automationCardMenuTestid as AUTOMATIONS_MORE_ACTIONS_TESTID, // at（src chunk）
  automationActionToggleTestid as AUTOMATIONS_TOGGLE_TESTID, // Xn
  automationActionDeleteTestid as AUTOMATIONS_DELETE_TESTID, // Et
  automationsListTestid as AUTOMATIONS_GRID_TESTID, // jr
  automationCardTestid as AUTOMATIONS_CARD_TESTID, // Bte
  offpeakTabTestid as AUTOMATIONS_TABS_TESTID, // on
} from './SrcSharedB';

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}


interface PlatformService {
  openExternal(url: string): void | Promise<void>;
  openInFileManager(path: string): Promise<{ success: boolean; error?: string }>;
}
declare function usePlatformService(): PlatformService;

interface ToastOptions {
  durationMs?: number;
  position?: "top-center" | "bottom-center";
  variant?: "info" | "success" | "error";
  actionLabel?: string;
  onAction?: () => void;
  dismissible?: boolean;
  dismissLabel?: string;
}

/* --- UI 原语 --- */

/* ── tombstone（A0-CLEANUP 族清理）：Button declare 删除 → import { Button } from './button'。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：SpinnerIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const SelectRoot: React.FC<{
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}>;
declare const DialogRoot: React.FC<{ open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }>;
declare const DialogContent: React.FC<{ className?: string; children: React.ReactNode }>;
declare const DialogHeader: React.FC<{ className?: string; children: React.ReactNode }>;
declare const DialogTitle: React.FC<{ className?: string; children: React.ReactNode }>;
declare const DropdownMenuRoot: React.FC<{ children: React.ReactNode }>;
declare const DropdownMenuTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }>;
declare const DropdownMenuContent: React.FC<{
  align?: "start" | "end";
  sideOffset?: number;
  className?: string;
  onClick?: React.MouseEventHandler;
  children: React.ReactNode;
}>;
declare const DropdownMenuItem: React.FC<
  { className?: string; disabled?: boolean; onSelect: (e: Event) => void; "data-testid"?: string } & Record<string, unknown>
>;
declare const DropdownMenuSeparator: React.FC<Record<string, never>>;

/* --- 图标 --- */

/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（19）：RefreshIcon/PlusIcon/TrashIcon/PencilIcon/ExternalLinkIcon/ChevronDownIcon/ChevronRightIcon/CheckIcon/DownloadIcon/FolderOpenIcon/SearchIcon/AlertIcon/SettingsIcon/EllipsisIcon/PlayIcon/RotateIcon/PauseIcon/ResumeIcon/EditIcon → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const AutomationStatusActiveIcon: React.FC<React.SVGProps<SVGSVGElement>>; // M3
declare const AutomationStatusPausedIcon: React.FC<React.SVGProps<SVGSVGElement>>; // k3
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：AutomationStatusCompletedIcon/AutomationStatusFailedIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const TemplateIcon: React.FC<{ className?: string; name: string }>; // uMt 闲时模板图标
declare const ScheduledTemplateIcon: React.FC<{ className?: string; name?: string }>; // Njt 定时模板图标
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（3）：SkillIcon/CommandIcon/SubagentIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const HookIcon: React.FC<React.SVGProps<SVGSVGElement>>; // p（camera-info 占位）
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：UserScopeIcon/InfoIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/* --- 通用领域类型 --- */

interface RemoteTarget {
  kind: "ssh" | "wsl" | "docker" | "server";
  host?: string;
  port?: number; // A0-CLEANUP3 3b：与 Settings.RemoteTarget 对齐（跨模块传参同型）
  container?: string;
  sshConfigAlias?: string;
}
interface ModelProvider {
  id: string;
  name: string;
  apiKey: string;
  [key: string]: unknown;
}

/* --- 服务 context（原 fs()/Ec()） --- */

interface SkillsService {
  list(request: { workspacePath: string; workspaceIdentity?: string | null; provider: string }): Promise<{
    skills: SkillItem[];
    capability: SkillCapability | null;
    diagnostics: SkillDiagnostic[];
  }>;
  setEnabled(request: {
    workspacePath: string;
    workspaceIdentity?: string | null;
    provider: string;
    scope?: string;
    skillId: string;
    enabled: boolean;
  }): Promise<void>;
  deleteSkill(request: { workspacePath: string; workspaceIdentity?: string | null; skillId: string }): Promise<void>;
}
interface SubagentsService {
  list(request: { workspacePath: string; workspaceIdentity?: string | null; provider: string }): Promise<{
    agents: SubagentItem[];
    capability: SubagentCapability | null;
  }>;
  getPrimaryUserAgentsDirectory(request: { provider: string }): Promise<{ path: string }>;
  createAgent(request: { config: SubagentConfig; provider: string }): Promise<void>;
  updateAgent(request: { agentId: string; config: SubagentConfig; oldFilePath: string; provider: string }): Promise<void>;
  deleteAgent(request: { agentId: string; filePath: string }): Promise<void>;
  setEnabled(request: { agentId: string; enabled: boolean }): Promise<void>;
  setBuiltInModelOverride(request: { agentName: string; model?: string | null; thoughtLevel?: string | null }): Promise<void>;
}
interface CommandsService {
  getPrimaryUserCommandsDirectory(request: { agentSource: string }): Promise<{ path: string }>;
}
interface HooksService {
  [key: string]: unknown;
}
interface PluginManagementService {
  [key: string]: unknown;
}
interface ZcodeAgentService {
  createTask(request: {
    workspacePath: string;
    workspaceIdentity?: string;
    provider: string;
    mcpServers?: unknown[];
  }): Promise<{ taskId: string; provider?: string; initialSlashCommands?: unknown[]; workspacePath: string; createdAt: number; updatedAt: number; [key: string]: unknown }>; // A0-CLEANUP3 3b：创建结果为完整任务记录（流入 FileTreePanel.TaskRecord）
}

/* --- 跨 chunk 助手（接口级） --- */

/** 原 $2：远程目标可用性判定 */
declare function resolveRemoteSyncTarget(opts: {
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget | null;
  clientMode: "web-remote-replayable" | "desktop-continuous";
  hasLocalSourceService: boolean;
}): boolean;
/** 原 q2：远程目标显示名 */
declare function remoteTargetDisplayName(target: RemoteTarget, workspacePath: string): string;
/** 原 kg：zcodeSessionService 工厂 */
declare function useZcodeSessionService(workspacePath?: string, unused?: undefined, workspaceIdentity?: string | null): unknown;
/** 原 Ag：workspace 服务工厂 */
declare function useWorkspaceAgentService(workspacePath?: string, unused?: undefined, workspaceIdentity?: string | null): {
  createTask: ZcodeAgentService["createTask"];
};
/** 原 M6：会话能力刷新（技能/命令变更后） */
declare function refreshSessionCapabilities(opts: {
  zcodeSessionService: unknown;
  workspacePath: string | null;
  workspaceIdentity?: string | null;
  reason: string;
}): Promise<void>;
/** 原 N6：技能能力刷新 */
declare function refreshSkillCapabilities(opts: {
  workspacePath: string | null;
  workspaceIdentity?: string | null;
  skillsService: SkillsService;
}): Promise<void>;
/** 原 V6：插件远程同步后全量刷新 */
declare function refreshAfterPluginSync(opts: {
  commandsService: unknown;
  mcpSyncService: unknown;
  reason: string;
  skillsService: SkillsService;
  workspaceIdentity?: string | null;
  workspacePath: string | null;
  zcodeAgentService: unknown;
  zcodeSessionService: unknown;
}): Promise<void>;
/** 原 lFt：hooks 能力刷新 */
declare function refreshAfterHookChange(opts: {
  logScope: string;
  reason: string;
  workspaceIdentity?: string | null;
  workspacePath: string | null;
  zcodeSessionService: unknown;
}): Promise<void>;

/* --- stores --- */

interface ModelProvidersStoreState {
  modelProviders: ModelProvider[];
  displayOrder: { providerIds: string[]; updatedAt?: number } | null;
  loading: boolean;
}
declare function useModelProvidersStore(): ModelProvidersStoreState; // qq
declare function useAppSettings(): { settings: { modelProviderFamilyModes?: Record<string, string>; keepAwakeWhileRunning?: boolean; [key: string]: unknown } | null; update: (patch: Record<string, unknown>) => Promise<void> }; // JM
interface TaskStoreState {
  getWorkspaceState: (workspacePath: string, identity?: string | null) => { activeTaskId: string | null };
  startDraft: (workspacePath: string, draft?: unknown, identity?: string | null) => void;
  bindRuntimeProvider: (workspacePath: string, provider: string, identity?: string | null) => void;
  setSlashCommands: (workspacePath: string, commands: unknown[], identity?: string | null) => void;
  setActiveTaskId: (workspacePath: string, taskId: string, identity?: string | null) => void;
  getState?: unknown;
}
declare function useWorkspaceTabsStore<T>(selector: (state: WorkspaceTabsStoreState) => T): T; // pc
interface WorkspaceTabsStoreState {
  tabs: Array<{ id: string; [key: string]: unknown }>;
  activeTabId: string | null;
  activateTabByPath: (workspacePath: string, opts?: { workspaceIdentity?: string | null }) => void;
}
declare function isWorkspaceTab(tab: { id: string } | undefined): boolean; // oc

/* ============================================================================
 * 1. 技能分区（原 y1t，js 195992–197541 / jsx 157604–157969）
 * ==========================================================================*/

export interface SkillItem {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  scope: "workspace" | "plugin" | "personal" | string;
  pluginName?: string;
  path: string;
  metadata?: {
    version?: string;
    slug?: string;
    publishedAt?: string | number;
    ownerId?: string;
    [key: string]: unknown;
  };
}
export interface SkillCapability {
  userScopeAvailable?: boolean;
  [key: string]: unknown;
}
export interface SkillDiagnostic {
  severity: "error" | "warning" | string;
  code: string;
  message: string;
  skillName?: string;
  path?: string;
}

/** 原 m1t（195926）：启用过滤匹配 */
export function skillEnabledFilterMatch(enabled: boolean, filter: string): boolean {
  return filter === "all" ? true : filter === "enabled" ? enabled : !enabled;
}

/** 原 g1t（jsx 157578）：工作区路径 → 末级目录名 */
export function workspaceFolderName(workspacePath: string | null | undefined): string {
  return workspacePath ? workspacePath.split(/[\\/]/u).filter(Boolean).at(-1) ?? workspacePath : "";
}

/** 原 _1t（jsx 157580）：发布时间 → ISO（非法 → null） */
export function formatPublishedAtIso(value: string | number | undefined): string | null {
  if (value === undefined) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** 原 K7（jsx 157585）：详情字段 */
export function DetailField(props: { label: string; value?: string | null; mono?: boolean; className?: string }) {
  const { label, value, mono = false, className = "" } = props;
  return value ? (
    <div className={`min-w-0 ${className}`}>
      <div className="text-ui-base font-medium text-foreground">{label}</div>
      <div className={["mt-1 break-words text-ui-base text-foreground-subtle", mono ? "break-all font-mono" : ""].join(" ")}>
        {value}
      </div>
    </div>
  ) : null;
}

/** 原 v1t（jsx 157593）：详情路径行（打开文件管理器） */
export function DetailPathRow(props: { label: string; path: string; openLabel: string; onOpen: () => void }) {
  const { label, path, openLabel, onOpen } = props;
  return (
    <div className="min-w-0 col-span-2">
      <div className="text-ui-base font-medium text-foreground">{label}</div>
      <div className="mt-1">
        <Button
          type="button"
          variant="link"
          size="sm"
          aria-label={openLabel}
          title={openLabel}
          className="inline-flex h-auto max-w-full items-baseline gap-1.5 whitespace-normal break-all px-0 py-0 text-left align-baseline font-mono text-ui-base font-normal text-foreground-subtle underline-offset-2 hover:text-foreground hover:underline"
          onClick={onOpen}
        >
          <span>{path}</span>
          <ExternalLinkIcon className="relative top-px size-3 shrink-0" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

/** 原 h1t（jsx 157538）：资源启用过滤下拉（all|enabled|disabled，settings.resourceFilter.*） */
export function ResourceEnabledFilterSelect(props: {
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel?: string;
}) {
  const { value, onValueChange, ariaLabel } = props;
  const { intl } = useIntlContext();
  return (
    <SelectRoot value={value} onValueChange={(next) => onValueChange(next)}>
      <SelectTrigger
        size="lg"
        className="h-9 w-full justify-between rounded-lg md:w-36"
        aria-label={ariaLabel ?? intl.formatMessage({ id: "settings.resourceFilter.label" })}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value="all">{intl.formatMessage({ id: "settings.resourceFilter.all" })}</SelectItem>
        <SelectItem value="enabled">{intl.formatMessage({ id: "settings.resourceFilter.enabled" })}</SelectItem>
        <SelectItem value="disabled">{intl.formatMessage({ id: "settings.resourceFilter.disabled" })}</SelectItem>
      </SelectContent>
    </SelectRoot>
  );
}

/* 技能分组/远程同步依赖（接口级） */
declare function groupSkillsByProvider(skills: SkillItem[], provider: string): SkillItem[]; // XB（skillStore chunk）
declare function skillCreatorPrompt(skillName: string, existingPath?: string): string; // Tj

export interface SkillsSettingsSectionProps {
  workspacePath: string | null;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget | null;
  isWebRemoteControl?: boolean;
}

/** 原 y1t：技能分区根（三域列表/诊断/详情/聊天创建/导入/远程同步） */
export function SkillsSettingsSection(props: SkillsSettingsSectionProps) {
  const { workspacePath, workspaceIdentity, remoteSessionId, remoteTarget, isWebRemoteControl = false } = props;
  const { intl } = useIntlContext();
  const platform = usePlatformService();
  const services = useServices();
  const { skillsService } = services;
  const baseServices = useBaseServices();
  const confirmDialog = useConfirmDialog();
  const effectiveWorkspacePath = workspacePath ?? null;
  const effectiveWorkspaceIdentity = workspaceIdentity;
  const workspaceFolder = workspaceFolderName(effectiveWorkspacePath ?? undefined);
  const workspaceAgentService = useWorkspaceAgentService(effectiveWorkspacePath ?? undefined, undefined, effectiveWorkspaceIdentity);
  const activateTabByPath = useWorkspaceTabsStore((state) => state.activateTabByPath);
  const [skills, setSkills] = React.useState<SkillItem[]>([]);
  const [capability, setCapability] = React.useState<SkillCapability | null>(null);
  const [initialLoading, setInitialLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [enabledFilter, setEnabledFilter] = React.useState("all");
  const [detailSkill, setDetailSkill] = React.useState<SkillItem | null>(null);
  const [diagnostics, setDiagnostics] = React.useState<SkillDiagnostic[]>([]);
  const [diagnosticsExpanded, setDiagnosticsExpanded] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [remoteSyncOpen, setRemoteSyncOpen] = React.useState(false);
  const requestSeq = React.useRef(0);
  const fallbackWorkspaceLabel = workspaceFolder;
  const remoteSyncTarget =
    resolveRemoteSyncTarget({
      remoteSessionId,
      remoteTarget,
      clientMode: isWebRemoteControl ? "web-remote-replayable" : "desktop-continuous",
      hasLocalSourceService: !!baseServices.skillSyncService,
    }) && effectiveWorkspacePath
      ? remoteTarget
      : null;
  const remoteContextLabel = remoteSyncTarget ? remoteTargetDisplayName(remoteSyncTarget, effectiveWorkspacePath ?? "") : "";

  const scopeLabelOf = React.useCallback(
    (skill: SkillItem) => {
      switch (skill.scope) {
        case "workspace":
          return fallbackWorkspaceLabel || intl.formatMessage({ id: "settings.skills.scope.workspaceFallback" });
        case "plugin":
          return skill.pluginName?.trim() ? skill.pluginName : intl.formatMessage({ id: "settings.skills.scope.plugin" });
        default:
          return intl.formatMessage({ id: "settings.skills.scope.personal" });
      }
    },
    [intl, fallbackWorkspaceLabel]
  );

  const diagnosticLabelOf = React.useCallback(
    (code: string) => intl.formatMessage({ id: `settings.skills.diagnostics.code.${code}` }),
    [intl]
  );

  const loadSkills = React.useCallback(
    async (showInitialLoading: boolean) => {
      if (!effectiveWorkspacePath) {
        setSkills([]);
        setCapability(null);
        setDiagnostics([]);
        setLoadError(null);
        setInitialLoading(false);
        setRefreshing(false);
        return;
      }
      setInitialLoading(showInitialLoading);
      setRefreshing(!showInitialLoading);
      setLoadError(null);
      const seq = ++requestSeq.current;
      try {
        const result = await skillsService.list({
          workspacePath: effectiveWorkspacePath,
          workspaceIdentity: effectiveWorkspaceIdentity,
          provider: "glm",
        });
        if (seq !== requestSeq.current) return;
        setSkills(result.skills);
        setCapability(result.capability);
        setDiagnostics(result.diagnostics);
        setInitialLoading(false);
        setRefreshing(false);
      } catch (error) {
        if (seq !== requestSeq.current) return;
        setInitialLoading(false);
        setRefreshing(false);
        setLoadError(error instanceof Error ? error.message : String(error));
      }
    },
    [effectiveWorkspaceIdentity, effectiveWorkspacePath, skillsService]
  );

  React.useEffect(() => {
    loadSkills(false);
  }, [effectiveWorkspacePath, loadSkills]);

  const handleRefresh = React.useCallback(async () => {
    await loadSkills(false);
  }, [loadSkills]);

  const handleRefreshCapabilities = React.useCallback(async () => {
    await refreshSkillCapabilities({
      workspacePath: effectiveWorkspacePath,
      workspaceIdentity: effectiveWorkspaceIdentity,
      skillsService,
    });
  }, [effectiveWorkspaceIdentity, effectiveWorkspacePath, skillsService]);

  const handleToggleSkill = React.useCallback(
    async (skillId: string, enabled: boolean) => {
      if (!effectiveWorkspacePath) return;
      const skill = skills.find((candidate) => candidate.id === skillId);
      try {
        await skillsService.setEnabled({
          workspacePath: effectiveWorkspacePath,
          workspaceIdentity: effectiveWorkspaceIdentity,
          provider: "glm",
          scope: skill?.scope,
          skillId,
          enabled,
        });
        await refreshSessionCapabilities({
          zcodeSessionService: workspaceAgentService,
          workspacePath: effectiveWorkspacePath,
          workspaceIdentity: effectiveWorkspaceIdentity,
          reason: "settings-skill-enabled",
        });
        await Promise.all([loadSkills(false), handleRefreshCapabilities()]);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : String(error));
      }
    },
    [effectiveWorkspaceIdentity, effectiveWorkspacePath, loadSkills, handleRefreshCapabilities, skills, skillsService, workspaceAgentService]
  );

  const handleDeleteSkill = React.useCallback(
    async (skill: SkillItem) => {
      if (!effectiveWorkspacePath || skill.scope === "plugin") return;
      const confirmed = await confirmDialog({
        title: intl.formatMessage({ id: "settings.skills.delete.title" }),
        description: intl.formatMessage({ id: "settings.skills.delete.description" }, { name: skill.name }),
        confirmLabel: intl.formatMessage({ id: "common.delete" }),
      });
      if (!confirmed) return;
      try {
        await skillsService.deleteSkill({
          workspacePath: effectiveWorkspacePath,
          workspaceIdentity: effectiveWorkspaceIdentity,
          skillId: skill.id,
        });
        await refreshSessionCapabilities({
          zcodeSessionService: workspaceAgentService,
          workspacePath: effectiveWorkspacePath,
          workspaceIdentity: effectiveWorkspaceIdentity,
          reason: "settings-skill-delete",
        });
        if (detailSkill?.id === skill.id) setDetailSkill(null);
        await loadSkills(false);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : String(error));
      }
    },
    [effectiveWorkspaceIdentity, effectiveWorkspacePath, confirmDialog, intl, loadSkills, detailSkill, skillsService, workspaceAgentService]
  );

  const groupedSkills = React.useMemo(
    () => splitSkillsByScope(groupSkillsByProvider(skills, "glm").filter((skill) => skillEnabledFilterMatch(skill.enabled, enabledFilter)), searchQuery),
    [searchQuery, skills, enabledFilter]
  );
  const totalVisible = groupedSkills.local.length + groupedSkills.plugin.length;

  /** 原 pe（157754）：聊天创建技能（skill-creator 任务接线） */
  const handleCreateViaChat = () => {
    if (!effectiveWorkspacePath) return;
    void skillCreatorPrompt("skill-creator", groupSkillsByProvider(skills, "glm").find((skill) => skill.name === "skill-creator")?.path);
    const store = taskStoreStatic.getState();
    const workspaceState = store.getWorkspaceState(effectiveWorkspacePath, effectiveWorkspaceIdentity);
    const activeTaskId = workspaceState.activeTaskId;
    const runtimeProvider = resolveRuntimeProvider(activeTaskId, workspaceState);
    const activateWorkspaceTab = () => {
      activateTabByPath(effectiveWorkspacePath, { workspaceIdentity: effectiveWorkspaceIdentity });
    };
    if (!activeTaskId) {
      store.startDraft(effectiveWorkspacePath, undefined, effectiveWorkspaceIdentity);
      activateWorkspaceTab();
      return;
    }
    if (runtimeProvider === "glm") {
      activateWorkspaceTab();
      return;
    }
    void (async () => {
      try {
        const mcpStore = useMcpStoreStatic((state) => state);
        await mcpStore.ensureLoadedForWorkspace(effectiveWorkspacePath, services.mcpSyncService, effectiveWorkspaceIdentity);
        const enabledMcpServers = mcpStore.getEnabledMcpServersForZCode("glm");
        const task = await workspaceAgentService.createTask({
          workspacePath: effectiveWorkspacePath,
          ...(effectiveWorkspaceIdentity ? { workspaceIdentity: effectiveWorkspaceIdentity } : {}),
          provider: "glm",
          mcpServers: enabledMcpServers,
        });
        const taskStore = taskStoreStatic.getState();
        taskStore.bindRuntimeProvider(effectiveWorkspacePath, task.provider ?? "glm", effectiveWorkspaceIdentity);
        if (task.initialSlashCommands && task.initialSlashCommands.length > 0) {
          taskStore.setSlashCommands(effectiveWorkspacePath, task.initialSlashCommands, effectiveWorkspaceIdentity);
        }
        registerWorkspaceTask({
          workspacePath: effectiveWorkspacePath,
          workspaceIdentity: effectiveWorkspaceIdentity,
          task,
          membership: { pinned: false, archived: false },
        });
        taskStore.setActiveTaskId(effectiveWorkspacePath, task.taskId, effectiveWorkspaceIdentity);
        activateWorkspaceTab();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error("[SkillsSection] 新建技能：为所选来源创建 task 失败", message);
        toast(intl.formatMessage({ id: "settings.skills.create.taskCreateFailed" }));
      }
    })();
  };

  const detailSkillResolved = detailSkill ? skills.find((skill) => skill.id === detailSkill.id) ?? detailSkill : null;
  const publishedAtIso = formatPublishedAtIso(detailSkillResolved?.metadata?.publishedAt);
  const handleOpenPath = React.useCallback(
    async (path: string) => {
      const result = await platform.openInFileManager(path);
      if (!result.success) toast(intl.formatMessage({ id: "appHeader.openInFileManagerFailed" }));
    },
    [intl, platform]
  );

  const errorCount = diagnostics.filter((diagnostic) => diagnostic.severity === "error").length;
  const warningCount = diagnostics.length - errorCount;
  const diagnosticsSummary =
    diagnostics.length > 0
      ? intl.formatMessage({ id: "settings.skills.diagnostics.summary" }, { errorCount: String(errorCount), warningCount: String(warningCount) })
      : "";
  const pluginManagedHint = intl.formatMessage({ id: "settings.pluginManaged.modifyInPlugin" });
  const pluginManagedBadge = intl.formatMessage({ id: "settings.pluginManaged.badge" });

  const renderSkillRow = (skill: SkillItem) => (
    <div
      key={skill.id}
      className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
    >
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground-subtle"
        aria-hidden="true"
      >
        <SkillIcon className="size-4" />
      </div>
      <div
        role="button"
        tabIndex={0}
        className="min-w-0 cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        onClick={() => setDetailSkill(skill)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setDetailSkill(skill);
          }
        }}
      >
        <div className="truncate text-ui-base font-medium text-foreground">{skill.name}</div>
        <div className="mt-0.5 truncate text-ui-base text-foreground-subtle">
          {skill.description || intl.formatMessage({ id: "settings.skills.noDescription" })}
        </div>
      </div>
      <span className="shrink-0 text-ui-base text-foreground-subtle">{scopeLabelOf(skill)}</span>
      {skill.scope === "plugin" ? (
        <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle" title={pluginManagedHint}>
          {pluginManagedBadge}
        </span>
      ) : (
        <Switch
          checked={skill.enabled}
          onCheckedChange={(enabled) => {
            handleToggleSkill(skill.id, enabled);
          }}
        />
      )}
      {skill.scope === "plugin" ? (
        <span className="size-7 shrink-0" aria-hidden="true" />
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-foreground-subtle hover:bg-destructive/10 hover:text-destructive"
          aria-label={intl.formatMessage({ id: "common.delete" })}
          title={intl.formatMessage({ id: "common.delete" })}
          onClick={() => void handleDeleteSkill(skill)}
        >
          <TrashIcon className="size-3.5" aria-hidden="true" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-ui-base leading-6 text-foreground-subtle">
          {intl.formatMessage({ id: "settings.skills.description" })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip title={intl.formatMessage({ id: "settings.skills.create.open" })}>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={intl.formatMessage({ id: "settings.skills.create.open" })}
              onClick={handleCreateViaChat}
            >
              <PlusIcon className="size-3.5" aria-hidden="true" />
            </Button>
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: "settings.skills.import.open" })}>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={intl.formatMessage({ id: "settings.skills.import.open" })}
              disabled={!capability?.userScopeAvailable}
              onClick={() => setImportOpen(true)}
            >
              <DownloadIcon className="size-3.5" aria-hidden="true" />
            </Button>
          </Tooltip>
          {remoteSyncTarget ? (
            <Tooltip title={intl.formatMessage({ id: "settings.skills.remoteSync.open" })}>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={intl.formatMessage({ id: "settings.skills.remoteSync.open" })}
                onClick={() => setRemoteSyncOpen(true)}
              >
                <RefreshIcon className="size-3.5" aria-hidden="true" />
              </Button>
            </Tooltip>
          ) : null}
          <Tooltip
            title={refreshing ? intl.formatMessage({ id: "settings.skills.refreshing" }) : intl.formatMessage({ id: "settings.skills.refresh" })}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={
                refreshing ? intl.formatMessage({ id: "settings.skills.refreshing" }) : intl.formatMessage({ id: "settings.skills.refresh" })
              }
              onClick={() => void handleRefresh()}
              disabled={refreshing}
            >
              <RefreshIcon className={refreshing ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden="true" />
            </Button>
          </Tooltip>
        </div>
      </div>
      {remoteSyncTarget ? (
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "settings.skills.remoteContext" }, { target: remoteContextLabel })}
        </div>
      ) : null}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative min-w-0 flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-foreground-subtle"
            aria-hidden="true"
          />
          <Input
            type="text"
            size="lg"
            className="h-9 rounded-lg pl-8"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={intl.formatMessage({ id: "settings.skills.searchPlaceholder" })}
          />
        </div>
        <ResourceEnabledFilterSelect
          value={enabledFilter}
          onValueChange={setEnabledFilter}
          ariaLabel={intl.formatMessage({ id: "settings.skills.filter.enabled.label" })}
        />
      </div>
      {diagnostics.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-amber-500/40 bg-amber-500/10 text-ui-base text-foreground">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
            onClick={() => setDiagnosticsExpanded((expanded) => !expanded)}
            aria-expanded={diagnosticsExpanded}
            aria-label={
              diagnosticsExpanded
                ? intl.formatMessage({ id: "settings.skills.diagnostics.collapse" })
                : intl.formatMessage({ id: "settings.skills.diagnostics.expand" })
            }
          >
            {diagnosticsExpanded ? (
              <ChevronDownIcon className="size-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronRightIcon className="size-3.5 shrink-0" aria-hidden="true" />
            )}
            <AlertIcon className="size-3.5 shrink-0 text-amber-500" aria-hidden="true" />
            <span className="flex-1 truncate font-medium">{diagnosticsSummary}</span>
          </button>
          {diagnosticsExpanded ? (
            <ul className="space-y-1 border-t border-amber-500/30 px-3 py-2">
              {diagnostics.map((diagnostic, index) => (
                <li key={`${diagnostic.code}-${diagnostic.path ?? "no-path"}-${index}`} className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span
                      className={
                        diagnostic.severity === "error"
                          ? "shrink-0 text-ui-xs font-semibold uppercase tracking-wide text-destructive"
                          : "shrink-0 text-ui-xs font-semibold uppercase tracking-wide text-amber-500"
                      }
                    >
                      {diagnostic.severity}
                    </span>
                    <span className="font-medium text-foreground">{diagnosticLabelOf(diagnostic.code)}</span>
                    {diagnostic.skillName ? <span className="text-foreground-subtle">{"· "}{diagnostic.skillName}</span> : null}
                  </div>
                  <div className="mt-0.5 break-words text-foreground-subtle">{diagnostic.message}</div>
                  {diagnostic.path ? (
                    <div className="mt-0.5 break-all font-mono text-ui-xs text-foreground-subtle">{diagnostic.path}</div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {capability?.userScopeAvailable ? null : (
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "settings.skills.userScopeDesktopOnly" })}
        </div>
      )}
      {loadError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-ui-base text-destructive">{loadError}</div>
      ) : null}
      {initialLoading ? (
        <div className="overflow-hidden rounded-xl border border-dashed border-border">
          <div className="px-4 py-3 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "common.loading" })}</div>
        </div>
      ) : totalVisible === 0 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="px-4 py-3 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.skills.empty" })}</div>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedSkills.local.length > 0 ? (
            <section className="space-y-2">
              <ResourceGroupHeader count={groupedSkills.local.length} title={intl.formatMessage({ id: "settings.skills.group.local" })} />
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="divide-y divide-border">{groupedSkills.local.map(renderSkillRow)}</div>
              </div>
            </section>
          ) : null}
          {groupedSkills.plugin.length > 0 ? (
            <section className="space-y-2">
              <ResourceGroupHeader
                count={groupedSkills.plugin.length}
                hint={pluginManagedHint}
                title={intl.formatMessage({ id: "settings.skills.group.plugin" })}
              />
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="divide-y divide-border">{groupedSkills.plugin.map(renderSkillRow)}</div>
              </div>
            </section>
          ) : null}
        </div>
      )}
      <DialogRoot
        open={detailSkill !== null}
        onOpenChange={(open) => {
          if (!open) setDetailSkill(null);
        }}
      >
        <DialogContent className="max-h-[min(80vh,640px)] max-w-xl overflow-hidden p-0">
          {detailSkillResolved ? (
            <div className="flex min-h-0 flex-col">
              <DialogHeader className="border-b border-popover-border px-4 pt-4 pb-3">
                <DialogTitle className="truncate pr-8 text-ui-lg">{detailSkillResolved.name}</DialogTitle>
              </DialogHeader>
              <div className="min-h-0 space-y-4 overflow-auto px-4 py-5">
                <div className="grid gap-1.5">
                  <div className="text-ui-base font-medium text-foreground">
                    {intl.formatMessage({ id: "settings.skills.detail.description" })}
                  </div>
                  <div className="max-h-40 overflow-auto whitespace-pre-wrap text-ui-base/relaxed text-foreground-subtle">
                    {detailSkillResolved.description || intl.formatMessage({ id: "settings.skills.noDescription" })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <DetailField label={intl.formatMessage({ id: "settings.skills.detail.scope" })} value={scopeLabelOf(detailSkillResolved)} />
                  <DetailField
                    label={intl.formatMessage({ id: "settings.skills.detail.status" })}
                    value={
                      detailSkillResolved.enabled
                        ? intl.formatMessage({ id: "settings.skills.detail.enabled" })
                        : intl.formatMessage({ id: "settings.skills.detail.disabled" })
                    }
                  />
                  <DetailField label={intl.formatMessage({ id: "settings.skills.detail.version" })} value={detailSkillResolved.metadata?.version} mono />
                  <DetailField label={intl.formatMessage({ id: "settings.skills.detail.slug" })} value={detailSkillResolved.metadata?.slug} mono />
                  <DetailField label={intl.formatMessage({ id: "settings.skills.detail.publishedAt" })} value={publishedAtIso} mono />
                  <DetailField
                    label={intl.formatMessage({ id: "settings.skills.detail.ownerId" })}
                    value={detailSkillResolved.metadata?.ownerId}
                    mono
                    className="col-span-2"
                  />
                  <DetailPathRow
                    label={intl.formatMessage({ id: "settings.skills.detail.path" })}
                    path={detailSkillResolved.path}
                    openLabel={intl.formatMessage({ id: "settings.skills.detail.openPath" })}
                    onOpen={() => void handleOpenPath(detailSkillResolved.path)}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </DialogRoot>
      <SkillsImportDialog
        open={importOpen}
        workspacePath={effectiveWorkspacePath}
        workspaceIdentity={effectiveWorkspaceIdentity}
        onOpenChange={setImportOpen}
        onImported={async () => {
          await refreshSessionCapabilities({
            zcodeSessionService: workspaceAgentService,
            workspacePath: effectiveWorkspacePath,
            workspaceIdentity: effectiveWorkspaceIdentity,
            reason: "settings-skill-import",
          });
          await handleRefresh();
        }}
      />
      <RemoteSyncDialogs
        canSyncSkills={!!(remoteSyncTarget && effectiveWorkspacePath)}
        canSyncMcp={false}
        skillOpen={remoteSyncOpen}
        mcpOpen={false}
        onSkillOpenChange={setRemoteSyncOpen}
        onMcpOpenChange={() => {}}
        localSkillSyncService={baseServices.skillSyncService}
        remoteSkillSyncService={services.skillsService}
        remoteTarget={remoteSyncTarget}
        skillWorkspacePath={effectiveWorkspacePath ?? ""}
        mcpWorkspacePath=""
        workspaceIdentity={effectiveWorkspaceIdentity}
        onSkillsSynced={async () => {
          await refreshSessionCapabilities({
            zcodeSessionService: workspaceAgentService,
            workspacePath: effectiveWorkspacePath,
            workspaceIdentity: effectiveWorkspaceIdentity,
            reason: "settings-remote-skill-sync",
          });
          await Promise.all([handleRefresh(), handleRefreshCapabilities()]);
        }}
        onMcpSynced={() => {}}
      />
    </div>
  );
}

/** 原 zV（jsx 157762）：任务运行时供应商解析（接口级） */
declare function resolveRuntimeProvider(taskId: string | null, workspaceState: unknown): string | null;
/** 原 cLt（jsx 157785）：工作区任务登记（接口级） */
/** 原 j7（Settings.tsx 已抽取）：分组头 */

/* ============================================================================
 * 2. 子代理分区（原 H1t，js 197542–199414 / jsx 158526–158853）
 * ==========================================================================*/

export interface SubagentItem {
  id?: string; // A0-CLEANUP3 3b：与属主 SettingsLeaves.SubagentItem 对齐（id/path 可选、model 含 null），回调逆变收敛
  name: string;
  description?: string;
  model?: string | null;
  path?: string;
  scope: string;
  source: string;
  enabled: boolean;
  tools?: string[];
  disallowedTools?: string[];
  skills?: string[];
  builtIn?: boolean;
  [key: string]: unknown;
}
export interface SubagentCapability {
  userScopeAvailable?: boolean;
  [key: string]: unknown;
}
export interface SubagentConfig {
  name?: string;
  description?: string;
  model?: string | null;
  thoughtLevel?: string | null;
  tools?: string[];
  [key: string]: unknown;
}

/* 接口级子件（行号见头部映射 §B） */
declare function sortSubagents(agents: SubagentItem[]): SubagentItem[]; // w1t（157977）
declare function useWorkspaceConfigOptions(workspacePath: string, unused: null, workspaceIdentity?: string | null): {
  configOptions: ConfigOption[];
  status: string;
}; // Jq；A0-CLEANUP3 3b：返回面按消费端（SubagentRow/SubagentConfigForm props）具型
declare function buildModelSelectGroups(
  provider: string,
  agents: unknown[],
  modelProviders: ModelProvider[],
  labels: { apiKeyLabel: string; codingPlanLabel: string },
  displayOrder: { providerIds: string[]; updatedAt?: number } | null,
  familyModes?: Record<string, string>
): SelectGroupEntry[]; // Hq；A0-CLEANUP3 3b：返回面按消费端具型
declare function refreshSubagentCapabilities(opts: {
  workspacePath: string | null;
  workspaceIdentity?: string | null;
  subagentsService: SubagentsService;
}): Promise<void>; // De

export interface SubagentsSettingsSectionProps {
  onManageModels: () => void;
  workspacePath: string | null;
  workspaceIdentity?: string | null;
}

/** 原 H1t：子代理分区根（用户/插件/内置三组；编辑态整页切换） */
export function SubagentsSettingsSection(props: SubagentsSettingsSectionProps) {
  const { onManageModels, workspacePath, workspaceIdentity } = props;
  const { intl } = useIntlContext();
  const platform = usePlatformService();
  const confirmDialog = useConfirmDialog();
  const { subagentsService } = useServices();
  const { modelProviders, displayOrder, loading: modelProvidersLoading } = useModelProvidersStore();
  const hasWorkspace = !!workspacePath?.trim();
  const { configOptions, status: workspaceConfigStatus } = useWorkspaceConfigOptions(workspacePath ?? "", null, workspaceIdentity);
  const { settings } = useAppSettings();
  const [agents, setAgents] = React.useState<SubagentItem[]>([]);
  const [capability, setCapability] = React.useState<SubagentCapability | null>(null);
  const [initialLoading, setInitialLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [enabledFilter, setEnabledFilter] = React.useState("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingAgent, setEditingAgent] = React.useState<SubagentItem | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [operatingAgentId, setOperatingAgentId] = React.useState<string | null>(null);
  const requestSeq = React.useRef(0);
  const modelSelectGroups = React.useMemo(
    () =>
      buildModelSelectGroups(
        "glm",
        [],
        modelProviders,
        {
          apiKeyLabel: intl.formatMessage({ id: "settings.modelProvider.apiKey" }),
          codingPlanLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.codingPlan" }),
        },
        displayOrder,
        settings?.modelProviderFamilyModes
      ),
    [displayOrder, intl, modelProviders, settings?.modelProviderFamilyModes]
  );
  const effectiveModelSelectGroups = modelSelectGroups;

  const loadAgents = React.useCallback(
    async (showInitialLoading: boolean) => {
      setInitialLoading(showInitialLoading);
      setRefreshing(!showInitialLoading);
      setLoadError(null);
      const seq = ++requestSeq.current;
      try {
        const result = await subagentsService.list({
          workspacePath: workspacePath ?? "",
          workspaceIdentity,
          provider: "glm",
        });
        if (seq !== requestSeq.current) return;
        setAgents(sortSubagents(result.agents));
        setCapability(result.capability);
        setInitialLoading(false);
        setRefreshing(false);
      } catch (error) {
        if (seq !== requestSeq.current) return;
        setInitialLoading(false);
        setRefreshing(false);
        setLoadError(error instanceof Error ? error.message : String(error));
      }
    },
    [subagentsService, workspaceIdentity, workspacePath]
  );

  React.useEffect(() => {
    loadAgents(true);
  }, [loadAgents]);

  const handleRefresh = React.useCallback(async () => {
    await loadAgents(false);
  }, [loadAgents]);

  const handleRefreshCapabilities = React.useCallback(async () => {
    await refreshSubagentCapabilities({ workspacePath, workspaceIdentity, subagentsService });
  }, [subagentsService, workspaceIdentity, workspacePath]);

  const handleRefreshAll = React.useCallback(async () => {
    await Promise.all([handleRefresh(), handleRefreshCapabilities()]);
  }, [handleRefresh, handleRefreshCapabilities]);

  const handleOpenUserAgentsFolder = React.useCallback(async () => {
    try {
      const { path } = await subagentsService.getPrimaryUserAgentsDirectory({ provider: "glm" });
      const result = await platform.openInFileManager(path);
      if (!result.success) toast(intl.formatMessage({ id: "appHeader.openInFileManagerFailed" }));
    } catch {
      toast(intl.formatMessage({ id: "appHeader.openInFileManagerFailed" }));
    }
  }, [intl, platform, subagentsService]);

  const handleSaveAgent = React.useCallback(
    async (config: SubagentConfig) => {
      setSaving(true);
      try {
        if (editingAgent) {
          await subagentsService.updateAgent({
            agentId: editingAgent.id,
            config,
            oldFilePath: editingAgent.path,
            provider: "glm",
          });
        } else {
          await subagentsService.createAgent({ config, provider: "glm" });
        }
        setFormOpen(false);
        setEditingAgent(null);
        await Promise.all([handleRefresh(), handleRefreshCapabilities()]);
      } catch (error) {
        toast(error instanceof Error ? error.message : String(error));
      } finally {
        setSaving(false);
      }
    },
    [editingAgent, handleRefresh, handleRefreshCapabilities, subagentsService]
  );

  const handleDeleteAgent = React.useCallback(
    async (agent: SubagentItem) => {
      if (!isUserManagedSubagent(agent)) return;
      const confirmed = await confirmDialog({
        title: intl.formatMessage({ id: "settings.subagents.delete.title" }),
        description: intl.formatMessage({ id: "settings.subagents.delete.description" }, { name: agent.name }),
        confirmLabel: intl.formatMessage({ id: "common.delete" }),
      });
      if (!confirmed) return;
      setOperatingAgentId(agent.id ?? null); // A0-CLEANUP3 3b：SubagentItem.id 与属主对齐为可选，运行期恒有值
      try {
        await subagentsService.deleteAgent({ agentId: agent.id, filePath: agent.path });
        setEditingAgent(null);
        setFormOpen(false);
        await Promise.all([handleRefresh(), handleRefreshCapabilities()]);
      } catch (error) {
        toast(error instanceof Error ? error.message : String(error));
      } finally {
        setOperatingAgentId(null);
      }
    },
    [confirmDialog, intl, handleRefresh, handleRefreshCapabilities, subagentsService]
  );

  const handleToggleAgent = React.useCallback(
    async (agent: SubagentItem, enabled: boolean) => {
      if (!isUserManagedSubagent(agent)) return;
      setOperatingAgentId(agent.id ?? null); // A0-CLEANUP3 3b：SubagentItem.id 与属主对齐为可选，运行期恒有值
      try {
        await subagentsService.setEnabled({ agentId: agent.id, enabled });
        await Promise.all([handleRefresh(), handleRefreshCapabilities()]);
      } catch (error) {
        toast(error instanceof Error ? error.message : String(error));
      } finally {
        setOperatingAgentId(null);
      }
    },
    [handleRefresh, handleRefreshCapabilities, subagentsService]
  );

  const handleBuiltInModelChange = React.useCallback(
    async (agent: SubagentItem, override: { model?: string | null; thoughtLevel?: string | null }) => {
      const builtInName = builtInSubagentName(agent);
      if (!builtInName) return;
      setOperatingAgentId(agent.id ?? null); // A0-CLEANUP3 3b：SubagentItem.id 与属主对齐为可选，运行期恒有值
      try {
        await subagentsService.setBuiltInModelOverride({
          agentName: builtInName,
          model: override.model,
          thoughtLevel: override.thoughtLevel,
        });
      } catch (error) {
        toast(error instanceof Error ? error.message : String(error));
        setOperatingAgentId(null);
        throw error;
      }
      try {
        await Promise.all([handleRefresh(), handleRefreshCapabilities()]);
      } catch (error) {
        toast(error instanceof Error ? error.message : String(error));
      } finally {
        setOperatingAgentId(null);
      }
    },
    [handleRefresh, handleRefreshCapabilities, subagentsService]
  );

  const handleEditAgent = React.useCallback((agent: SubagentItem) => {
    if (isUserManagedSubagent(agent)) {
      setEditingAgent(agent);
      setFormOpen(false);
    }
  }, []);

  const userScopeAvailable = capability?.userScopeAvailable === true;
  const handleAddNew = React.useCallback(() => {
    if (userScopeAvailable) {
      setEditingAgent(null);
      setFormOpen(true);
    }
  }, [userScopeAvailable]);

  const handleBackToList = React.useCallback(() => {
    setEditingAgent(null);
    setFormOpen(false);
  }, []);

  const filteredAgents = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return agents.filter((agent) => {
      if (enabledFilter === "enabled" && !agent.enabled) return false;
      if (enabledFilter === "disabled" && agent.enabled) return false;
      if (!query) return true;
      return [agent.name, agent.description, agent.model, agent.path, agent.scope, agent.source, agent.tools?.join(" "), agent.disallowedTools?.join(" "), agent.skills?.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [agents, searchQuery, enabledFilter]);
  const groupedAgents = React.useMemo(() => groupSubagents(filteredAgents), [filteredAgents]);
  const totalVisible = groupedAgents.user.length + groupedAgents.plugin.length + groupedAgents.builtIn.length;
  const editingAgentResolved = React.useMemo(
    () => (editingAgent ? agents.find((candidate) => candidate.id === editingAgent.id) ?? editingAgent : null),
    [agents, editingAgent]
  );

  if (userScopeAvailable && (formOpen || editingAgentResolved !== null)) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <BackLinkButton onClick={handleBackToList}>{intl.formatMessage({ id: "settings.subagents.backToList" })}</BackLinkButton>
          <div className="space-y-1">
            <h3 className="text-ui-lg font-semibold text-foreground">
              {editingAgent ? intl.formatMessage({ id: "settings.subagents.edit" }) : intl.formatMessage({ id: "settings.subagents.addNew" })}
            </h3>
            <p className="text-ui-base text-foreground-subtle">
              {editingAgent
                ? intl.formatMessage({ id: "settings.subagents.editDescription" })
                : intl.formatMessage({ id: "settings.subagents.addDescription" })}
            </p>
          </div>
          <SubagentConfigForm
            hasWorkspace={hasWorkspace}
            initial={editingAgentResolved ?? undefined}
            modelProviders={modelProviders}
            modelProvidersLoading={modelProvidersLoading}
            modelSelectGroups={effectiveModelSelectGroups}
            onManageModels={onManageModels}
            saving={saving}
            onCancel={handleBackToList}
            onDelete={handleDeleteAgent}
            onSave={handleSaveAgent}
            workspaceConfigOptions={configOptions}
            workspaceConfigStatus={workspaceConfigStatus}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-ui-base leading-6 text-foreground-subtle">
          {intl.formatMessage({ id: "settings.subagents.description" })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {userScopeAvailable ? (
            <Tooltip title={intl.formatMessage({ id: "settings.subagents.addNew" })}>
              <Button
                type="button"
                variant="ghost"
                size="icon-md"
                aria-label={intl.formatMessage({ id: "settings.subagents.addNew" })}
                onClick={handleAddNew}
              >
                <PlusIcon className="size-3.5" aria-hidden="true" />
              </Button>
            </Tooltip>
          ) : null}
          {userScopeAvailable ? (
            <Tooltip title={intl.formatMessage({ id: "settings.subagents.openUserAgentsFolder" })}>
              <Button
                type="button"
                variant="ghost"
                size="icon-md"
                aria-label={intl.formatMessage({ id: "settings.subagents.openUserAgentsFolder" })}
                onClick={() => void handleOpenUserAgentsFolder()}
              >
                <FolderOpenIcon className="size-3.5" aria-hidden="true" />
              </Button>
            </Tooltip>
          ) : null}
          <Tooltip
            title={refreshing ? intl.formatMessage({ id: "settings.skills.refreshing" }) : intl.formatMessage({ id: "settings.skills.refresh" })}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              aria-label={
                refreshing ? intl.formatMessage({ id: "settings.skills.refreshing" }) : intl.formatMessage({ id: "settings.skills.refresh" })
              }
              onClick={() => void handleRefreshAll()}
              disabled={refreshing || initialLoading}
            >
              <RefreshIcon className={refreshing ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden="true" />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="flex flex-col gap-3 md:flex-row">
        <Input
          type="text"
          size="lg"
          className="h-9 min-w-0 flex-1 rounded-lg border border-input-border bg-input hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={intl.formatMessage({ id: "settings.subagents.searchPlaceholder" })}
        />
        <SelectRoot value={enabledFilter} onValueChange={(value) => setEnabledFilter(value)}>
          <SelectTrigger
            variant="input"
            size="lg"
            className="h-9 w-full justify-between rounded-lg border !border-input-border bg-input hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused md:w-36"
            aria-label={intl.formatMessage({ id: "settings.resourceFilter.label" })}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="all">{intl.formatMessage({ id: "settings.subagents.filter.all" })}</SelectItem>
            <SelectItem value="enabled">{intl.formatMessage({ id: "settings.subagents.filter.enabled" })}</SelectItem>
            <SelectItem value="disabled">{intl.formatMessage({ id: "settings.subagents.filter.disabled" })}</SelectItem>
          </SelectContent>
        </SelectRoot>
      </div>
      {loadError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-ui-base text-destructive">{loadError}</div>
      ) : null}
      {capability && !capability.userScopeAvailable ? (
        <div className="rounded-lg border border-border bg-surface px-3 py-2 text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "settings.subagents.userScopeDesktopOnly" })}
        </div>
      ) : null}
      {initialLoading ? (
        <div className="px-4 py-3 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "common.loading" })}</div>
      ) : totalVisible === 0 ? (
        <div className="overflow-hidden rounded-xl border border-dashed border-border">
          <div className="px-4 py-3 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.subagents.empty" })}</div>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedAgents.user.length > 0 ? (
            <section className="space-y-2">
              <ResourceGroupHeader count={groupedAgents.user.length} title={intl.formatMessage({ id: "settings.subagents.group.user" })} />
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="divide-y divide-border">
                  {groupedAgents.user.map((agent) => (
                    <SubagentRow
                      key={agent.id}
                      agent={agent}
                      hasWorkspace={hasWorkspace}
                      isOperating={operatingAgentId === agent.id || refreshing}
                      modelGroups={modelSelectGroups}
                      modelProviders={modelProviders}
                      modelProvidersLoading={modelProvidersLoading}
                      modelSelectGroups={effectiveModelSelectGroups}
                      onBuiltInModelChange={handleBuiltInModelChange}
                      onDelete={handleDeleteAgent}
                      onEdit={handleEditAgent}
                      onToggle={handleToggleAgent}
                      workspaceConfigOptions={configOptions}
                      workspaceConfigStatus={workspaceConfigStatus}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : null}
          {groupedAgents.plugin.length > 0 ? (
            <section className="space-y-2">
              <ResourceGroupHeader
                count={groupedAgents.plugin.length}
                hint={intl.formatMessage({ id: "settings.subagents.group.plugin.hint" })}
                title={intl.formatMessage({ id: "settings.subagents.group.plugin" })}
              />
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="divide-y divide-border">
                  {groupedAgents.plugin.map((agent) => (
                    <SubagentRow
                      key={agent.id}
                      agent={agent}
                      hasWorkspace={hasWorkspace}
                      isOperating={operatingAgentId === agent.id || refreshing}
                      modelGroups={modelSelectGroups}
                      modelProviders={modelProviders}
                      modelProvidersLoading={modelProvidersLoading}
                      modelSelectGroups={effectiveModelSelectGroups}
                      onBuiltInModelChange={handleBuiltInModelChange}
                      onDelete={handleDeleteAgent}
                      onEdit={handleEditAgent}
                      onToggle={handleToggleAgent}
                      workspaceConfigOptions={configOptions}
                      workspaceConfigStatus={workspaceConfigStatus}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : null}
          {groupedAgents.builtIn.length > 0 ? (
            <section className="space-y-2">
              <ResourceGroupHeader
                count={groupedAgents.builtIn.length}
                hint={intl.formatMessage({ id: "settings.subagents.group.builtIn.hint" })}
                title={intl.formatMessage({ id: "settings.subagents.group.builtIn" })}
              />
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="divide-y divide-border">
                  {groupedAgents.builtIn.map((agent) => (
                    <SubagentRow
                      key={agent.id}
                      agent={agent}
                      hasWorkspace={hasWorkspace}
                      isOperating={operatingAgentId === agent.id || refreshing}
                      modelGroups={modelSelectGroups}
                      modelProviders={modelProviders}
                      modelProvidersLoading={modelProvidersLoading}
                      modelSelectGroups={effectiveModelSelectGroups}
                      onBuiltInModelChange={handleBuiltInModelChange}
                      onDelete={handleDeleteAgent}
                      onEdit={handleEditAgent}
                      onToggle={handleToggleAgent}
                      workspaceConfigOptions={configOptions}
                      workspaceConfigStatus={workspaceConfigStatus}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 3. 插件分区（原 I0t，js 199994–200497 / jsx 159986–160319）
 * ==========================================================================*/

export interface PluginItem {
  id: string;
  name: string;
  marketplace?: string;
  source?: string;
  enabled?: boolean; // A0-CLEANUP3 3b：与属主 SettingsLeaves.PluginItem 对齐（可选），双向收敛
  installed?: boolean;
  restorable?: boolean;
  updateStatus?: string;
  installedMeta?: { updateStatus?: string; latestVersion?: string };
  configuredOptions?: Record<string, unknown>;
  userConfig?: Record<string, { type: string; default?: unknown; sensitive?: boolean }>;
  hookDetails?: unknown[];
  info?: PluginDescribeInfo;
  [key: string]: unknown;
}
export interface PluginDescribeInfo {
  rootPath?: string;
  hookDetails?: PluginHookDetail[]; // A0-CLEANUP3 3b：与 SL.PluginItem.info.hookDetails 对齐
  userConfig?: PluginItem["userConfig"];
  configuredOptions?: Record<string, unknown>;
  [key: string]: unknown;
}
export interface PluginMarketplace {
  id: string;
  name?: string;
  pluginCount?: number;
  lastUpdated?: number | null;
  [key: string]: unknown;
}

/* 插件 store（原 B6，142985；接口级） */
interface PluginsStoreState {
  plugins: PluginItem[];
  marketplaces: PluginMarketplace[];
  marketplaceAvailabilityKnown: boolean;
  availablePlugins: unknown[];
  installedPlugins: Array<{ id: string; scope?: string; updateStatus?: string; [key: string]: unknown }>;
  restorableBuiltins: unknown[];
  loading: boolean;
  error: string | null;
  togglingPluginId: string | null;
  operationId: string | null;
  describeCache: Record<string, unknown>;
  initialize: (opts: { workspacePath: string; workspaceIdentity?: string | null; pluginService: unknown }) => Promise<void>;
  updateMarketplace: (marketplaceId: string | null, pluginService: unknown) => Promise<boolean>;
  refresh: (pluginService: unknown) => Promise<void>;
  addMarketplace: (request: unknown, pluginService: unknown) => Promise<void>;
  removeMarketplace: (marketplaceId: string, pluginService: unknown) => Promise<void>;
  installPlugin: (name: string, marketplace: string | undefined, pluginService: unknown) => Promise<void>;
  configurePlugin: (pluginId: string, options: Record<string, unknown>, pluginService: unknown) => Promise<void>;
  setEnabled: (pluginId: string, enabled: boolean, pluginService: unknown) => Promise<void>;
  describePlugin: (pluginId: string, name: string, marketplace: string | undefined, pluginService: unknown, force?: boolean) => Promise<void>;
  updatePlugin: (pluginId: string, pluginService: unknown) => Promise<void>;
  restoreBuiltin: (pluginId: string, pluginService: unknown) => Promise<void>;
}
declare const pluginsStoreStatic: { getState: () => PluginsStoreState }; // B6.getState()

/* 插件子视图（接口级；行号见头部映射 §C） */
declare const PluginConfigForm: React.FC<{
  getValue: (plugin: PluginDescribeInfo, key: string, spec: { default?: unknown; type: string }) => unknown;
  onSave: (plugin: PluginDescribeInfo) => void;
  onSetDraft: (pluginId: string, key: string, value: unknown) => void;
  operationId: string | null;
  plugin: PluginDescribeInfo;
}>; // U1t（jsx 158854）
declare function describePluginUpdateState(item: PluginItem | null): { updateAvailable: boolean; versionChanged: boolean } | null; // W1t（jsx 158891）
declare function isUpdateAvailableStatus(status: string | undefined): boolean; // i9（jsx 158888）
declare function formatPluginSource(opts: {
  source?: string;
  marketplace?: string;
  marketplaces: PluginMarketplace[];
  builtinLabel: string;
  claudeCodePluginsLabel: string;
  formatFromMarketplace: (marketplace: string) => string;
}): string; // p0t（jsx 159332）
declare function buildPluginChatMention(opts: { item: PluginItem; locale: string }): string; // P0t（159955）
declare const CLAUDE_CODE_PLUGINS_MARKETPLACE_ID: string; // c9（jsx 159313）

interface PluginStoreActions {
  onOpenDetail: (pluginId: string) => void;
  onInstall: (item: PluginItem) => void;
  onUninstall: (pluginId: string) => void; // A0-CLEANUP3 3b：与属主 SettingsLeaves.PluginStoreActions 对齐（实参为 item.id）
  onSetEnabled: (pluginId: string, enabled: boolean) => void;
  onUpdate: (pluginId: string) => void;
  operationId: string | null;
  togglingPluginId: string | null;
}

export interface PluginsSettingsSectionProps {
  workspacePath: string | null;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget | null;
  localWorkspacePath?: string | null;
  isWebRemoteControl?: boolean;
  onCreateTask?: (opts: { initialPrompt: string; initialPromptMention: string }) => void;
}

/** 原 I0t：插件分区根（商店/管理/详情三视图 + 市场源/远程同步对话框） */
export function PluginsSettingsSection(props: PluginsSettingsSectionProps) {
  const {
    workspacePath,
    workspaceIdentity,
    remoteSessionId,
    remoteTarget,
    localWorkspacePath,
    isWebRemoteControl = false,
    onCreateTask,
  } = props;
  const { intl, locale } = useIntlContext();
  const baseServices = useBaseServices();
  const {
    commandsService,
    mcpSyncService,
    pluginManagementService,
    pluginSyncService,
    skillsService,
    zcodeAgentService,
  } = useServices();
  const workspaceAgentService = useWorkspaceAgentService(workspacePath ?? undefined, undefined, workspaceIdentity);
  const plugins = usePluginsStore((state) => state.plugins);
  const marketplaces = usePluginsStore((state) => state.marketplaces);
  const marketplaceAvailabilityKnown = usePluginsStore((state) => state.marketplaceAvailabilityKnown);
  const availablePlugins = usePluginsStore((state) => state.availablePlugins);
  const installedPlugins = usePluginsStore((state) => state.installedPlugins);
  const restorableBuiltins = usePluginsStore((state) => state.restorableBuiltins);
  const loading = usePluginsStore((state) => state.loading);
  const storeError = usePluginsStore((state) => state.error);
  const togglingPluginId = usePluginsStore((state) => state.togglingPluginId);
  const operationId = usePluginsStore((state) => state.operationId);
  const describeCache = usePluginsStore((state) => state.describeCache);
  const initializeStore = usePluginsStore((state) => state.initialize);
  const updateMarketplace = usePluginsStore((state) => state.updateMarketplace);
  const addMarketplace = usePluginsStore((state) => state.addMarketplace);
  const removeMarketplace = usePluginsStore((state) => state.removeMarketplace);
  const installPlugin = usePluginsStore((state) => state.installPlugin);
  const configurePlugin = usePluginsStore((state) => state.configurePlugin);
  const setPluginEnabled = usePluginsStore((state) => state.setEnabled);
  const describePlugin = usePluginsStore((state) => state.describePlugin);
  const updatePlugin = usePluginsStore((state) => state.updatePlugin);
  const restoreBuiltin = usePluginsStore((state) => state.restoreBuiltin);
  const [view, setView] = React.useState<"store" | "detail" | "manage">("store");
  const [selectedPluginId, setSelectedPluginId] = React.useState<string | null>(null);
  const [segment, setSegment] = React.useState("public");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [enabledFilter, setEnabledFilter] = React.useState("all");
  const [configDrafts, setConfigDrafts] = React.useState<Record<string, Record<string, unknown>>>({});
  const [refreshing, setRefreshing] = React.useState(false);
  const [sourcesOpen, setSourcesOpen] = React.useState(false);
  const [addMarketplaceOpen, setAddMarketplaceOpen] = React.useState(false);
  const [remoteSyncOpen, setRemoteSyncOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const savedScrollTop = React.useRef(0);
  const effectiveWorkspaceIdentity = workspaceIdentity?.trim() || null;
  const remoteSyncTarget = resolveRemoteSyncTarget({
    remoteSessionId,
    remoteTarget,
    clientMode: isWebRemoteControl ? "web-remote-replayable" : "desktop-continuous",
    hasLocalSourceService: !!baseServices.pluginSyncService,
  })
    ? remoteTarget
    : null;
  const remoteContextLabel = remoteSyncTarget ? remoteTargetDisplayName(remoteSyncTarget, workspacePath ?? "") : "";

  React.useEffect(() => {
    if (workspacePath) {
      initializeStore({ workspacePath, workspaceIdentity, pluginService: pluginManagementService });
    }
  }, [initializeStore, pluginManagementService, workspaceIdentity, workspacePath]);

  /* 官方市场首次刷新（原 160055） */
  const refreshedMarketplaceIds = React.useRef(new Set<string>());
  React.useEffect(() => {
    for (const marketplaceId of [...OFFICIAL_MARKETPLACE_IDS, CLAUDE_CODE_PLUGINS_MARKETPLACE_ID]) {
      const marketplace = marketplaces.find((candidate) => candidate.id === marketplaceId);
      if (!marketplace || refreshedMarketplaceIds.current.has(marketplaceId)) continue;
      refreshedMarketplaceIds.current.add(marketplaceId);
      if (marketplace.pluginCount === 0 || !marketplace.lastUpdated) updateMarketplace(marketplaceId, pluginManagementService);
    }
  }, [marketplaces, pluginManagementService, updateMarketplace]);

  const storeItems = React.useMemo(
    () =>
      buildStoreItems({
        marketplaces,
        marketplaceAvailabilityKnown,
        availablePlugins,
        installedPlugins,
        plugins,
        restorableBuiltins,
      }),
    [availablePlugins, installedPlugins, marketplaceAvailabilityKnown, marketplaces, plugins, restorableBuiltins]
  );
  const storeItemById = React.useMemo(() => new Map(storeItems.map((item) => [item.id, item] as const)), [storeItems]);
  const selectedItem = selectedPluginId ? storeItemById.get(selectedPluginId) ?? null : null;
  const installedPluginMetaById = React.useMemo(() => new Map(installedPlugins.map((meta) => [meta.id, meta] as const)), [installedPlugins]);
  const managedPlugins = React.useMemo(() => plugins.filter((plugin) => skillEnabledFilterMatch(plugin.enabled ?? false, enabledFilter)), [enabledFilter, plugins]); // A0-CLEANUP3 3b：enabled 对齐为可选，运行期恒有值

  React.useEffect(() => {
    if (view === "detail" && selectedItem && !selectedItem.info) {
      describePlugin(selectedItem.id, selectedItem.name, selectedItem.marketplace ?? "", pluginManagementService); // A0-CLEANUP3 3b：marketplace 运行期恒有值
    }
  }, [describePlugin, selectedItem, pluginManagementService, view]);
  React.useEffect(() => {
    if (view === "detail" && selectedPluginId && !storeItemById.has(selectedPluginId)) {
      setView("store");
      setSelectedPluginId(null);
    }
  }, [selectedPluginId, storeItemById, view]);

  const findScrollContainer = () => rootRef.current?.closest("main") ?? null;
  const handleOpenDetail = React.useCallback((pluginId: string) => {
    savedScrollTop.current = rootRef.current?.closest("main")?.scrollTop ?? 0;
    setSelectedPluginId(pluginId);
    setView("detail");
    requestAnimationFrame(() => {
      const container = rootRef.current?.closest("main");
      if (container) container.scrollTop = 0;
    });
  }, []);
  const handleBackToStore = React.useCallback(() => {
    setView("store");
    setSelectedPluginId(null);
    requestAnimationFrame(() => {
      const container = findScrollContainer();
      if (container) container.scrollTop = savedScrollTop.current;
    });
  }, []);

  const handleRefreshMarketplaces = async () => {
    setRefreshing(true);
    try {
      await handleCheckForUpdates();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAfterLocalChange = React.useCallback(async () => {
    await refreshSessionCapabilities({
      zcodeSessionService: workspaceAgentService,
      workspacePath,
      workspaceIdentity: effectiveWorkspaceIdentity ?? undefined,
      reason: "settings-plugin-enabled",
    });
    await refreshSkillCapabilities({ workspacePath, workspaceIdentity: effectiveWorkspaceIdentity, skillsService });
  }, [effectiveWorkspaceIdentity, skillsService, workspacePath, workspaceAgentService]);

  const handleAfterRemoteSync = React.useCallback(async () => {
    await refreshAfterPluginSync({
      commandsService,
      mcpSyncService,
      reason: "settings-remote-plugin-sync",
      skillsService,
      workspaceIdentity: effectiveWorkspaceIdentity,
      workspacePath,
      zcodeAgentService,
      zcodeSessionService: workspaceAgentService,
    });
  }, [commandsService, mcpSyncService, effectiveWorkspaceIdentity, skillsService, workspacePath, zcodeAgentService, workspaceAgentService]);

  const handleSetPluginEnabled = React.useCallback(
    async (pluginId: string, enabled: boolean) => {
      await setPluginEnabled(pluginId, enabled, pluginManagementService);
      await handleAfterLocalChange();
    },
    [pluginManagementService, handleAfterLocalChange, setPluginEnabled]
  );

  const uninstallFlow = useUninstallFlow({
    pluginService: pluginManagementService,
    installedPlugins,
    plugins,
    operationId,
    onAfterUninstall: async () => {
      await handleAfterLocalChange();
    },
  });

  const handleInstall = React.useCallback(
    async (item: PluginItem) => {
      if (item.restorable) {
        await restoreBuiltin(item.id, pluginManagementService);
      } else {
        await installPlugin(item.name, item.marketplace ?? "", pluginManagementService); // A0-CLEANUP3 3b：marketplace 运行期恒有值
      }
      await handleAfterLocalChange();
    },
    [installPlugin, pluginManagementService, handleAfterLocalChange, restoreBuiltin]
  );

  const handleUpdatePlugin = React.useCallback(
    async (pluginId: string) => {
      await updatePlugin(pluginId, pluginManagementService);
      if (!pluginsStoreStatic.getState().error) await handleAfterLocalChange();
    },
    [pluginManagementService, handleAfterLocalChange, updatePlugin]
  );

  const handleCheckForUpdates = React.useCallback(async () => {
    const updated = await updateMarketplace(null, pluginManagementService);
    if (!updated) {
      const error = pluginsStoreStatic.getState().error;
      if (error) toast(error);
      return;
    }
    const updatableCount = pluginsStoreStatic.getState().installedPlugins.filter((meta) => isUpdateAvailableStatus(meta.updateStatus)).length;
    if (updatableCount > 0) {
      toast(intl.formatMessage({ id: "settings.plugins.checkForUpdates.found" }, { count: String(updatableCount) }));
      return;
    }
    toast(intl.formatMessage({ id: "settings.plugins.checkForUpdates.none" }));
  }, [intl, pluginManagementService, updateMarketplace]);

  const handleUsePrompt = React.useCallback(
    (item: PluginItem, prompt?: string) => {
      if (!item.installed) {
        handleInstall(item);
        return;
      }
      if (!workspacePath || !onCreateTask) return;
      onCreateTask({
        initialPrompt: buildPluginChatPrompt({ item, locale, prompt }),
        initialPromptMention: buildPluginChatMention({ item, locale }),
      });
    },
    [handleInstall, locale, onCreateTask, workspacePath]
  );

  const handleSetConfigDraft = (pluginId: string, key: string, value: unknown) => {
    setConfigDrafts((previous) => ({
      ...previous,
      [pluginId]: { ...previous[pluginId], [key]: value },
    }));
  };

  const resolveConfigValue = (plugin: PluginDescribeInfo, key: string, spec: { default?: unknown; type: string }): unknown => {
    const draftValue = configDrafts[plugin.id as string]?.[key];
    if (draftValue !== undefined) return draftValue;
    const configured = plugin.configuredOptions?.[key];
    if (configured === undefined) {
      return spec.default === undefined ? (spec.type === "boolean" ? false : "") : spec.default;
    }
    return configured;
  };

  const handleSaveConfig = async (plugin: PluginDescribeInfo) => {
    const options: Record<string, unknown> = {};
    for (const [key, spec] of Object.entries(plugin.userConfig ?? {})) {
      if (spec.sensitive) continue;
      const value = resolveConfigValue(plugin, key, spec);
      if (spec.type === "number") {
        const numeric = typeof value === "number" ? value : Number(value);
        if (Number.isFinite(numeric)) options[key] = numeric;
        continue;
      }
      options[key] = value;
    }
    await configurePlugin(plugin.id as string, options, pluginManagementService);
  };

  const renderPluginSource = React.useCallback(
    (item: PluginItem) =>
      formatPluginSource({
        source: item.source,
        marketplace: item.marketplace,
        marketplaces,
        builtinLabel: intl.formatMessage({ id: "settings.plugins.source.builtin" }),
        claudeCodePluginsLabel: intl.formatMessage({ id: "settings.plugins.marketplace.claudeCodePlugins" }),
        formatFromMarketplace: () => intl.formatMessage({ id: "settings.plugins.source.fromMarketplace" }),
      }),
    [intl, marketplaces]
  );

  const storeActions = React.useMemo<PluginStoreActions>(
    () => ({
      onOpenDetail: handleOpenDetail,
      onInstall: (item) => void handleInstall(item),
      onUninstall: uninstallFlow.requestUninstall,
      onSetEnabled: (pluginId, enabled) => void handleSetPluginEnabled(pluginId, enabled),
      onUpdate: (pluginId) => void handleUpdatePlugin(pluginId),
      operationId,
      togglingPluginId,
    }),
    [handleInstall, handleSetPluginEnabled, handleUpdatePlugin, handleOpenDetail, operationId, togglingPluginId, uninstallFlow.requestUninstall]
  );

  if (!workspacePath) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle">
        {intl.formatMessage({ id: "settings.plugins.noWorkspace" })}
      </div>
    );
  }

  const updateState = describePluginUpdateState(selectedItem);

  return (
    <div ref={rootRef} className="space-y-5" data-testid="plugin-store-root" data-view={view}>
      {view === "store" ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="min-w-0 flex-1 text-ui-base leading-6 text-foreground-subtle">
            {intl.formatMessage({ id: "settings.plugins.store.subtitle" })}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <Tooltip
              title={refreshing ? intl.formatMessage({ id: "settings.plugins.refreshing" }) : intl.formatMessage({ id: "settings.plugins.refresh" })}
            >
              <Button
                type="button"
                data-testid="plugin-store-refresh"
                variant="ghost"
                size="icon-md"
                aria-label={
                  refreshing ? intl.formatMessage({ id: "settings.plugins.refreshing" }) : intl.formatMessage({ id: "settings.plugins.refresh" })
                }
                onClick={() => void handleRefreshMarketplaces()}
                disabled={refreshing}
              >
                <RefreshIcon className={refreshing ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden="true" />
              </Button>
            </Tooltip>
            <Tooltip title={intl.formatMessage({ id: "settings.plugins.store.sources.title" })}>
              <Button
                type="button"
                data-testid="plugin-store-sources-open"
                variant="ghost"
                size="icon-md"
                aria-label={intl.formatMessage({ id: "settings.plugins.store.sources.title" })}
                onClick={() => setSourcesOpen(true)}
              >
                <SettingsIcon className="size-3.5" aria-hidden="true" />
              </Button>
            </Tooltip>
            <DropdownMenuRoot>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="rounded-full" data-testid="plugin-store-create">
                  {intl.formatMessage({ id: "settings.plugins.store.create" })}
                  <ChevronDownIcon className="size-3.5" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-max">
                <DropdownMenuItem
                  className="whitespace-nowrap"
                  data-testid="plugin-store-add-source-menu-item"
                  onSelect={() => setAddMarketplaceOpen(true)}
                >
                  <PlusIcon className="size-4" aria-hidden="true" />
                  {intl.formatMessage({ id: "settings.plugins.marketplaces.add" })}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuRoot>
          </div>
        </div>
      ) : null}
      {remoteSyncTarget && view === "store" ? (
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "settings.plugins.remoteContext" }, { target: remoteContextLabel })}
        </div>
      ) : null}
      {storeError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-ui-base text-destructive" data-testid="plugin-store-error">
          {storeError}
        </div>
      ) : null}
      {view === "detail" && selectedItem ? (
        <PluginDetail
          item={selectedItem}
          actions={storeActions}
          describeEntry={describeCache[selectedItem.id]}
          onBack={handleBackToStore}
          onRetryDescribe={() => void describePlugin(selectedItem.id, selectedItem.name, selectedItem.marketplace ?? "", pluginManagementService, true)} // A0-CLEANUP3 3b：marketplace 运行期恒有值
          onUsePrompt={handleUsePrompt}
          advanced={
            selectedItem.info ? (
              <div className="space-y-4">
                {updateState ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-ui-base font-medium text-foreground">
                        {selectedItem.installedMeta?.updateStatus === "update-available"
                          ? intl.formatMessage(
                              { id: "settings.plugins.detail.updateAvailable" },
                              { version: selectedItem.installedMeta?.latestVersion ?? "" }
                            )
                          : intl.formatMessage({ id: "settings.plugins.detail.versionChanged" })}
                      </p>
                      <p className="text-ui-xs text-foreground-subtle">
                        {intl.formatMessage({ id: "settings.plugins.detail.updateNewSessionsNote" })}
                      </p>
                    </div>
                    <Button
                      type="button"
                      data-testid="plugin-store-detail-update"
                      variant="outline"
                      size="sm"
                      disabled={operationId === `plugin:update:${selectedItem.id}`}
                      onClick={() => void handleUpdatePlugin(selectedItem.id)}
                    >
                      {intl.formatMessage({ id: "settings.plugins.detail.update" })}
                    </Button>
                  </div>
                ) : null}
                <PluginAdvancedSection>
                  <PluginInfoRow label={intl.formatMessage({ id: "settings.plugins.detail.rootPath" })} value={selectedItem.info.rootPath} />
                  {(selectedItem.info.hookDetails ?? []).length > 0 ? (
                    <PluginHookDetailsList hooks={selectedItem.info.hookDetails ?? []} />
                  ) : null}
                  <PluginConfigForm
                    getValue={resolveConfigValue}
                    onSave={(plugin) => void handleSaveConfig(plugin)}
                    onSetDraft={handleSetConfigDraft}
                    operationId={operationId}
                    plugin={selectedItem.info}
                  />
                </PluginAdvancedSection>
              </div>
            ) : undefined
          }
        />
      ) : view === "manage" ? (
        <PluginManageList
          plugins={managedPlugins}
          installedPluginMetaById={installedPluginMetaById}
          loading={loading}
          enabledFilter={enabledFilter}
          onEnabledFilterChange={setEnabledFilter}
          togglingPluginId={togglingPluginId}
          checkingUpdates={operationId?.startsWith("marketplace:update:") ?? false}
          showRemoteSync={!!remoteSyncTarget}
          renderPluginSource={renderPluginSource}
          storeItemById={storeItemById}
          onBack={handleBackToStore}
          onCheckUpdates={() => void handleCheckForUpdates()}
          onOpenRemoteSync={() => setRemoteSyncOpen(true)}
          onSelectPlugin={handleOpenDetail}
          onPluginEnabledChange={handleSetPluginEnabled}
        />
      ) : (
        <PluginStoreGrid
          items={storeItems}
          marketplaces={marketplaces}
          actions={storeActions}
          loading={loading || (operationId?.startsWith("marketplace:update:") ?? false)}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          segment={segment}
          onSegmentChange={setSegment}
          onOpenManage={() => setView("manage")}
        />
      )}
      <PluginUninstallDialog
        open={uninstallFlow.pendingPlugin !== null}
        pluginName={uninstallFlow.pendingPlugin?.name ?? ""}
        pending={uninstallFlow.uninstalling}
        onCancel={uninstallFlow.cancelUninstall}
        onConfirm={() => void uninstallFlow.confirmUninstall()}
      />
      <PluginSourcesDialog
        open={sourcesOpen}
        onOpenChange={setSourcesOpen}
        marketplaces={marketplaces}
        onUpdateMarketplace={(marketplaceId) => void updateMarketplace(marketplaceId, pluginManagementService)}
        onRemoveMarketplace={(marketplaceId) => void removeMarketplace(marketplaceId, pluginManagementService)}
        operationId={operationId}
      />
      <AddMarketplaceDialog
        open={addMarketplaceOpen}
        onOpenChange={setAddMarketplaceOpen}
        onAddMarketplace={(request) => addMarketplace(request, pluginManagementService)}
        operationId={operationId}
      />
      <RemoteSyncDialogs
        canSyncSkills={false}
        canSyncMcp={false}
        canSyncPlugins={!!(remoteSyncTarget && workspacePath)}
        skillOpen={false}
        mcpOpen={false}
        pluginOpen={remoteSyncOpen}
        onSkillOpenChange={() => {}}
        onMcpOpenChange={() => {}}
        onPluginOpenChange={setRemoteSyncOpen}
        localPluginSyncService={baseServices.pluginSyncService}
        remotePluginSyncService={pluginSyncService}
        localZCodeAgentService={baseServices.zcodeAgentService}
        remoteZCodeAgentService={zcodeAgentService}
        remoteTarget={remoteSyncTarget}
        skillWorkspacePath=""
        mcpWorkspacePath=""
        pluginWorkspacePath={workspacePath ?? ""}
        pluginLocalWorkspacePath={localWorkspacePath ?? undefined}
        workspaceIdentity={workspaceIdentity}
        onSkillsSynced={() => {}}
        onMcpSynced={() => {}}
        onPluginsSynced={handleAfterRemoteSync}
      />
    </div>
  );
}

/* ============================================================================
 * 4. 命令分区（原 G0t，js 200852–201243 / jsx 160523–160725）
 * ==========================================================================*/

export interface CommandItem {
  id: string;
  name: string;
  description?: string;
  argumentHint?: string;
  prompt?: string;
  enabled: boolean;
  agentSource: string;
  filePath: string;
  pluginName?: string;
  scope?: "user" | "project";
  location?: { source: string; scope: "user" | "project"; directoryPath?: string };
  [key: string]: unknown;
}
export interface CommandConfig {
  name: string;
  prompt: string;
  description?: string;
  argumentHint?: string;
}

/* 命令 store 桥（原 F6 142754，接口级） */
interface CommandsStoreState {
  commands: CommandItem[];
  userCommands: CommandItem[];
  pluginCommands: CommandItem[];
  capability: { userScopeAvailable?: boolean } | null;
  loading: boolean;
  error: string | null;
  operatingCommandId: string | null;
  initialize: (workspacePath: string | undefined, commandsService: unknown, workspaceIdentity?: string | null) => Promise<void>;
  refresh: (commandsService: unknown) => Promise<void>;
  createCommand: (
    request: { agentSource: string; config: CommandConfig; storageLevel?: string; workspacePath?: string },
    commandsService: unknown
  ) => Promise<void>;
  updateCommand: (
    request: {
      agentSource: string;
      commandId: string;
      config: CommandConfig;
      oldFilePath: string;
      storageLevel: string;
      workspacePath?: string;
    },
    commandsService: unknown
  ) => Promise<void>;
  deleteCommand: (request: { agentSource: string; commandId: string; filePath: string }, commandsService: unknown) => Promise<void>;
  toggleCommand: (
    request: { agentSource: string; commandId: string; filePath: string; enabled: boolean },
    commandsService: unknown
  ) => Promise<void>;
}

/** 原 L0t（js 200503）：命令 store 桥 hook（初始化 + 动作封装） */
export function useCommandsStoreBridge(opts: {
  workspacePath?: string;
  workspaceIdentity?: string | null;
  enabled?: boolean;
} = {}) {
  const { workspacePath, workspaceIdentity, enabled = true } = opts;
  const { commandsService } = useServices();
  const commands = useCommandsStore((state) => state.commands);
  const userCommands = useCommandsStore((state) => state.userCommands);
  const pluginCommands = useCommandsStore((state) => state.pluginCommands);
  const capability = useCommandsStore((state) => state.capability);
  const loading = useCommandsStore((state) => state.loading);
  const error = useCommandsStore((state) => state.error);
  const operatingCommandId = useCommandsStore((state) => state.operatingCommandId);
  const initialize = useCommandsStore((state) => state.initialize);
  const refresh = useCommandsStore((state) => state.refresh);
  const createCommand = useCommandsStore((state) => state.createCommand);
  const updateCommand = useCommandsStore((state) => state.updateCommand);
  const deleteCommand = useCommandsStore((state) => state.deleteCommand);
  const toggleCommand = useCommandsStore((state) => state.toggleCommand);

  React.useEffect(() => {
    if (enabled) initialize(workspacePath ?? null, commandsService, workspaceIdentity); // A0-CLEANUP3 3b：workspacePath 形参为 string | null
  }, [enabled, workspacePath, workspaceIdentity, commandsService, initialize]);

  const handleRefresh = React.useCallback(() => refresh(commandsService), [commandsService, refresh]);
  const handleCreate = React.useCallback(
    (config: CommandConfig, agentSource: string, extra?: { storageLevel?: string; workspacePath?: string }) =>
      createCommand({ agentSource, config, ...extra }, commandsService),
    [commandsService, createCommand]
  );
  const handleUpdate = React.useCallback(
    (request: Parameters<CommandsStoreState["updateCommand"]>[0]) => updateCommand(request, commandsService),
    [commandsService, updateCommand]
  );
  const handleDelete = React.useCallback(
    (request: Parameters<CommandsStoreState["deleteCommand"]>[0]) => deleteCommand(request, commandsService),
    [commandsService, deleteCommand]
  );
  const handleToggle = React.useCallback(
    (request: Parameters<CommandsStoreState["toggleCommand"]>[0]) => toggleCommand(request, commandsService),
    [commandsService, toggleCommand]
  );

  return React.useMemo(
    () => ({
      commands,
      userCommands,
      pluginCommands,
      capability,
      loading,
      error,
      operatingCommandId,
      refresh: handleRefresh,
      createCommand: handleCreate,
      updateCommand: handleUpdate,
      deleteCommand: handleDelete,
      toggleCommand: handleToggle,
    }),
    [commands, userCommands, pluginCommands, capability, loading, error, operatingCommandId, handleRefresh, handleCreate, handleUpdate, handleDelete, handleToggle]
  );
}

/** 原 m9（jsx 160369）：用户可管理命令（文件型 + zcode 来源） */
export function isUserManagedCommand(command: CommandItem): boolean {
  return isFileBasedCommand(command) && command.location?.source === "zcode";
}

/** 原 R0t（jsx 160372）：命令作用域徽章 */
export function CommandScopeBadge({ location }: { location: { scope: "user" | "project" } }) {
  const { intl } = useIntlContext();
  const messageId = location.scope === "project" ? "settings.scope.workspace" : "settings.scope.user";
  return (
    <span className="rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle">
      {intl.formatMessage({ id: messageId })}
    </span>
  );
}

/** 原 z0t（js 200556）：命令行件 */
export function CommandRow(props: {
  command: CommandItem;
  onEdit?: (command: CommandItem) => void;
  onDelete?: (command: CommandItem) => void;
  onToggle?: (command: CommandItem, enabled: boolean) => void;
  isOperating: boolean;
  pluginManagedHint?: string;
}) {
  const { command, onEdit, onDelete, onToggle, isOperating, pluginManagedHint } = props;
  const { intl } = useIntlContext();
  const canEdit = isUserManagedCommand(command);
  const canDelete = isUserManagedCommand(command);
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover">
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground-subtle"
        aria-hidden="true"
      >
        <CommandIcon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-ui-base font-medium text-foreground">{command.name}</span>
          {command.argumentHint ? <span className="text-ui-base text-foreground-subtlest">{command.argumentHint}</span> : null}
          {isFileBasedCommand(command) ? <CommandScopeBadge location={command.location as { scope: "user" | "project" }} /> : null}
          {isPluginCommand(command) ? (
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle">{command.pluginName}</span>
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-ui-base text-foreground-subtle">
          {command.description || intl.formatMessage({ id: "settings.commands.noDescription" })}
        </p>
        {isFileBasedCommand(command) ? (
          <p className="mt-0.5 truncate font-mono text-ui-base text-foreground-subtlest">{command.location?.directoryPath}</p>
        ) : null}
        {isPluginCommand(command) && pluginManagedHint ? (
          <p className="mt-0.5 truncate text-ui-base text-foreground-subtlest">{pluginManagedHint}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isFileBasedCommand(command) && onToggle ? (
          <Switch checked={command.enabled} onCheckedChange={(enabled) => onToggle(command, enabled)} disabled={isOperating} />
        ) : null}
        <div className="flex items-center gap-1">
          {canEdit && onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              onClick={() => onEdit(command)}
              disabled={isOperating}
              title={intl.formatMessage({ id: "settings.commands.edit" })}
            >
              <PencilIcon className="size-3.5" />
            </Button>
          )}
          {canDelete && onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              onClick={() => void onDelete(command)}
              disabled={isOperating}
              title={intl.formatMessage({ id: "common.delete" })}
            >
              <TrashIcon className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/** 原 B0t（jsx 160404）及长度限制 */
const COMMAND_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
const COMMAND_NAME_MIN_LENGTH = 1;
const COMMAND_NAME_MAX_LENGTH = 50;

/** 原 h9（jsx 160407）：命令表单 label */
export function CommandFormLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-ui-base font-medium text-foreground-subtle">{children}</label>;
}

/** 原 U0t（jsx 160412）：命令存储级别选择（user|project） */
export function CommandStorageLevelSelect(props: {
  disabled: boolean;
  storageLevel: "user" | "project";
  workspaceAvailable: boolean;
  onChange: (level: "user" | "project") => void;
}) {
  const { disabled, storageLevel, workspaceAvailable, onChange } = props;
  const { intl } = useIntlContext();
  return (
    <label className="flex min-w-0 flex-wrap items-center justify-end gap-2">
      <span className="shrink-0 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.scope.label" })}</span>
      <SelectRoot value={storageLevel} onValueChange={(value) => onChange(value as "user" | "project")} disabled={disabled}>
        <SelectTrigger size="lg" className="justify-between">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="user">{intl.formatMessage({ id: "settings.scope.user" })}</SelectItem>
          <SelectItem value="project" disabled={!workspaceAvailable}>
            {intl.formatMessage({ id: "settings.scope.workspace" })}
          </SelectItem>
        </SelectContent>
      </SelectRoot>
    </label>
  );
}

/** 原 W0t（js 200703）：命令表单（名称校验 1–50 + 字符集 + prompt 必填） */
export function CommandForm(props: {
  initial?: CommandItem;
  workspaceAvailable?: boolean;
  onSave: (config: CommandConfig, storageLevel: "user" | "project") => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const { initial, workspaceAvailable = false, onSave, onCancel, saving } = props;
  const { intl } = useIntlContext();
  const initialName = initial?.name?.replace(/^\//, "") ?? "";
  const initialStorageLevel = initial?.scope === "project" ? "project" : "user";
  const [name, setName] = React.useState(initialName);
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [argumentHint, setArgumentHint] = React.useState(initial?.argumentHint ?? "");
  const [prompt, setPrompt] = React.useState(initial?.prompt ?? "");
  const [storageLevel, setStorageLevel] = React.useState<"user" | "project">(workspaceAvailable ? initialStorageLevel : "user");
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [promptError, setPromptError] = React.useState<string | null>(null);

  const validate = () => {
    let valid = true;
    const trimmedName = name.trim();
    if (initial) {
      setNameError(null);
    } else if (trimmedName.length < COMMAND_NAME_MIN_LENGTH || trimmedName.length > COMMAND_NAME_MAX_LENGTH) {
      setNameError(
        intl.formatMessage(
          { id: "settings.commands.form.validation.nameLength" },
          { min: String(COMMAND_NAME_MIN_LENGTH), max: String(COMMAND_NAME_MAX_LENGTH) }
        )
      );
      valid = false;
    } else if (COMMAND_NAME_PATTERN.test(trimmedName)) {
      setNameError(null);
    } else {
      setNameError(intl.formatMessage({ id: "settings.commands.form.validation.nameCharacters" }));
      valid = false;
    }
    if (prompt.trim()) {
      setPromptError(null);
    } else {
      setPromptError(intl.formatMessage({ id: "settings.commands.form.validation.promptRequired" }));
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    await onSave(
      {
        name: name.trim(),
        prompt: prompt.trim(),
        description: description.trim() || undefined,
        argumentHint: argumentHint.trim() || undefined,
      },
      storageLevel
    );
  };

  const storageLevelSelect = (
    <CommandStorageLevelSelect disabled={!!initial} storageLevel={storageLevel} workspaceAvailable={workspaceAvailable} onChange={setStorageLevel} />
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="w-full min-w-0 space-y-1.5 md:w-48">
          <CommandFormLabel>{intl.formatMessage({ id: "settings.commands.form.name.label" })}</CommandFormLabel>
          <Input
            type="text"
            size="lg"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={intl.formatMessage({ id: "settings.commands.form.name.placeholder" })}
            disabled={!!initial}
          />
        </div>
        <div>{storageLevelSelect}</div>
      </div>
      {nameError ? <p className="-mt-1 text-ui-base text-destructive">{nameError}</p> : null}
      <div className="space-y-1.5">
        <CommandFormLabel>{intl.formatMessage({ id: "settings.commands.form.description.label" })}</CommandFormLabel>
        <Input
          type="text"
          size="lg"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={intl.formatMessage({ id: "settings.commands.form.description.placeholder" })}
        />
      </div>
      <div className="space-y-1.5">
        <CommandFormLabel>{intl.formatMessage({ id: "settings.commands.form.argumentHint.label" })}</CommandFormLabel>
        <Input
          type="text"
          size="lg"
          value={argumentHint}
          onChange={(event) => setArgumentHint(event.target.value)}
          placeholder={intl.formatMessage({ id: "settings.commands.form.argumentHint.placeholder" })}
        />
      </div>
      <div className="space-y-1.5">
        <CommandFormLabel>{intl.formatMessage({ id: "settings.commands.form.prompt.label" })}</CommandFormLabel>
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={5}
          className="min-h-28 text-ui-base"
          placeholder={intl.formatMessage({ id: "settings.commands.form.prompt.placeholder" })}
        />
        {promptError ? <p className="text-ui-base text-destructive">{promptError}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button type="submit" variant="default" size="lg" disabled={saving}>
          {saving ? intl.formatMessage({ id: "common.saving" }) : intl.formatMessage({ id: "common.save" })}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onCancel} disabled={saving}>
          {intl.formatMessage({ id: "common.cancel" })}
        </Button>
      </div>
    </form>
  );
}

export interface CommandsSettingsSectionProps {
  workspacePath: string | null;
  workspaceIdentity?: string | null;
}

/** 原 G0t：命令分区根（列表/搜索/创建/编辑/删除/导入） */
export function CommandsSettingsSection(props: CommandsSettingsSectionProps) {
  const { workspacePath, workspaceIdentity } = props;
  const { intl } = useIntlContext();
  const platform = usePlatformService();
  const { commandsService } = useServices();
  const confirmDialog = useConfirmDialog();
  const {
    commands,
    capability,
    loading,
    error,
    operatingCommandId,
    refresh,
    createCommand,
    updateCommand,
    deleteCommand,
    toggleCommand,
  } = useCommandsStoreBridge({ workspacePath: workspacePath ?? undefined, workspaceIdentity });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [refreshing, setRefreshing] = React.useState(false);
  const [formVisible, setFormVisible] = React.useState(false);
  const [editingCommand, setEditingCommand] = React.useState<CommandItem | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const handleOpenUserCommandsFolder = React.useCallback(async () => {
    try {
      const { path } = await commandsService.getPrimaryUserCommandsDirectory({ agentSource: COMMANDS_AGENT_SOURCE });
      const result = await platform.openInFileManager(path);
      if (!result.success) toast(intl.formatMessage({ id: "appHeader.openInFileManagerFailed" }));
    } catch {
      toast(intl.formatMessage({ id: "appHeader.openInFileManagerFailed" }));
    }
  }, [commandsService, intl, platform]);

  const handleSaveCommand = React.useCallback(
    async (config: CommandConfig, storageLevel: "user" | "project") => {
      setSaving(true);
      try {
        const targetWorkspacePath = storageLevel === "project" ? workspacePath ?? undefined : undefined;
        if (editingCommand) {
          await updateCommand({
            agentSource: editingCommand.agentSource,
            commandId: editingCommand.id,
            config,
            oldFilePath: editingCommand.filePath,
            storageLevel,
            workspacePath: targetWorkspacePath,
          });
        } else {
          await createCommand(config, COMMANDS_AGENT_SOURCE, { storageLevel, workspacePath: targetWorkspacePath });
        }
        setFormVisible(false);
        setEditingCommand(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("exists") || message.includes("already")) {
          toast(intl.formatMessage({ id: "forms.validation.fileExists" }, { fileName: `${config.name.replace(/^\//, "")}.md` }));
        } else {
          toast(message);
        }
      } finally {
        setSaving(false);
      }
    },
    [createCommand, editingCommand, intl, updateCommand, workspacePath]
  );

  const handleDeleteCommand = React.useCallback(
    async (command: CommandItem) => {
      if (!isUserManagedCommand(command)) return;
      const confirmed = await confirmDialog({
        title: intl.formatMessage({ id: "settings.commands.delete.title" }),
        description: intl.formatMessage({ id: "settings.commands.delete.description" }, { name: command.name }),
        confirmLabel: intl.formatMessage({ id: "common.delete" }),
      });
      if (!confirmed) return;
      try {
        await deleteCommand({ agentSource: command.agentSource, commandId: command.id, filePath: command.filePath });
      } catch (err) {
        toast(err instanceof Error ? err.message : String(err));
      }
    },
    [confirmDialog, deleteCommand, intl]
  );

  const handleToggleCommand = React.useCallback(
    async (command: CommandItem, enabled: boolean) => {
      if (!isFileBasedCommand(command)) return;
      try {
        await toggleCommand({ agentSource: command.agentSource, commandId: command.id, filePath: command.filePath, enabled });
      } catch (err) {
        toast(err instanceof Error ? err.message : String(err));
      }
    },
    [toggleCommand]
  );

  const handleEditCommand = React.useCallback((command: CommandItem) => {
    if (isUserManagedCommand(command)) {
      setEditingCommand(command);
      setFormVisible(false);
    }
  }, []);

  const handleAddNew = React.useCallback(() => {
    setEditingCommand(null);
    setFormVisible(true);
  }, []);

  const handleBackToList = React.useCallback(() => {
    setFormVisible(false);
    setEditingCommand(null);
  }, []);

  const groupedCommands = React.useMemo(() => splitCommandsByScope(commands, searchQuery), [commands, searchQuery]);
  const totalVisible = groupedCommands.local.length + groupedCommands.plugin.length;
  const formMode = formVisible || editingCommand !== null;
  const pluginManagedHint = intl.formatMessage({ id: "settings.pluginManaged.modifyInPlugin" });

  if (formMode) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <BackLinkButton onClick={handleBackToList}>{intl.formatMessage({ id: "settings.commands.backToList" })}</BackLinkButton>
          <div className="space-y-1">
            <h3 className="text-ui-lg font-semibold text-foreground">
              {editingCommand ? intl.formatMessage({ id: "settings.commands.edit" }) : intl.formatMessage({ id: "settings.commands.addNew" })}
            </h3>
            <p className="text-ui-base text-foreground-subtle">
              {editingCommand
                ? intl.formatMessage({ id: "settings.commands.editDescription" })
                : intl.formatMessage({ id: "settings.commands.addDescription" })}
            </p>
          </div>
          <CommandForm
            initial={editingCommand ?? undefined}
            workspaceAvailable={!!workspacePath}
            onSave={handleSaveCommand}
            onCancel={handleBackToList}
            saving={saving}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-ui-base leading-6 text-foreground-subtle">
          {intl.formatMessage({ id: "settings.commands.description" })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {capability?.userScopeAvailable && (
            <Tooltip title={intl.formatMessage({ id: "settings.commands.addNew" })}>
              <Button
                type="button"
                variant="ghost"
                size="icon-md"
                aria-label={intl.formatMessage({ id: "settings.commands.addNew" })}
                onClick={handleAddNew}
              >
                <PlusIcon className="size-3.5" aria-hidden="true" />
              </Button>
            </Tooltip>
          )}
          {capability?.userScopeAvailable && (
            <Tooltip title={intl.formatMessage({ id: "settings.commands.import.open" })}>
              <Button
                type="button"
                variant="ghost"
                size="icon-md"
                aria-label={intl.formatMessage({ id: "settings.commands.import.open" })}
                onClick={() => setImportOpen(true)}
              >
                <DownloadIcon className="size-3.5" aria-hidden="true" />
              </Button>
            </Tooltip>
          )}
          {capability?.userScopeAvailable && (
            <Tooltip title={intl.formatMessage({ id: "settings.commands.openUserCommandsFolder" })}>
              <Button
                type="button"
                variant="ghost"
                size="icon-md"
                aria-label={intl.formatMessage({ id: "settings.commands.openUserCommandsFolder" })}
                onClick={() => void handleOpenUserCommandsFolder()}
              >
                <FolderOpenIcon className="size-3.5" aria-hidden="true" />
              </Button>
            </Tooltip>
          )}
          <Tooltip
            title={refreshing ? intl.formatMessage({ id: "settings.skills.refreshing" }) : intl.formatMessage({ id: "settings.skills.refresh" })}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              aria-label={
                refreshing ? intl.formatMessage({ id: "settings.skills.refreshing" }) : intl.formatMessage({ id: "settings.skills.refresh" })
              }
              onClick={() => void handleRefresh()}
              disabled={refreshing || loading}
            >
              <RefreshIcon className={refreshing ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden="true" />
            </Button>
          </Tooltip>
        </div>
      </div>
      <Input
        type="text"
        size="lg"
        className="h-9 rounded-xl"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder={intl.formatMessage({ id: "settings.commands.searchPlaceholder" })}
      />
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-ui-base text-destructive">{error}</div>
      ) : null}
      {loading ? (
        <div className="px-4 py-3 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "common.loading" })}</div>
      ) : totalVisible === 0 ? (
        <div className="overflow-hidden rounded-xl border border-dashed border-border">
          <div className="px-4 py-3 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.commands.empty" })}</div>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedCommands.local.length > 0 ? (
            <section className="space-y-2">
              <ResourceGroupHeader count={groupedCommands.local.length} title={intl.formatMessage({ id: "settings.commands.group.local" })} />
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="divide-y divide-border">
                  {groupedCommands.local.map((command) => (
                    <CommandRow
                      key={command.id}
                      command={command}
                      onEdit={isUserManagedCommand(command) ? handleEditCommand : undefined}
                      onDelete={isUserManagedCommand(command) ? handleDeleteCommand : undefined}
                      onToggle={handleToggleCommand}
                      isOperating={operatingCommandId === command.id}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : null}
          {groupedCommands.plugin.length > 0 ? (
            <section className="space-y-2">
              <ResourceGroupHeader
                count={groupedCommands.plugin.length}
                hint={pluginManagedHint}
                title={intl.formatMessage({ id: "settings.commands.group.plugin" })}
              />
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="divide-y divide-border">
                  {groupedCommands.plugin.map((command) => (
                    <CommandRow key={command.id} command={command} pluginManagedHint={pluginManagedHint} isOperating={operatingCommandId === command.id} />
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      )}
      <CommandsImportDialog
        open={importOpen}
        workspacePath={workspacePath}
        workspaceIdentity={workspaceIdentity}
        onOpenChange={setImportOpen}
        onImported={refresh}
      />
    </div>
  );
}

/* ============================================================================
 * 5. Hooks 分区（原 p2t，js 202032–202285 / jsx 161468–161624）
 * ==========================================================================*/

export interface HookItem {
  id: string;
  event: string;
  type: "process" | "command" | string;
  matcher?: string;
  command: string;
  args?: string[];
  async?: boolean;
  shell?: string | boolean;
  statusMessage?: string;
  timeout?: number;
  enabled: boolean;
  custom?: Record<string, unknown>;
  location?: { source: string; scope?: string; directoryPath?: string; projectPath?: string }; // A0-CLEANUP3 3b：与 StoresDeep.HookDescriptor.location 对齐
  [key: string]: unknown;
}
export interface PluginHookRowModel {
  detail: {
    event: string;
    type: string;
    matcher?: string;
    command: string;
    args?: string[];
    sourcePath?: string;
    runnable?: boolean;
  };
  pluginEnabled: boolean;
  pluginId: string;
  pluginName: string;
  pluginScope?: string;
}

/** hooks store（原 Z0t，201244 / jsx 160815；接口级） */
interface HooksStoreState {
  hooks: HookItem[];
  loading: boolean;
  error: string | null;
  operatingHookId: string | null;
  initialize: (workspacePath: string | undefined, workspaceIdentity: string | null | undefined, hooksService: unknown) => Promise<void>;
  refresh: (hooksService: unknown) => Promise<void>;
  addHook: (hook: HookFormValues, hooksService: unknown) => Promise<void>;
  updateHook: (hookId: string, hook: HookFormValues, hooksService: unknown) => Promise<void>;
  deleteHook: (hookId: string, hooksService: unknown) => Promise<void>;
  toggleHook: (hookId: string, enabled: boolean, hooksService: unknown) => Promise<void>;
  importHook: (hookId: string, hooksService: unknown) => Promise<void>;
}

/** 原 Q0t（jsx 161013）：label 槽（data-slot="label"） */
export function FormLabelSlot({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      data-slot="label"
      className={cn("text-ui-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      {...props}
    />
  );
}

/** 原 $0t（jsx 161019）/ n2t（jsx 161236）：hook 事件枚举（两处同值） */
export const HOOK_EVENTS = [
  "SessionStart",
  "UserPromptSubmit",
  "PreToolUse",
  "PermissionRequest",
  "PostToolUse",
  "PostToolUseFailure",
  "Stop",
];
const HOOK_EVENT_ORDER = HOOK_EVENTS;

/** 原 e2t（jsx 161020）：custom 对象 → JSON 文本 */
export function customJsonOf(custom: Record<string, unknown> | undefined): string {
  return custom && Object.keys(custom).length > 0 ? JSON.stringify(custom, null, 2) : "";
}

export interface HookFormValues {
  event: string;
  matcher?: string;
  type: string;
  command: string;
  args?: string[];
  async?: boolean;
  shell?: string | boolean;
  statusMessage?: string;
  timeout: number;
  enabled: boolean;
  custom?: Record<string, unknown>;
  storageLevel: "user" | "project";
  [key: string]: unknown; // A0-CLEANUP3 3b：流入 Partial<HookDescriptor>（带索引签名），接口级补齐
}

/** 原 y9（jsx 161229）：hook 表单字段容器 */
export function HookFormField(props: { children: React.ReactNode; htmlFor: string; label: string }) {
  const { children, htmlFor, label } = props;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <FormLabelSlot htmlFor={htmlFor} className="text-foreground-subtle">
        {label}
      </FormLabelSlot>
      {children}
    </div>
  );
}

/** 原 t2t（js 201390）：hook 表单（事件/类型/匹配/命令/参数/shell/异步/高级） */
export function HookForm(props: {
  hook?: HookItem;
  workspaceAvailable?: boolean;
  defaultStorageLevel?: "user" | "project";
  onSave: (values: HookFormValues) => void;
  onCancel: () => void;
  isEditing?: boolean;
}) {
  const { hook, workspaceAvailable = false, defaultStorageLevel = "user", onSave, onCancel, isEditing = false } = props;
  const { intl } = useIntlContext();
  const hookStorageLevel = hook?.location?.scope === "project" ? "project" : "user";
  const [storageLevel, setStorageLevel] = React.useState<"user" | "project">(workspaceAvailable ? (hook ? hookStorageLevel : defaultStorageLevel) : "user");
  const [event, setEvent] = React.useState(hook?.event ?? "PreToolUse");
  const [type, setType] = React.useState(hook?.type ?? "process");
  const [matcher, setMatcher] = React.useState(hook?.matcher ?? "");
  const [command, setCommand] = React.useState(hook?.command ?? "");
  const [argsText, setArgsText] = React.useState((hook?.args ?? []).join("\n"));
  const [asyncEnabled, setAsyncEnabled] = React.useState(hook?.async ?? false);
  const [shell, setShell] = React.useState(typeof hook?.shell === "string" ? hook.shell : "");
  const [statusMessage, setStatusMessage] = React.useState(hook?.statusMessage ?? "");
  const [timeoutInput, setTimeoutInput] = React.useState(String(hook?.timeout ?? 60));
  const [customJson, setCustomJson] = React.useState(customJsonOf(hook?.custom));
  const [customError, setCustomError] = React.useState<string | null>(null);

  const handleSave = React.useCallback(() => {
    if (!command.trim()) return;
    let custom: Record<string, unknown> | undefined;
    if (customJson.trim()) {
      try {
        const parsed: unknown = JSON.parse(customJson);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          setCustomError(intl.formatMessage({ id: "settings.hooks.customJsonObjectError" }));
          return;
        }
        custom = parsed as Record<string, unknown>;
      } catch {
        setCustomError(intl.formatMessage({ id: "settings.hooks.customJsonParseError" }));
        return;
      }
    }
    setCustomError(null);
    onSave({
      event,
      matcher: matcher.trim() || undefined,
      type,
      command: command.trim(),
      ...(type === "process"
        ? { args: argsText.split("\n").map((line) => line.trim()).filter(Boolean) }
        : { async: asyncEnabled, shell: shell.trim() || (hook?.shell === true ? true : undefined) }),
      statusMessage: statusMessage.trim() || undefined,
      timeout: Number.parseInt(timeoutInput, 10) || 60,
      enabled: hook?.enabled ?? true,
      custom,
      storageLevel,
    });
  }, [argsText, asyncEnabled, command, customJson, event, hook?.enabled, hook?.shell, intl, matcher, onSave, shell, statusMessage, storageLevel, timeoutInput, type]);

  return (
    <div className="space-y-4" data-testid="hooks-form">
      <BackLinkButton onClick={onCancel}>{intl.formatMessage({ id: "settings.hooks.backToList" })}</BackLinkButton>
      <div className="space-y-1">
        <h3 className="text-ui-lg font-semibold text-foreground">
          {intl.formatMessage({ id: isEditing ? "settings.hooks.edit" : "settings.hooks.add" })}
        </h3>
        <p className="text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.hooks.description" })}</p>
      </div>
      <div className="space-y-3 rounded-xl border border-border p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <HookFormField label={intl.formatMessage({ id: "settings.scope.label" })} htmlFor="hook-scope">
            <SelectRoot value={storageLevel} onValueChange={(value) => setStorageLevel(value as "user" | "project")} disabled={!!hook}>
              <SelectTrigger id="hook-scope" size="lg" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">{intl.formatMessage({ id: "settings.scope.user" })}</SelectItem>
              </SelectContent>
            </SelectRoot>
          </HookFormField>
          <HookFormField label={intl.formatMessage({ id: "settings.hooks.event" })} htmlFor="hook-event">
            <SelectRoot value={event} onValueChange={(value) => setEvent(value)}>
              <SelectTrigger id="hook-event" size="lg" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOOK_EVENTS.map((hookEvent) => (
                  <SelectItem key={hookEvent} value={hookEvent}>
                    {hookEvent}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </HookFormField>
          <HookFormField label={intl.formatMessage({ id: "settings.hooks.type" })} htmlFor="hook-runner">
            <SelectRoot value={type} onValueChange={(value) => setType(value)}>
              <SelectTrigger id="hook-runner" size="lg" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["process", "command"].map((runner) => (
                  <SelectItem key={runner} value={runner}>
                    {intl.formatMessage({ id: `settings.hooks.type.${runner}` })}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </HookFormField>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <HookFormField label={intl.formatMessage({ id: "settings.hooks.matcher" })} htmlFor="matcher">
            <Input
              id="matcher"
              size="lg"
              value={matcher}
              onChange={(event) => setMatcher(event.target.value)}
              placeholder={intl.formatMessage({ id: "settings.hooks.matcherPlaceholder" })}
            />
            <p className="text-ui-base text-foreground-subtlest">{intl.formatMessage({ id: "settings.hooks.matcherHint" })}</p>
          </HookFormField>
          <HookFormField label={intl.formatMessage({ id: "settings.hooks.command" })} htmlFor="command">
            <Input
              id="command"
              size="lg"
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              placeholder={intl.formatMessage({ id: "settings.hooks.commandPlaceholder" })}
              className="font-mono"
            />
          </HookFormField>
        </div>
        {type === "process" ? (
          <HookFormField label={intl.formatMessage({ id: "settings.hooks.args" })} htmlFor="args">
            <Textarea
              id="args"
              value={argsText}
              onChange={(event) => setArgsText(event.target.value)}
              placeholder={intl.formatMessage({ id: "settings.hooks.argsPlaceholder" })}
              rows={4}
              className="resize-y font-mono"
            />
            <p className="text-ui-base text-foreground-subtlest">{intl.formatMessage({ id: "settings.hooks.argsHint" })}</p>
          </HookFormField>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <HookFormField label={intl.formatMessage({ id: "settings.hooks.shell" })} htmlFor="hook-shell">
              <Input
                id="hook-shell"
                size="lg"
                value={shell}
                onChange={(event) => setShell(event.target.value)}
                placeholder={intl.formatMessage({ id: "settings.hooks.shellPlaceholder" })}
                className="font-mono"
              />
            </HookFormField>
            <div className="flex items-end justify-between gap-4 pb-1">
              <FormLabelSlot htmlFor="hook-async-command">{intl.formatMessage({ id: "settings.hooks.async" })}</FormLabelSlot>
              <Switch id="hook-async-command" checked={asyncEnabled} onCheckedChange={setAsyncEnabled} />
            </div>
          </div>
        )}
        <details className="group/advanced border-t border-border pt-3">
          <summary className="flex cursor-pointer list-none items-center gap-1 text-ui-base font-medium text-foreground-subtle">
            <ChevronRightIcon className="size-3.5 transition-transform group-open/advanced:rotate-90" aria-hidden="true" />
            {intl.formatMessage({ id: "settings.hooks.advanced" })}
          </summary>
          <div className="mt-3 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <HookFormField label={intl.formatMessage({ id: "settings.hooks.timeout" })} htmlFor="timeout">
                <Input id="timeout" size="lg" type="number" min={1} value={timeoutInput} onChange={(event) => setTimeoutInput(event.target.value)} className="w-28" />
                <p className="text-ui-base text-foreground-subtlest">{intl.formatMessage({ id: "settings.hooks.timeoutHint" })}</p>
              </HookFormField>
              <HookFormField label={intl.formatMessage({ id: "settings.hooks.statusMessage" })} htmlFor="hook-status-message">
                <Input
                  id="hook-status-message"
                  size="lg"
                  value={statusMessage}
                  onChange={(event) => setStatusMessage(event.target.value)}
                  placeholder={intl.formatMessage({ id: "settings.hooks.statusMessagePlaceholder" })}
                />
              </HookFormField>
            </div>
            <HookFormField label={intl.formatMessage({ id: "settings.hooks.customJson" })} htmlFor="hook-custom-json">
              <Textarea
                id="hook-custom-json"
                value={customJson}
                onChange={(event) => setCustomJson(event.target.value)}
                rows={5}
                className="resize-y font-mono text-ui-base"
                placeholder={`{
  "customKey": "value"
}`}
              />
              {customError ? <p className="text-ui-base text-destructive">{customError}</p> : null}
            </HookFormField>
          </div>
        </details>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button size="lg" onClick={handleSave} disabled={!command.trim()}>
            {intl.formatMessage({ id: "common.save" })}
          </Button>
          <Button variant="ghost" size="lg" onClick={onCancel}>
            {intl.formatMessage({ id: "common.cancel" })}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** 原 r2t（jsx 161237）：作用域 Tabs（仅 user 触发器；project 由工作区推导） */
export function HookScopeTabs(props: { onScopeChange: (scope: string) => void; scope: string }) {
  const { onScopeChange, scope } = props;
  const { intl } = useIntlContext();
  return (
    <Tabs value={scope} onValueChange={(value) => onScopeChange(value)} className="w-fit">
      <TabsList className="rounded-full bg-surface flex h-8 p-0.5 group-data-horizontal/tabs:h-8">
        <TabsTrigger
          value="user"
          className="h-7 flex-none rounded-full border-transparent bg-transparent px-2.5 text-ui-base font-medium text-foreground-subtle data-active:border-transparent data-active:bg-background data-active:text-foreground data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-background"
        >
          <UserScopeIcon className="size-3.5 shrink-0" aria-hidden="true" />
          {intl.formatMessage({ id: "settings.scope.user" })}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

/** 原 b9（jsx 161322）：hook 行壳 */
export function HookRowShell(props: { actions?: React.ReactNode; children: React.ReactNode; testId?: string }) {
  const { actions, children, testId } = props;
  return (
    <div
      className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 px-4 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
      data-testid={testId}
    >
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground-subtle"
        aria-hidden="true"
      >
        <SubagentIcon className="size-4" />
      </div>
      <div className="min-w-0">{children}</div>
      {actions ? <div className="col-start-2 flex shrink-0 items-center justify-end gap-2 sm:col-start-auto">{actions}</div> : null}
    </div>
  );
}

/** 原 x9（jsx 161331）：hook 行主体（匹配器/类型徽章/命令/路径） */
export function HookRowBody(props: {
  command: string;
  matcher?: string;
  path?: string;
  trailingBadges?: React.ReactNode;
  type: string;
}) {
  const { command, matcher, path, trailingBadges, type } = props;
  const { intl } = useIntlContext();
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="truncate text-ui-base font-medium text-foreground">
          {matcher?.trim() || intl.formatMessage({ id: "settings.hooks.matchAll" })}
        </span>
        <Badge variant="secondary" className="rounded-md">
          {type}
        </Badge>
        {trailingBadges}
      </div>
      <p className="mt-1 truncate font-mono text-ui-sm text-foreground-subtle">{command}</p>
      {path ? <p className="mt-0.5 truncate font-mono text-ui-sm text-foreground-subtle/60">{path}</p> : null}
    </>
  );
}

/** 原 l2t（jsx 161443）：行操作按钮（tooltip 包装） */
export function HookRowActionButton(props: {
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  const { children, disabled, label, onClick } = props;
  return (
    <Tooltip title={label}>
      <Button variant="ghost" size="icon-md" aria-label={label} disabled={disabled} onClick={onClick}>
        {children}
      </Button>
    </Tooltip>
  );
}

/** 原 o2t（jsx 161349）：可编辑 hook 行 */
export function EditableHookRow(props: {
  busy: boolean;
  hook: HookItem;
  onDelete: (hook: HookItem) => void;
  onEdit: (hook: HookItem) => void;
  onToggle: (hook: HookItem, enabled: boolean) => void;
}) {
  const { busy, hook, onDelete, onEdit, onToggle } = props;
  const { intl } = useIntlContext();
  return (
    <HookRowShell
      testId="configured-hook-row"
      actions={
        <>
          <Switch checked={hook.enabled} onCheckedChange={(enabled) => void onToggle(hook, enabled)} disabled={busy} />
          <div className="flex items-center gap-1">
            <HookRowActionButton label={intl.formatMessage({ id: "settings.hooks.edit" })} onClick={() => onEdit(hook)}>
              <PencilIcon className="size-3.5" />
            </HookRowActionButton>
            <HookRowActionButton label={intl.formatMessage({ id: "settings.hooks.delete" })} onClick={() => void onDelete(hook)} disabled={busy}>
              <TrashIcon className="size-3.5" />
            </HookRowActionButton>
          </div>
        </>
      }
    >
      <HookRowBody
        matcher={hook.matcher}
        type={hook.type}
        command={[hook.command, ...(hook.args ?? [])].join(" ")}
        path={hook.location?.directoryPath}
      />
    </HookRowShell>
  );
}

/** 原 s2t（jsx 161383）：兼容 hook 行（Agents/Claude 导入） */
export function CompatibilityHookRow(props: { busy: boolean; hook: HookItem; onImport: (hook: HookItem) => void }) {
  const { busy, hook, onImport } = props;
  const { intl } = useIntlContext();
  const source = hook.location?.source;
  return (
    <HookRowShell
      actions={
        <Button variant="outline" size="sm" disabled={busy} onClick={() => void onImport(hook)}>
          <DownloadIcon className="size-3" />
          {intl.formatMessage({ id: "settings.hooks.import" })}
        </Button>
      }
    >
      <HookRowBody
        matcher={hook.matcher}
        type={hook.type}
        command={[hook.command, ...(hook.args ?? [])].join(" ")}
        path={hook.location?.directoryPath}
        trailingBadges={
          source ? (
            <Badge variant="outline" className="rounded-md">
              {source === "agents" ? "Agents" : "Claude"}
            </Badge>
          ) : null
        }
      />
    </HookRowShell>
  );
}

/** 原 c2t（jsx 161409）：插件 hook 行（只读 + 状态徽章） */
export function PluginHookRow({ hook }: { hook: PluginHookRowModel }) {
  const { intl } = useIntlContext();
  const runnable = hook.pluginEnabled && hook.detail.runnable;
  return (
    <HookRowShell testId="plugin-hook-row">
      <HookRowBody
        matcher={hook.detail.matcher}
        type={hook.detail.type}
        command={[hook.detail.command, ...(hook.detail.args ?? [])].join(" ")}
        path={hook.detail.sourcePath}
        trailingBadges={
          <>
            <Badge variant="outline" className="rounded-md">
              {hook.pluginName}
            </Badge>
            {hook.pluginScope ? null : (
              <Badge variant="outline" className="rounded-md">
                {intl.formatMessage({ id: "settings.hooks.scopeUnknown" })}
              </Badge>
            )}
            <Badge variant={runnable ? "secondary" : "outline"} className="rounded-md">
              {intl.formatMessage({ id: runnable ? "settings.hooks.enabled" : "settings.hooks.disabled" })}
            </Badge>
          </>
        }
      />
    </HookRowShell>
  );
}

/** 原 u2t（jsx 161451）：zcode 来源 hook 判定 */
export function isZCodeHook(hook: HookItem): boolean {
  return !hook.location || hook.location.source === "zcode";
}

/** 原 d2t（jsx 161454）：插件 hookDetails → 行模型 */
export function collectPluginHookRows(
  plugins: Array<{ id: string; name: string; enabled: boolean; hookDetails?: unknown[] }>,
  installedPlugins: Array<{ id: string; scope?: string }>,
  marketplaceAvailabilityKnown: boolean
): PluginHookRowModel[] {
  const scopeById = new Map(installedPlugins.map((meta) => [meta.id, meta.scope] as const));
  return plugins.flatMap((plugin) =>
    (plugin.hookDetails ?? []).map((detail) => ({
      detail: detail as PluginHookRowModel["detail"],
      pluginEnabled: plugin.enabled ?? false, // A0-CLEANUP3 3b：enabled 对齐为可选，运行期恒有值
      pluginId: plugin.id,
      pluginName: plugin.name,
      pluginScope: marketplaceAvailabilityKnown ? scopeById.get(plugin.id) : undefined,
    }))
  );
}

/** 原 f2t（jsx 161464）：按作用域过滤插件 hook */
export function filterPluginHooksByScope(rows: PluginHookRowModel[], scope: "user" | "project"): PluginHookRowModel[] {
  const locationScope = scope === "project" ? "workspace" : "user";
  return rows.filter((row) => row.pluginScope === undefined || row.pluginScope === locationScope);
}

/** 原 m2t（jsx 161625）：hook 搜索匹配 */
export function hookMatchesQuery(hook: HookItem, query: string): boolean {
  return query
    ? [hook.event, hook.type, hook.matcher, hook.command, ...(hook.args ?? []), hook.location?.directoryPath].some((value) =>
        value?.toLowerCase().includes(query)
      )
    : true;
}

/** 原 a2t（jsx 161289）：按事件分组（事件序优先，未知事件追加） */
type HookListRow =
  | { kind: "editable"; hook: HookItem }
  | { kind: "compatibility"; hook: HookItem }
  | { kind: "plugin"; hook: PluginHookRowModel; index: number };
export function groupHookRowsByEvent(
  editableHooks: HookItem[],
  compatibilityHooks: HookItem[],
  pluginHooks: PluginHookRowModel[]
): Array<{ event: string; rows: HookListRow[] }> {
  const rowsByEvent = new Map<string, HookListRow[]>();
  const push = (event: string, row: HookListRow) => {
    const rows = rowsByEvent.get(event) ?? [];
    rows.push(row);
    rowsByEvent.set(event, rows);
  };
  for (const hook of editableHooks) push(hook.event, { kind: "editable", hook });
  for (const hook of compatibilityHooks) push(hook.event, { kind: "compatibility", hook });
  pluginHooks.forEach((hook, index) => push(hook.detail.event, { kind: "plugin", hook, index }));
  const ordered = HOOK_EVENT_ORDER.flatMap((event) => {
    const rows = rowsByEvent.get(event);
    return rows ? [{ event, rows }] : [];
  });
  const knownEvents = new Set(HOOK_EVENT_ORDER);
  const extra = [...rowsByEvent.entries()].filter(([event]) => !knownEvents.has(event)).map(([event, rows]) => ({ event, rows }));
  return [...ordered, ...extra];
}

/** 原 i2t（js 201771）：hook 列表（按事件分节） */
export function HookListByEvent(props: {
  compatibilityHooks: HookItem[];
  editableHooks: HookItem[];
  operatingHookId: string | null;
  pluginHooks: PluginHookRowModel[];
  onDelete: (hook: HookItem) => void;
  onEdit: (hook: HookItem) => void;
  onImport: (hook: HookItem) => void;
  onToggle: (hook: HookItem, enabled: boolean) => void;
}) {
  const { compatibilityHooks, editableHooks, operatingHookId, pluginHooks, onDelete, onEdit, onImport, onToggle } = props;
  const { intl } = useIntlContext();
  const groups = groupHookRowsByEvent(editableHooks, compatibilityHooks, pluginHooks);
  return groups.length === 0 ? (
    <div className="overflow-hidden rounded-xl border border-dashed border-border">
      <div className="px-4 py-3 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.hooks.empty" })}</div>
    </div>
  ) : (
    <div className="space-y-4">
      {groups.map(({ event, rows }) => (
        <section key={event} className="space-y-2">
          <h3 className="px-1 text-ui-base font-medium text-foreground">{event}</h3>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="divide-y divide-border">
              {rows.map((row) =>
                row.kind === "editable" ? (
                  <EditableHookRow
                    key={row.hook.id}
                    hook={row.hook}
                    busy={operatingHookId === row.hook.id}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ) : row.kind === "compatibility" ? (
                  <CompatibilityHookRow key={row.hook.id} hook={row.hook} busy={operatingHookId === row.hook.id} onImport={onImport} />
                ) : (
                  <PluginHookRow key={`${row.hook.pluginId}-${row.hook.detail.sourcePath}-${row.index}`} hook={row.hook} />
                )
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

export interface HooksSettingsSectionProps {
  workspacePath: string | null;
  workspaceIdentity?: string | null;
}

/** 原 p2t：Hooks 分区根（列表/搜索/作用域/表单切换/插件兼容导入） */
export function HooksSettingsSection(props: HooksSettingsSectionProps) {
  const { workspacePath, workspaceIdentity } = props;
  const { intl } = useIntlContext();
  const { hooksService, pluginManagementService } = useServices();
  const workspaceAgentService = useWorkspaceAgentService(workspacePath ?? undefined, undefined, workspaceIdentity);
  const confirmDialog = useConfirmDialog();
  const hooksStore = useHooksStore();
  const plugins = usePluginsStore((state) => state.plugins);
  const installedPlugins = usePluginsStore((state) => state.installedPlugins);
  const marketplaceAvailabilityKnown = usePluginsStore((state) => state.marketplaceAvailabilityKnown);
  const pluginsLoading = usePluginsStore((state) => state.loading);
  const pluginsError = usePluginsStore((state) => state.error);
  const initializePlugins = usePluginsStore((state) => state.initialize);
  const refreshPlugins = usePluginsStore((state) => state.refresh);
  const [refreshing, setRefreshing] = React.useState(false);
  const [view, setView] = React.useState<"list" | "form">("list");
  const [editingHook, setEditingHook] = React.useState<HookItem | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [scope, setScope] = React.useState<"user" | "project">("user");
  const deferredQuery = React.useDeferredValue(searchQuery);
  const effectiveScope = scope === "project" && !workspacePath ? "user" : scope;
  const editableHooks = React.useMemo(
    () => hooksStore.hooks.filter((hook) => isZCodeHook(hook) && (hook.location?.scope ?? "user") === effectiveScope),
    [effectiveScope, hooksStore.hooks]
  );
  const compatibilityHooks = React.useMemo(
    () => hooksStore.hooks.filter((hook) => !isZCodeHook(hook) && (hook.location?.scope ?? "user") === effectiveScope),
    [effectiveScope, hooksStore.hooks]
  );
  const pluginHookRows = React.useMemo(() => collectPluginHookRows(plugins, installedPlugins, marketplaceAvailabilityKnown), [installedPlugins, marketplaceAvailabilityKnown, plugins]);
  const scopedPluginHookRows = React.useMemo(() => filterPluginHooksByScope(pluginHookRows, effectiveScope), [effectiveScope, pluginHookRows]);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredEditableHooks = React.useMemo(() => editableHooks.filter((hook) => hookMatchesQuery(hook, normalizedQuery)), [editableHooks, normalizedQuery]);
  const filteredCompatibilityHooks = React.useMemo(() => compatibilityHooks.filter((hook) => hookMatchesQuery(hook, normalizedQuery)), [compatibilityHooks, normalizedQuery]);
  const filteredPluginHooks = React.useMemo(
    () =>
      scopedPluginHookRows.filter((row) =>
        [row.pluginName, row.detail.event, row.detail.type, row.detail.matcher, row.detail.command, row.detail.sourcePath].some((value) =>
          value?.toLowerCase().includes(normalizedQuery)
        )
      ),
    [normalizedQuery, scopedPluginHookRows]
  );

  React.useEffect(() => {
    hooksStore.initialize(workspacePath ?? null, workspaceIdentity ?? null, hooksService); // A0-CLEANUP3 3b：HooksState.initialize 形参为 string | null
  }, [hooksService, hooksStore.initialize, workspaceIdentity, workspacePath]);
  React.useEffect(() => {
    if (workspacePath) {
      initializePlugins({ workspacePath, workspaceIdentity, pluginService: pluginManagementService });
    }
  }, [initializePlugins, pluginManagementService, workspaceIdentity, workspacePath]);

  const notifyHookChange = React.useCallback(
    async (reason: string) => {
      await refreshAfterHookChange({
        logScope: "hooks",
        reason,
        workspaceIdentity,
        workspacePath,
        zcodeSessionService: workspaceAgentService,
      });
    },
    [workspaceIdentity, workspacePath, workspaceAgentService]
  );

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([hooksStore.refresh(hooksService), workspacePath ? refreshPlugins(pluginManagementService) : Promise.resolve()]);
    } finally {
      setRefreshing(false);
    }
  }, [hooksService, hooksStore.refresh, pluginManagementService, refreshPlugins, workspacePath]);

  const handleSaveHook = React.useCallback(
    async (values: HookFormValues) => {
      try {
        if (editingHook) {
          await hooksStore.updateHook(editingHook.id, values, hooksService);
          await notifyHookChange("hook-updated");
        } else {
          await hooksStore.addHook(values, hooksService);
          await notifyHookChange("hook-added");
        }
        setView("list");
        setEditingHook(null);
      } catch (error) {
        toast(error instanceof Error ? error.message : String(error));
      }
    },
    [editingHook, hooksService, hooksStore.addHook, hooksStore.updateHook, notifyHookChange]
  );

  const handleDeleteHook = React.useCallback(
    async (hook: HookItem) => {
      const confirmed = await confirmDialog({
        title: intl.formatMessage({ id: "settings.hooks.delete" }),
        description: intl.formatMessage({ id: "settings.hooks.deleteDescription" }, { event: hook.event }),
        confirmLabel: intl.formatMessage({ id: "common.delete" }),
      });
      if (!confirmed) return;
      try {
        await hooksStore.deleteHook(hook.id, hooksService);
        await notifyHookChange("hook-deleted");
      } catch (error) {
        toast(error instanceof Error ? error.message : String(error));
      }
    },
    [confirmDialog, hooksService, hooksStore.deleteHook, intl, notifyHookChange]
  );

  const handleToggleHook = React.useCallback(
    async (hook: HookItem, enabled: boolean) => {
      try {
        await hooksStore.toggleHook(hook.id, enabled, hooksService);
        await notifyHookChange(enabled ? "hook-enabled" : "hook-disabled");
      } catch (error) {
        toast(error instanceof Error ? error.message : String(error));
      }
    },
    [hooksService, hooksStore.toggleHook, notifyHookChange]
  );

  const handleImportHook = React.useCallback(
    async (hook: HookItem) => {
      try {
        await hooksStore.importHook(hook.id, hooksService);
        await notifyHookChange("hook-imported");
        toast(intl.formatMessage({ id: "settings.hooks.imported" }));
      } catch (error) {
        toast(error instanceof Error ? error.message : String(error));
      }
    },
    [hooksService, hooksStore.importHook, intl, notifyHookChange]
  );

  if (view === "form") {
    return (
      <HookForm
        hook={editingHook ?? undefined}
        workspaceAvailable={!!workspacePath}
        defaultStorageLevel={effectiveScope}
        onSave={handleSaveHook}
        onCancel={() => {
          setEditingHook(null);
          setView("list");
        }}
        isEditing={!!editingHook}
      />
    );
  }

  const combinedLoading = hooksStore.loading || pluginsLoading;
  const combinedError = hooksStore.error || pluginsError;

  return (
    <div className="space-y-4" data-testid="hooks-settings-section">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-ui-base leading-6 text-foreground-subtle">
          {intl.formatMessage({ id: "settings.hooks.description" })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip title={intl.formatMessage({ id: "settings.hooks.add" })}>
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              aria-label={intl.formatMessage({ id: "settings.hooks.add" })}
              onClick={() => {
                setEditingHook(null);
                setView("form");
              }}
            >
              <PlusIcon className="size-3.5" aria-hidden="true" />
            </Button>
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: "settings.skills.refresh" })}>
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              aria-label={intl.formatMessage({ id: "settings.skills.refresh" })}
              onClick={() => void handleRefresh()}
              disabled={refreshing || combinedLoading}
            >
              <RefreshIcon className={refreshing ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden="true" />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-foreground-subtle"
          aria-hidden="true"
        />
        <Input
          type="text"
          size="lg"
          className="h-9 rounded-xl pl-8"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={intl.formatMessage({ id: "settings.hooks.searchPlaceholder" })}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <HookScopeTabs scope={effectiveScope} onScopeChange={(value) => setScope(value as "user" | "project")} />
        <div className="flex items-center gap-2 text-ui-base text-foreground-subtle">
          <InfoIcon className="size-3.5 shrink-0" aria-hidden="true" />
          <span>{intl.formatMessage({ id: "settings.hooks.sessionSnapshot" })}</span>
        </div>
      </div>
      {combinedError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-ui-base text-destructive">{combinedError}</div>
      ) : null}
      {combinedLoading && editableHooks.length + compatibilityHooks.length + pluginHookRows.length === 0 ? (
        <div className="px-1 py-3 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "common.loading" })}</div>
      ) : null}
      <HookListByEvent
        compatibilityHooks={filteredCompatibilityHooks}
        editableHooks={filteredEditableHooks}
        operatingHookId={hooksStore.operatingHookId}
        pluginHooks={filteredPluginHooks}
        onDelete={handleDeleteHook}
        onEdit={(hook) => {
          setEditingHook(hook);
          setView("form");
        }}
        onImport={handleImportHook}
        onToggle={handleToggleHook}
      />
    </div>
  );
}

/* ============================================================================
 * 6. 自动化分区（原 d6，js 138823–139924 / jsx 115911–116622；F15 族根）
 * ==========================================================================*/

export interface AutomationTask {
  automationId: string;
  title: string;
  prompt: string;
  cronExpr: string; // A0-CLEANUP3 3b §C：与 StoresDeep.Automation/SL.AutomationTaskLite 对齐（双向收敛）
  enabled: boolean;
  lifecycleStatus?: "active" | "paused" | "completed" | "failed" | string;
  runCount?: number;
  nextRunAt?: number | null; // A0-CLEANUP3 3b：StoresDeep.Automation 可空面对齐
  workspacePath?: string;
  workspaceIdentity?: string | null;
  model?: string | null;
  provider?: string | null;
  [key: string]: unknown;
}
export interface OffPeakTask {
  offPeakTaskId: string;
  title?: string;
  prompt: string;
  status: string; // A0-CLEANUP3 3b：与 SL.OffPeakTaskRecord 互指（运行期恒有值）
  permissionMode?: string;
  model?: string | null;
  thoughtLevel?: string | null;
  sessionId?: string | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  [key: string]: unknown;
}
export interface AutomationRun {
  trigger: string;
  sessionId?: string | null;
  [key: string]: unknown;
}

/* automations store（原 T3）与 offPeak store（原 bX）：接口级 */
interface AutomationsStoreState {
  automations: AutomationTask[];
  loading: boolean;
  operationId: string | null;
  runsCache: Record<string, { runs?: AutomationRun[] } | undefined>;
  error?: string | null;
  initialize: (opts: { workspacePath: string; workspaceIdentity?: string | null; agentService: unknown }) => Promise<void>;
  createAutomation: (input: Record<string, unknown>, agentService: unknown) => Promise<AutomationTask | null>;
  updateAutomation: (automationId: string, input: Record<string, unknown>, agentService: unknown) => Promise<boolean>;
  deleteAutomation: (automationId: string, agentService: unknown) => Promise<void>;
  setEnabled: (automationId: string, enabled: boolean, agentService: unknown) => Promise<void>;
  restartAutomation: (automationId: string, agentService: unknown) => Promise<void>;
  runAutomationNow: (automationId: string, agentService: unknown) => Promise<"queued" | "duplicate" | "failed">;
  loadRuns: (automationId: string, agentService: unknown, force: boolean) => Promise<void>;
  deleteRun: (automationId: string, runId: string, agentService: unknown) => Promise<void>;
  refresh: (agentService: unknown) => Promise<void>;
}
declare const automationsStoreStatic: { getState: () => AutomationsStoreState }; // T3.getState()
interface OffPeakStoreState {
  tasks: OffPeakTask[];
  loading: boolean;
  /** A0-CLEANUP3 3b：allowedModels/allowedModelConfigs 按 OffPeakTaskEditor 消费面具型 */
  grayConfig: {
    enabled?: boolean;
    codingPlanActive?: boolean;
    allowedModels?: string[];
    allowedModelConfigs?: Array<{ id: string; modelIdByKind?: Record<string, string>; reasoning?: { levels: Record<string, unknown>; defaultLevel?: string } }>;
  } | null;
  codingPlanSupport: unknown;
  takeNumberAvailability: { canTakeNumber?: boolean; nextTakeAt?: number } | null;
  takeNumberAvailabilityStatus: string | null;
  operationId: string | null;
  error?: string | null;
  initialize: (opts: { offPeakTaskService: unknown; codingPlanSubscriptionService: unknown }) => Promise<void>;
  refresh: (offPeakTaskService: unknown) => Promise<void>;
  refreshCodingPlanSupport: (offPeakTaskService: unknown) => Promise<void>;
  refreshTakeNumberAvailability: (offPeakTaskService: unknown) => Promise<void>;
  createTask: (input: Record<string, unknown>, offPeakTaskService: unknown) => Promise<{ ok: boolean; [key: string]: unknown }>;
  updateTask: (taskId: string, patch: Record<string, unknown>, offPeakTaskService: unknown) => Promise<boolean>;
  pauseTask: (taskId: string, offPeakTaskService: unknown) => Promise<void>;
  continueTask: (taskId: string, offPeakTaskService: unknown) => Promise<void>;
  cancelTask: (taskId: string, offPeakTaskService: unknown) => Promise<void>;
  deleteTask: (taskId: string, offPeakTaskService: unknown) => Promise<void>;
  deleteHistory: (taskId: string, offPeakTaskService: unknown) => Promise<void>;
  consumePendingCreateDraft: () => OffPeakTask | null;
}
declare function useOffPeakStore<T>(selector: (state: OffPeakStoreState) => T): T; // bX
declare const offPeakStoreStatic: { getState: () => OffPeakStoreState }; // bX.getState()

/* F15 族深层叶子（接口级；行号见头部映射 §F） */
declare const OffPeakTaskList: React.FC<{
  tasks: OffPeakTask[];
  busyOperationId: string | null;
  onOpen: (task: OffPeakTask) => void;
  onPause: (task: OffPeakTask) => void;
  onContinue: (task: OffPeakTask) => void;
  onCancel: (task: OffPeakTask) => void;
  onDelete: (task: OffPeakTask) => void;
  onOpenSession: (run: { sessionId?: string | null; workspacePath?: string; workspaceIdentity?: string | null }) => void;
}>; // cMt（jsx 113500）
declare const AutomationStatusChip: React.FC<{ text: string; icon?: React.ReactNode; dimmed?: boolean }>; // ANt（jsx 115689）
declare const OFF_PEAK_TEMPLATES: Array<{ id: string; cronExpr?: string }>; // Pjt（jsx 112762）
/** 原 INt（jsx 115771）：闲时创建按钮 —— A0-CLEANUP B-31 改指 ExtendedViews 导出（见文件头 import） */
/** 原 LNt（jsx 115784）：定时模板表 —— A0-CLEANUP B-31 改指 ExtendedViews 导出（见文件头 import） */
/** 原 AMt（jsx 113829）：自动化模型选择分组 —— 保留 declare：属主 EV 实体签名（displayOrder: string[]）与本域调用面（{providerIds…}|null）形状冲突，改指会新增错（A0-CLEANUP B-31 记录在案） */
declare function buildAutomationModelSelectGroups(opts: {
  selectedProvider: string;
  providers: ModelProvider[];
  labels: Record<string, string>;
  displayOrder: { providerIds: string[]; updatedAt?: number } | null;
  familyModes?: Record<string, string>;
  familySelectedKeys?: Record<string, string>;
  providerFamilyDomain?: string | null;
  getEntitlementSnapshot: (providerId: string) => unknown;
}): SelectGroupEntry[]; // AMt（jsx 113829）
declare function activeWorkspaceTabOf(
  selector: (state: WorkspaceTabsStoreState) => { id: string } | undefined
): { id: string } | undefined; // zMt（jsx 113941）
declare function resolveTakeNumberBlockReason(opts: {
  availabilityStatus: string | null;
  canTakeNumber?: boolean;
  grayEnabled: boolean;
  noPlan: boolean;
}): "plan" | "unavailable" | "quota" | null; // Ijt（jsx 112770）
declare function formatNextTakeAt(nextTakeAt: number, now: number, intl: IntlShape): string; // Ljt（jsx 112778）
declare function trackAutomationCreated(platform: PlatformService, opts: {
  automationId?: string;
  cronExpr: string;
  templateId?: string;
  error?: string | null;
  modelFields: unknown;
}): void; // PNt（jsx 115735）
declare function automationModelTelemetryFields(model: unknown, provider: unknown, providers: ModelProvider[]): unknown; // MNt（jsx 115713）
declare function trackAutomationAction(platform: PlatformService, opts: {
  action: string;
  source: string;
  automation: AutomationTask;
  providers: ModelProvider[];
}): void; // FNt（jsx 115752）
declare function offPeakDraftTelemetry(opts: { source?: unknown; model?: unknown }): unknown; // Vjt（jsx 113296）
declare function trackOffPeakCreateFailed(platform: PlatformService, telemetry: unknown, result: unknown): void; // Ujt（jsx 113330）
declare function trackOffPeakCreate(platform: PlatformService, telemetry: unknown, create: () => Promise<{ ok: boolean }>): Promise<{ ok: boolean }>; // Wjt
declare function offPeakCreateFailureMessageId(result: { ok: boolean; [key: string]: unknown }): string; // Dit（78941）
declare function automationLifecycleOf(automation: AutomationTask): "active" | "paused" | "completed" | "failed"; // qht（93279）
declare function automationHasFailedRun(automation: AutomationTask): boolean; // Kht（93276）
declare function automationScheduleLabel(automation: AutomationTask, intl: IntlShape): string; // rgt（93602）
declare function automationNextRunLabel(nextRunAt: number | null | undefined, now: number, intl: IntlShape): string | null; // egt（93576）；A0-CLEANUP3 3b：nextRunAt 可空面
declare function hasCodingPlanEntitlement(codingPlanSupport: unknown, settings: unknown): boolean; // Tit（78933）
declare function showToastWithAction(message: string, opts?: ToastOptions): string; // l6（toast 变体）

/** 原 BNt（jsx 115803）：可见标签页（有任务且闲时可见 → 双标签） */
export function resolveVisibleAutomationsTabs(opts: { hasAnyTasks: boolean; offPeakVisible: boolean }): string[] {
  return opts.hasAnyTasks ? (opts.offPeakVisible ? OFF_PEAK_TABS_WITH_IDLE : OFF_PEAK_TABS_SCHEDULED_ONLY) : [];
}
const OFF_PEAK_TABS_WITH_IDLE = ["scheduled", "idle"];
const OFF_PEAK_TABS_SCHEDULED_ONLY = ["scheduled"];

/** 原 VNt（jsx 115809）：无闲时入口时 idle → scheduled */
export function resolveEffectiveAutomationsTab(tab: string, offPeakVisible: boolean): string {
  return tab === "idle" && !offPeakVisible ? "scheduled" : tab;
}

/** 原 HNt（jsx 115812）：模板区可见性 */
export function resolveAutomationTemplateVisibility(opts: {
  hasAnyTasks: boolean;
  offPeakCreationEnabled: boolean;
  tab: string;
}): { showOffPeakTemplates: boolean; showScheduledTemplates: boolean } {
  const empty = !opts.hasAnyTasks;
  return {
    showOffPeakTemplates: opts.offPeakCreationEnabled && (empty || opts.tab === "idle"),
    showScheduledTemplates: empty || opts.tab === "scheduled",
  };
}

/** 原 UNt（jsx 115823）：生命周期状态样式表 */
const AUTOMATION_STATUS_STYLES: Record<string, { icon: React.FC<React.SVGProps<SVGSVGElement>>; className: string }> = {
  active: { icon: AutomationStatusActiveIcon, className: "text-success" },
  paused: { icon: AutomationStatusPausedIcon, className: "text-foreground-subtle" },
  completed: { icon: AutomationStatusCompletedIcon, className: "text-foreground-subtle" },
  failed: { icon: AutomationStatusFailedIcon, className: "text-destructive" },
};

/** 原 WNt（jsx 115841）：prompt 预览归一化 */
export function normalizeAutomationPromptPreview(prompt: string): string {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : " ";
}

/** 原 GNt（jsx 115845） */
export function isFailedAutomation(automation: AutomationTask): boolean {
  return automation.lifecycleStatus === "failed";
}

/** 原 KNt（jsx 115848） */
export function isToggleableAutomation(automation: AutomationTask): boolean {
  return automation.lifecycleStatus !== "completed" && automation.lifecycleStatus !== "failed";
}

/** 原 qNt（jsx 115851）：立即运行结果消息 */
export function runNowResultMessageId(result: "queued" | "duplicate" | "failed"): string {
  return result === "queued"
    ? "automations.runNowQueued"
    : result === "duplicate"
      ? "automations.runNowAlreadyRunning"
      : "automations.runNowFailed";
}

/** 原 u6（jsx 115854） */
export function automationErrorMessageId(action: string): string {
  return `automations.error.${action}`;
}

/** 原 JNt（jsx 115857）：创建错误（限额优先） */
export function automationCreateErrorMessageId(error: string | null | undefined): string {
  return error === "createLimit" ? "automations.error.createLimit" : automationErrorMessageId("create");
}

/** 原 YNt（jsx 115860） */
export function findAutomationById(automations: AutomationTask[], automationId: string | null | undefined): AutomationTask | null {
  const trimmed = automationId?.trim();
  return trimmed ? automations.find((automation) => automation.automationId === trimmed) ?? null : null;
}

/** 原 XNt（jsx 115864）：深链接目标解析 */
export function resolveAutomationOpenTarget(
  automations: AutomationTask[],
  openAutomationId: string | null | undefined,
  workspaceMatches: boolean
): { status: "pending" } | { status: "found"; target: AutomationTask } | { status: "missing" } {
  if (!openAutomationId?.trim() || !workspaceMatches) return { status: "pending" };
  const target = findAutomationById(automations, openAutomationId);
  return target ? { status: "found", target } : { status: "missing" };
}

/** 原 ZNt（js 138713）：自动化行操作菜单（立即运行/重启/暂停恢复/编辑/删除） */
export function AutomationRowActionMenu(props: {
  automation: AutomationTask;
  busy: boolean;
  canRestart: boolean;
  canToggle: boolean;
  onRunNow: (automation: AutomationTask) => void;
  onEdit: (automation: AutomationTask) => void;
  onToggle: (automation: AutomationTask, enabled: boolean) => void;
  onRestart: (automation: AutomationTask) => void;
  onDelete: (automation: AutomationTask) => void;
}) {
  const { automation, busy, canRestart, canToggle, onRunNow, onEdit, onToggle, onRestart, onDelete } = props;
  const { intl } = useIntlContext();
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex size-6 items-center justify-center rounded-md opacity-100 transition-colors hover:bg-hover md:opacity-0 md:group-hover:opacity-100 data-[state=open]:bg-hover data-[state=open]:opacity-100"
          data-testid={AUTOMATIONS_MORE_ACTIONS_TESTID}
          aria-label={intl.formatMessage({ id: "automations.moreActions" })}
          disabled={busy}
          onClick={(event) => event.stopPropagation()}
        >
          <EllipsisIcon className="size-4 text-foreground-subtle" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4} className="w-[190px]" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem className="gap-1" disabled={busy} onSelect={() => void onRunNow(automation)}>
          <span className="flex size-5 items-center justify-center">
            <PlayIcon className="size-4" aria-hidden="true" />
          </span>
          {intl.formatMessage({ id: "automations.runNow" })}
        </DropdownMenuItem>
        {canRestart ? (
          <DropdownMenuItem className="gap-1" disabled={busy} onSelect={() => void onRestart(automation)}>
            <span className="flex size-5 items-center justify-center">
              <RotateIcon className="size-4" strokeWidth={1.33} aria-hidden="true" />
            </span>
            {intl.formatMessage({ id: "automations.restart" })}
          </DropdownMenuItem>
        ) : null}
        {canToggle ? (
          <DropdownMenuItem
            data-testid={AUTOMATIONS_TOGGLE_TESTID}
            className="gap-1"
            disabled={busy}
            onSelect={() => void onToggle(automation, !automation.enabled)}
          >
            {automation.enabled ? (
              <span className="flex size-5 items-center justify-center">
                <PauseIcon className="size-4" aria-hidden="true" />
              </span>
            ) : (
              <span className="flex size-5 items-center justify-center">
                <ResumeIcon className="size-4" aria-hidden="true" />
              </span>
            )}
            {intl.formatMessage({ id: automation.enabled ? "automations.pause" : "automations.resume" })}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem className="gap-1" disabled={busy} onSelect={() => void onEdit(automation)}>
          <span className="flex size-5 items-center justify-center">
            <EditIcon className="size-4" aria-hidden="true" />
          </span>
          {intl.formatMessage({ id: "automations.form.editTitle" })}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          data-testid={AUTOMATIONS_DELETE_TESTID}
          className="gap-1 !text-destructive data-[highlighted]:!bg-menu-hover data-[highlighted]:!text-destructive focus:!text-destructive [&_svg]:!text-destructive"
          disabled={busy}
          onSelect={() => void onDelete(automation)}
        >
          <TrashIcon />
          {intl.formatMessage({ id: "automations.delete" })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}

export interface AutomationsMainProps {
  workspacePath: string | null;
  workspaceIdentity?: string | null;
  onCreateViaChat?: (prompt: string) => void;
  openAutomationId?: string | null;
  onOpenAutomationConsumed?: () => void;
  onOpenSession?: (opts: { sessionId: string; workspacePath?: string; workspaceIdentity?: string | null }) => void;
}

/** 原 d6：自动化主视图（定时 + 闲时双域；列表/创建/编辑/闲时表单四态） */
export function AutomationsMain(props: AutomationsMainProps) {
  const { workspacePath, workspaceIdentity, onCreateViaChat, openAutomationId, onOpenAutomationConsumed, onOpenSession } = props;
  const { intl } = useIntlContext();
  const platform = usePlatformService();
  const { zcodeAgentService } = useServices();
  const confirmDialog = useConfirmDialog();
  const { openCodingPlanUpgrade } = useUpgradeEntryForAutomations();
  const { modelProviders, displayOrder, loading: modelProvidersLoading } = useModelProvidersStore();
  const { settings, update: updateSettings } = useAppSettings();
  const { entitlements } = useCodingPlanEntitlementsForAutomations({
    modelProviders,
    loading: modelProvidersLoading,
    modelProviderFamilySelectedKeys: settings?.modelProviderFamilySelectedKeys as Record<string, string> | undefined,
  });
  const automations = useAutomationsStore((state) => state.automations);
  const createLimitReached = automations.length >= 20;
  const automationsLoading = useAutomationsStore((state) => state.loading);
  const automationOperationId = useAutomationsStore((state) => state.operationId);
  const runsCache = useAutomationsStore((state) => state.runsCache);
  const initializeAutomations = useAutomationsStore((state) => state.initialize);
  const createAutomation = useAutomationsStore((state) => state.createAutomation);
  const updateAutomation = useAutomationsStore((state) => state.updateAutomation);
  const deleteAutomation = useAutomationsStore((state) => state.deleteAutomation);
  const setAutomationEnabled = useAutomationsStore((state) => state.setEnabled);
  const restartAutomation = useAutomationsStore((state) => state.restartAutomation);
  const runAutomationNow = useAutomationsStore((state) => state.runAutomationNow);
  const loadRuns = useAutomationsStore((state) => state.loadRuns);
  const deleteRun = useAutomationsStore((state) => state.deleteRun);
  const refreshAutomations = useAutomationsStore((state) => state.refresh);
  const { offPeakTaskService, codingPlanSubscriptionService } = useServices();
  const offPeakTasks = useOffPeakStore((state) => state.tasks);
  const offPeakLoading = useOffPeakStore((state) => state.loading);
  const offPeakGrayConfig = useOffPeakStore((state) => state.grayConfig);
  const offPeakCodingPlanSupport = useOffPeakStore((state) => state.codingPlanSupport);
  const takeNumberAvailability = useOffPeakStore((state) => state.takeNumberAvailability);
  const takeNumberAvailabilityStatus = useOffPeakStore((state) => state.takeNumberAvailabilityStatus);
  const offPeakOperationId = useOffPeakStore((state) => state.operationId);
  const initializeOffPeak = useOffPeakStore((state) => state.initialize);
  const refreshOffPeak = useOffPeakStore((state) => state.refresh);
  const refreshCodingPlanSupport = useOffPeakStore((state) => state.refreshCodingPlanSupport);
  const refreshTakeNumberAvailability = useOffPeakStore((state) => state.refreshTakeNumberAvailability);
  const createOffPeakTask = useOffPeakStore((state) => state.createTask);
  const updateOffPeakTask = useOffPeakStore((state) => state.updateTask);
  const pauseOffPeakTask = useOffPeakStore((state) => state.pauseTask);
  const continueOffPeakTask = useOffPeakStore((state) => state.continueTask);
  const cancelOffPeakTask = useOffPeakStore((state) => state.cancelTask);
  const deleteOffPeakTask = useOffPeakStore((state) => state.deleteTask);
  const deleteOffPeakHistory = useOffPeakStore((state) => state.deleteHistory);
  const consumePendingCreateDraft = useOffPeakStore((state) => state.consumePendingCreateDraft);
  const [refreshingAll, setRefreshingAll] = React.useState(false);
  const [view, setView] = React.useState<
    | { mode: "list" }
    | { mode: "create"; draft: Record<string, unknown> | null }
    | { mode: "edit"; automation: AutomationTask }
    | { mode: "offpeak-create"; draft?: Record<string, unknown> | null }
    | { mode: "offpeak-edit"; task: OffPeakTask }
  >({ mode: "list" });
  const [tab, setTab] = React.useState("scheduled");
  const activeWorkspaceTab = activeWorkspaceTabOf((state) => {
    const activeTab = state.tabs.find((candidate) => candidate.id === state.activeTabId);
    return activeTab && isWorkspaceTab(activeTab) ? activeTab : undefined;
  });
  const offPeakGrayEnabled = offPeakGrayConfig?.enabled === true;
  const offPeakCreationEnabled = offPeakGrayEnabled && !activeWorkspaceTab;
  const noCodingPlan =
    offPeakGrayConfig?.codingPlanActive === false ||
    (offPeakGrayConfig?.codingPlanActive === undefined && !offPeakLoading && !hasCodingPlanEntitlement(offPeakCodingPlanSupport, settings));
  const offPeakVisible = !activeWorkspaceTab && (offPeakGrayEnabled || offPeakTasks.length > 0);
  const hasAnyTasks = automations.length > 0 || offPeakTasks.length > 0;
  const visibleTabs = resolveVisibleAutomationsTabs({ hasAnyTasks, offPeakVisible });
  const currentTabHasTasks = tab === "scheduled" ? automations.length > 0 : offPeakTasks.length > 0;
  const { showOffPeakTemplates, showScheduledTemplates } = resolveAutomationTemplateVisibility({
    hasAnyTasks,
    offPeakCreationEnabled,
    tab,
  });
  const templatesSeparatorVisible = currentTabHasTasks && (showOffPeakTemplates || showScheduledTemplates);
  const [initializedWorkspaceKey, setInitializedWorkspaceKey] = React.useState<string | null>(null);
  const [now, setNow] = React.useState(() => Date.now());
  const takeNumberBlock = React.useMemo(() => {
    const reason = resolveTakeNumberBlockReason({
      availabilityStatus: takeNumberAvailabilityStatus,
      canTakeNumber: takeNumberAvailability?.canTakeNumber,
      grayEnabled: offPeakGrayEnabled,
      noPlan: noCodingPlan,
    });
    return {
      reason,
      tooltip:
        reason === "plan"
          ? intl.formatMessage({ id: "offPeak.create.codingPlanOnly" })
          : reason === "unavailable"
            ? intl.formatMessage({ id: "offPeak.create.availabilityUnavailable" })
            : reason === "quota" && takeNumberAvailability?.nextTakeAt !== undefined
              ? intl.formatMessage({ id: "offPeak.create.limitReachedAt" }, { time: formatNextTakeAt(takeNumberAvailability.nextTakeAt, now, intl) })
              : undefined,
    };
  }, [intl, now, offPeakGrayEnabled, noCodingPlan, takeNumberAvailability, takeNumberAvailabilityStatus]);

  const modelSelectGroups = React.useMemo(
    () =>
      buildAutomationModelSelectGroups({
        selectedProvider: "glm",
        providers: modelProviders,
        labels: {
          apiKeyLabel: intl.formatMessage({ id: "settings.modelProvider.apiKey" }),
          apiKeyBadgeLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.apiKeyBadge" }),
          codingPlanLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.codingPlan" }),
          codingPlanBadgeLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.codingPlanBadge" }),
          startPlanLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.startPlan" }),
          startPlanBadgeLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.startPlanBadge" }),
          teamPlanBadgeLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.teamPlanBadge" }),
          teamPlanFallbackLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.teamPlan" }),
        },
        displayOrder,
        familyModes: settings?.modelProviderFamilyModes as Record<string, string> | undefined,
        familySelectedKeys: settings?.modelProviderFamilySelectedKeys as Record<string, string> | undefined,
        providerFamilyDomain: (settings?.providerFamilyDomain as string | null | undefined) ?? null,
        getEntitlementSnapshot: (providerId) => entitlements[providerId]?.snapshot ?? null,
      }),
    [entitlements, displayOrder, intl, modelProviders, settings?.modelProviderFamilyModes, settings?.modelProviderFamilySelectedKeys, settings?.providerFamilyDomain]
  );

  /* 初始化（原 116069） */
  React.useEffect(() => {
    if (!workspacePath) return;
    const workspaceKey = automationWorkspaceKey({ workspacePath, workspaceIdentity });
    let cancelled = false;
    setInitializedWorkspaceKey(null);
    setNow(Date.now());
    initializeAutomations({ workspacePath, workspaceIdentity, agentService: zcodeAgentService }).then(() => {
      if (!cancelled) setInitializedWorkspaceKey(workspaceKey);
    });
    return () => {
      cancelled = true;
    };
  }, [workspacePath, workspaceIdentity, zcodeAgentService, initializeAutomations]);
  React.useEffect(() => {
    initializeOffPeak({ offPeakTaskService, codingPlanSubscriptionService });
  }, [initializeOffPeak, offPeakTaskService, codingPlanSubscriptionService]);
  React.useEffect(() => {
    const effectiveTab = resolveEffectiveAutomationsTab(tab, offPeakVisible);
    if (effectiveTab !== tab) setTab(effectiveTab);
  }, [offPeakVisible, tab]);

  /* 连接方式变化 → 刷新 Coding Plan 支持（原 116095） */
  const providerFamilyDomain = settings?.providerFamilyDomain as string | undefined;
  const familyMode = providerFamilyDomain ? (settings?.modelProviderFamilyModes as Record<string, string> | undefined)?.[providerFamilyDomain] : undefined;
  const familySelectedKey = providerFamilyDomain ? (settings?.modelProviderFamilySelectedKeys as Record<string, string> | undefined)?.[providerFamilyDomain] : undefined;
  const settingsLoaded = settings != null;
  const settingsSeen = React.useRef(false);
  React.useEffect(() => {
    if (settingsLoaded) {
      if (!settingsSeen.current) {
        settingsSeen.current = true;
        return;
      }
      refreshCodingPlanSupport(offPeakTaskService);
    }
  }, [settingsLoaded, refreshCodingPlanSupport, offPeakTaskService, familySelectedKey, familyMode, providerFamilyDomain]);

  /* 配额到期唤醒（原 116108–116127） */
  React.useEffect(() => {
    const nextTakeAt = takeNumberAvailability?.nextTakeAt;
    if (takeNumberAvailability?.canTakeNumber !== false || nextTakeAt === undefined) return;
    const delay = Math.max(0, nextTakeAt - Date.now()) + 100;
    const timer = setTimeout(() => {
      setNow(Date.now());
      refreshTakeNumberAvailability(offPeakTaskService);
    }, delay);
    return () => clearTimeout(timer);
  }, [refreshTakeNumberAvailability, offPeakTaskService, takeNumberAvailability]);
  React.useEffect(() => {
    const nextTakeAt = takeNumberAvailability?.nextTakeAt;
    if (takeNumberAvailability?.canTakeNumber !== false || nextTakeAt === undefined) return;
    const remaining = nextTakeAt - Date.now();
    if (remaining <= 0) return;
    const minute = 60000;
    const remainder = remaining % minute;
    const delay = (remainder === 0 ? minute : remainder) + 50;
    const timer = setTimeout(() => setNow(Date.now()), delay);
    return () => clearTimeout(timer);
  }, [now, takeNumberAvailability]);

  /* 闲时任务轮询（原 116128） */
  React.useEffect(() => {
    if (view.mode !== "list" || offPeakTasks.length === 0) return;
    const interval = setInterval(() => {
      refreshOffPeak(offPeakTaskService);
    }, 10000);
    return () => clearInterval(interval);
  }, [view.mode, offPeakTasks.length, refreshOffPeak, offPeakTaskService]);

  const handleRefreshAll = React.useCallback(async () => {
    setRefreshingAll(true);
    try {
      await Promise.all([
        refreshAutomations(zcodeAgentService),
        refreshOffPeak(offPeakTaskService),
        ...(offPeakGrayEnabled ? [refreshTakeNumberAvailability(offPeakTaskService)] : []),
      ]);
      setNow(Date.now());
    } finally {
      setRefreshingAll(false);
    }
  }, [offPeakGrayEnabled, refreshOffPeak, refreshTakeNumberAvailability, offPeakTaskService, refreshAutomations, zcodeAgentService]);

  /* 聊天创建草稿消费（原 116140） */
  React.useEffect(() => {
    const draft = consumePendingCreateDraft();
    if (draft && !activeWorkspaceTab) {
      setTab("idle");
      setView({ mode: "offpeak-create", draft });
    }
  }, [consumePendingCreateDraft, activeWorkspaceTab]);
  React.useEffect(() => {
    if (!activeWorkspaceTab) return;
    setTab((previous) => (previous === "idle" ? "scheduled" : previous));
    setView((previous) => (previous.mode === "offpeak-create" || previous.mode === "offpeak-edit" ? { mode: "list" } : previous));
  }, [activeWorkspaceTab]);

  const handleOpenCodingPlanUpgrade = React.useCallback(() => {
    const providerId =
      (settings?.providerFamilyDomain as string | undefined) === "bigmodel" ? PROVIDER_IDS_BIGMODEL_CODING_PLAN : PROVIDER_IDS_ZAI_CODING_PLAN;
    openCodingPlanUpgrade({
      providerId,
      initialAudience: "personal",
      funnelContext: buildUpgradeFunnelForAutomations({
        providerId,
        eventText: intl.formatMessage({ id: "settings.modelProvider.codingPlan.upgrade" }),
        entryPlanState: planStateOfProviders({ providers: modelProviders, loading: modelProvidersLoading }),
      }),
    });
  }, [intl, modelProviders, modelProvidersLoading, openCodingPlanUpgrade, settings?.providerFamilyDomain]);

  const handleShowCodingPlanToast = React.useCallback(() => {
    showToastWithAction(intl.formatMessage({ id: "offPeak.create.codingPlanToast" }), {
      durationMs: 8000,
      position: "top-center",
      variant: "info",
      actionLabel: intl.formatMessage({ id: "settings.modelProvider.codingPlan.upgrade" }),
      onAction: handleOpenCodingPlanUpgrade,
      dismissible: true,
      dismissLabel: intl.formatMessage({ id: "common.close" }),
    });
  }, [handleOpenCodingPlanUpgrade, intl]);

  const handleShowCreateLimitToast = React.useCallback(() => {
    showToastWithAction(intl.formatMessage({ id: "automations.error.createLimit" }, { limit: "20" }));
  }, [intl]);

  /* 深链接打开（原 116193） */
  React.useEffect(() => {
    const workspaceKey = workspacePath ? automationWorkspaceKey({ workspacePath, workspaceIdentity }) : null;
    const target = resolveAutomationOpenTarget(automations, openAutomationId, workspaceKey !== null && initializedWorkspaceKey === workspaceKey);
    if (target.status === "pending") return;
    if (target.status === "found") {
      setView({ mode: "edit", automation: target.target });
    } else {
      showToastWithAction(intl.formatMessage({ id: "automations.error.targetNotFound" }));
    }
    onOpenAutomationConsumed?.();
  }, [automations, intl, initializedWorkspaceKey, onOpenAutomationConsumed, openAutomationId, workspaceIdentity, workspacePath]);

  const handleCreateManually = React.useCallback(() => {
    if (createLimitReached) {
      handleShowCreateLimitToast();
      return;
    }
    setView({ mode: "create", draft: null });
  }, [createLimitReached, handleShowCreateLimitToast]);

  const handleCreateViaChat = React.useCallback(() => {
    if (createLimitReached) {
      handleShowCreateLimitToast();
      return;
    }
    if (activeWorkspaceTab) {
      setView({ mode: "create", draft: null });
      return;
    }
    if (onCreateViaChat) {
      onCreateViaChat(intl.formatMessage({ id: "automations.createViaChat.prompt" }));
    } else {
      setView({ mode: "create", draft: null });
    }
  }, [createLimitReached, activeWorkspaceTab, intl, onCreateViaChat, handleShowCreateLimitToast]);

  const handleCreateFromTemplate = React.useCallback(
    (template: { id: string; cronExpr: string }) => {
      if (createLimitReached) {
        handleShowCreateLimitToast();
        return;
      }
      setView({
        mode: "create",
        draft: {
          templateId: template.id,
          title: intl.formatMessage({ id: `automations.template.${template.id}.title` }),
          cronExpr: template.cronExpr,
          prompt: intl.formatMessage({ id: `automations.template.${template.id}.prompt` }),
        },
      });
    },
    [createLimitReached, intl, handleShowCreateLimitToast]
  );

  const handleSubmitAutomation = React.useCallback(
    async ({ input, workspacePath: targetWorkspacePath, workspaceIdentity: targetWorkspaceIdentity }: {
      input: { title: string; [key: string]: unknown }; // A0-CLEANUP3 3b：AutomationEditor 提交草稿恒含 title（createAutomation 形参面）
      workspacePath: string;
      workspaceIdentity?: string | null;
    }) => {
      if (view.mode === "edit") {
        const updated = await updateAutomation(view.automation.automationId, input, zcodeAgentService);
        if (updated) {
          setNow(Date.now());
        } else {
          showToastWithAction(intl.formatMessage({ id: automationErrorMessageId("update") }));
        }
        return updated;
      }
      if (createLimitReached) {
        handleShowCreateLimitToast();
        return false;
      }
      const created = await createAutomation({ ...input, workspacePath: targetWorkspacePath, workspaceIdentity: targetWorkspaceIdentity }, zcodeAgentService);
      trackAutomationCreated(platform, {
        automationId: created?.automationId,
        cronExpr: (input.cronExpr as string | undefined) ?? "",
        templateId: view.mode === "create" ? (view.draft?.templateId as string | undefined) : undefined,
        error: automationsStoreStatic.getState().error,
        modelFields: automationModelTelemetryFields(input.model, input.provider, modelProviders),
      });
      if (!created) {
        const error = automationsStoreStatic.getState().error;
        showToastWithAction(intl.formatMessage({ id: automationCreateErrorMessageId(error) }, { limit: "20" }));
        return false;
      }
      setNow(Date.now());
      return true;
    },
    [createLimitReached, createAutomation, intl, modelProviders, platform, handleShowCreateLimitToast, updateAutomation, view, zcodeAgentService]
  );

  const handleToggleAutomation = React.useCallback(
    async (automation: AutomationTask, enabled: boolean) => {
      await setAutomationEnabled(automation.automationId, enabled, zcodeAgentService);
      if (automationsStoreStatic.getState().error) {
        showToastWithAction(intl.formatMessage({ id: automationErrorMessageId("toggle") }));
        return;
      }
      setView((previous) =>
        previous.mode === "edit" && previous.automation.automationId === automation.automationId
          ? { mode: "edit", automation: { ...previous.automation, enabled, lifecycleStatus: enabled ? "active" : "paused" } }
          : previous
      );
      setNow(Date.now());
    },
    [intl, setAutomationEnabled, zcodeAgentService]
  );

  const handleRestartAutomation = React.useCallback(
    async (automation: AutomationTask) => {
      await restartAutomation(automation.automationId, zcodeAgentService);
      if (automationsStoreStatic.getState().error) {
        showToastWithAction(intl.formatMessage({ id: automationErrorMessageId("restart") }));
      } else {
        setNow(Date.now());
      }
    },
    [intl, restartAutomation, zcodeAgentService]
  );

  const handleRunNow = React.useCallback(
    async (automation: AutomationTask, source: string = "list") => {
      logger.debug("[automations] 立即运行交互开始", { automationId: automation.automationId, source });
      trackAutomationAction(platform, { action: "run_now", source, automation, providers: modelProviders });
      const result = await runAutomationNow(automation.automationId, zcodeAgentService);
      logger.debug("[automations] 立即运行交互结束", { automationId: automation.automationId, source, result });
      if (result === "queued") {
        await loadRuns(automation.automationId, zcodeAgentService, true);
        const sessionId = automationsStoreStatic
          .getState()
          .runsCache[automation.automationId]?.runs?.find((run) => run.trigger === "manual" && !!run.sessionId)?.sessionId;
        showToastWithAction(intl.formatMessage({ id: "scheduledPreview.toast.running" }, { title: automation.title }), {
          durationMs: 4000,
          position: "top-center",
          variant: "info",
          ...(sessionId && onOpenSession
            ? {
                actionLabel: intl.formatMessage({ id: "scheduledPreview.toast.view" }),
                onAction: () =>
                  onOpenSession({ sessionId, workspacePath: automation.workspacePath, workspaceIdentity: automation.workspaceIdentity }),
              }
            : {}),
          dismissible: true,
          dismissLabel: intl.formatMessage({ id: "common.close" }),
        });
        setNow(Date.now());
      } else if (result === "duplicate" || result === "failed") {
        showToastWithAction(intl.formatMessage({ id: runNowResultMessageId(result) }));
      }
    },
    [intl, loadRuns, modelProviders, onOpenSession, platform, runAutomationNow, zcodeAgentService]
  );

  const handleDeleteAutomation = React.useCallback(
    async (automation: AutomationTask, source: string = "list") => {
      const confirmed = await confirmDialog({
        presentation: "automation-confirmation",
        title: intl.formatMessage({ id: "automations.delete.title" }),
        description: intl.formatMessage({ id: "automations.delete.description" }, { title: automation.title }),
        confirmLabel: intl.formatMessage({ id: "common.delete" }),
        confirmVariant: "destructive",
        showKeyboardHints: false,
      });
      if (!confirmed) return;
      trackAutomationAction(platform, { action: "delete", source, automation, providers: modelProviders });
      await deleteAutomation(automation.automationId, zcodeAgentService);
      if (automationsStoreStatic.getState().error) {
        showToastWithAction(intl.formatMessage({ id: automationErrorMessageId("delete") }));
      }
      setView((previous) =>
        previous.mode === "edit" && previous.automation.automationId === automation.automationId ? { mode: "list" } : previous
      );
    },
    [confirmDialog, deleteAutomation, intl, modelProviders, platform, zcodeAgentService]
  );

  const handleOpenRunSession = React.useCallback(
    (run: { sessionId?: string | null; workspacePath?: string; workspaceIdentity?: string | null }) => {
      if (!run.sessionId || !onOpenSession) return;
      onOpenSession({
        sessionId: run.sessionId,
        workspacePath: run.workspacePath,
        ...(run.workspaceIdentity ? { workspaceIdentity: run.workspaceIdentity } : {}),
      });
    },
    [onOpenSession]
  );

  const handleEditOffPeakTask = React.useCallback((task: OffPeakTask) => {
    setView({ mode: "offpeak-edit", task });
  }, []);

  const handleCancelOffPeakTask = React.useCallback(
    async (task: OffPeakTask) => {
      const confirmed = await confirmDialog({
        title: intl.formatMessage({ id: "offPeak.cancel.title" }),
        description: intl.formatMessage({ id: "offPeak.cancel.description" }, { title: task.title || task.prompt }),
        confirmLabel: intl.formatMessage({ id: "offPeak.action.cancel" }),
      });
      if (!confirmed) return;
      await cancelOffPeakTask(task.offPeakTaskId, offPeakTaskService);
      const error = offPeakStoreStatic.getState().error;
      if (error) showToastWithAction(error);
    },
    [confirmDialog, intl, cancelOffPeakTask, offPeakTaskService]
  );

  const handleDeleteOffPeakTask = React.useCallback(
    async (task: OffPeakTask) => {
      const confirmed = await confirmDialog({
        title: intl.formatMessage({ id: "offPeak.delete.title" }),
        description: intl.formatMessage({ id: "offPeak.delete.description" }),
        confirmLabel: intl.formatMessage({ id: "offPeak.delete.confirm" }),
      });
      if (!confirmed) return;
      await deleteOffPeakTask(task.offPeakTaskId, offPeakTaskService);
      const error = offPeakStoreStatic.getState().error;
      if (error) showToastWithAction(error);
      setView((previous) =>
        previous.mode === "offpeak-edit" && previous.task.offPeakTaskId === task.offPeakTaskId ? { mode: "list" } : previous
      );
    },
    [confirmDialog, intl, deleteOffPeakTask, offPeakTaskService]
  );

  const handleDeleteOffPeakHistory = React.useCallback(
    async (task: OffPeakTask) => {
      await deleteOffPeakHistory(task.offPeakTaskId, offPeakTaskService);
      const error = offPeakStoreStatic.getState().error;
      if (error) showToastWithAction(error);
    },
    [deleteOffPeakHistory, offPeakTaskService]
  );

  const handleSubmitOffPeakTask = React.useCallback(
    async (input: Record<string, unknown>) => {
      const currentView = view;
      const telemetry =
        currentView.mode === "offpeak-create"
          ? offPeakDraftTelemetry({ source: currentView.draft?.telemetrySource, model: input.model })
          : null;
      if (currentView.mode !== "offpeak-edit" && takeNumberBlock.reason !== null) {
        if (takeNumberBlock.reason === "plan") {
          handleShowCodingPlanToast();
        } else if (takeNumberBlock.reason === "unavailable") {
          showToastWithAction(intl.formatMessage({ id: "offPeak.error.unavailable" }));
        } else {
          showToastWithAction(takeNumberBlock.tooltip ?? intl.formatMessage({ id: "offPeak.error.quota" }));
        }
        if (telemetry) {
          trackOffPeakCreateFailed(platform, telemetry, {
            ok: false,
            failureStage: "client_validation",
            errorCategory: "client_validation",
            errorCode: "",
            providerName: "",
          });
        }
        return false;
      }
      if (currentView.mode === "offpeak-edit") {
        const updated = await updateOffPeakTask(
          currentView.task.offPeakTaskId,
          {
            title: input.title,
            prompt: input.prompt,
            permissionMode: input.permissionMode,
            model: input.model ?? null,
            thoughtLevel: input.thoughtLevel ?? null,
          },
          offPeakTaskService
        );
        if (!updated) showToastWithAction(intl.formatMessage({ id: "offPeak.error.generic" }));
        return updated;
      }
      const result =
        telemetry === null
          ? await createOffPeakTask(input, offPeakTaskService)
          : await trackOffPeakCreate(platform, telemetry, () => createOffPeakTask(input, offPeakTaskService));
      if (!result.ok) showToastWithAction(intl.formatMessage({ id: offPeakCreateFailureMessageId(result) }));
      return result.ok;
    },
    [intl, createOffPeakTask, takeNumberBlock, offPeakTaskService, updateOffPeakTask, platform, handleShowCodingPlanToast, view]
  );

  if (!workspacePath) {
    return (
      <div className="rounded-lg border border-card-border bg-card px-3 py-2 text-ui-base text-foreground-subtle">
        {intl.formatMessage({ id: "automations.noWorkspace" })}
      </div>
    );
  }

  if (view.mode === "offpeak-create" || view.mode === "offpeak-edit") {
    return (
      <OffPeakTaskEditor
        editing={view.mode === "offpeak-edit" ? offPeakTasks.find((task) => task.offPeakTaskId === view.task.offPeakTaskId) ?? view.task : null}
        initialDraft={view.mode === "offpeak-create" ? view.draft ?? null : null}
        allowedModels={offPeakGrayConfig?.allowedModels ?? []}
        allowedModelConfigs={offPeakGrayConfig?.allowedModelConfigs ?? []}
        defaultWorkspacePath={workspacePath ?? ""}
        defaultWorkspaceIdentity={workspaceIdentity}
        saving={
          offPeakOperationId?.startsWith("offpeak:create") || offPeakOperationId?.startsWith("offpeak:update") || false
        }
        createBlocked={view.mode === "offpeak-create" && takeNumberBlock.reason !== null}
        createBlockedTooltip={takeNumberBlock.tooltip}
        onBack={() => setView({ mode: "list" })}
        onSubmit={handleSubmitOffPeakTask}
        onOpenSession={onOpenSession}
        onDelete={(task) => void handleDeleteOffPeakTask(task)}
        onDeleteHistory={(task) => void handleDeleteOffPeakHistory(task)}
        onPause={(task) => void pauseOffPeakTask(task.offPeakTaskId, offPeakTaskService)}
        onContinue={(task) => void continueOffPeakTask(task.offPeakTaskId, offPeakTaskService)}
        showToast={showToastWithAction}
      />
    );
  }

  if (view.mode === "list") {
    return (
      <div data-automations-content className={cn(AUTOMATIONS_CONTENT_CLASS, "flex flex-col")}>
        <div className="flex flex-col gap-3">
          <h1 className="text-[30px] font-medium leading-[34px] tracking-[0.114px] text-foreground">
            {intl.formatMessage({ id: "settings.automations.title" })}
          </h1>
          <p className="text-ui-base leading-5 text-foreground-subtlest">
            {intl.formatMessage({ id: hasAnyTasks ? "automations.description.populated" : "automations.description" })}
          </p>
        </div>
        {visibleTabs.length > 0 ? (
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2" data-testid={AUTOMATIONS_TABS_TESTID}>
              {visibleTabs.map((tabId) => (
                <Button
                  key={tabId}
                  type="button"
                  size="xs"
                  variant={tab === tabId ? "secondary" : "ghost"}
                  className={cn(
                    "h-7 rounded-lg px-2.5 text-ui-base font-normal",
                    tab !== tabId && "text-foreground-subtle hover:bg-surface-hover hover:text-foreground"
                  )}
                  onClick={() => setTab(tabId)}
                >
                  {intl.formatMessage({ id: `offPeak.tabs.${tabId}` })}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Tooltip title={refreshingAll ? intl.formatMessage({ id: "automations.refreshing" }) : intl.formatMessage({ id: "automations.refresh" })}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={intl.formatMessage({ id: "automations.refresh" })}
                  onClick={() => void handleRefreshAll()}
                  disabled={refreshingAll}
                >
                  <RefreshIcon className={cn("size-3.5", refreshingAll && "animate-spin")} aria-hidden="true" />
                </Button>
              </Tooltip>
              {tab === "idle" ? null : (
                <CreateSplitButton onViaChat={handleCreateViaChat} onManually={handleCreateManually} appearance={tab === "scheduled" ? "primary" : "outline"} />
              )}
              {showOffPeakTemplates ? (
                <OffPeakCreateButton
                  greyReason={takeNumberBlock.reason}
                  greyTooltip={takeNumberBlock.tooltip}
                  onCreate={() => setView({ mode: "offpeak-create" })}
                />
              ) : null}
            </div>
          </div>
        ) : null}
        {automationsLoading && automations.length === 0 && offPeakTasks.length === 0 ? (
          <div className="mt-8 flex h-40 items-center justify-center">
            <SpinnerIcon className="size-5" />
          </div>
        ) : (
          <div className={cn("flex flex-col gap-8", hasAnyTasks ? "mt-5" : "mt-8")}>
            <div className="flex w-full flex-col gap-4">
              {hasAnyTasks ? (
                <KeepAwakeRow
                  checked={(settings?.keepAwakeWhileRunning as boolean | undefined) ?? false}
                  onChange={(checked) => void updateSettings({ keepAwakeWhileRunning: checked })}
                />
              ) : null}
              <div data-automations-task-grid className="contents">
                {offPeakVisible && tab !== "scheduled" && offPeakTasks.length > 0 ? (
                  <section className="flex w-full flex-col gap-4">
                    <OffPeakTaskList
                      tasks={offPeakTasks}
                      busyOperationId={offPeakOperationId}
                      onOpen={handleEditOffPeakTask}
                      onPause={(task) => void pauseOffPeakTask(task.offPeakTaskId, offPeakTaskService)}
                      onContinue={(task) => void continueOffPeakTask(task.offPeakTaskId, offPeakTaskService)}
                      onCancel={(task) => void handleCancelOffPeakTask(task)}
                      onDelete={(task) => void handleDeleteOffPeakTask(task)}
                      onOpenSession={handleOpenRunSession}
                    />
                  </section>
                ) : null}
                {tab === "idle" ? null : automations.length > 0 ? (
                  <section className="flex w-full flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-ui-base font-medium leading-5 text-foreground-subtle">
                        {intl.formatMessage({ id: "automations.createdLabel" })}
                      </h2>
                      {visibleTabs.length === 0 ? <CreateSplitButton onViaChat={handleCreateViaChat} onManually={handleCreateManually} /> : null}
                    </div>
                    <div
                      data-testid={AUTOMATIONS_GRID_TESTID}
                      className={cn(
                        "grid grid-cols-1 auto-rows-[132px] gap-x-4 gap-y-4 lg:grid-cols-2",
                        automations.length > 8 && "max-h-[1198px] overflow-y-auto overscroll-contain lg:max-h-[606px]"
                      )}
                    >
                      {automations.map((automation) => {
                        const lifecycle = automationLifecycleOf(automation);
                        const hasFailed = automationHasFailedRun(automation);
                        const statusStyle = AUTOMATION_STATUS_STYLES[lifecycle];
                        const StatusIcon = statusStyle.icon;
                        const scheduleLabel = automationScheduleLabel(automation, intl);
                        const nextRunLabel = automationNextRunLabel(automation.nextRunAt, now, intl);
                        const statusLine =
                          lifecycle === "active" && !hasFailed && nextRunLabel
                            ? `${scheduleLabel} · ${intl.formatMessage({ id: "automations.nextRun" }, { when: nextRunLabel })}`
                            : scheduleLabel;
                        const runCountLabel = intl.formatMessage({ id: "automations.runCount" }, { count: String(automation.runCount) });
                        const busy = automationOperationId?.endsWith(`:${automation.automationId}`) ?? false;
                        const canRestart = isFailedAutomation(automation);
                        const canToggle = isToggleableAutomation(automation);
                        return (
                          <div
                            key={automation.automationId}
                            data-testid={AUTOMATIONS_CARD_TESTID}
                            role="button"
                            tabIndex={0}
                            onClick={() => setView({ mode: "edit", automation })}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setView({ mode: "edit", automation });
                              }
                            }}
                            className={cn(
                              "group relative flex h-full min-h-0 cursor-pointer gap-3 overflow-hidden rounded-xl border border-card-border bg-background p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused",
                              lifecycle === "completed" ? "opacity-60" : "hover:bg-hover"
                            )}
                          >
                            <div className="flex h-full min-w-0 flex-1 flex-col gap-3">
                              <span className="block truncate pr-12 text-ui-base font-medium leading-5 text-foreground">{automation.title}</span>
                              <p className="text-wrap-phrase line-clamp-2 h-10 text-ui-base font-normal leading-5 text-foreground-subtle">
                                {normalizeAutomationPromptPreview(automation.prompt)}
                              </p>
                              <div className="mt-auto flex h-6 min-w-0 items-center gap-2 text-ui-base leading-5">
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                  {hasFailed ? (
                                    <>
                                      <span className="inline-flex shrink-0 items-center py-0.5 pl-1 pr-2 font-normal text-destructive">
                                        <span className="flex size-5 shrink-0 items-center justify-center">
                                          <AutomationStatusFailedIcon className="size-4" strokeWidth={1.33} aria-hidden="true" />
                                        </span>
                                        <span className="pl-1">{intl.formatMessage({ id: "automations.lifecycle.failed" })}</span>
                                      </span>
                                      <span className="inline-flex min-w-0 items-center rounded-md bg-success/10 py-0.5 pl-1 pr-2 font-normal text-success opacity-40">
                                        <span className="flex size-5 shrink-0 items-center justify-center">
                                          <AutomationStatusActiveIcon className="size-4" aria-hidden="true" />
                                        </span>
                                        <span className="truncate pl-1">{statusLine}</span>
                                      </span>
                                    </>
                                  ) : lifecycle === "active" ? (
                                    <AutomationStatusChip
                                      text={statusLine}
                                      icon={<StatusIcon className="size-4 shrink-0" strokeWidth={1.33} aria-hidden="true" />}
                                    />
                                  ) : (
                                    <>
                                      <span className={cn("inline-flex shrink-0 items-center gap-1 font-normal", statusStyle.className)}>
                                        <span className="flex size-5 shrink-0 items-center justify-center">
                                          <StatusIcon className="size-4 shrink-0" strokeWidth={1.33} aria-hidden="true" />
                                        </span>
                                        {intl.formatMessage({ id: `automations.lifecycle.${lifecycle}` })}
                                      </span>
                                      {lifecycle === "paused" || lifecycle === "completed" ? (
                                        <AutomationStatusChip dimmed text={statusLine} icon={<AutomationStatusActiveIcon className="size-4" aria-hidden="true" />} />
                                      ) : null}
                                    </>
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    "inline-flex shrink-0 items-center whitespace-nowrap rounded-md bg-surface px-1.5 py-0.5 text-ui-base font-normal text-foreground-subtle",
                                    (hasFailed || lifecycle === "paused") && "opacity-40"
                                  )}
                                >
                                  {runCountLabel}
                                </span>
                              </div>
                            </div>
                            <div className="absolute right-3 top-3 flex items-center gap-1">
                              {busy ? <SpinnerIcon className="size-3.5" /> : null}
                              <AutomationRowActionMenu
                                automation={automation}
                                busy={busy}
                                canRestart={canRestart}
                                canToggle={canToggle}
                                onRunNow={handleRunNow}
                                onEdit={(target) => setView({ mode: "edit", automation: target })}
                                onToggle={handleToggleAutomation}
                                onRestart={handleRestartAutomation}
                                onDelete={handleDeleteAutomation}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ) : (
                  <div
                    data-automations-empty-state
                    className="flex h-[226px] w-full items-center justify-center rounded-2xl border border-card-border bg-background px-4"
                  >
                    <div className="flex translate-y-2 flex-col items-center gap-5">
                      <p className="text-ui-base font-medium leading-5 text-foreground-subtlest">
                        {intl.formatMessage({ id: "automations.empty.title" })}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <CreateSplitButton onViaChat={handleCreateViaChat} onManually={handleCreateManually} />
                        {offPeakCreationEnabled && offPeakTasks.length === 0 ? (
                          <OffPeakCreateButton
                            greyReason={takeNumberBlock.reason}
                            greyTooltip={takeNumberBlock.tooltip}
                            onCreate={() => setView({ mode: "offpeak-create" })}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {hasAnyTasks ? null : (
                <KeepAwakeRow
                  checked={(settings?.keepAwakeWhileRunning as boolean | undefined) ?? false}
                  onChange={(checked) => void updateSettings({ keepAwakeWhileRunning: checked })}
                />
              )}
            </div>
            {templatesSeparatorVisible ? (
              <div data-automations-task-template-separator className="flex w-full flex-col py-2" aria-hidden="true">
                <div className="h-px w-full bg-card-border" />
              </div>
            ) : null}
            {showOffPeakTemplates ? (
              <section data-automations-idle-templates className="flex w-full flex-col gap-4">
                <h2 className="text-ui-base font-medium leading-5 text-foreground-subtle">
                  {intl.formatMessage({ id: "offPeak.templates.sectionTitle" })}
                </h2>
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  {OFF_PEAK_TEMPLATES.map((template) => {
                    const planBlocked = takeNumberBlock.reason === "plan";
                    return (
                      <div key={template.id} className="h-full">
                        <button
                          type="button"
                          onClick={() => {
                            if (planBlocked) {
                              handleShowCodingPlanToast();
                              return;
                            }
                            setView({
                              mode: "offpeak-create",
                              draft: {
                                title: intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.title` }),
                                prompt: intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.prompt` }),
                                telemetrySource: { eventRegion: "app.automations", templateId: template.id },
                              },
                            });
                          }}
                          className="flex h-full min-h-[114px] w-full flex-col gap-2 overflow-hidden rounded-xl border border-card-border bg-background p-3 text-left transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
                        >
                          <div className="flex items-center gap-0.5">
                            <TemplateIcon className="size-4 shrink-0 text-foreground-subtle" name={template.id} />
                            <span className="truncate px-1 text-ui-base font-medium leading-5 text-foreground">
                              {intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.title` })}
                            </span>
                          </div>
                          <p className="text-wrap-phrase line-clamp-2 flex-1 text-ui-base font-normal leading-5 text-foreground-subtle">
                            {intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.description` })}
                          </p>
                          <div className="text-ui-base font-normal leading-5 text-foreground-subtle">
                            {intl.formatMessage({ id: "offPeak.form.soonestAvailable" })}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}
            {showScheduledTemplates ? (
              <section data-automations-scheduled-templates className="flex w-full flex-col gap-4">
                <h2 className="text-ui-base font-medium leading-5 text-foreground-subtle">
                  {intl.formatMessage({ id: "automations.moreIdeas" })}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {SCHEDULED_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleCreateFromTemplate(template)}
                      className="group flex min-h-[114px] flex-col gap-2 overflow-hidden rounded-xl border border-card-border bg-background p-3 text-left transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
                    >
                      <div className="flex min-w-0 items-center gap-1">
                        <span className="flex size-5 shrink-0 items-center justify-center">
                          <ScheduledTemplateIcon className="text-foreground-subtle" name={template.icon} />
                        </span>
                        <span className="truncate text-ui-base font-medium leading-5 text-foreground">
                          {intl.formatMessage({ id: `automations.template.${template.id}.title` })}
                        </span>
                      </div>
                      <p className="line-clamp-2 flex-1 text-ui-base font-normal leading-5 text-foreground-subtle">
                        {intl.formatMessage({ id: `automations.template.${template.id}.description` })}
                      </p>
                      <div className="text-ui-base font-normal leading-5 text-foreground-subtle">
                        {intl.formatMessage({ id: `automations.template.${template.id}.schedule` })}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <AutomationEditor
      editing={view.mode === "edit" ? view.automation : null}
      initialDraft={view.mode === "create" ? view.draft : null}
      defaultWorkspacePath={workspacePath}
      defaultWorkspaceIdentity={workspaceIdentity}
      modelProviders={modelProviders}
      modelSelectGroups={modelSelectGroups}
      saving={automationOperationId?.startsWith("automation:create") || automationOperationId?.startsWith("automation:update") || false}
      onBack={() => setView({ mode: "list" })}
      onSubmit={handleSubmitAutomation}
      onRunNow={(automation) => handleRunNow(automation, "editor")}
      onToggle={handleToggleAutomation}
      onDelete={(automation) => handleDeleteAutomation(automation, "editor")}
      runsEntry={view.mode === "edit" ? runsCache[view.automation.automationId] : undefined}
      onLoadRuns={() => {
        if (view.mode === "edit") loadRuns(view.automation.automationId, zcodeAgentService, true);
      }}
      onDeleteRun={(runId) => {
        if (view.mode === "edit") deleteRun(view.automation.automationId, runId, zcodeAgentService);
      }}
      onOpenSession={
        view.mode === "edit" && onOpenSession
          ? (sessionId) => {
              onOpenSession({
                sessionId,
                workspacePath: view.automation.workspacePath,
                workspaceIdentity: view.automation.workspaceIdentity,
              });
            }
          : undefined
      }
    />
  );
}

/** d6 内 fX/q 的局部别名声明（与 SettingsPanels.tsx 同源，避免跨文件导入） */
declare function useUpgradeEntryForAutomations(): {
  openCodingPlanUpgrade: (opts: {
    providerId: string;
    initialAudience?: "personal" | "team";
    initialTeamPlanKey?: string;
    funnelContext?: string;
  }) => void;
}; // fX（89052）
declare function useCodingPlanEntitlementsForAutomations(opts: {
  modelProviders: ModelProvider[];
  loading: boolean;
  modelProviderFamilySelectedKeys?: Record<string, string>;
}): { entitlements: Record<string, { snapshot?: unknown }> }; // sX（88255）
const PROVIDER_IDS_ZAI_CODING_PLAN = providerIds.zaiCodingPlan; // 原 q.zaiCodingPlan（A0-CLEANUP B-7 接线）
const PROVIDER_IDS_BIGMODEL_CODING_PLAN = providerIds.bigmodelCodingPlan; // 原 q.bigmodelCodingPlan（A0-CLEANUP B-7 接线）
declare function buildUpgradeFunnelForAutomations(opts: { providerId: string; eventText: string; entryPlanState: string }): string; // FM
declare function planStateOfProviders(opts: { providers: ModelProvider[]; loading: boolean }): string; // LM
