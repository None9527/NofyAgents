// A0-S4-4a: 自 modules/SettingsPanelsCapability.tsx 插件分区（§3）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 1556–2160；§0 声明群整段随族迁入（SkillsService 接口引用的技能族型别经下方 type import 取回）。导入路径按 components/settings/ 深度改指 ../../modules/。
import * as React from "react";
import { DropdownMenu as DropdownMenuRoot, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { RefreshCw as RefreshIcon, PlusIcon, ChevronDownIcon, Settings2 as SettingsIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk
import { toast, type RemoteTarget } from '../../modules/ImeComposition'; // 〔A1-R50〕+type RemoteTarget（统一属主改指，本地同形副本删除）
import { RemoteSyncDialogs, canOpenRemoteSessionSourceCheck as resolveRemoteSyncTarget, remoteSyncTargetLabel as remoteTargetDisplayName } from '../../modules/Modals'; // 〔A1-R50〕+$2/q2（原二 declare）：canonical = RemoteSyncDialogs::canOpenRemoteSessionSourceCheck（styles 127142）/remoteSyncTargetLabel（styles 125207），别名保留调用名，消费位逐字不变
import { AddMarketplaceDialog, PluginAdvancedSection, PluginDetail, PluginHookDetailsList, PluginInfoRow, PluginManageList, PluginSourcesDialog, PluginStoreGrid, PluginUninstallDialog, buildPluginChatPrompt, buildStoreItems, useUninstallFlow, type PluginHookDetail } from '../../modules/SettingsLeaves'; // A0-CLEANUP3 3b：PluginHookDetail 属主为 SettingsLeaves（导出）
import { useBaseServices, useServices, useSessionService } from '../../modules/services'; // A1-R47：+useSessionService（原 Ag 收敛改指）
import { usePluginsStore, usePluginsStore as pluginsStoreStatic } from '../../modules/stores-workspace'; // 〔A1-R167〕+usePluginsStore as pluginsStoreStatic（束符 B6 静态面；下方 @252 墓碑）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // Ia
import { OFFICIAL_PLUGIN_MARKETPLACE_IDS as OFFICIAL_MARKETPLACE_IDS } from '../../modules/SrcSharedB'; // cre（jsx 159308）
import { skillEnabledFilterMatch, type SkillItem, type SkillCapability, type SkillDiagnostic } from './SkillsSettingsSection'; // m1t + §0 SkillsService 接口签名引用（属主：技能族文件）

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

/* ── tombstone〔A1-R50〕：本地 RemoteTarget 副本（6 员 family-A 形）删除 → 统一属主
 *    改指 components/ime/ImeComposition::RemoteTarget（canonical openInEditor opts.remoteTarget
 *    内联抽出；经 modules/ImeComposition type import，既有边）。消费位 @289 props 面 +
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
/* ── tombstone〔A1-R47〕：interface ZcodeAgentService 删除——唯一引用者为本批改指的 useWorkspaceAgentService declare（原 Ag → services/workspaceServiceHooks
 *  useSessionService@406 canonical，R37 既判），改指后本文件对该接口零引用（grep 实测：改前 2 处 = 定义 + declare 返回型引用），孤儿型块。
 *  历史角色：A0 期 declare 返回型 `{ createTask: ZcodeAgentService["createTask"] }` 占位——本文件实际消费仅 zcodeSessionService 直通
 *  （M6/V6 刷新簇zcodeSessionService 参数为 unknown 型，无成员消费），createTask 型面在本文件从未被消费（grep 实测零成员调用）。
 *  同块 useWorkspaceAgentService declare 收敛改指见下方墓碑（本文件消费 = M6/N6/V6 刷新簇 zcodeSessionService 直通）。未来如需 createTask 型面 → 经 bundle 取证重新引入。
 *  证据 A1-R47.report.md §三。 ── */



/* --- 跨 chunk 助手（接口级） --- */

/* ── tombstone〔A1-R50〕：declare resolveRemoteSyncTarget（原 $2，styles 127142–127149）/
 *    remoteTargetDisplayName（原 q2，styles 125207–125214）二件删除——逐字真身在案：
 *    components/modals/RemoteSyncDialogs::canOpenRemoteSessionSourceCheck（A0-S2d 转录）/
 *    remoteSyncTargetLabel（同叶转录），改经文件头 modules/Modals 别名 import 接线
 *    （既有边；Mcp@8/TopBar@138/RemoteGapSegments@89 同式先例）。消费位 @351
 *    （`resolveRemoteSyncTarget({ remoteSessionId, remoteTarget, clientMode, hasLocalSourceService })`）/
 *    @359（`remoteTargetDisplayName(remoteSyncTarget, workspacePath ?? "")`）逐字不变。
 *    型相容：canonical 参型 clientMode: string ⊇ 字面并、remoteTarget?: { kind?: string } | null
 *    ⊇ 属主 RemoteTarget（kind 四并 ⊆ string）；q2 参型 { kind: string; host?; port?; username?;
 *    distro?; user? } ⊇ 属主形（结构可赋）；返回 boolean/string 同契。 ── */
/* ── tombstone〔A1-R44〕：declare useZcodeSessionService（原 kg zcodeSessionService 工厂）删除——PluginsSettingsSection 零消费（grep 实测仅本 declare 行）。
 * 树内 kg 全域 declare 占位相，唯一活消费面 = OnboardingDialog@289（其本地 declare@23 + 消费）。纯删碑，证据见 A1-R44.report.md §二。 ── */
/* ── tombstone〔A1-R47〕：declare useWorkspaceAgentService（原 Ag）删除——收敛改指 services/workspaceServiceHooks useSessionService@406（Ag 真身 styles 24368-24370，
 *  A0-S4-5 已转录；R37 既判）。消费面 @318 改 useSessionService（返回 unknown，本文件消费仅 zcodeSessionService 直通 → 无型缝）。
 *  bundle 证据：I0t（PluginsSettingsSection 孪）@200309 `_ = Ag(e ?? void 0, void 0, t)` → @200415/@200431 `zcodeSessionService: _` 形合。
 *  证据 A1-R47.report.md §二。 ── */
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
/* ── tombstone〔A1-R44〕：declare refreshAfterHookChange（原 lFt hooks 能力刷新）删除——PluginsSettingsSection 零消费（grep 实测仅本 declare 行）。零消费实测：全文 grep 每名出现次数 = 1（仅本 declare 行），非 export、文件本地死面。树内无 canonical（全域 grep）：仅本簇 6 文件同形 declare 面；他文件活面（ExtendedViews useWorkspaceAgentService、Sidebar refreshAfterPluginSync、OnboardingDialog useZcodeSessionService@289 本地 declare+消费）皆各该文件自有 declare+消费暂代式，与本文件死面无涉。无改指对象，纯删碑；未来本文件出现消费面 → 经 bundle 取证定真身后重新引入。证据见 A1-R44.report.md §二/§四。
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
/* ── tombstone（A1-R2）：useWorkspaceTabsStore（原 pc js 4753）/isWorkspaceTab（原 oc js 4487）declare
 *    一并删除：本文件无调用点（死声明）；本地宽松 WorkspaceTabsStoreState 随删。
 *    真实实现见 ../../modules/WorkspaceTabsDeep（useWorkspaceTabStore/isWorkspaceKindTab）。 ── */


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
/* ── tombstone〔A1-R167〕：declare pluginsStoreStatic（束符 B6，本行原注 `B6.getState()`）删除 → 改采 @11 既有 modules/stores-workspace 边之别名 specifier `usePluginsStore as pluginsStoreStatic`〔别名保名〕，3 处消费点（@491/499/503）逐字不变。束符印证：本行原注 `B6.getState()` ≡ adopter stores/pluginsHelpers@7 `〔A1-R129n〕原 B6 静态面实接线`。canonical stores/pluginsStore@101 `export const usePluginsStore: UseBoundStore<PluginsState>`（经 stores-workspace@69 导入 / @86 再导出，与 @11 既有 usePluginsStore 同一实体）。零新边；@11 之环係既有、本批未新增边故环态不变。★隨批登記：本地 `PluginsStoreState`@228-251（24 行）自此成為死面（全文件僅 @228 定义 + @252 本樁兩处引用），候面收敛批清理；其所描 error/installedPlugins 二員与 canonical PluginsState@66/@62 逐字節同形，故三消费点型別不变。 ── */

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
  const workspaceAgentService = useSessionService(workspacePath ?? undefined, undefined, workspaceIdentity); // A1-R47：原 Ag 收敛改指（unknown 直通，无型缝）
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

