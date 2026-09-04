// A0-S4-4a: 自 modules/Settings.tsx MCP 分区（§13，原 G$t）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 3465–4278；§0 RemoteTarget/PlatformService/usePlatformService/McpSyncService/WorkspaceTabsStoreState/useWorkspaceTabsStore/remoteTargetDisplayLabel 声明随族迁入。
// PluginRecord 型别取自浏览器分区族文件（原同文件 §12 定义）。
import * as React from "react";
import { Plus as IconPlus, Download as IconDownload, CloudUpload as IconCloudUpload, Cable as IconCable, ExternalLink as IconExternalLink } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0。〔A1-P3-B13〕+IconCable（原 A_ = Sa('cable')@26798）/IconExternalLink（原 q_ = Sa('external-link')@27013）：W$t 转录消费
import { Button } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk
import { Input, toast, usePlatformService, type RemoteTarget } from '../../modules/ImeComposition'; // 〔A1-R46〕+usePlatformService（活面 declare 改指；canonical ImeComposition@186 = usePlatform@168，bundle l ≡ chunk 导出 M；R45 专裁既判，型交叉检查见 A1-R46.report.md §二）；〔A1-R50〕+type RemoteTarget（统一属主改指，本地同形副本删除）
import { RemoteSyncDialogs, canOpenRemoteSessionSourceCheck as canOpenRemoteSessionSource, remoteSyncTargetLabel as remoteTargetDisplayLabel } from '../../modules/Modals'; // +$2（A0-CLEANUP2 item 14 接线：原别名保留）；〔A1-R50〕+q2（原 remoteTargetDisplayLabel declare；canonical = RemoteSyncDialogs::remoteSyncTargetLabel，styles 125207；本叶命名与 XTt 单相——XTt 单参真身在 SplitLayoutDeep@1585，A1-R4 既判，此处双参形实为 q2，R47 普查误漏更正）
import { McpImportDialog, McpServerEditor, McpServerRow, type McpFormDraft } from '../../modules/SettingsPanels'; // A0-CLEANUP3 3b：编辑器保存草稿面
import { useBaseServices, useServices } from '../../modules/services';
import { useMcpStore, usePluginsStore, type McpServerConfig, type McpSource } from '../../modules/stores-workspace'; // A0-CLEANUP3 3b：McpServer 面对齐派生型
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // G（IntlProvider chunk）
import { joinTestidParts, pluginMcpServerRowTestid, mcpOpenAuthorizationButtonTestid } from '../../modules/SrcSharedB'; // 〔A1-P3-B13〕W$t 转录：qr 真身收敛改指（styles 601 `Xa as qr` ← src 9836 `Nb as Xa` ≡ Nb 8464 ≡ SrcSharedB@5015，R41 既判）+ 前缀实体 ≡ hv@8338/gv@8339。环安全：SrcSharedB 值闭包不达 components/settings（B11/B12 同边先例）
import { useConfirmDialog } from '../../modules/Modals';
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // Ia
import { t as logger } from '../../modules/logger';
import { Tabs, TabsList, TabsTrigger } from './SettingsRowPrimitives';
import { BackLinkButton, ResourceGroupHeader } from './SettingsShellParts';
import type { PluginRecord, ChromeImportResult } from './BrowserSettingsSection';

/* §0 声明群随族迁入（原 183–189 / 202–213 / 290–292 / 358–364 / 462–463） */
/* ── tombstone〔A1-R50〕：本地 RemoteTarget 副本（6 员 family-A 形，§0 随族迁入件）删除
 *    → 统一属主改指 components/ime/ImeComposition::RemoteTarget（canonical openInEditor
 *    opts.remoteTarget 内联抽出；经 modules/ImeComposition type import，既有边）。
 *    消费位 @47（本地 WorkspaceTab.remoteTarget 面）/ @284 props 面逐字不变。 ── */
interface WindowControlsOverlayMetrics {
  rightPaddingPx?: number;
}
interface PlatformService {
  openExternal(url: string): void | Promise<void>;
  openInFileManager(path: string): Promise<{ success: boolean; error?: string }>;
  selectDirectory(): Promise<string | null>;
  syncAppSettings?(patch: { closeToTrayOnWindows?: boolean }): void;
  getWindowControlsOverlayMetrics?(): WindowControlsOverlayMetrics | null;
  onWindowControlsOverlayChanged?(cb: (m: WindowControlsOverlayMetrics) => void): () => void;
  importChromeBrowserData?(): Promise<ChromeImportResult>;
  clearEmbeddedBrowserData?(mode: "cache" | "all"): Promise<{ success: boolean }>;
  onSettingsChanged?(cb: () => void): () => void;
}
/* ── tombstone〔A1-R46〕：declare usePlatformService 删除 → 改指 canonical（modules/ImeComposition 再导出 ≡ components/ime/ImeComposition@186 = usePlatform@168，bundle l ≡ chunk 导出 M；R45 专裁既判）。型交叉检查：消费面仅 @677 platform.openExternal（canonical 具体成员，签名逐字同形）；本文件无本地面 pass-through（本地 PlatformService 接口保留为他面型参用）。证据见 A1-R46.report.md §二。 ── */
interface McpSyncService {
  [key: string]: unknown;
}
interface WorkspaceTab {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget | null;
  localWorkspacePath?: string | null;
  [key: string]: unknown;
}
interface WorkspaceTabsStoreState {
  activeWorkspacePath: string | null;
  activeWorkspaceIdentity: string | null;
  tabs: WorkspaceTab[];
}
/** 原 pc（js 4801）：工作区标签页 store 选择器 */
import { useWorkspaceTabStore as useWorkspaceTabsStore } from '../../modules/WorkspaceTabsDeep'; // 〔A1-R166〕原 pc（js 4801）桩退营改指 canonical modules/WorkspaceTabsDeep@686——别名保名，消费点 @442/@443 逐字不变；全树 5 家先例〔SkillsSettingsSection@16、AutomationEditor@23 同式〕；★参面加宽：本地 WorkspaceTabsStoreState@52-56 三员係 canonical WorkspaceTabStoreState@152-171 之子集，二消费点仅读 activeWorkspacePath 与 activeWorkspaceIdentity 且两侧型别逐字同（string | null）→可赋；本地 @52-56 界面随本批成死面、登记候清理
/* ── tombstone〔A1-R50〕：declare remoteTargetDisplayLabel（原 q2，styles 125207–125214）删除
 *    ——逐字真身 = components/modals/RemoteSyncDialogs::remoteSyncTargetLabel（A0 转录），
 *    改经文件头 modules/Modals 别名 import 接线（既有边；$2 同式先例 @8）。消费位 @628
 *    （`remoteTargetDisplayLabel(effectiveRemoteTarget, effectiveWorkspacePath ?? "")`）逐字不变。
 *    型相容：canonical 参型 { kind: string; host?; port?; username?; distro?; user? } ⊇ 属主
 *    RemoteTarget（结构可赋）；返 string 同契。bundle 消费位实证 = 195227（mcp 域，
 *    `Ae = Ee ? q2(Ee, x ?? ``) : ```；mcpSyncService 判别 @195220 在案）。
 *    命名披露：本叶旧名 remoteTargetDisplayLabel 与 XTt（单参，SplitLayoutDeep@1585，A1-R4）
 *    撞名不同符——双参形实为 q2，R47 §108 活面普查（Skills/Plugins 二件）更正为三件。 ── */

/* ============================================================================
 * 13. MCP 分区（原 G$t，js 194645–195889 / jsx 156627）
 *     工具条（新建/导入/远程同步）+ 搜索 + 分组列表（本地/插件）+ 表单/JSON 编辑器
 *     OAuth 状态轮询与焦点回归刷新（效果链 194795–194916）
 * ==========================================================================*/

/** A0-CLEANUP3 3b：与 SettingsPanels.McpServer / stores-workspace.DerivedMcpServer 双向对齐
 * （去掉索引签名、补足 scope/config、enabled 收紧为必有），消除三型互指错误族 */
export interface McpServer {
  id: string;
  name: string;
  source: string;
  scope: "user" | "workspace";
  config: McpServerConfig;
  enabled: boolean;
  storageLevel?: "workspace" | "user" | string;
  projectPath?: string | null;
  authorization?: { authorizationUrl?: string } | null;
}
export type McpStatusSnapshot = Record<string, unknown>;

/** 原 Ug（js 25055，横切层 McpStore）：按工作区身份的 MCP 状态机 */
interface McpStoreState {
  servers: McpServer[];
  statusSnapshots: Record<string, McpStatusSnapshot>;
  currentProjectPath: string;
  currentWorkspaceIdentity: string | null;
  isConfigLoaded: boolean;
  ensureLoadedForWorkspace(
    workspacePath: string,
    mcpSyncService: McpSyncService,
    workspaceIdentity?: string | null,
  ): Promise<boolean>;
  loadMcpFromUserDirectory(mcpSyncService: McpSyncService, workspaceIdentity?: string | null): Promise<boolean>;
  toggleServer(serverId: string, enabled: boolean): Promise<void>;
  addScopedMcpServer(source: string, name: string, payload: unknown, workspaceIdentity?: string | null): Promise<void>;
  updateScopedMcpServer(source: string, name: string, payload: unknown, workspaceIdentity?: string | null): Promise<void>;
  deleteScopedMcpServer(source: string, name: string, projectPath?: string | null): Promise<void>;
  updateServerStatus(
    serverId: string,
    status: string,
    detail: unknown,
    opts?: { invalidateStatusListRequests?: boolean },
  ): void;
  beginServerStatusListRefresh(): void;
  markServerStatusListRefreshFailed(): void;
  mergeServerStatusSnapshots(snapshots: Record<string, McpStatusSnapshot>): void;
  getEnabledMcpServersForZCode(provider: string): McpServer[];
}
interface McpStoreHook {
  <T>(selector: (state: McpStoreState) => T): T;
  getState(): McpStoreState;
}

/* MCP 助手群（原 192533–194644 段内的纯函数/常量，接口级声明）： */
/** 原 V7（js 194325）：ZCode 自建 MCP 源标识 */
const MCP_SOURCE_ZCODE = "zcodeagentmcp";
/** 原 z$t：服务器列表指纹 */
declare function mcpServersFingerprint(servers: McpServer[]): string;
/** 原 B$t：插件列表指纹 */
declare function pluginsFingerprint(plugins: PluginRecord[]): string;
/** 原 H$t：计算待 OAuth 授权键（有则轮询状态） */
declare function computePendingOAuthKey(servers: McpServer[], snapshots: Record<string, unknown>): string | null; // A0-CLEANUP3 3b：snapshots 对齐 store 弱型（statusSnapshots: Record<string, unknown>）
/** 原 R$t：参与状态刷新的服务器 */
declare function pickStatusRefreshServers(servers: McpServer[], snapshots: Record<string, unknown>): McpServer[];
/** 原 M$t：OAuth 轮询截止时间 */
declare function oauthPollDeadline(): number;
/** 原 N$t：是否已过截止时间 */
declare function isPastDeadline(deadline: number): boolean;
/** 原 k$t：OAuth 轮询间隔（ms） */
declare const MCP_OAUTH_POLL_INTERVAL_MS: number;
/** 原 j$t：OAuth 授权后跟进刷新最大次数 */
declare const MCP_OAUTH_FOLLOWUP_MAX_ATTEMPTS: number;
/** 原 F$t：刷新键变化判定（返回 {lastRefreshKey, shouldRefresh}） */
declare function resolveRefreshKeyChange(
  previousKey: string,
  nextKey: string,
): { lastRefreshKey: string; shouldRefresh: boolean };
/** 原 I$t：OAuth 待处理/跟进状态归并 */
declare function resolveOAuthFollowup(input: {
  activeWorkspaceKey: string;
  existingFollowup: OAuthFollowup | null;
  mcpServers: McpServer[];
  pendingKey: string | null;
  previous: string | null;
}): { pending: string | null; followup: OAuthFollowup | null };
interface OAuthFollowup {
  refreshKey: string;
  workspaceKey: string;
  mcpServers: McpServer[];
}
/** 原 P$t：状态列表刷新（返回 refreshed|stale-workspace|status-mode-unsupported|failed） */
declare function refreshMcpServerStatuses(input: {
  beginServerStatusListRefresh: () => void;
  getCurrentWorkspaceKey: () => string;
  /** A0-CLEANUP3 3b：对齐 store 实签名（error/generation/kind） */
  markServerStatusListRefreshFailed: (error: string, generation: number, kind?: "connect" | "status") => void;
  mergeServerStatusSnapshots: (snapshots: Record<string, unknown>, generation: number, kind?: "connect" | "status") => void;
  /** getEnabledMcpServersForZCode 返回 {name; config} 面，与 McpServer 并存（原 union） */
  mcpServers: Array<McpServer | { name: string; config: unknown }>;
  mode?: "status" | "full";
  requestedWorkspaceKey: string;
  workspaceIdentity?: string | null;
  workspacePath: string;
  mcpSyncService: McpSyncService;
}): Promise<"refreshed" | "stale-workspace" | "status-mode-unsupported" | "failed">;
/** 原 QQt：按搜索词过滤本地服务器 */
declare function filterMcpServersByQuery(servers: McpServer[], query: string): McpServer[];
/** 原 V$t：插件 MCP 列表可见性 */
declare function isPluginMcpListVisible(remote: boolean): boolean;
/** 原 $Qt：插件托管 MCP 条目。〔A1-P3-B13〕返回型 unknown[] → PluginMcpItem[]（W$t 转录实体化所需；item 面 ≡ bundle 194799–194947 消费面归纳，型缝由 A0 弱型细化，非行为变更） */
declare function buildPluginMcpItems(
  plugins: PluginRecord[],
  query: string,
  snapshots: Record<string, unknown>, // A0-CLEANUP3 3b：对齐 store 弱型
): PluginMcpItem[];
/** 原 L$t：互斥锁工厂（串行化状态刷新） */
declare function createSerialMutex(): { request<T>(task: () => Promise<T>): Promise<T> } | null;
/** 原 H7（js 194440）：服务器序列化（刷新参数） */
declare function serializeMcpServers(servers: McpServer[]): unknown;
/** 原 RQt：服务器 → 编辑载荷 */
declare function mcpServerToPayload(server: McpServer | McpFormDraft): Record<string, unknown>; // A0-CLEANUP3 3b：编辑器保存路径以草稿回传

/** 原 KQt（js 193252）：MCP 服务器列表（空态带创建按钮；行 = GQt，接口级） */
export function McpServerList({
  servers,
  onCreate,
  onEdit,
  onDelete,
  onToggle,
  onOpenAuthorization,
  emptyTitle,
  emptyDescription,
}: {
  servers: McpServer[];
  onCreate: () => void;
  onEdit: (server: McpServer) => void;
  onDelete: (server: McpServer) => void;
  onToggle: (serverId: string, enabled: boolean) => void;
  onOpenAuthorization: (server: McpServer) => void;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const { intl } = useIntlContext();
  if (servers.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-dashed border-border">
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
          <div className="space-y-1">
            <div className="text-ui-base font-medium text-foreground">{emptyTitle}</div>
            <div className="text-ui-base text-foreground-subtle">{emptyDescription}</div>
          </div>
          <Button variant="outline" size="sm" onClick={onCreate}>
            <IconPlus className="size-4" />
            <span>{intl.formatMessage({ id: "settings.mcp.create.open" })}</span>
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="divide-y divide-border">
        {servers.map((server) => (
          <McpServerRow
            key={server.id}
            server={server}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
            onOpenAuthorization={onOpenAuthorization}
          />
        ))}
      </div>
    </div>
  );
}

/** 原 GQt（js 193151 附近）：MCP 服务器行（开关/编辑/删除/打开 OAuth 授权；
 *  testid：mcp-server-row / mcp-open-authorization-button，src chunk 8337/8339）。接口级。 */

/** 原 U$t（js 194776）：编辑器模式切换（表单 | JSON） */
export function McpEditorModeTabs({
  mode,
  onModeChange,
}: {
  mode: "form" | "json";
  onModeChange: (mode: "form" | "json") => void;
}) {
  const { intl } = useIntlContext();
  return (
    <Tabs value={mode} onValueChange={(value) => onModeChange(value as "form" | "json")} className="shrink-0 self-end">
      <TabsList className="flex h-8 rounded-lg border border-border bg-background p-1">
        <TabsTrigger value="form" className="h-6 rounded-md px-2.5 text-ui-base data-active:bg-secondary data-active:text-foreground">
          {intl.formatMessage({ id: "settings.mcp.form.mode.form" })}
        </TabsTrigger>
        <TabsTrigger value="json" className="h-6 rounded-md px-2.5 text-ui-base data-active:bg-secondary data-active:text-foreground">
          JSON
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

/** 原 HQt（js 192829）：MCP 服务器编辑器（表单/JSON 双模式；stdio/SSE/命令/参数/环境变量）。接口级。 */

/** 原 _$t（js 193640）：MCP 导入对话框 —— 外部 agent 配置一键导入
 *  （settingsSync：Claude Code/Codex/OpenCode…18 种，settingsSync.* 28 处 193248–207980）。接口级。 */

/** 插件托管 MCP 条目形状（原 W$t item 面，js 194799–194947 消费面归纳；〔A1-P3-B13〕buildPluginMcpItems 返回型由 unknown[] 细化，型缝注记见该 declare） */
export interface PluginMcpItem {
  id: string;
  name: string;
  pluginName: string;
  pluginMarketplace?: string;
  runtimeServerName: string;
  status?: string;
  error?: string;
  active?: boolean;
  pluginEnabled?: boolean;
  hostProvided?: boolean;
  toolCount?: number;
  authorization?: { authorizationUrl?: string } | null;
}

/** 原 W$t（js 194799–194947，登记段起点 194503）：插件托管 MCP 列表。
 *  〔A1-P3-B13〕declare（接口级）转录实体化：qr 2 点 194869 `qr(En, e.runtimeServerName)` / 194918 `qr(Qte, e.runtimeServerName)`
 *  收敛改指 joinTestidParts（En = styles 519 `Lr as En` ← src 9750 `hv as Lr` ≡ hv@8338 plugin-mcp-server-row ≡ pluginMcpServerRowTestid；
 *  Qte = styles 726 `mr as Qte` ← src 9964 `gv as mr` ≡ gv@8339 mcp-open-authorization-button ≡ mcpOpenAuthorizationButtonTestid）。
 *  依赖：G=useIntlContext / X=Button（modules/button）/ A_=lucide Cable / q_=lucide ExternalLink（A0-S3b 先例）。 */
export function PluginMcpServerList({ items, onOpenAuthorization }: { items: PluginMcpItem[]; onOpenAuthorization: (server: McpServer) => void }) {
  const { intl } = useIntlContext();
  const openAuthorizationLabel = intl.formatMessage({ id: "settings.mcp.oauth.openAuthorization" });
  function resolveStatusView(item: PluginMcpItem) { // 原 i（W$t 内嵌，194802）
    return item.authorization?.authorizationUrl
      ? {
          label: intl.formatMessage({ id: "settings.mcp.plugin.authorizationRequired" }),
          description: intl.formatMessage({
            id: "settings.mcp.plugin.authorizationRequiredDescription",
          }),
        }
      : item.status === "error"
        ? {
            label: intl.formatMessage({ id: "settings.mcp.plugin.unavailable" }),
            description:
              item.error ?? intl.formatMessage({ id: "settings.mcp.plugin.unavailableDescription" }),
          }
        : item.active
          ? item.status === "connecting"
            ? {
                label: intl.formatMessage({ id: "settings.mcp.plugin.connecting" }),
                description: intl.formatMessage({ id: "settings.mcp.plugin.connectingDescription" }),
              }
            : item.status === "connected"
              ? {
                  label: intl.formatMessage({ id: "settings.mcp.plugin.connected" }),
                  description: intl.formatMessage({ id: "settings.mcp.plugin.connectedDescription" }),
                }
              : item.status === "disconnected"
                ? {
                    label: intl.formatMessage({ id: "settings.mcp.plugin.disconnected" }),
                    description: intl.formatMessage({
                      id: "settings.mcp.plugin.disconnectedDescription",
                    }),
                  }
                : {
                    label: intl.formatMessage({
                      id: item.hostProvided
                        ? "settings.mcp.host.active"
                        : "settings.mcp.plugin.active",
                    }),
                    description: item.hostProvided
                      ? intl.formatMessage(
                          { id: "settings.mcp.host.activeDescription" },
                          { pluginName: item.pluginName },
                        )
                      : intl.formatMessage({ id: "settings.mcp.plugin.activeDescription" }),
                  }
          : item.pluginEnabled
            ? {
                label: intl.formatMessage({ id: "settings.mcp.plugin.unavailable" }),
                description: intl.formatMessage({ id: "settings.mcp.plugin.unavailableDescription" }),
              }
            : {
                label: intl.formatMessage({ id: "settings.mcp.plugin.disabled" }),
                description: intl.formatMessage({ id: "settings.mcp.plugin.disabledDescription" }),
              };
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="divide-y divide-border">
        {items.map((item) => {
          const statusView = resolveStatusView(item);
          return (
            <div
              key={item.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
              data-mcp-status={item.status ?? ""}
              data-mcp-tool-count={item.toolCount}
              data-testid={joinTestidParts(pluginMcpServerRowTestid, item.runtimeServerName)}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground-subtle" aria-hidden="true">
                <IconCable className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-ui-base font-medium text-foreground">{item.name}</span>
                  <span className="rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle">{item.pluginName}</span>
                  <span className="rounded-md bg-surface px-1.5 py-0.5 text-ui-xs text-foreground-subtle ring-1 ring-border">{statusView.label}</span>
                  {typeof item.toolCount == "number" && (
                    <span className="inline-flex rounded-md bg-surface px-1.5 py-0.5 text-ui-xs text-foreground-subtle ring-1 ring-border">
                      {intl.formatMessage(
                        { id: "settings.mcp.status.toolCount" },
                        { count: String(item.toolCount) },
                      )}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 truncate text-ui-base text-foreground-subtlest">{statusView.description}</div>
              </div>
              <div className="flex min-w-0 max-w-full shrink-0 items-center gap-2">
                {item.authorization?.authorizationUrl ? (
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={openAuthorizationLabel}
                    data-testid={joinTestidParts(mcpOpenAuthorizationButtonTestid, item.runtimeServerName)}
                    title={openAuthorizationLabel}
                    onClick={() => onOpenAuthorization?.(item as unknown as McpServer)} /* 〔A1-P3-B13〕型缝：bundle 194922 `() => t?.(e)` 以 item 回传；item ≡ McpServer authorization 面（A0 弱型） */
                  >
                    <IconExternalLink className="size-3" aria-hidden="true" />
                    <span className="hidden sm:inline">{openAuthorizationLabel}</span>
                  </Button>
                ) : null}
                <span className="max-w-24 truncate text-ui-base text-foreground-subtle sm:max-w-40">{item.pluginMarketplace}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface McpSettingsSectionProps {
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget | null;
  localWorkspacePath?: string | null;
  isWebRemoteControl?: boolean;
}

/** 原 G$t（js 194941）：MCP 分区主组件 */
export function McpSettingsSection({
  workspacePath,
  workspaceIdentity,
  remoteSessionId,
  remoteTarget,
  localWorkspacePath,
  isWebRemoteControl = false,
}: McpSettingsSectionProps = {}) {
  const { intl } = useIntlContext();
  const confirmDialog = useConfirmDialog();
  const services = useServices();
  const platform = usePlatformService();
  const baseServices = useBaseServices();
  const servers = useMcpStore((state) => state.servers);
  const statusSnapshots = useMcpStore((state) => state.statusSnapshots);
  const plugins = usePluginsStore((state) => state.plugins);
  const initializePlugins = usePluginsStore((state) => state.initialize);
  const storeProjectPath = useMcpStore((state) => state.currentProjectPath);
  const storeWorkspaceIdentity = useMcpStore((state) => state.currentWorkspaceIdentity);
  const activeWorkspacePath = useWorkspaceTabsStore((state) => state.activeWorkspacePath);
  const activeWorkspaceIdentity = useWorkspaceTabsStore((state) => state.activeWorkspaceIdentity ?? undefined);
  const effectiveWorkspacePath = workspacePath ?? activeWorkspacePath;
  const effectiveWorkspaceIdentity = workspaceIdentity ?? activeWorkspaceIdentity;
  /** 原 C：活动工作区键（身份优先，回落路径） */
  const activeWorkspaceKey = effectiveWorkspaceIdentity?.trim() || effectiveWorkspacePath || "";
  /** 原 w：store 当前工作区键 */
  const storeWorkspaceKey = storeWorkspaceIdentity?.trim() || storeProjectPath;
  /** 原 T：store 与活动工作区一致时才展示其数据 */
  const storeMatchesActiveWorkspace = !!activeWorkspaceKey && storeWorkspaceKey === activeWorkspaceKey;
  const visibleServers = storeMatchesActiveWorkspace ? servers : [];
  const visibleSnapshots = storeMatchesActiveWorkspace ? statusSnapshots : {};
  const isConfigLoaded = useMcpStore((state) => state.isConfigLoaded);
  const ensureLoadedForWorkspace = useMcpStore((state) => state.ensureLoadedForWorkspace);
  const loadMcpFromUserDirectory = useMcpStore((state) => state.loadMcpFromUserDirectory);
  const toggleServer = useMcpStore((state) => state.toggleServer);
  const addScopedMcpServer = useMcpStore((state) => state.addScopedMcpServer);
  const updateScopedMcpServer = useMcpStore((state) => state.updateScopedMcpServer);
  const deleteScopedMcpServer = useMcpStore((state) => state.deleteScopedMcpServer);
  const updateServerStatus = useMcpStore((state) => state.updateServerStatus);
  const beginServerStatusListRefresh = useMcpStore((state) => state.beginServerStatusListRefresh);
  const markServerStatusListRefreshFailed = useMcpStore((state) => state.markServerStatusListRefreshFailed);
  const mergeServerStatusSnapshots = useMcpStore((state) => state.mergeServerStatusSnapshots);

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingServer, setEditingServer] = React.useState<McpServer | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const [remoteSyncOpen, setRemoteSyncOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [editorMode, setEditorMode] = React.useState<"form" | "json">("form");
  const [configReadyWorkspaceKey, setConfigReadyWorkspaceKey] = React.useState("");
  const [oauthFollowup, setOauthFollowup] = React.useState<OAuthFollowup | null>(null);
  const [statusPollingUnsupported, setStatusPollingUnsupported] = React.useState(false);
  /** 原 pe：status-only 轮询不支持后的熔断标记 */
  const statusOnlyUnsupportedRef = React.useRef(false);
  const editorVisible = editorOpen || editingServer !== null;
  /** 原 he：服务器+插件指纹（刷新依赖） */
  const serverStatusListKey = React.useMemo(
    () => [mcpServersFingerprint(visibleServers), pluginsFingerprint(plugins)].filter(Boolean).join("|"),
    [plugins, visibleServers],
  );
  const serialMutexRef = React.useRef<ReturnType<typeof createSerialMutex>>(null);
  serialMutexRef.current ||= createSerialMutex();

  /** 原 _e（194699–194716）：最新上下文快照（供异步回调读取，避免闭包过期） */
  const contextRef = React.useRef({
    activeWorkspaceIdentity: effectiveWorkspaceIdentity,
    activeWorkspaceKey,
    activeWorkspacePath: effectiveWorkspacePath,
    configReadyWorkspaceKey,
    isConfigLoaded,
    serverStatusListKey,
    storeWorkspaceKey,
  });
  contextRef.current = {
    activeWorkspaceIdentity: effectiveWorkspaceIdentity,
    activeWorkspaceKey,
    activeWorkspacePath: effectiveWorkspacePath,
    configReadyWorkspaceKey,
    isConfigLoaded,
    serverStatusListKey,
    storeWorkspaceKey,
  };

  /** 原 ve（194717–194727）：刷新键（身份+路径+指纹多行串） */
  const refreshKey = React.useMemo(
    () =>
      !isConfigLoaded || !effectiveWorkspacePath || !activeWorkspaceKey || configReadyWorkspaceKey !== activeWorkspaceKey || !serverStatusListKey
        ? ""
        : [effectiveWorkspaceIdentity ?? "", effectiveWorkspacePath, serverStatusListKey].join("\n"),
    [effectiveWorkspaceIdentity, activeWorkspaceKey, effectiveWorkspacePath, isConfigLoaded, configReadyWorkspaceKey, serverStatusListKey],
  );
  /** 原 ye/be/xe：OAuth 待处理键 / 状态服务器 / 轮询截止时间 */
  const pendingOAuthKey = React.useMemo(() => computePendingOAuthKey(visibleServers, visibleSnapshots), [visibleServers, visibleSnapshots]);
  const statusServers = React.useMemo(() => pickStatusRefreshServers(visibleServers, visibleSnapshots), [visibleServers, visibleSnapshots]);
  const oauthDeadline = React.useMemo(
    () => (activeWorkspaceKey && pendingOAuthKey ? oauthPollDeadline() : 0),
    [activeWorkspaceKey, pendingOAuthKey],
  );

  /** 原 we（194729–194793）：状态刷新主入口（互斥 + 工作区守卫 + 结果分派） */
  const lastRefreshKeyRef = React.useRef<string | null>(null);
  const lastRefreshKeyStringRef = React.useRef("");
  const refreshStatuses = React.useCallback(
    async (options?: { mode?: "status" | "full"; mcpServers?: McpServer[] }) => {
      const requestedWorkspaceKey = activeWorkspaceKey;
      const context = contextRef.current;
      const getCurrentWorkspaceKey = () => {
        const latest = contextRef.current;
        return latest.activeWorkspaceKey === latest.storeWorkspaceKey &&
          latest.configReadyWorkspaceKey === latest.activeWorkspaceKey
          ? latest.activeWorkspaceKey
          : "";
      };
      const stillActiveWorkspace = () => getCurrentWorkspaceKey() === requestedWorkspaceKey;
      if (
        !requestedWorkspaceKey ||
        context.activeWorkspaceKey !== requestedWorkspaceKey ||
        context.storeWorkspaceKey !== requestedWorkspaceKey ||
        context.configReadyWorkspaceKey !== requestedWorkspaceKey ||
        !context.isConfigLoaded ||
        !context.activeWorkspacePath ||
        !context.serverStatusListKey ||
        (options?.mode === "status" && statusOnlyUnsupportedRef.current)
      ) {
        return;
      }
      const workspacePathForRequest = context.activeWorkspacePath;
      const serversForRequest =
        options?.mcpServers ?? useMcpStore.getState().getEnabledMcpServersForZCode("zcode");
      await serialMutexRef.current?.request(async () => {
        if (!stillActiveWorkspace() || (options?.mode === "status" && statusOnlyUnsupportedRef.current)) return;
        const outcome = await refreshMcpServerStatuses({
          beginServerStatusListRefresh,
          getCurrentWorkspaceKey,
          markServerStatusListRefreshFailed,
          mergeServerStatusSnapshots,
          mcpServers: serversForRequest,
          mode: options?.mode,
          requestedWorkspaceKey,
          workspaceIdentity: context.activeWorkspaceIdentity,
          workspacePath: workspacePathForRequest,
          mcpSyncService: services.mcpSyncService,
        }).catch((error) => (
          logger.warn("[mcp] list server statuses failed", {
            error: error instanceof Error ? error.message : String(error),
            workspacePath: workspacePathForRequest,
          }),
          "failed" as const
        ));
        if (outcome === "stale-workspace" || !stillActiveWorkspace()) return;
        if (outcome === "status-mode-unsupported") {
          statusOnlyUnsupportedRef.current = true;
          lastRefreshKeyRef.current = null;
          setOauthFollowup(null);
          setStatusPollingUnsupported(true);
          logger.warn("[mcp] status-only refresh unsupported; stop OAuth status polling", {
            workspacePath: workspacePathForRequest,
          });
          toast(intl.formatMessage({ id: "settings.mcp.statusOnlyUnsupported" }), { durationMs: 8000 });
        } else if (outcome === "refreshed" && options?.mode !== "status") {
          statusOnlyUnsupportedRef.current = false;
          setStatusPollingUnsupported(false);
        }
      });
    },
    [activeWorkspaceKey, beginServerStatusListRefresh, intl, markServerStatusListRefreshFailed, mergeServerStatusSnapshots, services.mcpSyncService],
  );

  /* --- 效果链（194795–194916） --- */

  /* 工作区切换：重置 OAuth 轮询状态（194795–194799） */
  React.useEffect(() => {
    lastRefreshKeyRef.current = null;
    setOauthFollowup(null);
    statusOnlyUnsupportedRef.current = false;
    setStatusPollingUnsupported(false);
  }, [activeWorkspaceKey, services.mcpSyncService]);

  /* 配置加载：进入工作区先拉取 MCP 配置，成功后登记 configReady（194799–194818） */
  React.useEffect(() => {
    let cancelled = false;
    setConfigReadyWorkspaceKey("");
    if (!effectiveWorkspacePath || !activeWorkspaceKey) return;
    ensureLoadedForWorkspace(effectiveWorkspacePath, services.mcpSyncService, effectiveWorkspaceIdentity)
      .then((loaded) => {
        if (cancelled || !loaded) return;
        const latest = useMcpStore.getState();
        if ((latest.currentWorkspaceIdentity?.trim() || latest.currentProjectPath) === activeWorkspaceKey) {
          setConfigReadyWorkspaceKey(activeWorkspaceKey);
        }
      })
      .catch((error) => {
        logger.warn("[mcp] load workspace config before status refresh failed", {
          error: error instanceof Error ? error.message : String(error),
          workspacePath: effectiveWorkspacePath,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [effectiveWorkspaceIdentity, activeWorkspaceKey, effectiveWorkspacePath, ensureLoadedForWorkspace, services.mcpSyncService]);

  /* 插件初始化（194818–194821）：插件指纹参与状态列表键 */
  React.useEffect(() => {
    if (effectiveWorkspacePath) {
      void initializePlugins({
        workspacePath: effectiveWorkspacePath,
        workspaceIdentity: effectiveWorkspaceIdentity,
        pluginService: services.pluginManagementService,
      });
    }
  }, [effectiveWorkspaceIdentity, effectiveWorkspacePath, initializePlugins, services.pluginManagementService]);

  /* 刷新键变化 → 触发刷新（194821–194826） */
  React.useEffect(() => {
    const change = resolveRefreshKeyChange(lastRefreshKeyStringRef.current, refreshKey);
    lastRefreshKeyStringRef.current = change.lastRefreshKey;
    if (change.shouldRefresh) void refreshStatuses();
  }, [refreshKey, refreshStatuses]);

  /* OAuth 待处理键归并（194826–194838） */
  React.useEffect(() => {
    if (!activeWorkspaceKey || configReadyWorkspaceKey !== activeWorkspaceKey) {
      lastRefreshKeyRef.current = null;
      setOauthFollowup(null);
      return;
    }
    const resolved = resolveOAuthFollowup({
      activeWorkspaceKey,
      existingFollowup: oauthFollowup,
      mcpServers: statusServers,
      pendingKey: pendingOAuthKey,
      previous: lastRefreshKeyRef.current,
    });
    lastRefreshKeyRef.current = resolved.pending;
    setOauthFollowup(resolved.followup);
  }, [activeWorkspaceKey, configReadyWorkspaceKey, oauthFollowup, pendingOAuthKey, statusServers]);

  /* OAuth 授权中：定时轮询状态直到截止（194838–194862） */
  React.useEffect(() => {
    if (!pendingOAuthKey || !activeWorkspaceKey || configReadyWorkspaceKey !== activeWorkspaceKey || statusPollingUnsupported) return;
    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;
    const deadline = oauthDeadline;
    const schedule = () => {
      if (cancelled || isPastDeadline(deadline)) return;
      timer = window.setTimeout(() => {
        if (cancelled || isPastDeadline(deadline)) return;
        attempts += 1;
        logger.debug("[mcp] refresh status while OAuth authorization is pending", {
          attempt: attempts,
          deadline,
          pendingKey: pendingOAuthKey,
          workspacePath: effectiveWorkspacePath,
        });
        void refreshStatuses({ mcpServers: serializeMcpServers(statusServers) as McpServer[] }).finally(schedule);
      }, MCP_OAUTH_POLL_INTERVAL_MS);
    };
    schedule();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [effectiveWorkspacePath, activeWorkspaceKey, configReadyWorkspaceKey, statusPollingUnsupported, oauthDeadline, pendingOAuthKey, statusServers, refreshStatuses]);

  /* OAuth 授权状态变化后的跟进刷新（最多 N 次，194863–194894） */
  React.useEffect(() => {
    if (!oauthFollowup || oauthFollowup.workspaceKey !== activeWorkspaceKey || configReadyWorkspaceKey !== activeWorkspaceKey || statusPollingUnsupported) return;
    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;
    const followUp = () => {
      if (cancelled) return;
      if (attempts >= MCP_OAUTH_FOLLOWUP_MAX_ATTEMPTS) {
        setOauthFollowup((current) => (current?.refreshKey === oauthFollowup.refreshKey ? null : current));
        return;
      }
      timer = window.setTimeout(() => {
        attempts += 1;
        logger.debug("[mcp] refresh status after OAuth authorization state changed", {
          attempt: attempts,
          followupKey: oauthFollowup.refreshKey,
          workspacePath: effectiveWorkspacePath,
        });
        void refreshStatuses({ mcpServers: serializeMcpServers(oauthFollowup.mcpServers) as McpServer[] }).finally(followUp);
      }, MCP_OAUTH_POLL_INTERVAL_MS);
    };
    void refreshStatuses({ mcpServers: serializeMcpServers(oauthFollowup.mcpServers) as McpServer[] }).finally(followUp);
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [effectiveWorkspacePath, activeWorkspaceKey, configReadyWorkspaceKey, statusPollingUnsupported, oauthFollowup, refreshStatuses]);

  /* 从 OAuth 浏览器返回（窗口焦点/页面可见）→ 立即刷新（194895–194916） */
  React.useEffect(() => {
    if (!pendingOAuthKey || !activeWorkspaceKey || configReadyWorkspaceKey !== activeWorkspaceKey || statusPollingUnsupported) return;
    const refreshNow = () => {
      logger.debug("[mcp] refresh status after returning from OAuth browser", {
        pendingKey: pendingOAuthKey,
        workspacePath: effectiveWorkspacePath,
      });
      void refreshStatuses({ mcpServers: serializeMcpServers(statusServers) as McpServer[] });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshNow();
    };
    window.addEventListener("focus", refreshNow);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("focus", refreshNow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [effectiveWorkspacePath, activeWorkspaceKey, configReadyWorkspaceKey, statusPollingUnsupported, pendingOAuthKey, statusServers, refreshStatuses]);

  /* --- 派生与动作（194917–194968） --- */

  /** 原 Te：搜索过滤后的本地服务器 */
  const filteredServers = React.useMemo(() => filterMcpServersByQuery(visibleServers, searchQuery), [searchQuery, visibleServers]);
  /** 原 Ee：远程目标（仅当可同步且有工作区时） */
  const effectiveRemoteTarget =
    canOpenRemoteSessionSource({
      remoteSessionId,
      remoteTarget,
      clientMode: isWebRemoteControl ? "web-remote-replayable" : "desktop-continuous",
      hasLocalSourceService: !!baseServices.mcpSyncService,
    }) && effectiveWorkspacePath
      ? remoteTarget ?? null
      : null;
  const isRemote = !!effectiveRemoteTarget;
  /** 原 Oe：插件托管 MCP 条目 */
  const pluginMcpItems = React.useMemo(
    () => (isRemote ? (isPluginMcpListVisible(isRemote) ? buildPluginMcpItems(plugins, searchQuery, visibleSnapshots) : []) : []),
    [isRemote, plugins, searchQuery, visibleSnapshots],
  );
  const totalResultCount = filteredServers.length + pluginMcpItems.length;
  const remoteContextLabel = effectiveRemoteTarget
    ? remoteTargetDisplayLabel(effectiveRemoteTarget, effectiveWorkspacePath ?? "")
    : "";

  /** 原 je（194932–194943）：开关服务器（启用时置 connecting 并刷新状态） */
  async function handleToggleServer(serverId: string, enabled: boolean) {
    await toggleServer(serverId, enabled);
    if (!enabled) {
      updateServerStatus(serverId, "unknown", undefined, { invalidateStatusListRequests: false });
      return;
    }
    if (!effectiveWorkspacePath) {
      updateServerStatus(serverId, "unknown", undefined, { invalidateStatusListRequests: false });
      return;
    }
    updateServerStatus(serverId, "connecting", undefined, { invalidateStatusListRequests: false });
    void refreshStatuses();
  }

  /** 原 Me（194944–194950）：保存（新建→add；编辑→update；可附带禁用） */
  // A0-CLEANUP3 3b：McpServerEditor.onSave 以表单草稿回传（仅用 name/storageLevel 面）
  async function handleSaveServer(server: McpServer | McpFormDraft, options?: { enabled?: boolean; name?: string }) {
    const payload = { ...mcpServerToPayload(server), ...(options?.enabled === false ? { enable: false } : {}) };
    const workspaceIdentityForScope = (server.storageLevel === "workspace" && storeWorkspaceIdentity) || undefined;
    if (options?.name) {
      await updateScopedMcpServer(MCP_SOURCE_ZCODE, options.name, payload, workspaceIdentityForScope ?? null);
    } else {
      await addScopedMcpServer(MCP_SOURCE_ZCODE, server.name, payload, workspaceIdentityForScope ?? null);
    }
    setEditorOpen(false);
    setEditingServer(null);
  }

  /** 原 Ne（194951–194957）：删除（确认对话框） */
  async function handleDeleteServer(server: McpServer) {
    const confirmed = await confirmDialog({
      title: intl.formatMessage({ id: "settings.mcp.deleteConfirmTitle" }, { name: server.name }),
      description: intl.formatMessage({ id: "settings.mcp.deleteConfirmDescription" }),
      confirmLabel: intl.formatMessage({ id: "settings.mcp.deleteConfirmAction" }),
      cancelLabel: intl.formatMessage({ id: "common.cancel" }),
    });
    if (confirmed) await deleteScopedMcpServer(server.source as McpSource, server.name, server.projectPath ?? undefined); // A0-CLEANUP3 3b：store 面 source 为 McpSource 枚举
  }

  /** 原 Pe（194958–194961）：进入编辑 */
  function handleEditServer(server: McpServer) {
    setEditingServer(server);
    setEditorOpen(false);
    setEditorMode("form");
  }

  /** 原 Fe/Ie（194962–194968）：打开 OAuth 授权页 */
  function handleOpenAuthorization(server: McpServer) {
    const url = server.authorization?.authorizationUrl;
    if (url) void platform.openExternal(url);
  }

  const pluginManagedHint = intl.formatMessage({ id: "settings.pluginManaged.modifyInPlugin" });

  /* --- 渲染：编辑态 / 列表态（194969–195168） --- */

  if (editorVisible) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <BackLinkButton
            onClick={() => {
              setEditorOpen(false);
              setEditingServer(null);
              setEditorMode("form");
            }}
          >
            {intl.formatMessage({ id: "settings.mcp.form.backToList" })}
          </BackLinkButton>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h3 className="text-ui-lg font-semibold text-foreground">
                {editingServer
                  ? intl.formatMessage({ id: "settings.mcp.form.editTitle" })
                  : intl.formatMessage({ id: "settings.mcp.form.createTitle" })}
              </h3>
              <p className="text-ui-base text-foreground-subtle">
                {editingServer
                  ? intl.formatMessage({ id: "settings.mcp.form.editDescription" })
                  : intl.formatMessage({ id: "settings.mcp.form.createDescription" })}
              </p>
            </div>
            <McpEditorModeTabs mode={editorMode} onModeChange={setEditorMode} />
          </div>
          <McpServerEditor
            initial={editingServer ?? undefined}
            editingId={editingServer?.id}
            editorMode={editorMode}
            source={editingServer?.source ?? MCP_SOURCE_ZCODE}
            workspaceAvailable={!!storeWorkspaceIdentity}
            onEditorModeChange={setEditorMode}
            onSave={(server, options) => void handleSaveServer(server, options)}
            onCancel={() => {
              setEditorOpen(false);
              setEditingServer(null);
              setEditorMode("form");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 工具条：说明 + 新建/导入/远程同步（195019–195074） */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-ui-base leading-6 text-foreground-subtle">
          {intl.formatMessage({ id: "settings.mcp.description" })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip title={intl.formatMessage({ id: "settings.mcp.create.open" })}>
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              aria-label={intl.formatMessage({ id: "settings.mcp.create.open" })}
              onClick={() => {
                setEditingServer(null);
                setEditorMode("form");
                setEditorOpen(true);
              }}
            >
              <IconPlus className="size-3.5" aria-hidden="true" />
            </Button>
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: "settings.mcp.import.open" })}>
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              aria-label={intl.formatMessage({ id: "settings.mcp.import.open" })}
              onClick={() => setImportOpen(true)}
            >
              <IconDownload className="size-3.5" aria-hidden="true" />
            </Button>
          </Tooltip>
          {effectiveRemoteTarget ? (
            <Tooltip title={intl.formatMessage({ id: "settings.mcp.remoteSync.open" })}>
              <Button
                type="button"
                variant="ghost"
                size="icon-md"
                aria-label={intl.formatMessage({ id: "settings.mcp.remoteSync.open" })}
                onClick={() => setRemoteSyncOpen(true)}
              >
                <IconCloudUpload className="size-3.5" aria-hidden="true" />
              </Button>
            </Tooltip>
          ) : null}
        </div>
      </div>

      {/* 搜索框（195075–195084） */}
      <Input
        type="text"
        size="lg"
        className="h-9 rounded-xl"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder={intl.formatMessage({ id: "settings.mcp.searchPlaceholder" })}
      />

      {/* 远程上下文提示（195085–195090） */}
      {isRemote ? (
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "settings.mcp.remoteContext" }, { target: remoteContextLabel })}
        </div>
      ) : null}

      {/* 列表（195091–195141）：空态 / 本地分组 + 插件分组 */}
      {totalResultCount === 0 ? (
        <McpServerList
          servers={[]}
          onCreate={() => setEditorOpen(true)}
          onEdit={handleEditServer}
          onDelete={(server) => void handleDeleteServer(server)}
          onToggle={(serverId, enabled) => void handleToggleServer(serverId, enabled)}
          onOpenAuthorization={handleOpenAuthorization}
          emptyTitle={intl.formatMessage({ id: "settings.mcp.emptyTitle" })}
          emptyDescription={intl.formatMessage({ id: "settings.mcp.emptyDescription" })}
        />
      ) : (
        <div className="space-y-4">
          {filteredServers.length > 0 ? (
            <section className="space-y-2">
              <ResourceGroupHeader
                count={filteredServers.length}
                title={intl.formatMessage({ id: "settings.mcp.group.local" })}
              />
              <McpServerList
                servers={filteredServers}
                onCreate={() => setEditorOpen(true)}
                onEdit={handleEditServer}
                onDelete={(server) => void handleDeleteServer(server)}
                onToggle={(serverId, enabled) => void handleToggleServer(serverId, enabled)}
                onOpenAuthorization={handleOpenAuthorization}
                emptyTitle={intl.formatMessage({ id: "settings.mcp.emptyTitle" })}
                emptyDescription={intl.formatMessage({ id: "settings.mcp.emptyDescription" })}
              />
            </section>
          ) : null}
          {pluginMcpItems.length > 0 ? (
            <section className="space-y-2">
              <ResourceGroupHeader
                count={pluginMcpItems.length}
                hint={pluginManagedHint}
                title={intl.formatMessage({ id: "settings.mcp.group.plugin" })}
              />
              <PluginMcpServerList items={pluginMcpItems} onOpenAuthorization={handleOpenAuthorization} />
            </section>
          ) : null}
        </div>
      )}

      {/* 导入对话框（外部 agent 配置，195142–195150） */}
      <McpImportDialog
        open={importOpen}
        workspacePath={storeWorkspaceIdentity}
        workspaceIdentity={effectiveWorkspaceIdentity}
        onOpenChange={setImportOpen}
        onImported={async () => {
          await loadMcpFromUserDirectory(services.mcpSyncService, effectiveWorkspaceIdentity);
        }}
      />

      {/* 远程同步对话框（195151–195166；r4 已随 TopBar 族抽取） */}
      <RemoteSyncDialogs
        canSyncSkills={false}
        canSyncMcp={!!(effectiveRemoteTarget && effectiveWorkspacePath)}
        skillOpen={false}
        mcpOpen={remoteSyncOpen}
        onSkillOpenChange={() => {}}
        onMcpOpenChange={setRemoteSyncOpen}
        localMcpSyncService={baseServices.mcpSyncService}
        remoteMcpSyncService={services.mcpSyncService}
        remoteTarget={effectiveRemoteTarget}
        skillWorkspacePath=""
        mcpWorkspacePath={effectiveWorkspacePath ?? ""}
        mcpLocalWorkspacePath={localWorkspacePath ?? undefined} // A0-CLEANUP3 3b：props 面为 string | undefined（null 归一）
        onSkillsSynced={() => {}}
        onMcpSynced={async () => {
          const reloaded = await loadMcpFromUserDirectory(services.mcpSyncService, effectiveWorkspaceIdentity);
          if (reloaded) await refreshStatuses();
        }}
      />
    </div>
  );
}

