// A0-S4-4a: 自 modules/SettingsPanelsCapability.tsx 子代理分区（§2）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 1051–1555；§0 声明群随族迁入（剔除 SkillsService 接口，其型别属技能族）。导入路径按 components/settings/ 深度改指 ../../modules/。
import * as React from "react";
import { Select as SelectRoot } from '../../modules/Settings'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { RefreshCw as RefreshIcon, PlusIcon, FolderOpenIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk
import { Input, toast } from '../../modules/ImeComposition';
import { BackLinkButton, ResourceGroupHeader, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../modules/Settings';
import { SubagentConfigForm, SubagentRow, builtInSubagentName, groupSubagents, isUserManagedSubagent, type ConfigOption, type SelectGroupEntry } from '../../modules/SettingsLeaves'; // A0-CLEANUP3 3b：SelectGroupEntry/ConfigOption 属主为 SettingsLeaves（导出）
import { useServices } from '../../modules/services';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';
import { useConfirmDialog } from '../../modules/Modals'; // U2
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // Ia
import { providerIds } from '../../modules/SrcSharedA'; // q=mo（A0-CLEANUP B-7）
import { useAppSettings } from '../../modules/UsageDeep'; // A1-R11：JM（53488）改指 canonical（components/usage/UsageDeep.tsx §2c）；调用点 273 解构 {settings}，297 读 modelProviderFamilyModes 具名面逐字不变。环安全：UsageDeep 值闭包不达本文件
import { modelMenuGroupsOf, useModelProvidersStore, type ModelProvider as PaymentModelProvider } from '../../modules/PaymentDeep'; // 〔A1-R29〕Hq 77850 canonical + 型缝型别：buildModelSelectGroups declare 收敛改指，见下墓碑。〔A1-R35〕+useModelProvidersStore（qq 78243-78403 逐字真身 ≡ components/payments/PaymentDeep §11；declare 收敛改指，见下墓碑；消费 @271 ≡ bundle 197843 H1t 面）。环安全：PaymentDeep shim 值闭包不达 components/settings
import type { SkillItem, SkillCapability, SkillDiagnostic } from './SkillsSettingsSection'; // §0 SkillsService 接口签名引用（属主：技能族文件）
import type { ModelCatalogEntryLike } from '../../modules/Home'; // 〔A1-R24〕zrt 197021 面联动：本文件 ModelProvider.models 型缝所依

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
/* ── tombstone（A0-S3c）：DialogContent、DialogHeader、DialogRoot、DialogTitle、DropdownMenuContent、DropdownMenuItem、DropdownMenuRoot、DropdownMenuSeparator、DropdownMenuTrigger、SelectRoot declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */










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
  models: Array<string | ModelCatalogEntryLike>; // 〔A1-R24〕zrt 197021 面联动型缝：qq store 真身含 models（SubagentLeaves 链透传面）
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
/* ── tombstone〔A1-R35〕：declare useModelProvidersStore（原 qq，78243）删除 → 改经文件头 modules/PaymentDeep import 消费（canonical = components/payments/PaymentDeep §11 useModelProvidersStore，bundle 78243-78403 逐字）。消费面 @271 ≡ bundle 197843（H1t 面）。 ── */
/* ── tombstone（A1-R11）：declare useAppSettings（原 JM，53488）删除，改经文件头 modules/UsageDeep import 消费
 *    （canonical = components/usage/UsageDeep.tsx §2c，JM 53488 逐字；返回面五字段，本文件消费 {settings}）。 ── */
interface TaskStoreState {
  getWorkspaceState: (workspacePath: string, identity?: string | null) => { activeTaskId: string | null };
  startDraft: (workspacePath: string, draft?: unknown, identity?: string | null) => void;
  bindRuntimeProvider: (workspacePath: string, provider: string, identity?: string | null) => void;
  setSlashCommands: (workspacePath: string, commands: unknown[], identity?: string | null) => void;
  setActiveTaskId: (workspacePath: string, taskId: string, identity?: string | null) => void;
  getState?: unknown;
}
/* ── tombstone（A1-R2）：useWorkspaceTabsStore（原 pc js 4753）/isWorkspaceTab（原 oc js 4487）declare
 *    一并删除：本文件无调用点（死声明）；本地宽松 WorkspaceTabsStoreState 随删。
 *    真实实现见 ../../modules/WorkspaceTabsDeep（useWorkspaceTabStore/isWorkspaceKindTab）。 ── */


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
/* ── tombstone〔A1-R29〕：declare buildModelSelectGroups（原 Hq）删除 → 改指 modelMenuGroupsOf（Hq 真身：
 *    bundle 77850 唯一真身 ≡ PaymentDeep@993 A0 逐字实化，modules/PaymentDeep@118 转导出）。双实例收敛证据：
 *    消费面实测：@292（modelSelectGroups useMemo）≡ bundle 197861（`Hq(\`glm\`, [], s, {labels}, c, h?.modelProviderFamilyModes)`），
 *    改名改指（agents 位 = bundle 第二参，Hq 体内从不读，负证据在案，删位）。负证据：bundle 内 Hq 无第二真身。 ── */
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
      // 〔A1-R29〕型缝：本地 ModelProvider 面（models: Array<string | ModelCatalogEntryLike>）窄化至 canonical PD 面
      // （行依据：本行 + 本地 ModelProvider@81）；bundle Hq 第二参（agents 位）体内不读，删位（负证据在案）。
      modelMenuGroupsOf(
        "glm",
        modelProviders as PaymentModelProvider[],
        {
          apiKeyLabel: intl.formatMessage({ id: "settings.modelProvider.apiKey" }),
          codingPlanLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.codingPlan" }),
        },
        displayOrder,
        settings?.modelProviderFamilyModes,
        undefined
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

