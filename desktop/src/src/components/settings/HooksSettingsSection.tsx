// A0-S4-4a: 自 modules/SettingsPanelsCapability.tsx Hooks 分区（§5）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 2830–3684；§0 声明群随族迁入（剔除 SkillsService/SubagentsService 接口，其型别属技能/子代理族）。导入路径按 components/settings/ 深度改指 ../../modules/。
import * as React from "react";
import { Select as SelectRoot } from '../../modules/Settings'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { RefreshCw as RefreshIcon, PlusIcon, Trash2 as TrashIcon, PencilIcon, DownloadIcon, SearchIcon, Bot as SubagentIcon, UserRound as UserScopeIcon, InfoIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button, ChevronRight as ChevronRightIcon } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk
import { Input, Textarea, toast } from '../../modules/ImeComposition';
import { Badge } from '../../modules/PaymentDeep';
import { BackLinkButton, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Tabs, TabsList, TabsTrigger } from '../../modules/Settings';
import { useServices, useSessionService } from '../../modules/services'; // A1-R47：+useSessionService（原 Ag 收敛改指）
import { useHooksStore, usePluginsStore } from '../../modules/stores-workspace';
import { cn } from '../../modules/UtilsCn';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';
import { useConfirmDialog } from '../../modules/Modals'; // U2
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // Ia
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
/* ── tombstone〔A1-R44〕：declare usePlatformService 删除——本文件零消费（grep 实测仅本 declare 行）。树内 usePlatformService 全域 declare 占位相（10+ 文件同形 declare），唯一实 export 面 = ImeComposition@186（= usePlatform 别名），canonical 归属待后批裁定。纯删碑，证据见 A1-R44.report.md §二。 ── */

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
/* ── tombstone〔A1-R47〕：interface ZcodeAgentService 删除——唯一引用者为本批改指的 useWorkspaceAgentService declare（原 Ag → services/workspaceServiceHooks
 *  useSessionService@406 canonical，R37 既判），改指后本文件对该接口零引用（grep 实测：改前 2 处 = 定义 + declare 返回型引用），孤儿型块。
 *  历史角色：A0 期 declare 返回型 `{ createTask: ZcodeAgentService["createTask"] }` 占位——本文件实际消费仅 zcodeSessionService 直通
 *  （refreshAfterHookChange（原 lFt）zcodeSessionService 参数为 unknown 型，无成员消费），createTask 型面在本文件从未被消费（grep 实测零成员调用）。
 *  同块 useWorkspaceAgentService declare 收敛改指见下方墓碑。未来如需 createTask 型面 → 经 bundle 取证重新引入。
 *  证据 A1-R47.report.md §三。 ── */



/* --- 跨 chunk 助手（接口级） --- */

/* ── tombstone〔A1-R44〕：死 declare 簇（3 件）删除：resolveRemoteSyncTarget（原 $2 远程目标可用性判定）/ remoteTargetDisplayName（原 q2 远程目标显示名）/ useZcodeSessionService（原 kg zcodeSessionService 工厂）。
 * 零消费实测：全文 grep 每名出现次数 = 1（仅本 declare 行），非 export、文件本地死面。树内无 canonical（全域 grep）：仅本簇 6 文件同形 declare 面；他文件活面（ExtendedViews useWorkspaceAgentService、Sidebar refreshAfterPluginSync、OnboardingDialog useZcodeSessionService@289 本地 declare+消费）皆各该文件自有 declare+消费暂代式，与本文件死面无涉。无改指对象，纯删碑；未来本文件出现消费面 → 经 bundle 取证定真身后重新引入。证据见 A1-R44.report.md §二/§四。
 * 同块 useWorkspaceAgentService（原 Ag）/refreshAfterHookChange（原 lFt）为本文件活面（declare+消费），逐件保留。A1-R44 项 1 机械簇收敛，证据见 A1-R44.report.md。 ── */








/* ── tombstone〔A1-R47〕：declare useWorkspaceAgentService（原 Ag）删除——收敛改指 services/workspaceServiceHooks useSessionService@406（Ag 真身 styles 24368-24370，
 *  A0-S4-5 已转录；R37 既判）。消费面 @819 改 useSessionService（返回 unknown，本文件消费仅 zcodeSessionService 直通 → 无型缝）。
 *  bundle 证据：p2t（HooksSettingsSection 孪）@202331 `a = Ag(e ?? void 0, void 0, t)` → @202388 `zcodeSessionService: a` 形合。
 *  证据 A1-R47.report.md §二。 ── */
/* ── tombstone〔A1-R44〕：死 declare 簇（3 件）删除：refreshSessionCapabilities（原 M6 会话能力刷新）/ refreshSkillCapabilities（原 N6 技能能力刷新）/ refreshAfterPluginSync（原 V6 插件远程同步后全量刷新）。
 * 零消费实测：全文 grep 每名出现次数 = 1（仅本 declare 行），非 export、文件本地死面。树内无 canonical（全域 grep）：仅本簇 6 文件同形 declare 面；他文件活面（ExtendedViews useWorkspaceAgentService、Sidebar refreshAfterPluginSync、OnboardingDialog useZcodeSessionService@289 本地 declare+消费）皆各该文件自有 declare+消费暂代式，与本文件死面无涉。无改指对象，纯删碑；未来本文件出现消费面 → 经 bundle 取证定真身后重新引入。证据见 A1-R44.report.md §二/§四。
 * A1-R44 项 1 机械簇收敛，证据见 A1-R44.report.md。 ── */





















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
  const workspaceAgentService = useSessionService(workspacePath ?? undefined, undefined, workspaceIdentity); // A1-R47：原 Ag 收敛改指（unknown 直通，无型缝）
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

