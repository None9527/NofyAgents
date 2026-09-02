// A0-S4-4a: 自 modules/SettingsPanelsCapability.tsx 自动化分区（§6，d6/F15 族根）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 3685–4960（含尾部 fX/q 局部别名声明）；§0 声明群随族迁入（剔除 SkillsService/SubagentsService 接口，其型别属技能/子代理族）。导入路径按 components/automations/ 深度改指 ../../modules/。
import * as React from "react";
import { DropdownMenu as DropdownMenuRoot, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { LoaderCircle as SpinnerIcon, RefreshCw as RefreshIcon, Trash2 as TrashIcon, EllipsisIcon, PlayIcon, RotateCcw as RotateIcon, PauseIcon, PlayCircle as ResumeIcon, SquarePen as EditIcon, CircleCheck as AutomationStatusCompletedIcon, TriangleAlert as AutomationStatusFailedIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk
import { toast, usePlatformService, type PlatformService } from '../../modules/ImeComposition'; // 〔A1-R48〕+usePlatformService/type PlatformService（原 l ≡ imeComposition M 导出 ≡ usePlatform 域外别名）：本地 2 员面碑化改指，见下墓碑
import { AutomationEditor, CreateSplitButton, KeepAwakeRow, OffPeakTaskEditor, type SelectGroupEntry } from '../../modules/SettingsLeaves'; // A0-CLEANUP3 3b：SelectGroupEntry 属主为 SettingsLeaves（导出）
import { useServices } from '../../modules/services';
import { useAutomationsStore } from '../../modules/stores-tasks';
import { cn } from '../../modules/UtilsCn';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';
import { t as logger } from '../../modules/logger';
import { useConfirmDialog } from '../../modules/Modals'; // U2
import { isWorkspaceKindTab as isWorkspaceTab } from '../../modules/WorkspaceTabsDeep'; // 原 oc（A1-R2：styles js 4487 改指 R1 既有导出；别名保留本地调用名）
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // Ia
import { SETTINGS_CONTENT_CLASS as AUTOMATIONS_CONTENT_CLASS } from '../../modules/Settings'; // H3 容器类
import { OffPeakCreateButton, SCHEDULED_TEMPLATES } from '../../modules/ExtendedViews'; // INt / LNt（A0-CLEANUP B-31 接线）
import { providerIds } from '../../modules/SrcSharedA'; // q=mo（A0-CLEANUP B-7）
import { isCodingPlanConnectionSelected as hasCodingPlanEntitlement, type ModelCatalogEntryLike } from '../../modules/Home'; // 〔A1-R24〕zrt 197021 面联动：本文件 ModelProvider.models 型缝所依 // 〔A1-R104〕+hasCodingPlanEntitlement 改指（原 Tit declare 删碑；canonical = Home::isCodingPlanConnectionSelected@749，A0 语义重建在案，xn/zi 依赖 R27/R28 既收敛）。环安全：Home 值闭包不达 components/automations（grep 实证仅注释提及）
import { offPeakCreateFailureMessageId, reportTelemetry } from '../../modules/StoresDeep'; // 〔A1-R104〕原 Dit declare 删碑改指 canonical = offPeakHelpers 逐字实体（转导出） // 〔A1-R105〕+reportTelemetry：原 xw（40457）遥测总入口 canonical（StoresDeep@323，R36 实体化；PaymentDeep R26 同判例）
import { parseCustomModelRef } from '../../modules/SrcSharedB'; // 〔A1-R105〕原 Zn（styles 544 `P as Zn` ← src iS@8966 ≡ SrcSharedB parseCustomModelRef）：MNt 深依赖 canonical
import { useAppSettings } from '../../modules/UsageDeep'; // A1-R11：JM（53488）改指 canonical（components/usage/UsageDeep.tsx §2c）；调用点 548 解构 {settings, update}，552/655–657 读取面（具名 + 既有 as 窄化）与 1179/1341 update({keepAwakeWhileRunning}) 补丁逐字不变。环安全：UsageDeep 值闭包不达本文件
import { formatCronSchedule as automationScheduleLabel } from '../conversation/AutomationCards'; // 〔A1-R103〕rgt 改指：原 automationScheduleLabel declare（rgt，注记行号 93602 旧口径）删除，canonical = R96 逐字实体 formatCronSchedule（同束符 rgt@109573）。环安全：AutomationCards 值闭包（React/lucide/I18n/button/UtilsCn/SettingsLeaves/ToolStatusModel）不达 components/automations
import {
  automationsWorkspaceKey as automationWorkspaceKey, // Ti
  automationCardMenuTestid as AUTOMATIONS_MORE_ACTIONS_TESTID, // at（src chunk）
  automationActionToggleTestid as AUTOMATIONS_TOGGLE_TESTID, // Xn
  automationActionDeleteTestid as AUTOMATIONS_DELETE_TESTID, // Et
  automationsListTestid as AUTOMATIONS_GRID_TESTID, // jr
  automationCardTestid as AUTOMATIONS_CARD_TESTID, // Bte
  offpeakTabTestid as AUTOMATIONS_TABS_TESTID, // on
} from '../../modules/SrcSharedB';
import type { SkillItem, SkillCapability, SkillDiagnostic } from '../settings/SkillsSettingsSection'; // §0 SkillsService 接口签名引用（属主：技能族文件）

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}


/* ── tombstone〔A1-R48〕：本地 PlatformService 面（openExternal/openInFileManager 2 员）+ declare usePlatformService（原 l）
 *    删除 → 改指 canonical = components/ime/ImeComposition PlatformService 富面（A1-R48 增补已括 2 员）
 *    + usePlatformService 真导出（modules/ImeComposition shim 再导出）。共同根因 = canonical 富面未括宿主桥接成员，
 *    增补证据见 A1-R47.report §四.6。
 *    track* declares（PNt/FNt/Ujt/Wjt）参型 PlatformService 同名解析 canonical；消费 @547 逐字不变。 ── */

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
/* ── tombstone（A0-S3c）：DialogContent、DialogHeader、DialogRoot、DialogTitle、DropdownMenuContent、DropdownMenuItem、DropdownMenuRoot、DropdownMenuSeparator、DropdownMenuTrigger、SelectRoot declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */










/* --- 图标 --- */

/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（19）：RefreshIcon/PlusIcon/TrashIcon/PencilIcon/ExternalLinkIcon/ChevronDownIcon/ChevronRightIcon/CheckIcon/DownloadIcon/FolderOpenIcon/SearchIcon/AlertIcon/SettingsIcon/EllipsisIcon/PlayIcon/RotateIcon/PauseIcon/ResumeIcon/EditIcon → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const AutomationStatusActiveIcon: React.FC<React.SVGProps<SVGSVGElement>>; // M3
declare const AutomationStatusPausedIcon: React.FC<React.SVGProps<SVGSVGElement>>; // k3
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：AutomationStatusCompletedIcon/AutomationStatusFailedIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const TemplateIcon: React.FC<{ className?: string; name: string }>; // uMt 闲时模板图标
declare const ScheduledTemplateIcon: React.FC<{ className?: string; name?: string }>; // Njt 定时模板图标
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（3）：SkillIcon/CommandIcon/SubagentIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone〔A1-R43〕：declare HookIcon（原 p（camera-info 占位））删除——本文件零消费（死 declare；全文 grep 实测仅本声明行），树内无 canonical（全域 grep 实测：仅 6 文件 declare 面，零 export/零消费）；A1-R43 项 3 机械簇收敛，证据见 A1-R43.report.md §四。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：UserScopeIcon/InfoIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/* --- 通用领域类型 --- */

/* ── tombstone〔A1-R50〕：本地 RemoteTarget 副本（6 员 family-A 形）删除——本文件零消费
 *    （grep 实测仅本声明行；$2/q2 declare 簇 R44 已碑化）。统一属主裁定 =
 *    components/ime/ImeComposition::RemoteTarget（canonical openInEditor opts.remoteTarget
 *    内联抽出）；未来出现消费面 → 经 modules/ImeComposition type import 引入。 ── */
interface ModelProvider {
  id: string;
  name: string;
  apiKey: string;
  models: Array<string | ModelCatalogEntryLike>; // 〔A1-R24〕zrt 197021 面联动型缝：qq store 真身含 models（AutomationEditor → SubagentLeaves 链透传面）
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

/* ── tombstone〔A1-R44〕：死 declare 簇（8 件）删除：resolveRemoteSyncTarget（原 $2 远程目标可用性判定）/ remoteTargetDisplayName（原 q2 远程目标显示名）/ useZcodeSessionService（原 kg zcodeSessionService 工厂）/
 * useWorkspaceAgentService（原 Ag workspace 服务工厂）/ refreshSessionCapabilities（原 M6 会话能力刷新）/ refreshSkillCapabilities（原 N6 技能能力刷新）/ refreshAfterPluginSync（原 V6 插件远程同步后全量刷新）/
 * refreshAfterHookChange（原 lFt hooks 能力刷新）。零消费实测：全文 grep 每名出现次数 = 1（仅本 declare 行），非 export、文件本地死面。树内无 canonical（全域 grep）：仅本簇 6 文件同形 declare 面；他文件活面（ExtendedViews useWorkspaceAgentService、Sidebar refreshAfterPluginSync、OnboardingDialog useZcodeSessionService@289 本地 declare+消费）皆各该文件自有 declare+消费暂代式，与本文件死面无涉。无改指对象，纯删碑；未来本文件出现消费面 → 经 bundle 取证定真身后重新引入。证据见 A1-R44.report.md §二/§四。
 * A1-R44 项 1 机械簇收敛（R43 §六.1 留批闭合，全族实查 37 件；Hooks/Plugins/Skills 同形活面 declare 逐件保留，明细见报告 §三）。 ── */












































/* --- stores --- */

interface ModelProvidersStoreState {
  modelProviders: ModelProvider[];
  displayOrder: { providerIds: string[]; updatedAt?: number } | null;
  loading: boolean;
}
declare function useModelProvidersStore(): ModelProvidersStoreState; // qq
/* ── tombstone（A1-R11）：declare useAppSettings（原 JM，53488）删除，改经文件头 modules/UsageDeep import 消费
 *    （canonical = components/usage/UsageDeep.tsx §2c，JM 53488 逐字；update 形参 AppRuntimeSettingsPatch 索引面对 1179/1341 补丁可赋）。 ── */
interface TaskStoreState {
  getWorkspaceState: (workspacePath: string, identity?: string | null) => { activeTaskId: string | null };
  startDraft: (workspacePath: string, draft?: unknown, identity?: string | null) => void;
  bindRuntimeProvider: (workspacePath: string, provider: string, identity?: string | null) => void;
  setSlashCommands: (workspacePath: string, commands: unknown[], identity?: string | null) => void;
  setActiveTaskId: (workspacePath: string, taskId: string, identity?: string | null) => void;
  getState?: unknown;
}
/* ── tombstone（A1-R2）：useWorkspaceTabsStore（原 pc js 4753）declare 已删除：本文件无调用点（死声明）。
 *    isWorkspaceTab（原 oc js 4487）declare 已删除，改经文件头真实 import
 *    （../../modules/WorkspaceTabsDeep 之 isWorkspaceKindTab，别名保留本地调用名）消费。
 *    本地宽松 WorkspaceTabsStoreState 保留：activeWorkspaceTabOf（zMt）declare 仍引用。 ── */
interface WorkspaceTabsStoreState {
  tabs: Array<{ id: string; [key: string]: unknown }>;
  activeTabId: string | null;
  activateTabByPath: (workspacePath: string, opts?: { workspaceIdentity?: string | null }) => void;
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
  codingPlanSupport: { supported?: boolean; providerFamily?: string; selectedConnectionKey?: string } | null; // 〔A1-R104〕型精化：按 Tit canonical（Home::isCodingPlanConnectionSelected）参面（A0-CLEANUP3 3b 对齐模式续；本地 ambient 面自洽，不跨核）
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
/* ── tombstone〔A1-R105〕：declare 三连——trackAutomationCreated（原 PNt）/automationModelTelemetryFields（原 MNt）/
 *    trackAutomationAction（原 FNt）删除——遥测三符 + NNt/jNt 逐字实体化于下方；深依赖全改指树内 canonical
 *    （xw→StoresDeep::reportTelemetry R36、Zn→SrcSharedB::parseCustomModelRef）。 ── */
/* ── 原 jNt（js 138579）→ AUTOMATION_TELEMETRY_REGION：遥测域标〔A1-R105 逐字实体化〕 ── */
const AUTOMATION_TELEMETRY_REGION = `app.automations`;
/* ── 原 MNt（js 138580–138596）→ automationModelTelemetryFields：模型遥测三元（model_name/provider/provider hostname）〔A1-R105 逐字实体化〕 ── */
function automationModelTelemetryFields(e: any, t: any, n: any) {
  let r = e?.trim() ?? ``,
    i = parseCustomModelRef(r),
    a = r.indexOf(`/`),
    o = t?.trim() || i?.providerId?.trim() || (a > 0 ? r.slice(0, a).trim() : ``),
    s = i?.modelName?.trim() || (a > 0 ? r.slice(a + 1).trim() : r),
    c = n.find((e: any) => e.id === o),
    l = ``;
  if (c?.source === `custom` && c.endpoints.baseURL?.trim())
    try {
      l = new URL(c.endpoints.baseURL).hostname;
    } catch {
      l = ``;
    }
  return { model_name: s, model_provider: o, provider_name: l };
}
/* ── 原 NNt（js 138597–138607）→ sanitizeTelemetryErrorText：错误文案脱敏（url/path/凭据三遮 + 500 截）〔A1-R105 逐字实体化〕 ── */
function sanitizeTelemetryErrorText(e: any) {
  return e
    ? e
        .replace(/https?:\/\/[^\s"']+/g, `[url]`)
        .replace(/(?:[A-Za-z]:\\|\/)[^\s"']+/g, `[path]`)
        .replace(
          /((?:api[_-]?key|token|authorization|password)\s*[:=]\s*)[^\s,;]+/gi,
          `$1[redacted]`,
        )
        .slice(0, 500)
    : ``;
}
/* ── 原 PNt（js 138608–138628）→ trackAutomationCreated：创建结果遥测（success/fail + cron/template/脱敏错误 + 模型三元展开）〔A1-R105 逐字实体化〕 ── */
function trackAutomationCreated(e: any, t: any) {
  return reportTelemetry(
    e,
    {
      elementName: `automation_create_result`,
      eventRegion: AUTOMATION_TELEMETRY_REGION,
      eventType: `result`,
      eventExtraDetail: {
        status: t.automationId ? `success` : `fail`,
        automation_id: t.automationId ?? ``,
        create_source: `manual`,
        cron_expr: t.cronExpr,
        template_id: t.templateId ?? ``,
        error_code: ``,
        error_msg: t.automationId ? `` : sanitizeTelemetryErrorText(t.error),
        ...t.modelFields,
      },
    },
    `automation-telemetry`,
  );
}
/* ── 原 FNt（js 138629–138647）→ trackAutomationAction：run_now/delete 点击遥测（run_now 附模型三元）〔A1-R105 逐字实体化〕 ── */
function trackAutomationAction(e: any, t: any) {
  return reportTelemetry(
    e,
    {
      elementName: t.action === `run_now` ? `automation_run_now_ck` : `automation_delete_ck`,
      eventRegion: AUTOMATION_TELEMETRY_REGION,
      eventType: `ck`,
      eventExtraDetail: {
        automation_id: t.automation.automationId,
        action_source: t.source,
        ...(t.action === `run_now`
          ? automationModelTelemetryFields(t.automation.model, t.automation.provider, t.providers)
          : {}),
      },
    },
    `automation-telemetry`,
  );
}
declare function offPeakDraftTelemetry(opts: { source?: unknown; model?: unknown }): unknown; // Vjt（jsx 113296）
declare function trackOffPeakCreateFailed(platform: PlatformService, telemetry: unknown, result: unknown): void; // Ujt（jsx 113330）
declare function trackOffPeakCreate(platform: PlatformService, telemetry: unknown, create: () => Promise<{ ok: boolean }>): Promise<{ ok: boolean }>; // Wjt
/* ── tombstone〔A1-R104〕：declare offPeakCreateFailureMessageId（原 Dit 91405）删除——改指 offPeakHelpers 逐字 canonical（modules/StoresDeep 转导出，import 在案）。 ── */
/* ── tombstone〔A1-R103〕：declare 四连——automationLifecycleOf（原 qht）/automationHasFailedRun（原 Kht）/
 *    automationScheduleLabel（原 rgt）/automationNextRunLabel（原 egt）删除。qht/Kht/egt + 4 依赖逐字实体化于下方；
 *    rgt 改指 AutomationCards::formatCronSchedule canonical（R96 实体化，同束符 rgt@109573）。
 *    declare 注记行号 93279/93276/93602/93576 为旧口径，实测现行口径 = 109298/109291/109573/109547。
 *    双轨登记 W5：AutomationsMainView A0 孪生 describeAutomationFrequency/describeAutomationNextRun（语义重建）与本批逐字实体并存。 ── */
/* ── 原 Kht（js 109291–109297）→ automationHasFailedRun：失败态判定（lifecycle/dispatch/lastError 三面）〔A1-R103 逐字实体化〕 ── */
function automationHasFailedRun(e: any) {
  return (
    e.lifecycleStatus === `failed` ||
    e.dispatchStatus === `failed_to_dispatch` ||
    !!e.lastError?.trim()
  );
}
/* ── 原 qht（js 109298–109306）→ automationLifecycleOf：生命周期态投射（failed > completed > paused/停用 > active）〔A1-R103 逐字实体化〕 ── */
function automationLifecycleOf(e: any) {
  return e.lifecycleStatus === `failed`
    ? `failed`
    : e.lifecycleStatus === `completed`
      ? `completed`
      : e.lifecycleStatus === `paused` || !e.enabled
        ? `paused`
        : `active`;
}
/* ── 原 J$/Jht（js 109308–109309，q$ 同声明者链 109307 留束 = cron 描述器域星期序，非本闭包）→
 *    padTwoDigitDatePart/NEXT_RUN_RELATIVE_WINDOW_MS〔A1-R103 逐字实体化〕 ── */
const padTwoDigitDatePart = (e: any) => String(e).padStart(2, `0`);
const NEXT_RUN_RELATIVE_WINDOW_MS = 720 * 60 * 60 * 1e3;
/* ── 原 $$（js 109522–109526）→ formatAbsoluteRunTime：时间戳 → YYYY-MM-DD HH:mm〔A1-R103 逐字实体化〕 ── */
function formatAbsoluteRunTime(e: any) {
  if (!e) return `-`;
  let t = new Date(e);
  return `${t.getFullYear()}-${padTwoDigitDatePart(t.getMonth() + 1)}-${padTwoDigitDatePart(t.getDate())} ${padTwoDigitDatePart(t.getHours())}:${padTwoDigitDatePart(t.getMinutes())}`;
}
/* ── 原 $ht（js 109527–109546）→ formatRelativeRunTime：相对时刻文案（<1min → soon/justNow；分/时/日分级 + in/ago）〔A1-R103 逐字实体化〕 ── */
function formatRelativeRunTime(e: any, t: any, n: any) {
  if (!e) return `-`;
  let r = e - t,
    i = Math.abs(r),
    a = r >= 0,
    o = 6e4,
    s = 60 * o,
    c = 24 * s,
    l: any,
    u: any;
  if (i < o)
    return n.formatMessage({ id: a ? `automations.time.soon` : `automations.time.justNow` });
  i < s
    ? ((l = Math.round(i / o)), (u = `automations.time.minutes`))
    : i < c
      ? ((l = Math.round(i / s)), (u = `automations.time.hours`))
      : ((l = Math.round(i / c)), (u = `automations.time.days`));
  let d = n.formatMessage({ id: u }, { value: String(l) });
  return n.formatMessage({ id: a ? `automations.time.in` : `automations.time.ago` }, { amount: d });
}
/* ── 原 egt（js 109547–109549）→ automationNextRunLabel：下次运行文案（≤720h → 相对；余 → 绝对；过期/无 → null）〔A1-R103 逐字实体化〕 ── */
function automationNextRunLabel(e: any, t: any, n: any) {
  return !e || e <= t ? null : e - t <= NEXT_RUN_RELATIVE_WINDOW_MS ? formatRelativeRunTime(e, t, n) : formatAbsoluteRunTime(e);
}
/* ── tombstone〔A1-R104〕：declare hasCodingPlanEntitlement（原 Tit 91395）删除——改指 Home::isCodingPlanConnectionSelected canonical（import 别名在案）。
 *    双轨登记 W5：Home@761–774 A0 本地孪生（isCodingPlanConnectionSelected 本体即 canonical）与 AutomationsMainView@1005–1008 孪生并存。 ── */
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

/** 原 ZNt（js 138730）：自动化行操作菜单（立即运行/重启/暂停恢复/编辑/删除） */
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
  const { openCodingPlanUpgrade } = useCodingPlanUpgradeDialog();
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
      funnelContext: buildCodingPlanFunnelContext({
        providerId,
        eventText: intl.formatMessage({ id: "settings.modelProvider.codingPlan.upgrade" }),
        entryPlanState: resolveEntryPlanState({ providers: modelProviders, loading: modelProvidersLoading }),
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
/* ── tombstone〔A1-R43〕：declare useUpgradeEntryForAutomations（原 fX 89100）删除 → 一符一家收敛 PaymentDeep useCodingPlanUpgradeDialog
 *    （fX 逐字真身：useContext(dX) + throw 守卫，components/payments/PaymentDeep@10102，A1-R23 补 export；
 *    modules/PaymentDeep@317 转导出；Home@152/343 R23 收敛先例同链）。
 *    消费面实测 @550 改名改指（解构 openCodingPlanUpgrade；canonical 返回 context any 面，解构逐字兼容）。
 *    型缝沿革在案：R42 已裁 funnelContext string→unknown（本碑前身行注）；真形对象面（fX 89100 读 e?.funnelContext?.purchaseAudience）。
 *    环安全：modules/PaymentDeep→components/payments→modules/Home 既有二环（Home@152 注在案），不达 automations（grep 实证）。
 *    尾部导入（R35 先例）：import { useCodingPlanUpgradeDialog } from '../../modules/PaymentDeep'。 ── */

declare function useCodingPlanEntitlementsForAutomations(opts: {
  modelProviders: ModelProvider[];
  loading: boolean;
  modelProviderFamilySelectedKeys?: Record<string, string>;
}): { entitlements: Record<string, { snapshot?: unknown }> }; // sX（88255）
const PROVIDER_IDS_ZAI_CODING_PLAN = providerIds.zaiCodingPlan; // 原 q.zaiCodingPlan（A0-CLEANUP B-7 接线）
const PROVIDER_IDS_BIGMODEL_CODING_PLAN = providerIds.bigmodelCodingPlan; // 原 q.bigmodelCodingPlan（A0-CLEANUP B-7 接线）
/* ── tombstone〔A1-R42〕：declare buildUpgradeFunnelForAutomations（原 FM）/planStateOfProviders（原 LM）删除 → 改指 components/shell/Home §U.8 canonical：buildCodingPlanFunnelContext（FM 53267-53276，A1-R25 逐字实体化）/resolveEntryPlanState（LM 53299-53312，A1-R26），经尾部导入取回。
 *    消费面实测 @771/@774 改名改指（≡ bundle 139073/139076；R25/R26 注「139073/139076 R0 域留批」闭合）。型缝：funnelContext A0 string 近似 → unknown 对象面（@1481，MPSS@209 A1-R11 先例：fX 89100 读 e?.funnelContext?.purchaseAudience——对象面非字符串）；ModelProvider[]→ModelProviderEntry[] 逐字段相容（索引签名 unknown 对齐）。 ── */
import { buildCodingPlanFunnelContext, resolveEntryPlanState } from '../shell/Home'; // 〔A1-R42〕原 buildUpgradeFunnelForAutomations/planStateOfProviders（FM/LM declare）收敛改指——Home §U.8 canonical（FM 53267 A1-R25 / LM 53299 A1-R26 逐字实体化；本批补 export）。尾部导入：ES 模块提升，行引用零漂（R35 先例）。环安全：Home 不 import automations 域（grep 实证），值闭包单向。

import { useCodingPlanUpgradeDialog } from '../../modules/PaymentDeep'; // 〔A1-R43〕原 useUpgradeEntryForAutomations（fX declare）收敛改指——canonical useCodingPlanUpgradeDialog（fX 89100 逐字真身，A1-R23 补 export；Home@152 R23 先例同链）。尾部导入：ES 提升，行引用零漂。
