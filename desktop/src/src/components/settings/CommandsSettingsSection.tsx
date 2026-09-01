// A0-S4-4a: 自 modules/SettingsPanelsCapability.tsx 命令分区（§4）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 2161–2829；§0 声明群随族迁入（剔除 SkillsService/SubagentsService 接口，其型别属技能/子代理族）。导入路径按 components/settings/ 深度改指 ../../modules/。
import * as React from "react";
import { Select as SelectRoot } from '../../modules/Settings'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { RefreshCw as RefreshIcon, PlusIcon, Trash2 as TrashIcon, PencilIcon, DownloadIcon, FolderOpenIcon, SquareTerminal as CommandIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk
import { Input, Textarea, toast } from '../../modules/ImeComposition';
import { splitCommandsByScope } from '../../modules/McpHelpers';
import { BackLinkButton, ResourceGroupHeader, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from '../../modules/Settings';
import { CommandsImportDialog } from '../../modules/SettingsPanels';
import { useServices } from '../../modules/services';
import { useCommandsStore } from '../../modules/stores-workspace';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';
import { useConfirmDialog } from '../../modules/Modals'; // U2
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // Ia
import { DEFAULT_AGENT_NAME as COMMANDS_AGENT_SOURCE } from '../../modules/SrcSharedA'; // Kte（`zcodeAgent`）
import {
  isUserPreferenceSource as isFileBasedCommand, // ki（跨 chunk）
  isPluginPreferenceSource as isPluginCommand, // ft（跨 chunk）
} from '../../modules/SrcSharedB';
import type { SkillItem, SkillCapability, SkillDiagnostic } from './SkillsSettingsSection'; // §0 SkillsService 接口签名引用（属主：技能族文件）

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
/* ── tombstone〔A1-R43〕：declare AutomationStatusActiveIcon（原 M3）删除——本文件零消费（死 declare；全文 grep 实测仅本声明行），树内无 canonical（全域 grep 实测：仅 6 文件 declare 面，零 export/零消费）；A1-R43 项 3 机械簇收敛，证据见 A1-R43.report.md §四。 ── */
/* ── tombstone〔A1-R43〕：declare AutomationStatusPausedIcon（原 k3）删除——本文件零消费（死 declare；全文 grep 实测仅本声明行），树内无 canonical（全域 grep 实测：仅 6 文件 declare 面，零 export/零消费）；A1-R43 项 3 机械簇收敛，证据见 A1-R43.report.md §四。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：AutomationStatusCompletedIcon/AutomationStatusFailedIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone〔A1-R43〕：declare TemplateIcon（原 uMt 闲时模板图标）删除——本文件零消费（死 declare；全文 grep 实测仅本声明行），树内无 canonical（全域 grep 实测：仅 6 文件 declare 面，零 export/零消费）；A1-R43 项 3 机械簇收敛，证据见 A1-R43.report.md §四。 ── */
/* ── tombstone〔A1-R43〕：declare ScheduledTemplateIcon（原 Njt 定时模板图标）删除——本文件零消费（死 declare；全文 grep 实测仅本声明行），树内无 canonical（全域 grep 实测：仅 6 文件 declare 面，零 export/零消费）；A1-R43 项 3 机械簇收敛，证据见 A1-R43.report.md §四。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（3）：SkillIcon/CommandIcon/SubagentIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone〔A1-R43〕：declare HookIcon（原 p（camera-info 占位））删除——本文件零消费（死 declare；全文 grep 实测仅本声明行），树内无 canonical（全域 grep 实测：仅 6 文件 declare 面，零 export/零消费）；A1-R43 项 3 机械簇收敛，证据见 A1-R43.report.md §四。 ── */
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
/* ── tombstone（A1-R2）：useWorkspaceTabsStore（原 pc js 4753）/isWorkspaceTab（原 oc js 4487）declare
 *    一并删除：本文件无调用点（死声明）；本地宽松 WorkspaceTabsStoreState 随删。
 *    真实实现见 ../../modules/WorkspaceTabsDeep（useWorkspaceTabStore/isWorkspaceKindTab）。 ── */


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

