// A0-S4-4a: 自 modules/SettingsPanelsCapability.tsx 技能分区（§1）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 348–1050；§0 声明群随族迁入（剔除 SubagentsService 接口，其型别属子代理族）。导入路径按 components/settings/ 深度改指 ../../modules/。
import * as React from "react";
import { Select as SelectRoot } from '../../modules/Settings'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Dialog as DialogRoot, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { RefreshCw as RefreshIcon, PlusIcon, Trash2 as TrashIcon, ExternalLinkIcon, ChevronDownIcon, DownloadIcon, SearchIcon, TriangleAlert as AlertIcon, Sparkles as SkillIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button, ChevronRight as ChevronRightIcon } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk
import { registerWorkspaceTask } from '../../modules/FileTreePanel';
import { skillMentionMarkdown as skillCreatorPrompt } from '../composer/FileMentionDragHelpers'; // A1-R12：原 Tj（52128）declare 改指纯函数叶子（本批逐字转录）；调用点 505 逐字不变。环安全：叶子零 import
import { Input, toast, usePlatformService, type RemoteTarget } from '../../modules/ImeComposition'; // 〔A1-R48〕+usePlatformService（原 l）：本地 2 员面碑化改指，见下墓碑；〔A1-R50〕+type RemoteTarget（统一属主改指，本地同形副本删除）
import { splitSkillsByScope } from '../../modules/McpHelpers';
import { RemoteSyncDialogs, canOpenRemoteSessionSourceCheck as resolveRemoteSyncTarget, remoteSyncTargetLabel as remoteTargetDisplayName } from '../../modules/Modals'; // 〔A1-R50〕+$2/q2（原 resolveRemoteSyncTarget/remoteTargetDisplayName 二 declare）：canonical = RemoteSyncDialogs::canOpenRemoteSessionSourceCheck（styles 127142）/remoteSyncTargetLabel（styles 125207），别名保留调用名，消费位逐字不变
import { ResourceGroupHeader, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from '../../modules/Settings';
import { SkillsImportDialog } from '../../modules/SettingsPanels';
import { useTaskStore as taskStoreStatic } from '../../modules/SkillStore'; // xe.getState()
import { useWorkspaceTabStore as useWorkspaceTabsStore } from '../../modules/WorkspaceTabsDeep'; // 原 pc（A1-R2：styles js 4753 改指 R1 既有导出；别名保留本地调用名）
import { useBaseServices, useCachedTaskService, useServices, useSessionService } from '../../modules/services'; // A1-R47：+useCachedTaskService/useSessionService（原 kg/Ag 双角色拆分改指）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';
import { t as logger } from '../../modules/logger';
import { useConfirmDialog } from '../../modules/Modals'; // U2
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // Ia
import { useMcpStore as useMcpStoreStatic } from '../../modules/stores-workspace'; // Ug（静态调用形态）

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}


/* ── tombstone〔A1-R48〕：本地 PlatformService 面（openExternal/openInFileManager 2 员）+ declare usePlatformService（原 l）
 *    删除 → 改指 canonical = components/ime/ImeComposition PlatformService 富面（A1-R48 增补已括 2 员）+ 真导出。
 *    消费 @332（hook 位）/@559（openInFileManager 直调，无守卫 → canonical 必选员）逐字不变。
 *    本件无余 PlatformService 型参。
 *    增补证据见 A1-R47.report §四.6。 ── */

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
/* ── tombstone〔A1-R43〕：declare AutomationStatusActiveIcon（原 M3）删除——本文件零消费（死 declare；全文 grep 实测仅本声明行），树内无 canonical（全域 grep 实测：仅 6 文件 declare 面，零 export/零消费）；A1-R43 项 3 机械簇收敛，证据见 A1-R43.report.md §四。 ── */
/* ── tombstone〔A1-R43〕：declare AutomationStatusPausedIcon（原 k3）删除——本文件零消费（死 declare；全文 grep 实测仅本声明行），树内无 canonical（全域 grep 实测：仅 6 文件 declare 面，零 export/零消费）；A1-R43 项 3 机械簇收敛，证据见 A1-R43.report.md §四。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：AutomationStatusCompletedIcon/AutomationStatusFailedIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone〔A1-R43〕：declare TemplateIcon（原 uMt 闲时模板图标）删除——本文件零消费（死 declare；全文 grep 实测仅本声明行），树内无 canonical（全域 grep 实测：仅 6 文件 declare 面，零 export/零消费）；A1-R43 项 3 机械簇收敛，证据见 A1-R43.report.md §四。 ── */
/* ── tombstone〔A1-R43〕：declare ScheduledTemplateIcon（原 Njt 定时模板图标）删除——本文件零消费（死 declare；全文 grep 实测仅本声明行），树内无 canonical（全域 grep 实测：仅 6 文件 declare 面，零 export/零消费）；A1-R43 项 3 机械簇收敛，证据见 A1-R43.report.md §四。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（3）：SkillIcon/CommandIcon/SubagentIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone〔A1-R43〕：declare HookIcon（原 p（camera-info 占位））删除——本文件零消费（死 declare；全文 grep 实测仅本声明行），树内无 canonical（全域 grep 实测：仅 6 文件 declare 面，零 export/零消费）；A1-R43 项 3 机械簇收敛，证据见 A1-R43.report.md §四。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：UserScopeIcon/InfoIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/* --- 通用领域类型 --- */

/* ── tombstone〔A1-R50〕：本地 RemoteTarget 副本（6 员 family-A 形）删除 → 统一属主
 *    改指 components/ime/ImeComposition::RemoteTarget（canonical openInEditor opts.remoteTarget
 *    内联抽出；经 modules/ImeComposition type import，既有边）。消费位 @322 props 面 +
 *    原 $2/q2 declare 参型面逐字不变。 ── */
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
  }): Promise<{ taskId: string; title: string; provider?: string; initialSlashCommands?: unknown[]; workspacePath: string; createdAt: number; updatedAt: number; [key: string]: unknown }>; // A0-CLEANUP3 3b：创建结果为完整任务记录（流入 FileTreePanel.TaskRecord）；+title（A1-R10 2c：TaskRecord 收敛 = canonical TaskMeta，title 必有真形——创建任务经 cLt/oLt 上送 Vo taskMeta 域，titleMatchesSearch 等消费面皆读 title）
}

/* --- 跨 chunk 助手（接口级） --- */

/* ── tombstone〔A1-R50〕：declare resolveRemoteSyncTarget（原 $2，styles 127142–127149）/
 *    remoteTargetDisplayName（原 q2，styles 125207–125214）二件删除——逐字真身在案：
 *    components/modals/RemoteSyncDialogs::canOpenRemoteSessionSourceCheck（A0-S2d 转录）/
 *    remoteSyncTargetLabel（同叶转录），改经文件头 modules/Modals 别名 import 接线
 *    （既有边；Mcp@8/TopBar@138/RemoteGapSegments@89 同式先例）。消费位 @356
 *    （`resolveRemoteSyncTarget({ remoteSessionId, remoteTarget, clientMode, hasLocalSourceService })`）/
 *    @364（`remoteTargetDisplayName(remoteSyncTarget, effectiveWorkspacePath ?? "")`）逐字不变。
 *    型相容：canonical 参型 clientMode: string ⊇ 字面并、remoteTarget?: { kind?: string } | null
 *    ⊇ 属主 RemoteTarget（kind 四并 ⊆ string）；q2 参型 { kind: string; host?; port?; username?;
 *    distro?; user? } ⊇ 属主形（结构可赋）；返回 boolean/string 同契。 ── */
/* ── tombstone〔A1-R44〕：declare useZcodeSessionService（原 kg zcodeSessionService 工厂）删除——SkillsSettingsSection 零消费（grep 实测仅本 declare 行）。
 * 树内 kg 全域 declare 占位相，唯一活消费面 = OnboardingDialog@289（其本地 declare@23 + 消费）。纯删碑，证据见 A1-R44.report.md §二。 ── */
/* ── tombstone〔A1-R47〕：declare useWorkspaceAgentService 删除——本文件孪 y1t（Skills 视图）在 bundle 实调双钩：h = kg@196303（createTask 消费 @527）与
 *  g = Ag@196304（zcodeSessionService 直通 @453/@482/@866/@889），A0 期误并为一 declare。本批拆分改指：createTask → useCachedTaskService（kg 真身，型缝投射），
 *  直通 → useSessionService（Ag 真身，unknown 直通无缝）。R44「原 Ag」标注部分更正（createTask 面实为 kg）。ZcodeAgentService 接口留存（投射型所依）。
 *  证据 A1-R47.report.md §二/§四。 ── */
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
/* ── tombstone〔A1-R44〕：死 declare 簇（2 件）删除：refreshAfterPluginSync（原 V6 插件远程同步后全量刷新）/ refreshAfterHookChange（原 lFt hooks 能力刷新）。
 * 零消费实测：全文 grep 每名出现次数 = 1（仅本 declare 行），非 export、文件本地死面。树内无 canonical（全域 grep）：仅本簇 6 文件同形 declare 面；他文件活面（ExtendedViews useWorkspaceAgentService、Sidebar refreshAfterPluginSync、OnboardingDialog useZcodeSessionService@289 本地 declare+消费）皆各该文件自有 declare+消费暂代式，与本文件死面无涉。无改指对象，纯删碑；未来本文件出现消费面 → 经 bundle 取证定真身后重新引入。证据见 A1-R44.report.md §二/§四。
 * A1-R44 项 1 机械簇收敛，证据见 A1-R44.report.md。 ── */

















/* --- stores --- */

interface ModelProvidersStoreState {
  modelProviders: ModelProvider[];
  displayOrder: { providerIds: string[]; updatedAt?: number } | null;
  loading: boolean;
}
/* ── tombstone〔A1-R35〕：declare useModelProvidersStore（原 qq，78243）删除——本树零消费死 declare（负证据在案：本文件无消费点）；真身 = components/payments/PaymentDeep §11 useModelProvidersStore（bundle 78243-78403 逐字），同批实体化。 ── */
/* ── tombstone（A1-R11）：declare useAppSettings（原 JM，53488）删除。负证据：本文件无活调用点（§0 声明群随族整段迁入之死声明）；
 *    canonical = components/usage/UsageDeep.tsx §2c useAppSettings（JM 53488 逐字），活消费面见 Subagents/AutomationsMain/MPSS 等（本批另行改指）。 ── */
interface TaskStoreState {
  getWorkspaceState: (workspacePath: string, identity?: string | null) => { activeTaskId: string | null };
  startDraft: (workspacePath: string, draft?: unknown, identity?: string | null) => void;
  bindRuntimeProvider: (workspacePath: string, provider: string, identity?: string | null) => void;
  setSlashCommands: (workspacePath: string, commands: unknown[], identity?: string | null) => void;
  setActiveTaskId: (workspacePath: string, taskId: string, identity?: string | null) => void;
  getState?: unknown;
}
/* ── tombstone（A1-R2）：useWorkspaceTabsStore（原 pc js 4753）declare 已删除，改经文件头真实 import
 *    （../../modules/WorkspaceTabsDeep 之 useWorkspaceTabStore，别名保留本地调用名）消费；
 *    本地宽松 WorkspaceTabsStoreState 随删（改指后无引用）。
 *    isWorkspaceTab（原 oc js 4487）declare 一并删除：本文件无调用点（死声明）。 ── */


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
/* ── tombstone（A1-R12）：declare skillCreatorPrompt（原 Tj，52128）删除 → 文件头
 *    ../composer/FileMentionDragHelpers import 别名消费（canonical = skillMentionMarkdown，
 *    本批逐字转录；调用点 505 逐字不变）。 ── */

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
  const cachedTaskService = useCachedTaskService(effectiveWorkspacePath ?? undefined, undefined, effectiveWorkspaceIdentity) as { createTask: ZcodeAgentService["createTask"] }; // A1-R47：原 kg 收敛改指（型缝 unknown → createTask 面）
  const workspaceSessionService = useSessionService(effectiveWorkspacePath ?? undefined, undefined, effectiveWorkspaceIdentity); // A1-R47：原 Ag 收敛改指（unknown 直通，无型缝）
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
          zcodeSessionService: workspaceSessionService,
          workspacePath: effectiveWorkspacePath,
          workspaceIdentity: effectiveWorkspaceIdentity,
          reason: "settings-skill-enabled",
        });
        await Promise.all([loadSkills(false), handleRefreshCapabilities()]);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : String(error));
      }
    },
    [effectiveWorkspaceIdentity, effectiveWorkspacePath, loadSkills, handleRefreshCapabilities, skills, skillsService, workspaceSessionService]
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
          zcodeSessionService: workspaceSessionService,
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
    [effectiveWorkspaceIdentity, effectiveWorkspacePath, confirmDialog, intl, loadSkills, detailSkill, skillsService, workspaceSessionService]
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
        const task = await cachedTaskService.createTask({
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
            zcodeSessionService: workspaceSessionService,
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
            zcodeSessionService: workspaceSessionService,
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

