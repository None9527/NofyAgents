// A0-S4-4a: 自 modules/SettingsPanelsCapability.tsx 自动化分区（§6，d6/F15 族根）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 3685–4960（含尾部 fX/q 局部别名声明）；§0 声明群随族迁入（剔除 SkillsService/SubagentsService 接口，其型别属技能/子代理族）。导入路径按 components/automations/ 深度改指 ../../modules/。
import * as React from "react";
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）// 〔A1-R108〕图标族实体化接线（k3/M3/Njt/uMt 编译形消费）
import { DropdownMenu as DropdownMenuRoot, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { LoaderCircle as SpinnerIcon, RefreshCw as RefreshIcon, Trash2 as TrashIcon, EllipsisIcon, PlayIcon, RotateCcw as RotateIcon, PauseIcon, PlayCircle as ResumeIcon, SquarePen as EditIcon, CircleCheck as AutomationStatusCompletedIcon, TriangleAlert as AutomationStatusFailedIcon, Clock, CircleStop, Target, Activity, FileText, List, ListChecks, SlidersHorizontal, Info, Moon, Square, ExternalLink } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0 // 〔A1-R108〕+Clock/CircleStop（原 V_/R_：M3/k3 状态图标真身，束 26949/26912 Sa 工厂证）+Target/Activity/FileText/List/ListChecks/SlidersHorizontal（原 wbe/y_/Z_/dv/lv/bbe：Mjt/lMt 模板图标映射表六员）// 〔A1-R113〕+Info/Moon/Square/ExternalLink（原 p/xv/Wv/q_：O3/qjt/Xjt/P3 图标包装真身，imeComposition 11781/束 27516/27871/27013 工厂证）
import { Button } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk
import { toast, usePlatformService, type PlatformService } from '../../modules/ImeComposition'; // 〔A1-R48〕+usePlatformService/type PlatformService（原 l ≡ imeComposition M 导出 ≡ usePlatform 域外别名）：本地 2 员面碑化改指，见下墓碑
import { AutomationEditor, CreateSplitButton, KeepAwakeRow, OffPeakTaskEditor, type SelectGroupEntry } from '../../modules/SettingsLeaves'; // A0-CLEANUP3 3b：SelectGroupEntry 属主为 SettingsLeaves（导出）
import { useServices } from '../../modules/services';
import { useAutomationsStore } from '../../modules/stores-tasks';
import { cn } from '../../modules/UtilsCn';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';
import { t as logger } from '../../modules/logger';
import { useConfirmDialog } from '../../modules/Modals'; // U2
import { isWorkspaceKindTab as isWorkspaceTab, useWorkspaceTabStore } from '../../modules/WorkspaceTabsDeep'; // 原 oc（A1-R2：styles js 4487 改指 R1 既有导出；别名保留本地调用名）// 〔A1-R107〕+useWorkspaceTabStore：原 pc（js 4753）canonical（映射表行 66 在案）——activeWorkspaceTabOf declare 拆合壁后真实接线
import { InfoTooltip as Tooltip, ShadcnTooltipProvider, ShadcnTooltip, ShadcnTooltipTrigger, ShadcnTooltipContent } from '../../modules/UsageStatsUiParts'; // Ia // 〔A1-R112〕+ShadcnTooltipProvider/ShadcnTooltip/ShadcnTooltipTrigger/ShadcnTooltipContent（原 Na/Oa/Ma/ka：ANt 真身 Tooltip 四原语；usageStatsUiParts 导出 p/d/m/f ≡ Ce/G/K/q，B5-11 §B 实体在案）
import { SETTINGS_CONTENT_CLASS as AUTOMATIONS_CONTENT_CLASS } from '../../modules/Settings'; // H3 容器类
import { OffPeakCreateButton, SCHEDULED_TEMPLATES } from '../../modules/ExtendedViews'; // INt / LNt（A0-CLEANUP B-31 接线）
import { providerIds } from '../../modules/SrcSharedA'; // q=mo（A0-CLEANUP B-7）
import { isCodingPlanConnectionSelected as hasCodingPlanEntitlement, isRemoteWorkspaceTab, useOffPeakTaskStore, type ModelCatalogEntryLike } from '../../modules/Home'; // 〔A1-R114〕+useOffPeakTaskStore：原 bX canonical（Home@826 逐字 zustand 实体，束 91416；型面对齐批改指） // 〔A1-R24〕zrt 197021 面联动：本文件 ModelProvider.models 型缝所依 // 〔A1-R104〕+hasCodingPlanEntitlement 改指（原 Tit declare 删碑；canonical = Home::isCodingPlanConnectionSelected@749，A0 语义重建在案，xn/zi 依赖 R27/R28 既收敛）。环安全：Home 值闭包不达 components/automations（grep 实证仅注释提及） // 〔A1-R107〕+isRemoteWorkspaceTab：原 zMt（135518）canonical（SettingsLeaves 映射行 78 判词在案 ≡ N2@123216；Home::isRemoteWorkspaceTab@1256 转导出）
import { useModelProvidersStore, useCodingPlanEntitlements, filterUsableProviders, modelMenuGroupsOf } from '../../modules/PaymentDeep'; // 〔A1-R115〕+filterUsableProviders/modelMenuGroupsOf（原 N6e/Hq canonical：PaymentDeep@1097/@993 逐字实体，转导出 @128/@118；AMt 适配批接线） // 〔A1-R109〕原 qq declare 删碑改指：canonical = PaymentDeep §11 useModelProvidersStore（bundle 78243–78403 逐字，R35 实体化，转导出 @319；ModelProviderSettingsSection 同判例）。环安全：PaymentDeep 值闭包不达 components/automations（grep 实证零 import 边） // 〔A1-R111〕+useCodingPlanEntitlements：原 sX declare（useCodingPlanEntitlementsForAutomations）删碑改指——canonical = PaymentDeep@9236 逐字实体（映射行 9235/10265 在案；R38 订阅面链闭合判例）
import { offPeakCreateFailureMessageId, reportTelemetry } from '../../modules/StoresDeep'; // 〔A1-R104〕原 Dit declare 删碑改指 canonical = offPeakHelpers 逐字实体（转导出） // 〔A1-R105〕+reportTelemetry：原 xw（40457）遥测总入口 canonical（StoresDeep@323，R36 实体化；PaymentDeep R26 同判例）
import { parseCustomModelRef, OFFPEAK_IDLE_PLAN_ID } from '../../modules/SrcSharedB'; // 〔A1-R105〕原 Zn（styles 544 `P as Zn` ← src iS@8966 ≡ SrcSharedB parseCustomModelRef）：MNt 深依赖 canonical // 〔A1-R106〕+OFFPEAK_IDLE_PLAN_ID：原 vee（styles 613 `Z as vee` ← src 5357；Vjt 遥测缺省 provider 面）
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
  offpeakCardTestid, // Zy（Rte）
  offpeakCardMenuTestid, // Qy（rt）
  offpeakActionPauseTestid, // rb（Jn）
  offpeakActionContinueTestid, // ib（Mt）
  offpeakActionDeleteTestid, // ab（wt）
} from '../../modules/SrcSharedB'; // 〔A1-R113〕+offpeak 五 testid（cMt 卡面/菜单/动作锚标；SrcSharedB 4966–4974 逐字 canonical 在案）
import type { SkillItem, SkillCapability, SkillDiagnostic } from '../settings/SkillsSettingsSection'; // §0 SkillsService 接口签名引用（属主：技能族文件）

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

/* ── tombstone〔A1-R107〕：本地 IntlShape 接口删除——唯一引用面 formatNextTakeAt declare（原 Ljt）
 *    已销账，实体参型走 : any 缝；束 Ljt 对 intl 仅 formatMessage 调用面，运行期形状不变。 ── */


/* ── tombstone〔A1-R48〕：本地 PlatformService 面（openExternal/openInFileManager 2 员）+ declare usePlatformService（原 l）
 *    删除 → 改指 canonical = components/ime/ImeComposition PlatformService 富面（A1-R48 增补已括 2 员）
 *    + usePlatformService 真导出（modules/ImeComposition shim 再导出）。共同根因 = canonical 富面未括宿主桥接成员，
 *    增补证据见 A1-R47.report §四.6。
 *    track* declares（PNt/FNt/Ujt/Wjt）参型 PlatformService 同名解析 canonical；消费 @547 逐字不变。 ── */

/* ── tombstone〔A1-R110〕：本地 ToastOptions 接口删除——唯一引用面 showToastWithAction declare（原 l6）
 *    已销账，实体参型走 : any 缝；canonical toast（ImeComposition）options 面本含
 *    durationMs/position/variant/actionLabel/anchorId 全成员（@502/515 在案），运行期形状不变。 ── */

/* --- UI 原语 --- */

/* ── tombstone（A0-CLEANUP 族清理）：Button declare 删除 → import { Button } from './button'。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：SpinnerIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone（A0-S3c）：DialogContent、DialogHeader、DialogRoot、DialogTitle、DropdownMenuContent、DropdownMenuItem、DropdownMenuRoot、DropdownMenuSeparator、DropdownMenuTrigger、SelectRoot declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */










/* --- 图标 --- */

/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（19）：RefreshIcon/PlusIcon/TrashIcon/PencilIcon/ExternalLinkIcon/ChevronDownIcon/ChevronRightIcon/CheckIcon/DownloadIcon/FolderOpenIcon/SearchIcon/AlertIcon/SettingsIcon/EllipsisIcon/PlayIcon/RotateIcon/PauseIcon/ResumeIcon/EditIcon → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone〔A1-R108〕：declare 四连——AutomationStatusActiveIcon（原 M3）/AutomationStatusPausedIcon（原 k3）/
 *    TemplateIcon（原 uMt）/ScheduledTemplateIcon（原 Njt）删除——逐字实体化于下方实体带（编译形 $.jsx）。
 *    M3/k3 真身 = E3 缺省 props 包装之 Clock/CircleStop（原 V_/R_）；Njt/uMt 真身 = Mjt/lMt
 *    映射表查图标（六员 lucide 改指 npm）。R43 判词「树内无 canonical」续成立——本批首次实体化。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：AutomationStatusCompletedIcon/AutomationStatusFailedIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
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

/* ── tombstone〔A1-R109〕：declare useModelProvidersStore（原 qq）+ 本地 ModelProvidersStoreState 接口删除——
 *    改指 canonical = PaymentDeep §11 useModelProvidersStore（bundle 78243–78403 逐字，R35 实体化；
 *    modules/PaymentDeep 转导出 @319，文件头 import 在案）。返回面 modelProviders: ModelProvider[]
 *    （UsageDeep 型，models: ModelMetadata[] 对本地板型 ModelCatalogEntryLike 面赋同，索引签兼容）、
 *    displayOrder: {providerIds, updatedAt} 非空面（本域消费 881 直传 + 真值守卫零波动）。
 *    消费点 @782 逐字不变。 ── */
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
/* ── tombstone（A1-R2）：useWorkspaceTabsStore（原 pc js 4753）declare 已删除。
 *    isWorkspaceTab（原 oc js 4487）declare 已删除，改经文件头真实 import
 *    （../../modules/WorkspaceTabsDeep 之 isWorkspaceKindTab，别名保留本地调用名）消费。
 *    〔A1-R107〕翻案：R2 判 pc「本文件无调用点（死声明）」系融合形遮蔽——调用点实在
 *    activeWorkspaceTabOf（zMt）declare 内层（束真形 ge = zMt(pc(selector))，138898）。
 *    本批 zMt declare 拆壁：pc 经文件头 useWorkspaceTabStore 真实接线，zMt 改指
 *    Home::isRemoteWorkspaceTab canonical；本地宽松 WorkspaceTabsStoreState 随删。 ── */


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
/* ── tombstone〔A1-R109〕：declare automationsStoreStatic（原 T3.getState()）+ 本地 AutomationsStoreState 接口删除——
 *    改指 canonical = stores/automationsStore useAutomationsStore 之 zustand 静面 .getState()
 *    （UseBoundStore = StoreApi & hook，storeTypes@17 在案；文件头 import 既有行 10）。
 *    五消费点（1109/1113/1126/1143/1198）改 useAutomationsStore.getState() →
 *    useAutomationsStore.getState()，.error 读取面逐字不变（canonical error: string | null）。 ── */
/* ── tombstone〔A1-R114〕：declare useOffPeakStore/offPeakStoreStatic（原 bX 双符）+ 本地 OffPeakStoreState 弱接口删除——
 *    改指 canonical = Home::useOffPeakTaskStore（@826 逐字 zustand 实体，束 91416；modules/Home 转导出 @146）。
 *    型面对齐：19 订阅点换名（selector 参面由弱接口转强型 OffPeakTaskStoreState）、3 静面 .getState() 换名；
 *    弱→强摩擦按 tsc 实测逐处对齐（R107 首参宽化 / R26 判例族）。双轨登记 W5：AutomationsMainView bX 消费面（束 138876 簇）归一留批续。 ── */

/* F15 族深层叶子（接口级；行号见头部映射 §F） */
/* ── tombstone〔A1-R113〕：declare OffPeakTaskList（原 cMt，jsx 113500 / js 134696–134939）删除——逐字实体化于下方实体带（AutomationStatusChip 之后）。
 *    依赖全收：zjt/Bjt 描述器、nMt 排序、rMt/iMt+aMt+oMt 提示气泡链（Ia ≡ Tooltip 既有别名）、
 *    sMt 图标映射表、图标包装带八员（O3/qjt/A3/j3/Xjt/N3/P3/F3）、VO/HO/UO/WO/YO ≡ ui/dropdown-menu 五原语、
 *    Rte/rt/Jn/Mt/wt ≡ SrcSharedB offpeak 五 testid。 ── */
/* ── tombstone〔A1-R112〕：declare AutomationStatusChip（原 ANt，jsx 115689 / js 138530–138578）删除——逐字实体化于下方实体带（showToastWithAction 之后）。
 *    依赖 Na/Oa/Ma/ka = usageStatsUiParts Tooltip 四原语（束导出 p/d/m/f ≡ Ce/G/K/q），
 *    改指 modules/UsageStatsUiParts 转导出 ShadcnTooltipProvider/ShadcnTooltip/ShadcnTooltipTrigger/ShadcnTooltipContent（import 在案）。 ── */
/* ── tombstone〔A1-R108〕：declare OFF_PEAK_TEMPLATES（原 Pjt）删除——逐字实体化于下方实体带。
 *    束真形为 var 链 Pjt+Fjt（134016–134017）；Fjt（闲时提示气泡类）消费 135803/138666 未实体化，
 *    按 R103 q$ 留束判例切出留束，语句形归一入 roundtrip 脚本。 ── */
/** 原 INt（jsx 115771）：闲时创建按钮 —— A0-CLEANUP B-31 改指 ExtendedViews 导出（见文件头 import） */
/** 原 LNt（jsx 115784）：定时模板表 —— A0-CLEANUP B-31 改指 ExtendedViews 导出（见文件头 import） */
/* ── tombstone〔A1-R115〕：declare buildAutomationModelSelectGroups（原 AMt，jsx 113829 / js 135401–135422）删除——逐字实体化于下方实体带（OffPeakTaskList 之后）。
 *    依赖 N6e ≡ filterUsableProviders（PaymentDeep@1097）、Hq ≡ modelMenuGroupsOf（PaymentDeep@993，转导出在案）。
 *    形状冲突批裁决（A0-CLEANUP B-31 留批消解）：束 Hq 12 参形（位 2 = configModels 空数组位、位 10/11 = l/u void 位）
 *    对树 canonical 10 参形——实体按树位适配（R29 hjt 改适判例：负证据在案，configModels 位 Hq 体内不读）；
 *    displayOrder 参面 {providerIds…}|null 与 modelMenuGroupsOf 既有参型全合（旧 EV string[] 面非本批障碍）。
 *    roundtrip 承逆适配缝（位 2 `[],` 与位 11 `void 0,` 补位）。 ── */
/* ── tombstone〔A1-R107〕：declare 三连——activeWorkspaceTabOf（原 zMt）/resolveTakeNumberBlockReason（原 Ijt）/
 *    formatNextTakeAt（原 Ljt）删除。Ijt/Ljt 逐字实体化于下方实体带；zMt 改指 canonical
 *    Home::isRemoteWorkspaceTab（SettingsLeaves 映射行 78 判词 ≡ N2@123216），调用点拆合壁
 *    还原束真形 ge = zMt(pc(selector))（138898）：isRemoteWorkspaceTab(useWorkspaceTabStore(selector))。
 *    注记行号系 jsx 旧口径，实测束真身：Ijt@134018–134030、Ljt@134031–134042、zMt@135518–135520。 ── */
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
/* ── tombstone〔A1-R106〕：declare 三连——offPeakDraftTelemetry（原 Vjt）/trackOffPeakCreateFailed（原 Ujt）/
 *    trackOffPeakCreate（原 Wjt）删除——闲时遥测四件（含 Hjt 载荷构建器）逐字实体化于下方；
 *    深依赖改指树内 canonical（xw→StoresDeep::reportTelemetry、vee→SrcSharedB::OFFPEAK_IDLE_PLAN_ID）。 ── */
/* ── 原 Vjt（js 134402–134409）→ offPeakDraftTelemetry：闲时草稿遥测模型（域标/模板/模型名/缺省 provider）〔A1-R106 逐字实体化〕 ── */
function offPeakDraftTelemetry(e: any) {
  return {
    eventRegion: e.source?.eventRegion ?? `app.automations`,
    templateId: e.source?.templateId ?? ``,
    modelName: e.model?.trim() ?? ``,
    modelProvider: OFFPEAK_IDLE_PLAN_ID,
  };
}
/* ── 原 Hjt（js 134410–134437）→ buildOffPeakCreateTelemetryReport：创建结果遥测载荷（success/failure 双支展开）〔A1-R106 逐字实体化〕 ── */
function buildOffPeakCreateTelemetryReport(e: any, t: any) {
  let n = {
    result: t.ok ? `success` : `failure`,
    template_id: e.templateId,
    model_name: e.modelName,
    model_provider: e.modelProvider,
    provider_name: t.providerName,
  };
  return {
    elementName: `off_peak_task_create_result`,
    eventRegion: e.eventRegion,
    eventType: `result`,
    eventText: ``,
    eventExtraDetail: t.ok
      ? {
          ...n,
          off_peak_task_id: t.task.offPeakTaskId,
          ticket_initial_state: t.ticketInitialState,
          queue_position: t.queuePosition === void 0 ? `` : String(t.queuePosition),
        }
      : {
          ...n,
          failure_stage: t.failureStage,
          error_category: t.errorCategory,
          error_code: t.errorCode,
        },
  };
}
/* ── 原 Ujt（js 134438–134440）→ trackOffPeakCreateFailed：创建失败遥测上报〔A1-R106 逐字实体化〕 ── */
function trackOffPeakCreateFailed(e: any, t: any, n: any) {
  return reportTelemetry(e, buildOffPeakCreateTelemetryReport(t, n), `off-peak-telemetry`);
}
/* ── 原 Wjt（js 134441–134444）→ trackOffPeakCreate：创建遥测包装（await 创建 → 上报 → 透传结果）〔A1-R106 逐字实体化〕 ── */
async function trackOffPeakCreate(e: any, t: any, n: any) {
  let r = await n();
  return (trackOffPeakCreateFailed(e, t, r), r);
}
/* ── 原 Ijt（js 134018–134030）→ resolveTakeNumberBlockReason：取号阻断原因（灰度门内三级——状态异常/无套餐/配额尽）〔A1-R107 逐字实体化〕 ── */
function resolveTakeNumberBlockReason({ availabilityStatus: e, canTakeNumber: t, grayEnabled: n, noPlan: r }: any) {
  return n
    ? e === `loading` || e === `error`
      ? `unavailable`
      : r
        ? `plan`
        : e === `ready`
          ? t === !0
            ? null
            : `quota`
          : `unavailable`
    : null;
}
/* ── 原 Ljt（js 134031–134042）→ formatNextTakeAt：下次取号剩余时间文案（不足一分/时分/整时/分四支）〔A1-R107 逐字实体化〕 ── */
function formatNextTakeAt(e: any, t: any, n: any) {
  let r = e - t;
  if (r <= 0) return n.formatMessage({ id: `offPeak.create.remaining.lessThanMinute` });
  let i = Math.ceil(r / 6e4),
    a = Math.floor(i / 60),
    o = i % 60;
  return a > 0 && o > 0
    ? n.formatMessage({ id: `offPeak.create.remaining.hoursMinutes` }, { hours: a, minutes: o })
    : a > 0
      ? n.formatMessage({ id: `offPeak.create.remaining.hours` }, { hours: a })
      : n.formatMessage({ id: `offPeak.create.remaining.minutes` }, { minutes: o });
}
/* ── 原 Mjt（js 134005）→ SCHEDULED_TEMPLATE_ICONS：定时模板图标映射表〔A1-R108 逐字实体化〕 ── */
const SCHEDULED_TEMPLATE_ICONS: Record<string, React.ElementType> = { target: Target, activity: Activity, file: FileText, list: List }; // 〔A1-R108〕型缝：映射表索引面注记（束原形无注记；TS7053 防）
/* ── 原 Njt（js 134006–134015）→ ScheduledTemplateIcon：定时模板图标（映射表查表渲染）〔A1-R108 逐字实体化〕 ── */
function ScheduledTemplateIcon({ className: e, name: t }: any) {
  let n = SCHEDULED_TEMPLATE_ICONS[t];
  return (0, $.jsx)(n, {
    "aria-hidden": `true`,
    className: e,
    "data-automation-template-icon": t,
    size: 16,
    strokeWidth: 2,
  });
}
/* ── 原 Pjt（js 134016）→ OFF_PEAK_TEMPLATES：闲时模板三连〔A1-R108 逐字实体化；var 链切出，Fjt 留束（R103 q$ 判例）〕 ── */
const OFF_PEAK_TEMPLATES = [{ id: `standupGitSummary` }, { id: `ciFlakyReport` }, { id: `documentationSyncCheck` }];
/* ── 原 E3（js 134469）→ AUTOMATION_STATUS_ICON_DEFAULTS：状态图标缺省 props〔A1-R108 逐字实体化〕 ── */
const AUTOMATION_STATUS_ICON_DEFAULTS = { size: 16, strokeWidth: 2 };
/* ── 原 k3（js 134490–134492）→ AutomationStatusPausedIcon〔A1-R108 逐字实体化〕 ── */
function AutomationStatusPausedIcon(e: any) {
  return (0, $.jsx)(CircleStop, { ...AUTOMATION_STATUS_ICON_DEFAULTS, ...e });
}
/* ── 原 M3（js 134508–134510）→ AutomationStatusActiveIcon〔A1-R108 逐字实体化〕 ── */
function AutomationStatusActiveIcon(e: any) {
  return (0, $.jsx)(Clock, { ...AUTOMATION_STATUS_ICON_DEFAULTS, ...e });
}
/* ── 原 lMt（js 134940–134947）→ OFF_PEAK_TEMPLATE_ICONS：闲时模板图标映射表〔A1-R108 逐字实体化〕 ── */
const OFF_PEAK_TEMPLATE_ICONS: Record<string, React.ElementType> = { // 〔A1-R108〕型缝：映射表索引面注记（束原形无注记；TS7053 防）
  standupGitSummary: List,
  ciFlakyReport: Activity,
  documentationSyncCheck: ListChecks,
  customize: SlidersHorizontal,
  standupGitSummarySecondary: List,
  followUpMonitor: ListChecks,
};
/* ── 原 uMt（js 134948–134957）→ TemplateIcon：闲时模板图标（映射表查表渲染）〔A1-R108 逐字实体化〕 ── */
function TemplateIcon({ className: e, name: t }: any) {
  let n = OFF_PEAK_TEMPLATE_ICONS[t];
  return (0, $.jsx)(n, {
    "aria-hidden": `true`,
    className: e,
    "data-off-peak-template-icon": t,
    size: 16,
    strokeWidth: 2,
  });
}
/* ── 原 c6（js 138647）→ AUTOMATIONS_TOAST_ANCHOR_ID：自动化主面 toast 锚标〔A1-R110 逐字实体化〕 ── */
const AUTOMATIONS_TOAST_ANCHOR_ID = `automations-main-toast-anchor`;
/* ── 原 l6（js 138648–138650）→ showToastWithAction：带锚 toast 包装（透传 opts + 注入 anchorId）〔A1-R110 逐字实体化；型缝：次参可选注记——束 JS 形无注记而 15 消费点单参调用〕 ── */
function showToastWithAction(e: any, t?: any) {
  return toast(e, { ...t, anchorId: AUTOMATIONS_TOAST_ANCHOR_ID });
}
/* ── 原 ANt（js 138530–138578）→ AutomationStatusChip：自动化状态小徽（截断探测 → 溢出时 Tooltip 显全文）〔A1-R112 逐字实体化；型缝二：解构参 `: any` + useRef 初值 `as any`——束形无注记，TS 下 useRef(null) 收窄 MutableRefObject<null> 致 scrollWidth 读面不可达〕 ── */
function AutomationStatusChip({ dimmed: e = !1, icon: t, text: n }: any) {
  let r = (0, React.useRef)(null as any),
    [i, a] = (0, React.useState)(!1);
  return (
    (0, React.useEffect)(() => {
      let e = r.current;
      if (!e) return;
      let t = () => {
        let t = e.scrollWidth > e.clientWidth;
        a((e) => (e === t ? e : t));
      };
      if ((t(), typeof ResizeObserver > `u`))
        return (
          window.addEventListener(`resize`, t),
          () => window.removeEventListener(`resize`, t)
        );
      let n = new ResizeObserver(t);
      return (n.observe(e), () => n.disconnect());
    }, [n]),
    (0, $.jsx)(ShadcnTooltipProvider, {
      children: (0, $.jsxs)(ShadcnTooltip, {
        children: [
          (0, $.jsx)(ShadcnTooltipTrigger, {
            asChild: !0,
            children: (0, $.jsxs)(`span`, {
              className: cn(
                `inline-flex w-fit min-w-0 max-w-full items-center gap-0.5 overflow-hidden rounded-lg bg-success/10 py-0.5 pl-1 pr-2 font-normal text-success`,
                e && `opacity-40`,
              ),
              children: [
                (0, $.jsx)(`span`, {
                  className: `flex size-5 shrink-0 items-center justify-center`,
                  children: t,
                }),
                (0, $.jsx)(`span`, {
                  ref: r,
                  "data-testid": `automation-schedule-text`,
                  className: `min-w-0 truncate whitespace-nowrap`,
                  children: n,
                }),
              ],
            }),
          }),
          i ? (0, $.jsx)(ShadcnTooltipContent, { side: `top`, sideOffset: 6, children: n }) : null,
        ],
      }),
    })
  );
}
/* ── 原 zjt（js 134053–134090）→ offPeakStatusDescriptor：闲时任务状态描述器（六态：图标键/类名/文案键/值）〔A1-R113 逐字实体化〕 ── */
function offPeakStatusDescriptor(e: any): any {
  switch (e.status) {
    case `queued`:
      return e.queuePosition
        ? {
            icon: `moon`,
            className: `text-idle-task`,
            labelId: `offPeak.badge.queuePosition`,
            labelValues: { position: String(e.queuePosition) },
          }
        : { icon: `moon`, className: `text-idle-task`, labelId: `offPeak.status.queued` };
    case `paused`:
      return e.queuePosition
        ? {
            icon: `pause`,
            className: `text-idle-task`,
            labelId: `offPeak.badge.pausedPosition`,
            labelValues: { position: String(e.queuePosition) },
          }
        : { icon: `pause`, className: `text-idle-task`, labelId: `offPeak.status.paused` };
    case `running`:
      return { icon: `spinner`, className: `text-success`, labelId: `offPeak.status.running` };
    case `completed`:
      return {
        icon: `success`,
        className: `text-foreground-subtle`,
        labelId: `offPeak.status.completed`,
      };
    case `failed`:
      return { icon: `warning`, className: `text-destructive`, labelId: `offPeak.status.failed` };
    case `cancelled`:
      return {
        icon: `stopped`,
        className: `text-foreground-subtle`,
        labelId: `offPeak.status.cancelled`,
      };
  }
}
/* ── 原 Bjt（js 134091–134100）→ offPeakQueueBadge：失败态附带排队位徽（余态 null）〔A1-R113 逐字实体化〕 ── */
function offPeakQueueBadge(e: any) {
  return e.status !== `failed` || e.queuePosition === void 0
    ? null
    : {
        icon: `moon`,
        className: `text-idle-task`,
        labelId: `offPeak.badge.queuePosition`,
        labelValues: { position: String(e.queuePosition) },
      };
}
/* ── 原 O3（js 134484–134486）→ OffPeakHintIcon：info 图标包装〔A1-R113 逐字实体化〕 ── */
function OffPeakHintIcon(e: any) {
  return (0, $.jsx)(Info, { ...AUTOMATION_STATUS_ICON_DEFAULTS, ...e });
}
/* ── 原 qjt（js 134487–134489）→ OffPeakMoonIcon：moon 图标包装〔A1-R113 逐字实体化〕 ── */
function OffPeakMoonIcon(e: any) {
  return (0, $.jsx)(Moon, { ...AUTOMATION_STATUS_ICON_DEFAULTS, ...e });
}
/* ── 原 A3（js 134493–134495）→ OffPeakPauseActionIcon：circle-stop 动作图标包装〔A1-R113 逐字实体化〕 ── */
function OffPeakPauseActionIcon(e: any) {
  return (0, $.jsx)(CircleStop, { ...AUTOMATION_STATUS_ICON_DEFAULTS, ...e });
}
/* ── 原 j3（js 134502–134504）→ OffPeakContinueActionIcon：circle-play 动作图标包装〔A1-R113 逐字实体化〕 ── */
function OffPeakContinueActionIcon(e: any) {
  return (0, $.jsx)(ResumeIcon, { ...AUTOMATION_STATUS_ICON_DEFAULTS, ...e });
}
/* ── 原 Xjt（js 134505–134507）→ OffPeakCancelActionIcon：square 填充动作图标包装〔A1-R113 逐字实体化〕 ── */
function OffPeakCancelActionIcon(e: any) {
  return (0, $.jsx)(Square, { ...AUTOMATION_STATUS_ICON_DEFAULTS, fill: `currentColor`, ...e });
}
/* ── 原 N3（js 134511–134513）→ OffPeakMenuIcon：ellipsis 菜单图标包装〔A1-R113 逐字实体化〕 ── */
function OffPeakMenuIcon(e: any) {
  return (0, $.jsx)(EllipsisIcon, { ...AUTOMATION_STATUS_ICON_DEFAULTS, ...e });
}
/* ── 原 P3（js 134514–134516）→ OffPeakSessionIcon：external-link 会话跳转图标包装〔A1-R113 逐字实体化〕 ── */
function OffPeakSessionIcon(e: any) {
  return (0, $.jsx)(ExternalLink, { ...AUTOMATION_STATUS_ICON_DEFAULTS, ...e });
}
/* ── 原 F3（js 134520–134526）→ OffPeakDeleteIcon：trash-2 删除图标包装（span 容器）〔A1-R113 逐字实体化〕 ── */
function OffPeakDeleteIcon() {
  return (0, $.jsx)(`span`, {
    className: `flex size-5 shrink-0 items-center justify-center`,
    "aria-hidden": `true`,
    children: (0, $.jsx)(TrashIcon, { className: `size-4`, ...AUTOMATION_STATUS_ICON_DEFAULTS }),
  });
}
/* ── 原 nMt（js 134656–134658）→ sortOffPeakTasksNewestFirst：createdAt 倒序投影〔A1-R113 逐字实体化〕 ── */
function sortOffPeakTasksNewestFirst(e: any) {
  return [...e].sort((e, t) => t.createdAt - e.createdAt);
}
/* ── 原 rMt/iMt（js 134659–134660）→ OFF_PEAK_HINT_VIEWPORT_MIN_GAP/OFF_PEAK_HINT_SIDE_OFFSET：提示气泡几何常量〔A1-R113 逐字实体化〕 ── */
const OFF_PEAK_HINT_VIEWPORT_MIN_GAP = 320,
  OFF_PEAK_HINT_SIDE_OFFSET = 16;
/* ── 原 aMt（js 134661–134663）→ offPeakHintSide：提示气泡侧位裁决（右缘余量 ≥ 336 → right，余 → top）〔A1-R113 逐字实体化〕 ── */
function offPeakHintSide(e: any, t: any) {
  return e && t - e.right >= OFF_PEAK_HINT_VIEWPORT_MIN_GAP + OFF_PEAK_HINT_SIDE_OFFSET ? `right` : `top`;
}
/* ── 原 oMt（js 134664–134694）→ OffPeakActionHint：动作提示气泡（受控开合 + resize 侧位重裁；Ia ≡ Tooltip 既有别名）〔A1-R113 逐字实体化；型缝二：解构参 `: any` + useRef 初值 `as any`〕 ── */
function OffPeakActionHint({ children: e, title: t }: any) {
  let n = (0, React.useRef)(null as any),
    [r, i] = (0, React.useState)(!1),
    [a, o] = (0, React.useState)(`right`),
    s = (0, React.useCallback)(() => {
      o(offPeakHintSide(n.current?.getBoundingClientRect() ?? null, window.innerWidth));
    }, []);
  return (
    (0, React.useEffect)(() => {
      if (r)
        return (
          s(),
          window.addEventListener(`resize`, s),
          () => window.removeEventListener(`resize`, s)
        );
    }, [r, s]),
    (0, $.jsx)(Tooltip, {
      title: t,
      open: r,
      onOpenChange: (e: any) => {
        (e && s(), i(e));
      },
      triggerRef: n,
      side: a,
      align: a === `top` ? `end` : `center`,
      sideOffset: OFF_PEAK_HINT_SIDE_OFFSET,
      className: `max-w-[min(20rem,calc(100vw-1rem))]`,
      children: e,
    })
  );
}
/* ── 原 sMt（js 134695）→ OFF_PEAK_STATUS_ICONS：闲时状态图标映射表（k3 ≡ AutomationStatusPausedIcon 双键；M/N/I_ ≡ 既有 lucide 别名）〔A1-R113 逐字实体化；型缝：映射表索引面注记（TS7053 防，R108 判例）〕 ── */
const OFF_PEAK_STATUS_ICONS: Record<string, React.ElementType> = { moon: OffPeakMoonIcon, pause: AutomationStatusPausedIcon, spinner: SpinnerIcon, success: AutomationStatusCompletedIcon, warning: AutomationStatusFailedIcon, stopped: AutomationStatusPausedIcon };
/* ── 原 cMt（js 134696–134939）→ OffPeakTaskList：闲时任务卡网格（空态/卡面/状态徽/会话跳转/动作菜单五分支）〔A1-R113 逐字实体化；型缝：解构参 `: any`〕 ── */
export function OffPeakTaskList({ // 〔A1-R119〕+export：AutomationsMainView OffPeakTaskList declare（原 cMt 134679）改指本 R113 逐字实体
  tasks: e,
  busyOperationId: t,
  onOpen: n,
  onPause: r,
  onContinue: i,
  onCancel: a,
  onDelete: o,
  onOpenSession: s,
}: any) {
  let { intl: c } = useIntlContext(),
    l = sortOffPeakTasksNewestFirst(e);
  return l.length === 0
    ? (0, $.jsx)(`div`, {
        className: `rounded-[10px] border border-card-border px-3 py-3 text-ui-base text-foreground-subtle`,
        children: c.formatMessage({ id: `offPeak.list.empty` }),
      })
    : (0, $.jsx)(`div`, {
        className: `grid auto-rows-[132px] grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2`,
        children: l.map((e) => {
          let l = offPeakStatusDescriptor(e),
            u = OFF_PEAK_STATUS_ICONS[l.icon],
            d = offPeakQueueBadge(e),
            f = d ? OFF_PEAK_STATUS_ICONS[d.icon] : null,
            p = t?.endsWith(e.offPeakTaskId) ?? !1,
            m = e.status === `queued` || e.status === `paused` || e.status === `running`;
          return (0, $.jsxs)(
            `div`,
            {
              "data-testid": offpeakCardTestid,
              role: `button`,
              tabIndex: 0,
              onClick: () => n(e),
              onKeyDown: (t: any) => {
                (t.key === `Enter` || t.key === ` `) && (t.preventDefault(), n(e));
              },
              className: cn(
                `group relative flex h-full min-h-0 cursor-pointer gap-3 overflow-hidden rounded-[10px] border border-card-border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused`,
                e.status === `completed` ? `opacity-60 hover:bg-hover` : `hover:bg-hover`,
              ),
              children: [
                (0, $.jsxs)(`div`, {
                  className: `flex h-full min-w-0 flex-1 flex-col gap-3`,
                  children: [
                    (0, $.jsx)(`span`, {
                      className: `block truncate pr-14 text-ui-base font-medium leading-5 text-foreground`,
                      children: e.title || e.prompt,
                    }),
                    (0, $.jsx)(`p`, {
                      className: `line-clamp-2 h-9 text-ui-base font-normal leading-snug text-foreground-subtle`,
                      children: e.prompt,
                    }),
                    (0, $.jsxs)(`div`, {
                      className: `mt-auto flex h-6 min-w-0 items-center gap-[10px] text-ui-base leading-snug`,
                      children: [
                        (0, $.jsxs)(`div`, {
                          className: cn(
                            `flex w-fit min-w-0 items-center gap-0.5 font-normal`,
                            l.className,
                            (e.status === `queued` || e.status === `paused`) &&
                              `rounded-[8px] bg-idle-task-surface py-0.5 pl-1 pr-2 text-idle-task`,
                          ),
                          children: [
                            (0, $.jsx)(`span`, {
                              className: `flex size-5 shrink-0 items-center justify-center`,
                              children: (0, $.jsx)(u, {
                                className: cn(
                                  `size-4 shrink-0`,
                                  e.status === `running` && `animate-spin`,
                                ),
                                strokeWidth: 1.33,
                                "aria-hidden": `true`,
                              }),
                            }),
                            (0, $.jsx)(`span`, {
                              className: `truncate`,
                              children: c.formatMessage({ id: l.labelId }, l.labelValues),
                            }),
                          ],
                        }),
                        d && f
                          ? (0, $.jsxs)(`div`, {
                              className: `flex w-fit min-w-0 items-center gap-0.5 rounded-[6px] bg-idle-task-surface py-0.5 pl-1 pr-2 text-idle-task opacity-40`,
                              children: [
                                (0, $.jsx)(`span`, {
                                  className: `flex size-5 shrink-0 items-center justify-center`,
                                  children: (0, $.jsx)(f, {
                                    className: `size-4 shrink-0`,
                                    strokeWidth: 1.33,
                                    "aria-hidden": `true`,
                                  }),
                                }),
                                (0, $.jsx)(`span`, {
                                  className: `truncate`,
                                  children: c.formatMessage({ id: d.labelId }, d.labelValues),
                                }),
                              ],
                            })
                          : null,
                      ],
                    }),
                  ],
                }),
                (0, $.jsxs)(`div`, {
                  className: `absolute right-3 top-3 flex items-center gap-1`,
                  children: [
                    e.sessionId
                      ? (0, $.jsx)(`button`, {
                          type: `button`,
                          className: `flex size-6 items-center justify-center rounded-md opacity-100 transition-colors hover:bg-white/10 md:opacity-0 md:group-hover:opacity-100`,
                          "aria-label": c.formatMessage({ id: `offPeak.goToSession` }),
                          onClick: (t: any) => {
                            (t.stopPropagation(), s(e));
                          },
                          children: (0, $.jsx)(OffPeakSessionIcon, {
                            className: `size-4 text-foreground-subtle`,
                            "aria-hidden": `true`,
                          }),
                        })
                      : null,
                    (0, $.jsxs)(DropdownMenuRoot, {
                      children: [
                        (0, $.jsx)(DropdownMenuTrigger, {
                          asChild: !0,
                          children: (0, $.jsx)(`button`, {
                            type: `button`,
                            className: `flex size-6 items-center justify-center rounded-md opacity-100 transition-colors hover:bg-white/10 md:opacity-0 md:group-hover:opacity-100 data-[state=open]:bg-white/10 data-[state=open]:opacity-100`,
                            "data-testid": offpeakCardMenuTestid,
                            "aria-label": c.formatMessage({ id: `automations.moreActions` }),
                            disabled: p,
                            onClick: (e: any) => e.stopPropagation(),
                            children: (0, $.jsx)(OffPeakMenuIcon, {
                              className: `size-4 text-foreground-subtle`,
                              "aria-hidden": `true`,
                            }),
                          }),
                        }),
                        (0, $.jsxs)(DropdownMenuContent, {
                          align: `end`,
                          sideOffset: 4,
                          className: `w-[190px]`,
                          onClick: (e: any) => e.stopPropagation(),
                          children: [
                            e.status === `queued`
                              ? (0, $.jsxs)(DropdownMenuItem, {
                                  className: `gap-1`,
                                  "data-testid": offpeakActionPauseTestid,
                                  onSelect: () => r(e),
                                  children: [
                                    (0, $.jsx)(`span`, {
                                      className: `flex size-5 items-center justify-center`,
                                      children: (0, $.jsx)(OffPeakPauseActionIcon, {
                                        className: `size-4`,
                                        "aria-hidden": `true`,
                                      }),
                                    }),
                                    (0, $.jsx)(`span`, {
                                      className: `flex-1`,
                                      children: c.formatMessage({ id: `offPeak.action.pause` }),
                                    }),
                                    (0, $.jsx)(OffPeakActionHint, {
                                      title: c.formatMessage({ id: `offPeak.action.pauseHint` }),
                                      children: (0, $.jsx)(`span`, {
                                        className: `inline-flex`,
                                        onClick: (e: any) => e.stopPropagation(),
                                        children: (0, $.jsx)(OffPeakHintIcon, {
                                          className: `size-3.5 shrink-0 text-foreground-subtle`,
                                          "aria-hidden": `true`,
                                        }),
                                      }),
                                    }),
                                  ],
                                })
                              : null,
                            e.status === `paused`
                              ? (0, $.jsxs)(DropdownMenuItem, {
                                  className: `gap-1`,
                                  "data-testid": offpeakActionContinueTestid,
                                  onSelect: () => i(e),
                                  children: [
                                    (0, $.jsx)(`span`, {
                                      className: `flex size-5 items-center justify-center`,
                                      children: (0, $.jsx)(OffPeakContinueActionIcon, {
                                        className: `size-4`,
                                        "aria-hidden": `true`,
                                      }),
                                    }),
                                    (0, $.jsx)(`span`, {
                                      className: `flex-1`,
                                      children: c.formatMessage({ id: `offPeak.action.continue` }),
                                    }),
                                    (0, $.jsx)(OffPeakActionHint, {
                                      title: c.formatMessage({ id: `offPeak.action.continueHint` }),
                                      children: (0, $.jsx)(`span`, {
                                        className: `inline-flex`,
                                        onClick: (e: any) => e.stopPropagation(),
                                        children: (0, $.jsx)(OffPeakHintIcon, {
                                          className: `size-3.5 shrink-0 text-foreground-subtle`,
                                          "aria-hidden": `true`,
                                        }),
                                      }),
                                    }),
                                  ],
                                })
                              : null,
                            e.status === `running`
                              ? (0, $.jsxs)(DropdownMenuItem, {
                                  className: `gap-1`,
                                  onSelect: () => a(e),
                                  children: [
                                    (0, $.jsx)(`span`, {
                                      className: `flex size-5 items-center justify-center`,
                                      children: (0, $.jsx)(OffPeakCancelActionIcon, {
                                        className: `size-4 fill-current`,
                                        "aria-hidden": `true`,
                                      }),
                                    }),
                                    c.formatMessage({ id: `offPeak.action.cancel` }),
                                  ],
                                })
                              : null,
                            m ? (0, $.jsx)(DropdownMenuSeparator, {}) : null,
                            (0, $.jsxs)(DropdownMenuItem, {
                              className: `gap-1 !text-destructive data-[highlighted]:!bg-menu-hover data-[highlighted]:!text-destructive focus:!text-destructive [&_svg]:!text-destructive`,
                              "data-testid": offpeakActionDeleteTestid,
                              onSelect: () => o(e),
                              children: [
                                (0, $.jsx)(OffPeakDeleteIcon, {}),
                                c.formatMessage({ id: `automations.delete` }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            },
            e.offPeakTaskId,
          );
        }),
      });
}
/* ── 原 AMt（js 135401–135422）→ buildAutomationModelSelectGroups：自动化模型选择分组（N6e 可用供应商过滤 + Hq 分组构造二段）〔A1-R115 逐字实体化；形状缝：Hq 12 参形适配树 modelMenuGroupsOf 10 参形（位 2 configModels 空数组位/位 11 void 位删；R29 hjt 判例，逆适配缝 roundtrip 承）〕 ── */
export function buildAutomationModelSelectGroups(e: any) { // 〔A1-R120〕+export：AutomationsMainView AMt A0 语义孪生归一改指（束 d6 139541 区 rgt/egt 直调实证；双轨归一批）
  let t = filterUsableProviders({
    providers: e.providers,
    selectedProvider: e.selectedProvider,
    getEntitlementSnapshot: e.getEntitlementSnapshot,
    modelProviderFamilySelectedKeys: e.familySelectedKeys,
  });
  return modelMenuGroupsOf(
    e.selectedProvider,
    t,
    e.labels,
    e.displayOrder,
    e.familyModes,
    e.familySelectedKeys,
    [],
    !1,
    void 0,
    { providerFamilyDomain: e.providerFamilyDomain },
  );
}
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
/* ── 原 $$（js 109522–109526）→ formatAbsoluteRunTime：时间戳 → YYYY-MM-DD HH:mm〔A1-R103 逐字实体化〕〔A1-R119〕+export：AutomationsMainView describeFarRunTime declare 改指 ── */
export function formatAbsoluteRunTime(e: any) {
  if (!e) return `-`;
  let t = new Date(e);
  return `${t.getFullYear()}-${padTwoDigitDatePart(t.getMonth() + 1)}-${padTwoDigitDatePart(t.getDate())} ${padTwoDigitDatePart(t.getHours())}:${padTwoDigitDatePart(t.getMinutes())}`;
}
/* ── 原 $ht（js 109527–109546）→ formatRelativeRunTime：相对时刻文案（<1min → soon/justNow；分/时/日分级 + in/ago）〔A1-R103 逐字实体化〕〔A1-R119〕+export：AutomationsMainView describeNearRunTime declare 改指 ── */
export function formatRelativeRunTime(e: any, t: any, n: any) {
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
export function automationNextRunLabel(e: any, t: any, n: any) { // 〔A1-R120〕+export：AutomationsMainView describeAutomationNextRun A0 语义孪生归一改指（束 egt 直调实证）
  return !e || e <= t ? null : e - t <= NEXT_RUN_RELATIVE_WINDOW_MS ? formatRelativeRunTime(e, t, n) : formatAbsoluteRunTime(e);
}
/* ── tombstone〔A1-R104〕：declare hasCodingPlanEntitlement（原 Tit 91395）删除——改指 Home::isCodingPlanConnectionSelected canonical（import 别名在案）。
 *    双轨登记 W5：Home@761–774 A0 本地孪生（isCodingPlanConnectionSelected 本体即 canonical）与 AutomationsMainView@1005–1008 孪生并存。 ── */
/* ── tombstone〔A1-R110〕：declare showToastWithAction（原 l6）删除——逐字实体化于下方实体带（c6 锚常量随收）。 ── */

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
  const { entitlements } = useCodingPlanEntitlements({
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
  const offPeakTasks = useOffPeakTaskStore((state) => state.tasks);
  const offPeakLoading = useOffPeakTaskStore((state) => state.loading);
  const offPeakGrayConfig = useOffPeakTaskStore((state) => state.grayConfig);
  const offPeakCodingPlanSupport = useOffPeakTaskStore((state) => state.codingPlanSupport);
  const takeNumberAvailability = useOffPeakTaskStore((state) => state.takeNumberAvailability);
  const takeNumberAvailabilityStatus = useOffPeakTaskStore((state) => state.takeNumberAvailabilityStatus);
  const offPeakOperationId = useOffPeakTaskStore((state) => state.operationId);
  const initializeOffPeak = useOffPeakTaskStore((state) => state.initialize);
  const refreshOffPeak = useOffPeakTaskStore((state) => state.refresh);
  const refreshCodingPlanSupport = useOffPeakTaskStore((state) => state.refreshCodingPlanSupport);
  const refreshTakeNumberAvailability = useOffPeakTaskStore((state) => state.refreshTakeNumberAvailability);
  const createOffPeakTask = useOffPeakTaskStore((state) => state.createTask);
  const updateOffPeakTask = useOffPeakTaskStore((state) => state.updateTask);
  const pauseOffPeakTask = useOffPeakTaskStore((state) => state.pauseTask);
  const continueOffPeakTask = useOffPeakTaskStore((state) => state.continueTask);
  const cancelOffPeakTask = useOffPeakTaskStore((state) => state.cancelTask);
  const deleteOffPeakTask = useOffPeakTaskStore((state) => state.deleteTask);
  const deleteOffPeakHistory = useOffPeakTaskStore((state) => state.deleteHistory);
  const consumePendingCreateDraft = useOffPeakTaskStore((state) => state.consumePendingCreateDraft);
  const [refreshingAll, setRefreshingAll] = React.useState(false);
  const [view, setView] = React.useState<
    | { mode: "list" }
    | { mode: "create"; draft: Record<string, unknown> | null }
    | { mode: "edit"; automation: AutomationTask }
    | { mode: "offpeak-create"; draft?: Record<string, unknown> | null }
    | { mode: "offpeak-edit"; task: OffPeakTask }
  >({ mode: "list" });
  const [tab, setTab] = React.useState("scheduled");
  // 〔A1-R107〕束真形 ge = zMt(pc(selector))（138898）拆壁还原：zMt→isRemoteWorkspaceTab canonical + pc→useWorkspaceTabStore canonical
  const activeWorkspaceTab = isRemoteWorkspaceTab(
    useWorkspaceTabStore((state) => {
      const activeTab = state.tabs.find((candidate) => candidate.id === state.activeTabId);
      return activeTab && isWorkspaceTab(activeTab) ? activeTab : undefined;
    }),
  );
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
        getEntitlementSnapshot: (providerId: string) => entitlements[providerId]?.snapshot ?? null, // 〔A1-R115〕型面对齐：declare 删后上下文型面丢失，消费点箭头补注
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
        error: useAutomationsStore.getState().error,
        modelFields: automationModelTelemetryFields(input.model, input.provider, modelProviders),
      });
      if (!created) {
        const error = useAutomationsStore.getState().error;
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
      if (useAutomationsStore.getState().error) {
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
      if (useAutomationsStore.getState().error) {
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
        const sessionId = useAutomationsStore
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
      if (useAutomationsStore.getState().error) {
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
      const error = useOffPeakTaskStore.getState().error;
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
      const error = useOffPeakTaskStore.getState().error;
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
      const error = useOffPeakTaskStore.getState().error;
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
            title: input.title as string | undefined, // 〔A1-R114〕型面对齐：input 为 Record<string, unknown>，强型 Partial<OffPeakCreateInput> 命名键收窄
            prompt: input.prompt as string | undefined, // 〔A1-R114〕同上
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
                      onPause={(task: OffPeakTask) => void pauseOffPeakTask(task.offPeakTaskId, offPeakTaskService)}
                      onContinue={(task: OffPeakTask) => void continueOffPeakTask(task.offPeakTaskId, offPeakTaskService)}
                      onCancel={(task: OffPeakTask) => void handleCancelOffPeakTask(task)}
                      onDelete={(task: OffPeakTask) => void handleDeleteOffPeakTask(task)}
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

/* ── tombstone〔A1-R111〕：declare useCodingPlanEntitlementsForAutomations（原 sX，注记 88255 旧口径，实测 88303）删除——
 *    改指 canonical = PaymentDeep::useCodingPlanEntitlements@9236（sX 逐字实体，映射行 9235/10265 在案；
 *    R38 订阅面链 $j→useSubscriptionSnapshot 闭合判例）。消费点 @772 改名改指逐字（解构 {entitlements} 不变）；
 *    canonical 参型 : any 解构面，本域三键入参（modelProviders/loading/modelProviderFamilySelectedKeys）全兼容。 ── */
const PROVIDER_IDS_ZAI_CODING_PLAN = providerIds.zaiCodingPlan; // 原 q.zaiCodingPlan（A0-CLEANUP B-7 接线）
const PROVIDER_IDS_BIGMODEL_CODING_PLAN = providerIds.bigmodelCodingPlan; // 原 q.bigmodelCodingPlan（A0-CLEANUP B-7 接线）
/* ── tombstone〔A1-R42〕：declare buildUpgradeFunnelForAutomations（原 FM）/planStateOfProviders（原 LM）删除 → 改指 components/shell/Home §U.8 canonical：buildCodingPlanFunnelContext（FM 53267-53276，A1-R25 逐字实体化）/resolveEntryPlanState（LM 53299-53312，A1-R26），经尾部导入取回。
 *    消费面实测 @771/@774 改名改指（≡ bundle 139073/139076；R25/R26 注「139073/139076 R0 域留批」闭合）。型缝：funnelContext A0 string 近似 → unknown 对象面（@1481，MPSS@209 A1-R11 先例：fX 89100 读 e?.funnelContext?.purchaseAudience——对象面非字符串）；ModelProvider[]→ModelProviderEntry[] 逐字段相容（索引签名 unknown 对齐）。 ── */
import { buildCodingPlanFunnelContext, resolveEntryPlanState } from '../shell/Home'; // 〔A1-R42〕原 buildUpgradeFunnelForAutomations/planStateOfProviders（FM/LM declare）收敛改指——Home §U.8 canonical（FM 53267 A1-R25 / LM 53299 A1-R26 逐字实体化；本批补 export）。尾部导入：ES 模块提升，行引用零漂（R35 先例）。环安全：Home 不 import automations 域（grep 实证），值闭包单向。

import { useCodingPlanUpgradeDialog } from '../../modules/PaymentDeep'; // 〔A1-R43〕原 useUpgradeEntryForAutomations（fX declare）收敛改指——canonical useCodingPlanUpgradeDialog（fX 89100 逐字真身，A1-R23 补 export；Home@152 R23 先例同链）。尾部导入：ES 提升，行引用零漂。
