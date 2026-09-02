// A0-S4-4c: 自 modules/SidebarLeaves.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/shell/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * SidebarLeaves.tsx — Sidebar 族接口级叶子展开（B4 批次 · 解混淆重建）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，规格文档行号以它为准）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 登记：同目录 Sidebar.report.md §2「接口级（★）保留清单」——本文件将其中六项叶子
 *       从「接口声明」展开为「逐行还原」，格式与口径同 TopBar.tsx / Sidebar.tsx。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  数据层钩子：
 *   VFt  → useWorkspaceTaskGroups   项目视图任务分组数据钩子 (144427)
 *   uzt  → useGroupedTaskView       分组任务视图数据层钩子 (153205)
 *   mRt  → useSidebarUsageState     侧栏用量状态钩子（F12 域接线）(150255)
 *  分组视图合成助手（uzt 依赖族，本次一并实体化）：
 *   KRt  → sortTasksByGroupOrder        (— / 126406)
 *   qRt  → buildGroupedViewFromStructure (152903 区 / 126428)
 *   JRt  → applyDraftPromotions          (— / 126470)
 *   YRt  → findTaskInViewByKey           (— / 126504)
 *   XRt  → isTaskFirstInGroup            (— / 126514)
 *   ZRt  → normalizeWorkspaceScopes      (— / 126518)
 *   j8   → collectViewWorkspaceScopes    (— / 126525)
 *   QRt  → composeOptimisticOverlay      (153040 区 / 126543)
 *   $Rt  → collectViewTaskKeys           (— / 126621)
 *   tzt  → isGroupedViewReady            (— / 126635)
 *   nzt  → GroupedViewLoadCache（class） (— / 126641)
 *   rzt  → prependCreatedGroup           (— / 126669)
 *   izt  → resolveVisibleMissingTaskKeys (— / 126679)
 *   azt  → viewNodeOrderKey              (— / 126690)
 *   ozt  → viewNodesShallowEqual         (— / 126693)
 *   szt  → mergeGroupedViewPreservingIdentity (— / 126696)
 *   czt  → toTopLevelNodeRef             (— / 126714)
 *   lzt  → serializeGroupedViewOrder     (— / 126721)
 *   Cx   → fetchTaskIndex（接口级，跨块助手群 _x/vx/gx/yx/bx/xx/Sx/xOe/bOe）(29752)
 *  光束动画族：
 *   ABt  → BeamBorderAnimation       光束描边动画容器 (157550)
 *   OBt  → useSystemThemePreference  prefers-color-scheme 侦听 (— / 131093)
 *   kBt  → resolveBeamTheme          auto → 系统主题 (— / 131104)
 *   wBt  → generateBeamCss           尺寸分派 (— / 130367)
 *   TBt  → generateBeamCssSm         旋转 conic 描边 (— / 130373)
 *   EBt  → generateBeamCssMd         旋转 conic + 边缘渐隐 (— / 130593)
 *   DBt  → generateBeamCssLine       行波 travel/spike 动画 (— / 130825)
 *   fBt/pBt → smBorderGradients/smInnerGradients (— / 129454/129458)
 *   mBt/hBt → mdBorderGradients/mdInnerGradients (— / 129462/129466)
 *   gBt  → resolveSpikePalette       (— / 129475)
 *   H8   → withAlpha                 rgb()/rgba() → 指定 alpha (— / 129920)
 *   vBt  → lineStrokeGradients       (— / 129929)
 *   bBt  → lineInnerGradients        (— / 130159)
 *   SBt  → lineBloomGradients        (— / 130327)
 *   CBt  → lineBloomMonoGradients    (— / 130349)
 *   uBt  → BEAM_SIZE_PRESETS         sm/md/line 圆角与描边宽 (— / 128919)
 *   B8   → BEAM_THEME_PARAMS         尺寸×主题 不透明度/内阴影/饱和 (— / 128935)
 *   V8   → MD_BEAM_PALETTES          md 边框/尖峰色板 (— / 128990)
 *   dBt  → SM_BEAM_PALETTES          sm 边框/内部色板 (— / 129180)
 *   _Bt  → LINE_STROKE_PALETTES      line 描边色板（主题×变体）(— / 129479)
 *   yBt  → LINE_INNER_PALETTES       line 内部色板 (— / 129940)
 *   xBt  → LINE_SPIKE_PALETTES       line 尖峰色板 (— / 130168)
 *  列表段：
 *   lLt  → ArchivedTasksSection      归档任务段 (146823)
 *   mLt  → WebRemoteTaskListSection  Web 远控任务列表段 (147286)
 *   uLt  → WebRemoteTaskRow          远控任务行 (— / 122425)
 *   aPt  → useWebRemoteTaskSwitcher  远控打开/切换状态钩子 (— / 116882)
 *   iPt  → openWebRemoteTask         远控任务打开流程 (— / 116801)
 *   dLt  → WEB_REMOTE_RETRY_DELAY_MS = 300 (— / 122539)
 *   fLt  → WEB_REMOTE_MAX_RETRIES = 3      (— / 122540)
 *   pLt  → waitRetryDelay            (— / 122541)
 *   DPt  → buildWebRemoteTaskViewModel 视图模型（pinned/groups/timeline/archived）(— / 117181)
 *   TPt  → groupTasksByWorkspace     (— / 117155)
 *   EPt  → taskMatchesSearch         (— / 117146)
 *   _6   → filterTasksBySearch       (— / 117149)
 *   g6   → sortTaskRows              (— / 117120)
 *   SPt  → taskRowComparator         (— / 117117)
 *   CPt  → sameTaskRef               (— / 117126)
 *   wPt  → applyRemoteTaskMembership (— / 117128)
 *   _Pt  → filterRemoteCapableWorkspaces (— / 117029)
 *   gPt  → isRemoteCapableWorkspace  (— / 117026)
 *   vPt  → shouldRetryEmptyRemoteIndex (— / 117035)
 *   h6   → mapRemoteTasksToRows      (— / 117063)
 *   xPt  → resolveTaskDisplayStatus  (— / 117053)
 *   mPt  → isStreamingDisplayStatus  (— / 117049)
 *   hPt  → isRunningRuntimeStatus    (— / 117051)
 *   bPt  → normalizeRuntimePhase     (— / 117043)
 *   f6   → webRemoteTaskKey          `${workspaceKey}:${taskId}` (— / 116795)
 *   ei   → taskWorkspaceKey          identity?.trim() || path（Io 的任务对象形态）
 *   sLt  → cleanupDeletedTaskState   (— / 122284)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk；标注来源 chunk）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() (Z)                       utils-CEEH0K_K.js
 *  3. Button (X) / 图标工厂           button-laUijeDG.js
 *  4. useIntlContext (G)             IntlProvider-C321H7m8.js
 *  5. Tooltip (Ia)                   usageStatsUiParts-CiR7YEhh.js
 *  6. logger (J)                     logger-PFDwl5Yq.js
 *  7. useTaskStore (xe) / getWorkspaceSlice (fe)   skillStore-BmeKHDBI.js
 *  8. 会话注册/搜索/路由 store (Zs/Vo/A2)           src-HCld2afU.js
 *  9. useConfirmDialog (U2) / applyOptimisticTaskMutation (Uo)  已在 TopBar.tsx 还原
 * 10. useTaskListItems (ZS) / buildWorkspaceServicesMap (yc) / useScopedWorkspaceTabs (J3)
 *                                    src-HCld2afU.js（接口声明，见 §0）
 * 11. 用量域 F12（JM/xn/qq/hX/q/Uq/dr/TY/pX/Mrt/$j/rM/Oq/PCt）  接口声明，见 §0
 *     〔A1-R23〕Oq 叠层专项：resolveUsageState declare 删除，改接 Home §U.3 resolveCodingPlanUsageRemaining
 *     逐字真身（bundle Oq 76207–76245 唯一真身；消费三面 76250/76296/150396，本文件 mRt 调用点 996 即 150396 面）
 * ============================================================================
 */

import * as React from "react";
import { Smartphone as IconSmartphone, Cloud as IconCloud, Folder as IconFolder, FolderOpen as IconFolderOpen, CloudUpload as IconCloudUpload, ArchiveRestore as IconArchiveRestore, Archive as IconArchive, Pin as IconPin, Loader as IconLoader, ChevronDown as IconChevronDown, MessageCirclePlus as IconMessageCirclePlus } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { Button, ChevronRight as IconChevronRight } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk；A0-S3b 增补：ChevronRight as IconChevronRight（button chunk 图标，pass-1 同源）
import { workspaceKeyOf } from '../../modules/CodeViewer';
import { toast } from '../../modules/ImeComposition';
import { RemoteSyncingRow, TaskListLoadingRow, taskChangeSummary } from '../../modules/Sidebar'; // 〔A1-P3-B11〕+taskChangeSummary（原 vg declare 收敛改指，墓碑见 @352；消费面 3170 逐字不变）。环安全：本→modules/Sidebar 边既有，拓扑零变
import { logger, useTaskStore } from '../../modules/SkillStore';
import { taskEntityKey, mergeMetaPreservingActivity as mergeTaskWithActivity, compareTasksActiveFirst as compareTasksForList } from '../../modules/StoresDeep'; // +mergeTaskWithActivity/compareTasksForList（A1-R10 2e：原 Po（1324）/Lie（1353）declare 改指 canonical——helpers mergeMetaPreservingActivity/compareTasksActiveFirst 逐字；调用点 1233/1248/3537 逐字不变）
import { applySearchTaskMutation as applyOptimisticTaskMutation } from '../../stores/searchResultsStore'; // A1-R10 2e：原 Uo（1895）declare 改指 canonical = R9 shim；调用点 3227 逐字不变。环安全：shim 值闭包（QuickPick/helpers/taskStore/zustand）不达 components/shell（QuickPick 导入面实测无 shell 边）
import { baseName as workspaceBaseName } from '../../modules/MarkdownIntegration'; // A1-R10 2e：原 Go（1928）declare 改指 canonical = components/markdown baseName 逐字；调用点 3124/3154 逐字不变。环安全：MarkdownIntegration 闭包不达 components/shell（实测在案）
import { useSearchResultsStore, type SearchResultsState } from '../../modules/QuickPick'; // A1-R10 项 1a：原 Vo（bundle 1553）declare 改指 canonical = QuickPick 1254 区（A1-R9 收敛完成；modules/QuickPick 为再导出 shim，QuickPickDeep 同源先例）。环安全：QuickPick 值闭包（modules/ImeComposition/SkillStore/StoresDeep/services/stores-core 族 + components/ui）不达 components/shell
import { normalizeSearchDescriptor as buildTaskListQueryDescriptor, descriptorCacheKey as queryDescriptorKey, type SearchDescriptor } from '../../stores/searchResultsHelpers'; // A1-R10 项 1a：原 zie/Bie（bundle 1385/1396）declare 改指 canonical（searchResultsHelpers 逐字转录在案）；入参 workspaceScopes → 出参 workspaceKeys 真形（1386–1395 实测）。环安全：helpers 值闭包 = react + stores/taskStore，不达 components/shell
import { useBaseServices } from '../../modules/services';
import { useSessionRegistryStore, type BaseServices } from '../../modules/stores-core'; // BaseServices：buildScopedServices 实参形
import { formatRelativeTime } from '../../modules/SidePanel'; // $S
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js）
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // 原 Ia（A0-CLEANUP 族清理：本地 Tooltip declare 改指 InfoTooltip）
import { resolveCodingPlanUsageRemaining as resolveUsageState, resolveUpgradeTargetSource, type CodingPlanUsageViewLike, type EntitlementSnapshotLike } from '../../modules/Home'; // 〔A1-R23〕Oq 叠层专项：原 resolveUsageState declare（Oq）删除，改接 Home §U.3 逐字真身（经 modules/Home 转导出，本目录无 './Home' 直连先例）。环安全：resolveCodingPlanUsageRemaining 为 Home 顶层 hoisted function，仅 useSidebarUsageState 渲染期调用；型别导入全擦除。〔A1-R26〕+resolveUpgradeTargetSource（Mrt 89154 实体化，本文件 932 消费面 ≡ bundle 150329）
import { readTaskIndexShard as fetchTaskIndex, applySessionRuntimeToIndexItems as hydrateTaskIndex } from './TaskIndexCore';
import { type MobileHomeResult, type WebRemoteSwitcherService, type WebRemoteWorkspaceInfo } from '../remote/WebRemote'; // 〔A1-R52〕switcher 族属主闭合：消费面三本地型（WebRemoteWorkspace/WebRemoteTaskIndex/WebRemoteSwitcher）删碑改指生产面（六点分叉表闭合，A1-P2-B9.report.md §四）。环安全：type-only 导入全擦除，WebRemote 值闭包（ui/modules 族）不达 SidebarLeaves // 〔A1-P3-B3〕原 fetchTaskIndex declare（Cx）改指逐字 canonical = TaskIndexCore.readTaskIndexShard（styles 32476，A1-P3-B2 转录）；调用点 1524 逐字不变。环安全：TaskIndexCore 顶层全函数/var 声明，值闭包不达 SidebarLeaves
import { joinTestidParts } from '../../modules/SrcSharedB'; // 〔A1-P3-B11〕原 scopedTestId（qr/Nb 局部转录）收敛改指 canonical（墓碑见 @361）；消费面 3724/3783。环安全：SrcSharedB 为共享导出叶，无反向 components/shell 边（Sidebar.tsx@220 同边先例）

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上述 chunk；此处为重建接口）
 * ==========================================================================*/


/** react-intl 风格 intl 对象（原 G()，IntlProvider-C321H7m8.js） */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): { intl: IntlShape; locale: string };

/** 日志器（原 J，logger-PFDwl5Yq.js） */

/** toast（原 m，imeComposition chunk） */

/* ── tombstone（A0-CLEANUP 族清理）：Button（原 X）declare 删除 → import { Button } from './button'；
   Tooltip（原 Ia）declare 删除 → import { InfoTooltip as Tooltip } from './UsageStatsUiParts'。 ── */

/** 图标（lucide 风格；原图标块 + button chunk 导出） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（7）：IconSmartphone/IconCloud/IconFolder/IconFolderOpen/IconCloudUpload/IconArchiveRestore/IconArchive → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconX: React.FC<React.SVGProps<SVGSVGElement>>; // Kv
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（5）：IconPin/IconLoader/IconChevronRight/IconChevronDown/IconMessageCirclePlus → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/* ---- store / 横切助手（src-HCld2afU.js / skillStore-BmeKHDBI.js） ---- */

interface WorkspaceTab {
  id: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  label?: string;
  workspacePurpose?: "conversation" | "project" | string;
  kind?: "local" | "remote" | string;
  remoteTarget?: {
    kind: "ssh" | "wsl" | "docker" | "server";
    host?: string;
    port?: number;
    username?: string;
    sshConfigAlias?: string;
  } | null;
  remoteSessionId?: string | null;
  [key: string]: unknown;
}
type TaskSortBy = "created" | "updated"; // A1-R10 精化：原 "updated"|"created"|"manual"|string 宽面 → bundle 真形二值（Iie@1456 `n === "created"`、140393/140601 消费面实测；与 Sidebar 334 同形）
interface TaskMeta {
  taskId: string;
  title: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  archived?: boolean;
  unreadAt?: number | null; // A1-R10 2e 精化：补 null 支 = canonical 真形（store 以 null 清未读；本地消费 3390/3574/3713 皆真值/typeof 判定，兼容）
  provider?: string | null; // A1-R10 2e 精化：补 null 支 = canonical 真形（本地无 .provider 消费点，零影响）
  workspaceLabel?: string;
  workspaceKind?: "local" | "remote" | string;
  remoteSessionId?: string;
  displayStatus?: string;
  status?: string;
  changeStat?: { added: number; removed: number } | null;
  [key: string]: unknown;
}

/** 任务作用域 store（原 xe，skillStore chunk） */
interface TaskStoreState {
  [key: string]: unknown;
}
/** 工作区切片（原 fe）：taskListVersion 等 */
declare function getWorkspaceSlice(state: TaskStoreState, workspacePath: string, workspaceIdentity?: string | null): {
  taskListVersion: number;
  selectedSupplierKey?: string | null;
  [key: string]: unknown;
};
declare function clearPromotedGroupedDraftTaskSelector(state: TaskStoreState): (
  workspacePath: string,
  taskId: string,
  workspaceIdentity?: string | null,
) => void;

/** 会话注册 store 选择器（原 Zs） */
interface SessionRegistryState {
  sessionsById: Record<string, SessionRecord | undefined>;
  sessionIdByWorkspaceIdentity: Record<string, string | undefined>;
  sessionIdByWorkspacePath: Record<string, string | undefined>;
}
interface SessionRecord { [key: string]: unknown }

/** 搜索结果 store（原 Vo）：任务元数据缓存与失效 */
/* ── tombstone（A1-R10）：本地 SearchResultsState 近似面 + useSearchResultsStore
 *    declare 删除，改经文件头真实 import（../../modules/QuickPick canonical，
 *    A1-R9 收敛完成）。R8/R9 留批型缝已按 bundle 真形消解：本簇消费面
 *    （559–562/775 = bundle 144478–144481 簇）传入之描述符实为 zie 出参
 *    （workspaceKeys 真形，bundle 1386–1395），非本地旧面之 workspaceScopes；
 *    SearchDescriptor 精化（kind/sortBy 收窄，见 searchResultsHelpers A1-R10 注）
 *    后与 canonical QueryDescriptor 结构一致，setQueryResults 缝合通过。 ── */

/** 基础服务（原 Ec）：当前窗口的 WorkspaceServices */
interface ZCodeTaskServiceLike {
  listGroupedTaskViewStructure(args: { workspaceScopes: WorkspaceScope[] }): Promise<GroupedViewStructure>;
  createTaskGroup(): Promise<TaskGroup>;
  renameTaskGroup(args: { groupId: string; title: string; workspaceScopes: WorkspaceScope[] }): Promise<TaskGroup>;
  updateTaskGroupColor(args: { groupId: string; color: GroupColor; workspaceScopes: WorkspaceScope[] }): Promise<TaskGroup>;
  deleteTaskGroup(args: { groupId: string; workspaceScopes: WorkspaceScope[] }): Promise<void>;
  applyGroupedTaskViewOrder(payload: SerializedGroupedOrder): Promise<void>;
  onDynamicWorkspaceEvent(scope: WorkspaceScope): (cb: (event: DynamicWorkspaceEvent) => void) => { dispose(): void };
  unarchiveTask(args: { taskId: string; workspacePath: string; workspaceIdentity?: string }): Promise<TaskMeta>;
  deleteTask(args: { taskId: string; workspacePath: string; workspaceIdentity?: string }): Promise<void>;
  archiveTask(args: { taskId: string; workspacePath: string; workspaceIdentity?: string }): Promise<void>;
  setTaskPinned(args: { taskId: string; workspacePath: string; workspaceIdentity?: string; pinned: boolean }): Promise<void>;
  [key: string]: unknown;
}
interface WorkspaceServices {
  zcodeTaskService: ZCodeTaskServiceLike;
  zcodeAgentService: unknown;
  zcodeSessionService: unknown;
  commandsService: unknown;
  mcpSyncService: unknown;
  skillsService: unknown;
  [key: string]: unknown;
}

/** 会话打开/水合助手（原 gc/_c/vc，jsx 3614–3621）——〔A1-P3-B4〕留批：canonical 已定位 =
 *  WorkspaceTabsDeep resolveTabRemoteSessionId/tabHasRemoteBacking/resolveTabServicesBinding
 *  （styles 4814/4822/4825，语义重建），运行时同形；惟 canonical 参数形为全量
 *  SessionRegistryState，本叶调用面传三字段快照（下方 SessionRegistrySnapshot），型面不接，
 *  需 canonical 侧参数放宽或快照型归一后改指（证据见 A1-P3-B4.report.md §七）。 */
declare function resolveRemoteSessionId(tab: WorkspaceTab, registry: SessionRegistrySnapshot): string | null;
declare function isRemoteWorkspace(tab: WorkspaceTab, remoteSessionId: string | null): boolean;
declare function buildScopedServices(
  scope: WorkspaceScope & { remoteSessionId?: string | null },
  services: BaseServices, // 实参为 useBaseServices() 返回形；返回分片按 WorkspaceServices 收敛
  registry: SessionRegistrySnapshot,
): { services: WorkspaceServices; remoteSessionId?: string | null } | null;
interface SessionRegistrySnapshot {
  sessionsById: SessionRegistryState["sessionsById"];
  sessionIdByWorkspaceIdentity: SessionRegistryState["sessionIdByWorkspaceIdentity"];
  sessionIdByWorkspacePath: SessionRegistryState["sessionIdByWorkspacePath"];
}

/** 任务列表查询描述符与键（原 zie/Bie，jsx 425/436） */
/* ── tombstone（A1-R10）：本地 TaskListQueryDescriptor 近似面 +
 *    buildTaskListQueryDescriptor/queryDescriptorKey declare 删除，改经文件头
 *    真实 import 别名改指（searchResultsHelpers normalizeSearchDescriptor/
 *    descriptorCacheKey，原 zie/Bie 逐字转录）。bundle 真形：zie 入参含
 *    workspaceScopes、出参为 workspaceKeys 归一面（1386–1395）；本地旧面
 *    出入同形（皆 workspaceScopes）属 A0 近似误差。消费面 605/620 逐字不变。 ── */

/** 会话水合（原 JS，jsx 32603）：任务行 + 水合中的端点键 + 作用域修订号 */
declare function useSessionItems(scopes: Array<WorkspaceScope & { remoteSessionId?: string }>): {
  items: SessionItem[];
  hydratingEndpointKeys: string[];
  sourceRevisionByScopeKey: Record<string, string | undefined>;
};
interface SessionItem { [key: string]: unknown }

/** 成员版本（原 dx，jsx 29595）/ 作用域刷新（原 Ho，jsx 949） */
declare function useMembershipVersion(): number;
declare function invalidateTaskScopes(scopes: WorkspaceScope[]): void;

/** 乐观叠加（原 OFt，120063）：workspaceKey → 叠加层 Map */
interface OptimisticTaskOverlay {
  tasks: TaskMeta[];
  activeTaskId?: string | null;
  promotedGroupedDraftTaskByTaskId?: Record<string, { workspacePath: string; workspaceIdentity?: string | null; placement: { type: "top" } | { type: "group"; groupId: string } }>;
}
declare function useOptimisticTaskOverlays(workspaceTabs: WorkspaceTab[]): Map<string, OptimisticTaskOverlay>;

/** 远端就绪（原 jFt，120094） */
declare function memoJson(value: unknown): string;

/** 分片抓取（原 RFt，120168） */
declare function fetchWorkspaceTaskShards(args: {
  service: ZCodeTaskServiceLike;
  scopes: WorkspaceScope[];
  sessions: SessionItem[];
  sortBy: TaskSortBy;
  membershipCacheKey: string;
}): Promise<Map<string, { workspacePath: string; workspaceIdentity?: string | null; items: TaskMeta[]; total: number; hasMore: boolean; unreadTaskKeys: string[] }>>;

/** 作用域缓存键（原 $Ae，jsx 32582） */
declare function workspaceScopeCacheKey(scope: WorkspaceScope): string;

/** 作用域差异（原 zFt，120215）/ 分片指纹（原 BFt，120223） */
declare function diffTaskScopes(previous: TaskMeta[], next: TaskMeta[]): Set<string>;
declare function shardFingerprint(shards: WorkspaceTaskShard[]): string;

/** 动态事件助手（原 px/rx/ux，jsx 29621/29553/29582） */
declare function handleIncrementalWorkspaceEvent(args: { event: DynamicWorkspaceEvent; service: ZCodeTaskServiceLike }): void;
declare function requiresFullRefresh(event: DynamicWorkspaceEvent): boolean;
declare function invalidateWorkspaceEvent(event: DynamicWorkspaceEvent): void;

/** 确认对话框（原 U2，TopBar.tsx 已还原） */
declare function useConfirmDialog(): (args: { title: string; description?: string; confirmLabel?: string }) => Promise<boolean>;

/* ── tombstone（A1-R10 2e）：declare function applyOptimisticTaskMutation（原 Uo，1895）删除，
 *    改经文件头 stores/searchResultsStore import 消费（canonical = applySearchTaskMutation；
 *    3227 调用点逐字不变）。 ── */

/** 任务列表数据钩子（原 ZS，jsx 32810；接口级，Sidebar.tsx 已声明） */
declare function useTaskListItems(args: {
  kind: "archived" | "pinned" | "timeline" | "workspace";
  workspaceTabs: WorkspaceTab[];
  sortBy: TaskSortBy;
  searchQuery: string;
  expanded: boolean;
  collapsedLimit: number;
}): { items: TaskMeta[]; total: number; loading: boolean; syncingRemoteWorkspaces: boolean };

/** 工作区服务映射（原 yc，jsx 3637） */
declare function buildWorkspaceServicesMap(
  tabs: WorkspaceTab[],
  services: BaseServices, // 实参为 useBaseServices() 返回形；分片值按 WorkspaceServices 收敛
  registry: SessionRegistrySnapshot,
): Map<string, { services: WorkspaceServices }>;

/** 横切展示助手（Sidebar.tsx 同族已还原） */
/* ── tombstone〔A1-P3-B11〕：declare taskChangeSummary（vg）删除 → 改指 Sidebar@397 逐字真身（原 vg jsx 20317 ≡ bundle 23753–23755），经 modules/Sidebar 转导出（@120 导入面扩展）；
 *    消费面 @3170 逐字不变；declare 期窄返型 {added,removed} 为 canonical TaskChangeSummary 富面所涵（消费仅读 added/removed @3220）。 ── */
/* ── tombstone（A1-R10 2e）：declare workspaceBaseName（Go 1928）/mergeTaskWithActivity（Po 1324）删除，
 *    改经文件头 import 消费（canonical = components/markdown baseName 逐字 / helpers mergeMetaPreservingActivity
 *    逐字；调用点 3124/3154 与 1233/1248 逐字不变；本地 TaskMeta.unreadAt 同步精化 number | null）。 ── */
declare function activityOverlayOf(task: TaskMeta, overlay: TaskMeta): TaskMeta; // ee ——〔A1-P3-B11〕真身普查闭合：styles 378 `G as ee` ← skillStore-BmeKHDBI 2489 `y as G` ← y@141–159 ≡ taskStore.mergeTaskMeta@256（原 y jsx 134，逐字同构）；改指未行 = 型缝：mergeTaskMeta 返型 taskStore.TaskMeta（changeSummary?: unknown、无索引签名）不纳 mergeTaskWithActivity 次参（Partial<helpers.TaskMeta> & Record<string,unknown>）——候 A0 型面裁定（泛型/宽化），登记

/** 加载行 / 远控同步行（Sidebar.tsx 已还原） */

/* ── tombstone〔A1-P3-B11〕：scopedTestId（原 qr/Nb 局部转录，src-HCld2afU.js 8464）删除 → 一符一家收敛 SrcSharedB@5015
 * joinTestidParts（qr 真身链：styles 601 `Xa as qr` ← src 9836 `Nb as Xa` ≡ Nb js 8464，逐字 `${e}-${t}`，R41 既判；本件与 canonical 逐字同形）。
 * 消费面实测 2 处改名改指：@3723（≡ bundle 147180）/@3782（≡ 147265），均在原 uLt（147124）远控任务行体内；导入面 @134 新增。 ── */
/* ── tombstone〔A1-P3-B11〕：TESTID_WEB_REMOTE_TASK_OPEN = "web-remote-task-open" 删除——A0 期值误：bundle 147180 实为
 * qr(An, p.taskId)，An = chunk 导入 `Mi as An`（styles 523）← taskItemTestid ≡ X_ = `task-item`（src 8319）；"web-remote-task-open" 串双 chunk 零命中（负证据）。 ── */
const TESTID_TASK_ITEM = "task-item"; // 原 An ← Mi ← X_（src 8319）〔A1-P3-B11〕
const TESTID_TASK_ARCHIVE = "task-archive"; // 原 et ← Ai ← Q_（src 8321）

/** 删除归档任务后的状态清理（原 sLt，122284；依赖 xe.getState / rae） */
declare function cleanupDeletedTaskState(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  taskId: string;
}): void;

/* ---- 用量域 F12（mRt 依赖；接口级声明） ---- */

interface SettingsSnapshot {
  providerFamilyDomain?: string | null;
  modelProviderFamilySelectedKeys?: { bigmodel?: string | null };
  [key: string]: unknown;
}
declare function useSettingsContext(): { settings: SettingsSnapshot | null };
declare function resolveProviderFamilyDomain(domain: string | null | undefined): string; // xn
declare function useModelProviders(): { modelProviders: unknown[]; loading: boolean }; // qq
declare function normalizeCodingPlanProviders(providers: unknown[]): CodingPlanProvider[]; // hX
interface CodingPlanProvider { id: string; name?: string; [key: string]: unknown } // 〔A1-R23〕型缝：+name——Home Oq 入参面 Array<{ id; name? }>（bundle Oq body 仅读 e.id/e.name）
declare const PROVIDER_IDS: { zaiCodingPlan: string; bigmodelCodingPlan: string }; // q
declare function resolveSelectedSupplierKey(key: string | null | undefined): string | null; // Uq（与 WorkspaceShell kJt 同名异函数：此处为供应商键前缀解析）
declare function supplierProviderId(key: string): string | null; // dr
declare function useTeamProducts(args: { enabled: boolean; authenticated: boolean }): {
  snapshot: { productList: Array<{ subscribed?: boolean; [key: string]: unknown }> } | null;
  loading: boolean;
}; // TY
declare function resolveTeamSources(args: {
  activeCodingPlanProviderIds: string[];
  availableCodingPlanProviders: CodingPlanProvider[];
  subscribedTeamProducts: Array<{ [key: string]: unknown }>;
}): TeamSource[]; // pX
interface TeamSource { id: string; providerId: string; label?: string; organizationId?: string; projectId?: string; [key: string]: unknown }
/* ── tombstone（A1-R26）：declare resolveUpgradeTargetSource（原 Mrt，89154–89170）删除 →
 *    文件头 ../../modules/Home import 改接（canonical = Home §U.5 逐字真身，bundle Mrt 唯一真身；
 *    终端消费实测：本文件 932 ≡ bundle 150329；负证据：bundle 内 Mrt 无第二定义）。
 *    调用点逐字不变；型缝：真身参型/返回面按消费面推导（下游 960–996 兼容实测）。 ── */
declare function useCodingPlanEntitlement(args: {
  enabled: boolean;
  includeSubscription: boolean;
  preferredProviderId: string;
  allowDisabledPreferredProvider: boolean;
  requirePreferredProvider: boolean;
  allowEnvApiKey: boolean;
  organizationId?: string;
  projectId?: string;
  cacheKey?: string | null;
}): { snapshot: PlanEntitlementSnapshot | null; loading: boolean }; // $j
// 〔A1-R23〕型缝：原 `interface PlanEntitlementSnapshot { [key: string]: unknown }` 收敛为 Home EntitlementSnapshotLike 别名——
// Oq 76207 入参面 snapshot?: EntitlementSnapshotLike | null（Home §U.3 逐字）；本型原形仅索引签名，别名后结构兼容（含索引签名）
type PlanEntitlementSnapshot = EntitlementSnapshotLike;
declare function entitlementCacheKey(provider: CodingPlanProvider | null | undefined): string | null; // rM
declare function resolveProfilePlanAudience(args: {
  hasTeamPlanEntitlement: boolean;
  individualEntitlements: Array<{ snapshot: PlanEntitlementSnapshot | null; providerId: string; loading?: boolean }>;
  teamEntitlementLoading: boolean;
}): { audience: "individual" | "team"; snapshot?: PlanEntitlementSnapshot } | null; // uRt
/* 墓碑（A1-R23 · Oq 叠层专项裁定，R21 模式直接套用）：原 `declare function resolveUsageState(args: {
 *   availableProviders: CodingPlanProvider[]; entitlements: ProviderEntitlement[];
 *   modelProvidersLoading: boolean; selectedProviderId: string | null;
 * }): { hasAnyActiveCodingPlan: boolean; [key: string]: unknown } | null; // Oq`
 * 删除。证据链：bundle Oq 唯一真身 76207–76245（grep 全 bundle 仅一处定义）；消费三面——
 * 76250（i3e = !!Oq(e)）、76296（Home §V 族）、150396（mRt useSidebarUsageState，即本文件下方调用点）；
 * 树内逐字真身 = Home §U.3 resolveCodingPlanUsageRemaining（A1-R19 转录，机械校验器在证，覆盖 76250/76296 两面）。
 * 本批改经顶部 `import { resolveCodingPlanUsageRemaining as resolveUsageState } from '../../modules/Home'` 接线，调用点逐字不变。
 * 同批删除的并行副本：components/usage/UsageDeep resolvePlanWidgetModel（同异取证：body ≡ Oq，判同身）。 */
declare function fallbackProviderId(domain: string): string | undefined; // PCt

interface ProviderEntitlement {
  sourceId: string;
  providerId: string;
  label?: string;
  snapshot: PlanEntitlementSnapshot | null;
  loading: boolean;
}

/* ---- 分组视图共享类型（与 Sidebar.tsx 同口径） ---- */

type GroupColor = "gray" | "red" | "orange" | "yellow" | "green" | "blue" | "purple" | string;
interface TaskGroup {
  id: string;
  title: string;
  color: GroupColor;
  createdAt: number;
  updatedAt?: number;
  [key: string]: unknown;
}
interface GroupedViewNodeGroup { type: "group"; group: TaskGroup; tasks: TaskMeta[]; sortOrder?: number }
interface GroupedViewNodeTask { type: "task"; task: TaskMeta; sortOrder?: number }
type GroupedViewNode = GroupedViewNodeGroup | GroupedViewNodeTask;
interface GroupedView { nodes: GroupedViewNode[] }
interface WorkspaceScope {
  workspacePath: string;
  workspaceIdentity?: string | null;
  workspacePurpose?: string;
}
interface GroupedViewStructure {
  groups: TaskGroup[];
  members: Array<{ groupId: string; workspacePath: string; workspaceIdentity?: string | null; taskId: string; sortOrder: number | null; addedAt?: number }>;
  topLevelOrders: Array<({ type: "group"; groupId: string } | { type: "task"; workspaceKey: string; taskId: string }) & { sortOrder: number }>;
}
interface TaskIndexResult {
  taskIndexItems: TaskMeta[];
  pinnedIds: Set<string>;
  archivedIds: Set<string>;
  deletedIds: Set<string>;
  unreadAtByTaskId: Map<string, number>;
  terminalStatusByTaskId: Map<string, string>;
  titleOverrideByTaskId: Map<string, string>;
  cronAutomationIdByTaskId: Map<string, string>;
}
/* ── tombstone（A1-P3-B3）：declare function fetchTaskIndex（原 Cx，styles 32476）删除，
 *    改经文件头 ./TaskIndexCore import 消费（canonical = readTaskIndexShard，A1-P3-B2 逐字转录；
 *    1524 调用点逐字不变）。TaskIndexResult 接口留存（1510 GroupedViewLoadCache 泛型消费）。 ── */
interface DynamicWorkspaceEvent {
  type: string;
  reason?: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  [key: string]: unknown;
}
interface SerializedGroupedOrder {
  workspaceScopes: WorkspaceScope[];
  topLevelNodes: Array<
    | { type: "group"; groupId: string }
    | { type: "task"; task: { workspacePath: string; workspaceIdentity?: string | null; taskId: string } }
  >;
  groups: Array<{ groupId: string; taskRefs: Array<{ workspacePath: string; workspaceIdentity?: string | null; taskId: string }> }>;
}

/** 组排序步长（原 URt） */
const GROUP_ORDER_STEP = 1000;

/* ============================================================================
 * 1. 原 VFt（144427 / 120229）：useWorkspaceTaskGroups —— 项目视图数据层
 *    本地查询描述符 + 远端会话水合 + 分片抓取 + 乐观叠加合成；
 *    订阅 workspace_task_list_changed 做增量/全量刷新。
 * ==========================================================================*/

/** 原 W6（144363 / 120160）：工作区加载标记映射（keys → true；等长同值时保持引用） */
function workspaceLoadingFlags(current: Record<string, boolean>, keys: string[]): Record<string, boolean> {
  const unique = [...new Set(keys)];
  return Object.keys(current).length === unique.length && unique.every((k) => current[k] === true)
    ? current
    : Object.fromEntries(unique.map((k) => [k, true]));
}
/** 原 FFt（144351）：读取可见条数限制（下限 n，默认 5） */
export function readVisibleLimit(map: Record<string, number>, key: string, defaultLimit = 5): number {
  const value = map[key];
  return typeof value === "number" && Number.isFinite(value) ? Math.max(defaultLimit, Math.floor(value)) : defaultLimit;
}

interface WorkspaceTaskQueryConfig {
  scope: WorkspaceScope;
  workspaceKey: string;
  remoteSessionId: string | null;
  isRemoteWorkspace: boolean;
  visibleLimit: number;
  descriptor: SearchDescriptor; // A1-R10：zie 出参真形（原本地 TaskListQueryDescriptor 已删碑）
  queryKey: string;
}
interface WorkspaceTaskShard {
  shardKey: string;
  services: WorkspaceServices;
  configs: WorkspaceTaskQueryConfig[];
}
interface WorkspaceTaskGroup {
  workspacePath: string;
  workspaceIdentity?: string | null;
  items: TaskMeta[];
  total: number;
  hasMore: boolean;
  hasUnread: boolean;
}
interface WorkspaceTaskQueryResult {
  queryKey: string;
  descriptor: SearchDescriptor; // A1-R10：zie 出参真形；与 canonical SetQueryResultArgs.descriptor（QueryDescriptor 同构）缝合
  items: TaskMeta[];
  total: number;
  hasMore: boolean;
  unreadTaskKeys: string[];
  expectedInvalidationVersion?: number;
}

export function useWorkspaceTaskGroups(args: {
  workspaceTabs: WorkspaceTab[];
  activeWorkspacePath: string;
  activeWorkspaceIdentity?: string | null;
  sortBy: TaskSortBy;
  visibleLimitByWorkspaceKey: Record<string, number>;
  defaultVisibleLimit: number;
}): {
  groups: WorkspaceTaskGroup[];
  loadingByWorkspaceKey: Record<string, boolean>;
  refresh: () => Promise<void>;
} {
  const baseServices = useBaseServices();
  const sessionsById = useSessionRegistryStore((s) => s.sessionsById);
  const sessionIdByWorkspaceIdentity = useSessionRegistryStore((s) => s.sessionIdByWorkspaceIdentity);
  const sessionIdByWorkspacePath = useSessionRegistryStore((s) => s.sessionIdByWorkspacePath);
  const registry = React.useMemo(
    () => ({ sessionsById, sessionIdByWorkspaceIdentity, sessionIdByWorkspacePath }),
    [sessionIdByWorkspaceIdentity, sessionIdByWorkspacePath, sessionsById],
  );
  const setQueryResults = useSearchResultsStore((s) => s.setQueryResults);
  const resultsByQueryKey = useSearchResultsStore((s) => s.resultsByQueryKey);
  const taskMetaByEntityKey = useSearchResultsStore((s) => s.taskMetaByEntityKey);
  const taskUnreadOverlayByEntityKey = useSearchResultsStore((s) => s.taskUnreadOverlayByEntityKey);

  const inflightRef = React.useRef<null | { requestId: number; signature: string; activityRevision: string; membershipVersion: number }>(null);
  const requestSequenceRef = React.useRef(0);
  const staleFlagRef = React.useRef(false);
  const previousGroupsRef = React.useRef(new Map<string, { items: TaskMeta[]; total: number }>());

  const taskListVersionJson = useTaskStore((state) =>
    memoJson(
      args.workspaceTabs.map((tab) => [
        workspaceKeyOf(tab.workspacePath, tab.workspaceIdentity),
        getWorkspaceSlice(state, tab.workspacePath, tab.workspaceIdentity).taskListVersion,
      ]),
    ),
  );
  const optimisticOverlays = useOptimisticTaskOverlays(args.workspaceTabs);
  const versionByWorkspaceKey = React.useMemo(() => new Map(JSON.parse(taskListVersionJson) as Array<[string, number]>), [taskListVersionJson]);

  const remoteReadiness = React.useMemo(
    () =>
      memoJson(
        args.workspaceTabs.map((tab) => {
          const key = workspaceKeyOf(tab.workspacePath, tab.workspaceIdentity);
          const remoteSessionId = resolveRemoteSessionId(tab, registry);
          return { workspaceKey: key, remoteSessionId, ready: remoteSessionId ? !!sessionsById[remoteSessionId] : true };
        }),
      ),
    [args.workspaceTabs, registry, sessionsById],
  );

  const activeWorkspaceKey = React.useMemo(
    () => workspaceKeyOf(args.activeWorkspacePath, args.activeWorkspaceIdentity),
    [args.activeWorkspaceIdentity, args.activeWorkspacePath],
  );

  const queryConfigs = React.useMemo<WorkspaceTaskQueryConfig[]>(
    () =>
      args.workspaceTabs.map((tab) => {
        const scope: WorkspaceScope = { workspacePath: tab.workspacePath, workspaceIdentity: tab.workspaceIdentity };
        const remoteSessionId = resolveRemoteSessionId(tab, registry);
        const remote = isRemoteWorkspace(tab, remoteSessionId);
        const workspaceKey = workspaceKeyOf(scope.workspacePath, scope.workspaceIdentity);
        const visibleLimit = readVisibleLimit(args.visibleLimitByWorkspaceKey, workspaceKey, args.defaultVisibleLimit);
        const descriptor = buildTaskListQueryDescriptor({
          kind: "workspace",
          workspaceScopes: [scope],
          sortBy: args.sortBy,
          search: "",
          expanded: false,
          visibleLimit,
        });
        return {
          scope,
          workspaceKey,
          remoteSessionId,
          isRemoteWorkspace: remote,
          visibleLimit,
          descriptor,
          queryKey: `${queryDescriptorKey(descriptor)}::version=${versionByWorkspaceKey.get(workspaceKey) ?? 0}`,
        };
      }),
    [args.defaultVisibleLimit, args.sortBy, args.visibleLimitByWorkspaceKey, args.workspaceTabs, registry, versionByWorkspaceKey],
  );

  /** 按远端会话分片（同端点共享一次服务调用） */
  const shards = React.useMemo<WorkspaceTaskShard[]>(() => {
    const byEndpoint = new Map<string, { services: WorkspaceServices; configs: WorkspaceTaskQueryConfig[] }>();
    for (const config of queryConfigs) {
      const built = buildScopedServices({ ...config.scope, remoteSessionId: config.remoteSessionId }, baseServices, registry);
      if (!built) continue;
      const shardKey = built.remoteSessionId ?? "__base__";
      const shard = byEndpoint.get(shardKey) ?? { services: built.services, configs: [] };
      shard.configs.push(config);
      byEndpoint.set(shardKey, shard);
    }
    return [...byEndpoint.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([shardKey, value]) => ({ shardKey, services: value.services, configs: value.configs }));
  }, [baseServices, queryConfigs, registry]);
  const shardsRef = React.useRef(shards);
  shardsRef.current = shards;

  const shardSignature = React.useMemo(() => shardFingerprint(shards), [shards]);
  const agentEndpoints = React.useMemo(
    () =>
      shards.flatMap((shard) =>
        shard.configs.map((config) => ({
          workspacePath: config.scope.workspacePath,
          ...(config.scope.workspaceIdentity ? { workspaceIdentity: config.scope.workspaceIdentity } : {}),
          ...(shard.shardKey === "__base__" ? {} : { endpointKey: shard.shardKey }),
          agentService: shard.services.zcodeAgentService,
        })),
      ),
    [shards],
  );

  const { items: sessionItems, sourceRevisionByScopeKey } = useSessionItems(agentEndpoints);
  const membershipVersion = useMembershipVersion();
  const [loadingByWorkspaceKey, setLoadingByWorkspaceKey] = React.useState<Record<string, boolean>>({});
  const [retryTick, bumpRetryTick] = React.useState(0);

  /** 待抓取的查询：优先活动工作区，否则全部 stale */
  const pendingConfigs = React.useMemo(() => {
    const stale = queryConfigs.filter((config) => {
      const result = resultsByQueryKey[config.queryKey];
      return result == null || result.stale;
    });
    const active = stale.filter((config) => config.workspaceKey === activeWorkspaceKey);
    return active.length > 0 ? active : stale;
  }, [activeWorkspaceKey, queryConfigs, resultsByQueryKey]);

  const activityRevision = React.useMemo(
    () =>
      pendingConfigs
        .map((config) => {
          const key = workspaceScopeCacheKey({
            workspacePath: config.scope.workspacePath,
            ...(config.scope.workspaceIdentity ? { workspaceIdentity: config.scope.workspaceIdentity } : {}),
            ...(config.remoteSessionId ? { endpointKey: config.remoteSessionId } : {}),
          });
          return `${key}=${sourceRevisionByScopeKey[key] ?? "missing"}`;
        })
        .sort()
        .join("|"),
    [pendingConfigs, sourceRevisionByScopeKey],
  );

  const requestSignature = React.useMemo(
    () =>
      [
        args.sortBy,
        taskListVersionJson,
        remoteReadiness,
        `activity=${activityRevision}`,
        `membership=${membershipVersion}`,
        ...pendingConfigs.map(
          (config) =>
            `${config.workspaceKey}:${config.remoteSessionId ?? "base"}:limit=${config.visibleLimit}:${config.queryKey}:invalidation=${resultsByQueryKey[config.queryKey]?.invalidationVersion ?? 0}`,
        ),
      ].join("||"),
    [membershipVersion, pendingConfigs, args.sortBy, remoteReadiness, resultsByQueryKey, activityRevision, taskListVersionJson],
  );
  const signatureRef = React.useRef({ requestSignature, sessionsIndexRevision: activityRevision, membershipVersion });
  signatureRef.current = { requestSignature, sessionsIndexRevision: activityRevision, membershipVersion };

  const refresh = React.useCallback(async () => {
    if (pendingConfigs.length === 0) {
      if (inflightRef.current === null) setLoadingByWorkspaceKey((current) => workspaceLoadingFlags(current, []));
      return;
    }
    const inflight = inflightRef.current;
    if (inflight) {
      if (inflight.signature !== requestSignature) staleFlagRef.current = true;
      return;
    }
    const requestId = ++requestSequenceRef.current;
    const request = { requestId, signature: requestSignature, activityRevision, membershipVersion };
    inflightRef.current = request;
    const sessions = sessionItems;
    const expectedInvalidation = new Map(pendingConfigs.map((config) => [config.queryKey, resultsByQueryKey[config.queryKey]?.invalidationVersion ?? 0]));
    const missingKeys = pendingConfigs
      .filter((config) => {
        if (resultsByQueryKey[config.queryKey] != null) return false;
        const previous = previousGroupsRef.current.get(config.workspaceKey);
        return !previous || (previous.items.length === 0 && previous.total === 0);
      })
      .map((config) => config.workspaceKey);
    setLoadingByWorkspaceKey((current) => workspaceLoadingFlags(current, missingKeys));
    try {
      const pendingKeys = new Set(pendingConfigs.map((config) => config.queryKey));
      const results = (
        await Promise.all(
          shards.map(async (shard) => {
            const configs = shard.configs.filter((config) => pendingKeys.has(config.queryKey));
            if (configs.length === 0) return [];
            const fetched = await fetchWorkspaceTaskShards({
              service: shard.services.zcodeTaskService,
              scopes: configs.map((config) => config.scope),
              sessions,
              sortBy: args.sortBy,
              membershipCacheKey: `${membershipVersion}::workspace::${shard.shardKey}::${configs.map((config) => `${config.workspaceKey}@${taskListVersionJson}`).join("|")}`,
            });
            return configs.map((config) => {
              const bucket = fetched.get(config.workspaceKey) ?? {
                workspacePath: config.scope.workspacePath,
                workspaceIdentity: config.scope.workspaceIdentity,
                items: [],
                total: 0,
                hasMore: false,
                unreadTaskKeys: [],
              };
              const limited = bucket.items.slice(0, config.visibleLimit);
              return {
                queryKey: config.queryKey,
                descriptor: config.descriptor,
                items: limited,
                total: bucket.total,
                hasMore: bucket.total > limited.length,
                unreadTaskKeys: bucket.unreadTaskKeys,
                expectedInvalidationVersion: expectedInvalidation.get(config.queryKey),
              } as WorkspaceTaskQueryResult;
            });
          }),
        )
      ).flat();
      const current = signatureRef.current;
      const stillCurrent =
        inflightRef.current?.requestId === requestId &&
        current.requestSignature === request.signature &&
        current.sessionsIndexRevision === request.activityRevision &&
        current.membershipVersion === request.membershipVersion;
      if (results.length > 0 && stillCurrent) setQueryResults(results);
      else if (!stillCurrent) staleFlagRef.current = true;
    } catch (error) {
      logger.error("[useWorkspaceTaskLists] 加载 workspace task 列表失败", error);
    } finally {
      if (inflightRef.current?.requestId === requestId) {
        inflightRef.current = null;
        setLoadingByWorkspaceKey((current) => workspaceLoadingFlags(current, []));
        const current = signatureRef.current;
        const changed =
          staleFlagRef.current ||
          current.requestSignature !== request.signature ||
          current.sessionsIndexRevision !== request.activityRevision ||
          current.membershipVersion !== request.membershipVersion;
        staleFlagRef.current = false;
        if (changed) bumpRetryTick((tick) => tick + 1);
      }
    }
  }, [shards, membershipVersion, pendingConfigs, args.sortBy, requestSignature, resultsByQueryKey, sessionItems, activityRevision, setQueryResults]);

  React.useEffect(() => {
    if (pendingConfigs.length !== 0) void refresh();
  }, [pendingConfigs.length, refresh, retryTick, requestSignature]);

  /** 会话成员变化 → 作用域级失效 */
  const lastMembershipRef = React.useRef<null | { items: SessionItem[]; membershipVersion: number }>(null);
  React.useEffect(() => {
    if (agentEndpoints.length === 0) return;
    const last = lastMembershipRef.current;
    if (last && last.items === sessionItems && last.membershipVersion === membershipVersion) return;
    const membershipChanged = !last || last.membershipVersion !== membershipVersion;
    const previousItems = last?.items ?? null;
    lastMembershipRef.current = { items: sessionItems, membershipVersion };
    if (membershipChanged || previousItems === null) {
      invalidateTaskScopes(agentEndpoints);
      return;
    }
    const changedKeys = diffTaskScopes(previousItems as unknown as TaskMeta[], sessionItems as unknown as TaskMeta[]);
    if (changedKeys.size === 0) return;
    const changed = agentEndpoints.filter((endpoint) => changedKeys.has(workspaceKeyOf(endpoint.workspacePath, endpoint.workspaceIdentity)));
    if (changed.length > 0) invalidateTaskScopes(changed);
  }, [sessionItems, membershipVersion, agentEndpoints]);

  /** 订阅 workspace_task_list_changed：增量处理，否则全量刷新该行 */
  React.useEffect(() => {
    const currentShards = shardsRef.current;
    if (currentShards.length === 0) return;
    const disposers: Array<() => void> = [];
    for (const shard of currentShards) {
      const configsByKey = new Map(shard.configs.map((config) => [config.workspaceKey, config]));
      for (const config of configsByKey.values()) {
        const subscription = shard.services.zcodeTaskService.onDynamicWorkspaceEvent({
          workspacePath: config.scope.workspacePath,
          ...(config.scope.workspaceIdentity ? { workspaceIdentity: config.scope.workspaceIdentity } : {}),
        })((event) => {
          if (event.type === "workspace_task_list_changed" && workspaceKeyOf(event.workspacePath, event.workspaceIdentity) === config.workspaceKey) {
            handleIncrementalWorkspaceEvent({ event, service: shard.services.zcodeTaskService });
            if (requiresFullRefresh(event)) {
              logger.info(
                `[useWorkspaceTaskLists] 收到无法增量处理的 workspace_task_list_changed，刷新 workspace 行 workspace=${config.scope.workspacePath} reason=${event.reason}`,
              );
              invalidateWorkspaceEvent(event);
              invalidateTaskScopes([config.scope]);
            }
          }
        });
        disposers.push(() => subscription.dispose());
      }
    }
    return () => {
      for (const dispose of disposers) dispose();
    };
  }, [shardSignature]);

  const groups = React.useMemo(() => {
    const composed = composeWorkspaceTaskGroups({
      queryConfigs,
      resultsByQueryKey,
      taskMetaByEntityKey,
      taskUnreadOverlayByEntityKey,
      optimisticTaskOverlayByWorkspaceKey: optimisticOverlays,
      previousGroupsByWorkspaceKey: previousGroupsRef.current,
      sortBy: args.sortBy,
    });
    previousGroupsRef.current = composed.cache;
    return composed.groups;
  }, [optimisticOverlays, args.sortBy, queryConfigs, resultsByQueryKey, taskMetaByEntityKey, taskUnreadOverlayByEntityKey]);

  return { groups, loadingByWorkspaceKey, refresh };
}

/** 原 NFt（144400 区）：查询结果 → 分组视图（含乐观叠加与未读合成；接口级，行为同 Sidebar.tsx 登记） */
declare function composeWorkspaceTaskGroups(args: {
  queryConfigs: WorkspaceTaskQueryConfig[];
  resultsByQueryKey: SearchResultsState["resultsByQueryKey"];
  taskMetaByEntityKey: SearchResultsState["taskMetaByEntityKey"];
  taskUnreadOverlayByEntityKey: SearchResultsState["taskUnreadOverlayByEntityKey"];
  optimisticTaskOverlayByWorkspaceKey: Map<string, OptimisticTaskOverlay>;
  previousGroupsByWorkspaceKey: Map<string, { items: TaskMeta[]; total: number }>;
  sortBy: TaskSortBy;
}): { groups: WorkspaceTaskGroup[]; cache: Map<string, { items: TaskMeta[]; total: number }> };

/* ============================================================================
 * 2. 原 mRt（150255 / 124505）：useSidebarUsageState —— 侧栏用量状态
 *    供应商域解析 + 团队/个人 coding-plan 权益 + 升级目标解析。
 * ==========================================================================*/

export interface SidebarUsageStateModel {
  audience: "individual" | "team" | undefined;
  availableCodingPlanProviders: CodingPlanProvider[];
  modelProvidersLoading: boolean;
  providerEntitlements: ProviderEntitlement[];
  profilePlanBadge: { audience?: "individual" | "team"; snapshot?: PlanEntitlementSnapshot | null } | null;
  selectedProviderId: string | null;
  upgradeTargetProviderId: string | undefined;
  usageState: CodingPlanUsageViewLike | null; // 〔A1-R23〕型缝：Oq 出参面（原 { hasAnyActiveCodingPlan: boolean; [key: string]: unknown } | null）——Home CodingPlanUsageViewLike 逐字型，含 hasAnyActiveCodingPlan 字段，下方 1002 消费不变
}

export function useSidebarUsageState(args: {
  enabled: boolean;
  workspaceIdentity?: string | null;
  workspacePath: string;
}): SidebarUsageStateModel {
  const { settings } = useSettingsContext();
  const providerDomain = resolveProviderFamilyDomain(settings?.providerFamilyDomain);
  const { modelProviders, loading: modelProvidersLoading } = useModelProviders();
  const selectedSupplierKey = useTaskStore((state) =>
    args.workspacePath ? (getWorkspaceSlice(state, args.workspacePath, args.workspaceIdentity).selectedSupplierKey ?? "") : "",
  );
  const availableProviders = React.useMemo(() => normalizeCodingPlanProviders(modelProviders), [modelProviders]);
  const zaiProvider = availableProviders.find((provider) => provider.id === PROVIDER_IDS.zaiCodingPlan);
  const bigmodelProvider = availableProviders.find((provider) => provider.id === PROVIDER_IDS.bigmodelCodingPlan);

  const selectedSupplier = resolveSelectedSupplierKey(selectedSupplierKey);
  const selectedProviderRaw = selectedSupplier ? supplierProviderId(selectedSupplier) : null;
  /** 域外供应商不参与本域权益 */
  const selectedProviderId = selectedProviderRaw && providerDomain && selectedProviderRaw !== providerDomain ? null : selectedSupplier;
  const isCrossDomain = providerDomain !== "zai";

  const teamProducts = useTeamProducts({ enabled: args.enabled && !modelProvidersLoading && isCrossDomain, authenticated: true });
  const subscribedTeamProducts = React.useMemo(
    () => teamProducts.snapshot?.productList.filter((product) => product.subscribed === true) ?? [],
    [teamProducts.snapshot?.productList],
  );
  const teamSources = React.useMemo(
    () =>
      resolveTeamSources({
        activeCodingPlanProviderIds: [],
        availableCodingPlanProviders: [],
        subscribedTeamProducts,
      }),
    [subscribedTeamProducts],
  );
  const upgradeTarget = React.useMemo(
    () =>
      resolveUpgradeTargetSource({
        bigmodelSelectedKey: settings?.modelProviderFamilySelectedKeys?.bigmodel,
        selectedProviderId,
        teamSources,
      }),
    [selectedProviderId, settings?.modelProviderFamilySelectedKeys?.bigmodel, teamSources],
  );
  const resolvedSourceId = upgradeTarget?.sourceId ?? null;

  const zaiEntitlement = useCodingPlanEntitlement({
    enabled: args.enabled && !modelProvidersLoading && !!zaiProvider,
    includeSubscription: true,
    preferredProviderId: PROVIDER_IDS.zaiCodingPlan,
    allowDisabledPreferredProvider: true,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    cacheKey: entitlementCacheKey(zaiProvider),
  });
  const bigmodelEntitlement = useCodingPlanEntitlement({
    enabled: args.enabled && !modelProvidersLoading && isCrossDomain && !!bigmodelProvider,
    includeSubscription: true,
    preferredProviderId: PROVIDER_IDS.bigmodelCodingPlan,
    allowDisabledPreferredProvider: true,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    cacheKey: entitlementCacheKey(bigmodelProvider),
  });
  const teamEntitlement = useCodingPlanEntitlement({
    enabled: args.enabled && !modelProvidersLoading && upgradeTarget?.providerId === PROVIDER_IDS.bigmodelCodingPlan && upgradeTarget.audience === "team",
    includeSubscription: true,
    preferredProviderId: PROVIDER_IDS.bigmodelCodingPlan,
    allowDisabledPreferredProvider: true,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    organizationId: upgradeTarget?.teamSource?.organizationId,
    projectId: upgradeTarget?.teamSource?.projectId,
    cacheKey: upgradeTarget?.teamSource?.id,
  });

  const profilePlanBadge = resolveProfilePlanAudience({
    individualEntitlements: [
      ...(providerDomain === "bigmodel"
        ? []
        : [{ providerId: PROVIDER_IDS.zaiCodingPlan, snapshot: zaiEntitlement.snapshot, loading: zaiEntitlement.loading }]),
      ...(isCrossDomain
        ? [{ providerId: PROVIDER_IDS.bigmodelCodingPlan, snapshot: bigmodelEntitlement.snapshot, loading: bigmodelEntitlement.loading }]
        : []),
    ],
    hasTeamPlanEntitlement: isCrossDomain && subscribedTeamProducts.length > 0,
    teamEntitlementLoading: isCrossDomain && teamProducts.loading,
  });

  const providerEntitlements: ProviderEntitlement[] = [
    ...(upgradeTarget?.providerId === PROVIDER_IDS.zaiCodingPlan
      ? [{ sourceId: PROVIDER_IDS.zaiCodingPlan, providerId: PROVIDER_IDS.zaiCodingPlan, ...zaiEntitlement }]
      : []),
    ...(upgradeTarget?.providerId === PROVIDER_IDS.bigmodelCodingPlan && upgradeTarget.audience === "individual"
      ? [{ sourceId: PROVIDER_IDS.bigmodelCodingPlan, providerId: PROVIDER_IDS.bigmodelCodingPlan, ...bigmodelEntitlement }]
      : []),
    ...(upgradeTarget?.providerId === PROVIDER_IDS.bigmodelCodingPlan && upgradeTarget.audience === "team" && upgradeTarget.teamSource
      ? [
          {
            sourceId: upgradeTarget.teamSource.id,
            providerId: upgradeTarget.teamSource.providerId,
            label: upgradeTarget.teamSource.label,
            ...teamEntitlement,
          },
        ]
      : []),
  ];

  const usageStateRaw = resolveUsageState({
    availableProviders,
    entitlements: providerEntitlements,
    modelProvidersLoading,
    selectedProviderId: resolvedSourceId,
  });
  const usageState = usageStateRaw?.hasAnyActiveCodingPlan ? usageStateRaw : null;
  const upgradeTargetProviderId =
    (resolvedSourceId === PROVIDER_IDS.zaiCodingPlan || resolvedSourceId === PROVIDER_IDS.bigmodelCodingPlan ? resolvedSourceId : undefined) ??
    upgradeTarget?.providerId ??
    availableProviders[0]?.id ??
    fallbackProviderId(providerDomain);

  return {
    audience: upgradeTarget?.audience,
    availableCodingPlanProviders: availableProviders,
    modelProvidersLoading,
    providerEntitlements,
    profilePlanBadge,
    selectedProviderId: resolvedSourceId,
    upgradeTargetProviderId,
    usageState,
  };
}

/* ============================================================================
 * 3. 原 uzt（153205 / 126735）+ 合成助手族：useGroupedTaskView —— 分组视图数据层
 * ==========================================================================*/

/** 原 k8（任务排序键）/ WRt（顶层任务排序键）/ A8（节点比较键）/ GRt（节点排序器）/ Dx（索引水合） */
declare function groupedTaskSortKey(task: TaskMeta): string; // k8
declare function topLevelTaskOrderKey(task: TaskMeta): string; // WRt
declare function viewNodeCompareKey(node: GroupedViewNode): string; // A8
declare function compareViewNodes(a: GroupedViewNode, b: GroupedViewNode): number; // GRt
/* ── tombstone（A1-P3-B4）：declare hydrateTaskIndex（原 Dx）删除——逐字 canonical =
 *    TaskIndexCore.applySessionRuntimeToIndexItems（styles 32592，A1-P3-B2 转录），
 *    头部 import 别名接线（调用点 1081 逐字不变）。环安全同 B3 fetchTaskIndex（TaskIndexCore
 *    顶层全函数/var 声明，值闭包不达 SidebarLeaves）。 ── */

/** 原 KRt（— / 126406）：组内任务按成员 sortOrder 排序，缺序者按 addedAt 追加 */
function sortTasksByGroupOrder(tasks: TaskMeta[], memberOrderByKey: Map<string, { sortOrder: number | null; addedAt?: number }>): TaskMeta[] {
  const orderByKey = new Map<string, number>();
  let maxOrder = 0;
  const unordered: Array<{ task: TaskMeta; addedAt: number; key: string }> = [];
  for (const task of tasks) {
    const key = groupedTaskSortKey(task);
    const member = memberOrderByKey.get(key);
    if (member && member.sortOrder !== null) {
      orderByKey.set(key, member.sortOrder);
      maxOrder = Math.max(maxOrder, member.sortOrder);
    } else {
      unordered.push({ task, addedAt: member?.addedAt ?? task.createdAt, key });
    }
  }
  unordered.sort((a, b) => (b.addedAt === a.addedAt ? a.key.localeCompare(b.key) : b.addedAt - a.addedAt));
  let nextOrder = maxOrder;
  for (const entry of unordered) {
    nextOrder += GROUP_ORDER_STEP;
    orderByKey.set(entry.key, nextOrder);
  }
  return [...tasks].sort((a, b) => {
    const orderA = orderByKey.get(groupedTaskSortKey(a)) ?? 0;
    const orderB = orderByKey.get(groupedTaskSortKey(b)) ?? 0;
    return orderA === orderB ? groupedTaskSortKey(a).localeCompare(groupedTaskSortKey(b)) : orderA - orderB;
  });
}

/** 原 qRt（152903 区 / 126428）：结构 + 任务索引 → 分组视图（过滤 pinned/archived/deleted） */
function buildGroupedViewFromStructure(args: {
  structure: GroupedViewStructure;
  taskIndexItems: TaskMeta[];
  sessions: SessionItem[];
  pinnedIds: Set<string>;
  archivedIds: Set<string>;
  deletedIds?: Set<string>;
}): GroupedView {
  const { structure } = args;
  const taskByKey = new Map<string, TaskMeta>();
  const hydrated = hydrateTaskIndex({ taskIndexItems: args.taskIndexItems, sessions: args.sessions });
  for (const task of hydrated) {
    if (args.deletedIds?.has(task.taskId) || args.pinnedIds.has(task.taskId) || args.archivedIds.has(task.taskId)) continue;
    taskByKey.set(groupedTaskSortKey(task), task);
  }
  const memberOrderByKey = new Map(structure.members.map((member) => [memberKeyOf(member), member]));
  const membersByGroupId = new Map<string, GroupedViewStructure["members"]>();
  for (const member of structure.members) {
    const bucket = membersByGroupId.get(member.groupId) ?? [];
    bucket.push(member);
    membersByGroupId.set(member.groupId, bucket);
  }
  const topLevelOrderByKey = new Map<string, number>();
  for (const order of structure.topLevelOrders) {
    const key = order.type === "group" ? `group:${order.groupId}` : `task:${JSON.stringify([order.workspaceKey, order.taskId])}`;
    topLevelOrderByKey.set(key, order.sortOrder);
  }
  const nodes: GroupedViewNode[] = structure.groups.map((group) => {
    const tasks = (membersByGroupId.get(group.id) ?? [])
      .map((member) => taskByKey.get(memberKeyOf(member)))
      .filter((task): task is TaskMeta => !!task);
    const order = topLevelOrderByKey.get(`group:${group.id}`);
    return {
      type: "group",
      group,
      tasks: sortTasksByGroupOrder(tasks, memberOrderByKey),
      ...(order === undefined ? {} : { sortOrder: order }),
    };
  });
  for (const [key, task] of taskByKey) {
    if (memberOrderByKey.has(key)) continue;
    const order = topLevelOrderByKey.get(topLevelTaskOrderKey(task));
    nodes.push({ type: "task", task, ...(order === undefined ? {} : { sortOrder: order }) });
  }
  const unordered = nodes.filter((node) => node.sortOrder === undefined).sort((a, b) => {
    const createdAtA = a.type === "group" ? a.group.createdAt : a.task.createdAt;
    const createdAtB = b.type === "group" ? b.group.createdAt : b.task.createdAt;
    return createdAtB === createdAtA ? viewNodeCompareKey(a).localeCompare(viewNodeCompareKey(b)) : createdAtB - createdAtA;
  });
  let maxOrder = structure.topLevelOrders.reduce((max, order) => Math.max(max, order.sortOrder), 0);
  for (const node of unordered) {
    maxOrder += GROUP_ORDER_STEP;
    node.sortOrder = maxOrder;
  }
  nodes.sort(compareViewNodes);
  return { nodes };
}
function memberKeyOf(member: { workspacePath: string; workspaceIdentity?: string | null; taskId: string }): string {
  return taskEntityKey({ taskId: member.taskId, workspacePath: member.workspacePath, workspaceIdentity: member.workspaceIdentity });
}

/** 原 JRt（— / 126470）：草稿提升位置应用（top → 前置；group → 移入组） */
declare function moveTaskIntoGroupStart(view: GroupedView, args: { activeTaskKey: string; groupId: string }): GroupedView; // d8（Sidebar.tsx 已还原）〔A1-P3-B4 留批：canonical = Sidebar.tsx moveTaskIntoGroupStart，运行时同形；惟两叶各持本地 GroupedView/TaskGroup 型族（Sidebar 侧 TaskGroup 带索引签名，本叶无），型面不接，需型别归一后改指（证据见 A1-P3-B4.report.md §七）〕
function applyDraftPromotions(
  view: GroupedView,
  promotions: Map<string, { placement: { type: "top" } | { type: "group"; groupId: string } }>,
  taskByKey: Map<string, TaskMeta>,
): GroupedView {
  let current = view;
  for (const [entityKey, promotion] of promotions) {
    if (promotion.placement.type === "top") {
      const index = current.nodes.findIndex((node) => node.type === "task" && taskEntityKeyOf(node.task) === entityKey);
      if (index <= 0) continue;
      const nodes = [...current.nodes];
      const [removed] = nodes.splice(index, 1);
      if (removed) nodes.unshift(removed);
      current = { nodes };
      continue;
    }
    const task = taskByKey.get(entityKey);
    if (task && !isTaskFirstInGroup(current, entityKey, promotion.placement.groupId)) {
      current = moveTaskIntoGroupStart(current, { activeTaskKey: groupedTaskSortKey(task), groupId: promotion.placement.groupId });
    }
  }
  return current;
}
function taskEntityKeyOf(task: TaskMeta): string {
  return taskEntityKey({ taskId: task.taskId, workspacePath: task.workspacePath, workspaceIdentity: task.workspaceIdentity });
}

/** 原 YRt（— / 126504）：按键在视图中查任务 */
function findTaskInViewByKey(view: GroupedView, entityKey: string): TaskMeta | undefined {
  for (const node of view.nodes) {
    if (node.type === "group") {
      const task = node.tasks.find((item) => taskEntityKeyOf(item) === entityKey);
      if (task) return task;
      continue;
    }
    if (taskEntityKeyOf(node.task) === entityKey) return node.task;
  }
  return undefined;
}
/** 原 XRt（— / 126514）：任务是否已是目标组首行 */
function isTaskFirstInGroup(view: GroupedView, entityKey: string, groupId: string): boolean {
  const group = view.nodes.find((node) => node.type === "group" && node.group.id === groupId);
  return !!(group?.type === "group" && group.tasks[0] && taskEntityKeyOf(group.tasks[0]) === entityKey);
}
/** 原 ZRt（— / 126518）：页签 → 作用域（去冗余字段） */
function normalizeWorkspaceScopes(tabs: WorkspaceTab[]): WorkspaceScope[] {
  return tabs.map((tab) => ({
    workspacePath: tab.workspacePath,
    workspaceIdentity: tab.workspaceIdentity,
    workspacePurpose: tab.workspacePurpose,
  }));
}
/** 原 j8（— / 126525）：视图 → 去重作用域列表 */
function collectViewWorkspaceScopes(view: GroupedView): WorkspaceScope[] {
  const byKey = new Map<string, WorkspaceScope>();
  const collect = (task: Pick<TaskMeta, "workspacePath" | "workspaceIdentity">) => {
    const key = workspaceKeyOf(task.workspacePath, task.workspaceIdentity);
    byKey.set(key, { workspacePath: task.workspacePath, workspaceIdentity: task.workspaceIdentity });
  };
  for (const node of view.nodes) {
    if (node.type === "group") {
      node.tasks.forEach(collect);
      continue;
    }
    collect(node.task);
  }
  return [...byKey.values()];
}

/** 原 QRt（153040 区 / 126543）：乐观叠加合成（任务覆盖 + 缺失可见行前置 + 草稿提升） */
function composeOptimisticOverlay(args: {
  view: GroupedView;
  optimisticOverlays: OptimisticTaskOverlay[];
  visibleMissingTaskKeys: Set<string>;
}): GroupedView {
  const overlayTaskByKey = new Map<string, TaskMeta>();
  const taskByKey = new Map<string, TaskMeta>();
  const promotions = new Map<string, { placement: { type: "top" } | { type: "group"; groupId: string }; workspacePath: string; workspaceIdentity?: string | null }>();
  for (const node of args.view.nodes) {
    if (node.type === "group") {
      for (const task of node.tasks) taskByKey.set(taskEntityKeyOf(task), task);
      continue;
    }
    taskByKey.set(taskEntityKeyOf(node.task), node.task);
  }
  for (const overlay of args.optimisticOverlays) {
    for (const task of overlay.tasks) {
      const key = taskEntityKeyOf(task);
      overlayTaskByKey.set(key, task);
      taskByKey.set(key, task);
    }
    for (const [taskId, promotion] of Object.entries(overlay.promotedGroupedDraftTaskByTaskId ?? {})) {
      promotions.set(taskEntityKey({ taskId, workspacePath: promotion.workspacePath, workspaceIdentity: promotion.workspaceIdentity }), promotion);
    }
  }
  if (overlayTaskByKey.size === 0 && promotions.size === 0) return args.view;

  const seenKeys = new Set<string>();
  let changed = false;
  const mappedNodes = args.view.nodes.map((node) => {
    if (node.type === "group") {
      let groupChanged = false;
      const tasks = node.tasks.map((task) => {
        const key = taskEntityKeyOf(task);
        seenKeys.add(key);
        const overlay = overlayTaskByKey.get(key);
        if (overlay) {
          groupChanged = true;
          return mergeTaskWithActivity(task, activityOverlayOf(task, overlay));
        }
        return task;
      });
      if (groupChanged) {
        changed = true;
        return { ...node, tasks };
      }
      return node;
    }
    const key = taskEntityKeyOf(node.task);
    seenKeys.add(key);
    const overlay = overlayTaskByKey.get(key);
    if (overlay) {
      changed = true;
      return { ...node, task: mergeTaskWithActivity(node.task, activityOverlayOf(node.task, overlay)) };
    }
    return node;
  });

  const missingVisible = [...overlayTaskByKey.entries()]
    .filter(([key]) => args.visibleMissingTaskKeys.has(key) && !seenKeys.has(key))
    .map(([, task]) => task)
    .sort((a, b) =>
      b.updatedAt === a.updatedAt
        ? b.createdAt === a.createdAt
          ? a.taskId.localeCompare(b.taskId)
          : b.createdAt - a.createdAt
        : b.updatedAt - a.updatedAt,
    );
  if (missingVisible.length === 0) return applyDraftPromotions(changed ? { nodes: mappedNodes } : args.view, promotions, taskByKey);

  const byGroupId = new Map<string, TaskMeta[]>();
  const topLevel: TaskMeta[] = [];
  for (const task of missingVisible) {
    const promotion = promotions.get(taskEntityKeyOf(task));
    if (promotion?.placement.type === "group") {
      const bucket = byGroupId.get(promotion.placement.groupId) ?? [];
      bucket.push(task);
      byGroupId.set(promotion.placement.groupId, bucket);
      continue;
    }
    topLevel.push(task);
  }
  const withMissing = mappedNodes.map((node) => {
    if (node.type !== "group") return node;
    const bucket = byGroupId.get(node.group.id);
    return bucket?.length ? { ...node, tasks: [...bucket, ...node.tasks] } : node;
  });
  const orphaned = [...byGroupId.entries()]
    .filter(([, tasks]) => tasks.length > 0)
    .flatMap(([groupId, tasks]) => (withMissing.some((node) => node.type === "group" && node.group.id === groupId) ? [] : tasks));
  return applyDraftPromotions(
    { nodes: [...[...topLevel.concat(orphaned)].map((task) => ({ type: "task", task } as GroupedViewNode)), ...withMissing] },
    promotions,
    taskByKey,
  );
}

/** 原 $Rt（— / 126621）：视图内全部任务键集合 */
function collectViewTaskKeys(view: GroupedView): Set<string> {
  const keys = new Set<string>();
  for (const node of view.nodes) {
    if (node.type === "group") {
      for (const task of node.tasks) keys.add(taskEntityKeyOf(task));
      continue;
    }
    keys.add(taskEntityKeyOf(node.task));
  }
  return keys;
}
/** 原 tzt（— / 126635）：分组视图就绪 = 远端已初始化且无水合中端点 */
function isGroupedViewReady(args: { remoteDataInitialized: boolean; hydratingEndpointKeys: string[] }): boolean {
  return args.remoteDataInitialized && args.hydratingEndpointKeys.length === 0;
}

/** 原 nzt（— / 126641）：加载缓存（代际 + 在途合并 + completed 记忆） */
class GroupedViewLoadCache<Value> {
  private generation = 0;
  private requestSequence = 0;
  private completed: { key: string; value: Value } | null = null;
  private inFlightByKey = new Map<string, { generation: number; latestRequestSequence: number; promise: Promise<Value> | null }>();

  load(key: string, loader: () => Promise<Value>): Promise<Value> {
    const sequence = this.requestSequence + 1;
    this.requestSequence = sequence;
    if (this.completed?.key === key) return Promise.resolve(this.completed.value);
    const generation = this.generation;
    const existing = this.inFlightByKey.get(key);
    if (existing?.generation === generation && existing.promise) {
      existing.latestRequestSequence = sequence;
      return existing.promise;
    }
    const entry = { generation, latestRequestSequence: sequence, promise: null as Promise<Value> | null };
    const promise = Promise.resolve()
      .then(loader)
      .then((value) => {
        if (this.generation === generation && this.requestSequence === entry.latestRequestSequence) {
          this.completed = { key, value };
        }
        return value;
      })
      .finally(() => {
        if (this.inFlightByKey.get(key)?.promise === promise) this.inFlightByKey.delete(key);
      });
    entry.promise = promise;
    this.inFlightByKey.set(key, entry);
    return promise;
  }
  isCurrent(key: string, value: Value): boolean {
    return this.completed?.key === key && this.completed.value === value;
  }
  invalidate(): void {
    this.generation += 1;
    this.completed = null;
    this.inFlightByKey.clear();
  }
}

/** 原 rzt（— / 126669）：新建组前置（sortOrder = 最小值 - 1000） */
function prependCreatedGroup(view: GroupedView, group: TaskGroup): GroupedView {
  if (view.nodes.some((node) => node.type === "group" && node.group.id === group.id)) return view;
  return {
    nodes: [
      { type: "group", group, tasks: [], sortOrder: view.nodes.reduce((min, node) => Math.min(min, node.sortOrder ?? 0), 0) - 1000 },
      ...view.nodes,
    ],
  };
}
/** 原 izt（— / 126679）：乐观叠加中「可见但视图缺失」的任务键 */
function resolveVisibleMissingTaskKeys(args: {
  view: GroupedView;
  optimisticOverlays: OptimisticTaskOverlay[];
  previousVisibleMissingTaskKeys: Set<string>;
}): Set<string> {
  const inView = collectViewTaskKeys(args.view);
  const overlayKeys = new Set<string>();
  const missing = new Set<string>();
  for (const overlay of args.optimisticOverlays) {
    for (const task of overlay.tasks) {
      const key = taskEntityKeyOf(task);
      overlayKeys.add(key);
      if (overlay.activeTaskId === task.taskId && !inView.has(key)) missing.add(key);
    }
  }
  for (const key of args.previousVisibleMissingTaskKeys) {
    if (!inView.has(key) && overlayKeys.has(key)) missing.add(key);
  }
  return missing;
}
/** 原 azt（— / 126690）/ ozt（— / 126693）：节点身份键与浅比较 */
function viewNodeOrderKey(node: GroupedViewNode): string {
  return node.type === "group"
    ? `group:${node.group.id}`
    : `task:${workspaceKeyOf(node.task.workspacePath, node.task.workspaceIdentity)}:${node.task.taskId}`;
}
function viewNodesShallowEqual(a: GroupedViewNode, b: GroupedViewNode): boolean {
  if (a.type !== b.type || a.sortOrder !== b.sortOrder) return false;
  if (a.type === "group" && b.type === "group") {
    return JSON.stringify(a.group) === JSON.stringify(b.group)
      ? a.tasks.length === b.tasks.length && a.tasks.every((task, index) => task === b.tasks[index])
      : false;
  }
  return a.type === "task" && b.type === "task" && a.task === b.task;
}
/** 原 szt（— / 126696）：结构重建结果与旧视图按身份合并（保持引用稳定） */
function mergeGroupedViewPreservingIdentity(previous: GroupedView, next: GroupedView): GroupedView {
  if (previous.nodes.length === 0) return next;
  const previousByKey = new Map(previous.nodes.map((node) => [viewNodeOrderKey(node), node]));
  let sameOrder = previous.nodes.length === next.nodes.length;
  const nodes = next.nodes.map((node, index) => {
    const match = previousByKey.get(viewNodeOrderKey(node));
    if (match && viewNodesShallowEqual(match, node)) {
      if (sameOrder && previous.nodes[index] !== match) sameOrder = false;
      return match;
    }
    sameOrder = false;
    return node;
  });
  return sameOrder ? previous : { nodes };
}
/** 原 czt（— / 126714）：节点 → 顶层引用（序列化用） */
function toTopLevelNodeRef(node: GroupedViewNode): SerializedGroupedOrder["topLevelNodes"][number] {
  return node.type === "group"
    ? { type: "group", groupId: node.group.id }
    : {
        type: "task",
        task: { workspacePath: node.task.workspacePath, workspaceIdentity: node.task.workspaceIdentity, taskId: node.task.taskId },
      };
}
/** 原 lzt（— / 126721）：视图 → 持久化载荷 */
function serializeGroupedViewOrder(args: { view: GroupedView }): SerializedGroupedOrder {
  return {
    workspaceScopes: collectViewWorkspaceScopes(args.view),
    topLevelNodes: args.view.nodes.map(toTopLevelNodeRef),
    groups: args.view.nodes
      .filter((node): node is GroupedViewNodeGroup => node.type === "group")
      .map((node) => ({
        groupId: node.group.id,
        taskRefs: node.tasks.map((task) => ({
          workspacePath: task.workspacePath,
          workspaceIdentity: task.workspaceIdentity,
          taskId: task.taskId,
        })),
      })),
  };
}

export interface GroupedTaskViewController {
  view: GroupedView;
  setView: (view: GroupedView | ((current: GroupedView) => GroupedView)) => void;
  loading: boolean;
  initialized: boolean;
  saving: boolean;
  refresh: () => Promise<void>;
  createGroup: () => Promise<TaskGroup>;
  renameGroup: (groupId: string, title: string) => Promise<void>;
  updateGroupColor: (groupId: string, color: GroupColor) => Promise<void>;
  ungroupGroup: (groupId: string) => Promise<void>;
  applyOrder: (view: GroupedView) => Promise<void>;
}

export function useGroupedTaskView(options: { workspaceTabs: WorkspaceTab[] }): GroupedTaskViewController {
  const services = useBaseServices();
  const [rawView, setRawView] = React.useState<GroupedView>({ nodes: [] });
  const [loading, setLoading] = React.useState(false);
  const [remoteDataInitialized, setRemoteDataInitialized] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const loadSequenceRef = React.useRef(0);

  const taskListVersionJson = useTaskStore((state) =>
    memoJson(
      options.workspaceTabs.map((tab) => [
        workspaceKeyOf(tab.workspacePath, tab.workspaceIdentity),
        getWorkspaceSlice(state, tab.workspacePath, tab.workspaceIdentity).taskListVersion,
      ]),
    ),
  );
  const workspaceScopes = React.useMemo(() => normalizeWorkspaceScopes(options.workspaceTabs), [options.workspaceTabs]);
  const scopedTabs = useScopedWorkspaceTabs({ workspaceTabs: options.workspaceTabs });
  const sessionScopes = React.useMemo(
    () =>
      scopedTabs.map((tab) => ({
        workspacePath: tab.workspacePath,
        ...(tab.workspaceIdentity ? { workspaceIdentity: tab.workspaceIdentity } : {}),
      })),
    [scopedTabs],
  );
  const { items: sessionItems, hydratingEndpointKeys } = useSessionItems(sessionScopes);
  const initialized = isGroupedViewReady({ remoteDataInitialized, hydratingEndpointKeys });
  const sessionItemsRef = React.useRef(sessionItems);
  sessionItemsRef.current = sessionItems;

  const membershipVersion = useMembershipVersion();
  const optimisticOverlays = useOptimisticTaskOverlays(options.workspaceTabs);
  const clearPromotedGroupedDraftTask = useTaskStore((state) => clearPromotedGroupedDraftTaskSelector(state));
  const previousVisibleMissingRef = React.useRef(new Set<string>());
  const persistedOrderSignaturesRef = React.useRef(new Set<string>());

  /** 乐观叠加后的展示视图 */
  const view = React.useMemo(() => {
    const overlays = [...optimisticOverlays.values()];
    const visibleMissing = resolveVisibleMissingTaskKeys({
      view: rawView,
      optimisticOverlays: overlays,
      previousVisibleMissingTaskKeys: previousVisibleMissingRef.current,
    });
    previousVisibleMissingRef.current = visibleMissing;
    return composeOptimisticOverlay({ view: rawView, optimisticOverlays: overlays, visibleMissingTaskKeys: visibleMissing });
  }, [optimisticOverlays, rawView]);

  const [loadCache] = React.useState(() => new GroupedViewLoadCache<{ structure: GroupedViewStructure; membership: TaskIndexResult }>());
  const invalidateCache = React.useCallback(() => {
    loadCache.invalidate();
  }, [loadCache]);

  const load = React.useCallback(async () => {
    const sequence = loadSequenceRef.current + 1;
    loadSequenceRef.current = sequence;
    setLoading(true);
    try {
      const cacheKey = [membershipVersion, taskListVersionJson, workspaceScopes.map((scope) => workspaceKeyOf(scope.workspacePath, scope.workspaceIdentity)).join("|")].join("::");
      const loaded = await loadCache.load(cacheKey, async () => {
        const [structure, membership] = await Promise.all([
          services.zcodeTaskService.listGroupedTaskViewStructure({ workspaceScopes }),
          fetchTaskIndex({ service: services.zcodeTaskService, scopes: sessionScopes }),
        ]);
        return { structure, membership };
      });
      if (loadSequenceRef.current === sequence && loadCache.isCurrent(cacheKey, loaded)) {
        const built = buildGroupedViewFromStructure({
          structure: loaded.structure,
          taskIndexItems: loaded.membership.taskIndexItems,
          sessions: sessionItemsRef.current,
          pinnedIds: loaded.membership.pinnedIds,
          archivedIds: loaded.membership.archivedIds,
          deletedIds: loaded.membership.deletedIds,
        });
        setRawView((current) => mergeGroupedViewPreservingIdentity(current, built));
      }
    } catch (error) {
      if (loadSequenceRef.current === sequence) logger.error("[useGroupedTaskView] 加载 grouped task 视图失败", error);
    } finally {
      if (loadSequenceRef.current === sequence) {
        setLoading(false);
        setRemoteDataInitialized(true);
      }
    }
  }, [membershipVersion, loadCache, workspaceScopes, sessionScopes, services.zcodeTaskService, taskListVersionJson]);

  const loadRef = React.useRef(load);
  loadRef.current = load;

  /** 草稿提升位置落盘：top 提升若已在顶则清除；group 提升不在组首则 applyOrder */
  React.useEffect(() => {
    const visibleKeys = collectViewTaskKeys(rawView);
    const toPersist: Array<{ workspacePath: string; taskId: string; workspaceIdentity?: string | null }> = [];
    const toClear: Array<{ workspacePath: string; taskId: string; workspaceIdentity?: string | null }> = [];
    for (const overlay of optimisticOverlays.values()) {
      for (const [taskId, promotion] of Object.entries(overlay.promotedGroupedDraftTaskByTaskId ?? {})) {
        const entityKey = taskEntityKey({ taskId, workspacePath: promotion.workspacePath, workspaceIdentity: promotion.workspaceIdentity });
        const task = findTaskInViewByKey(view, entityKey);
        if (promotion?.placement.type === "top") {
          const first = rawView.nodes[0];
          if (task && first?.type === "task" && taskEntityKeyOf(first.task) === entityKey) toClear.push(task);
        } else if (task && (visibleKeys.has(entityKey) || previousVisibleMissingRef.current.has(entityKey)) && !isTaskFirstInGroup(rawView, entityKey, promotion.placement.groupId)) {
          toPersist.push(task);
        }
      }
    }
    for (const entry of toClear) clearPromotedGroupedDraftTask(entry.workspacePath, entry.taskId, entry.workspaceIdentity);
    if (toPersist.length === 0) return;
    const signature = toPersist.map((entry) => taskEntityKey(entry)).sort().join("|");
    if (persistedOrderSignaturesRef.current.has(signature)) return;
    persistedOrderSignaturesRef.current.add(signature);
    services.zcodeTaskService
      .applyGroupedTaskViewOrder(serializeGroupedViewOrder({ view }))
      .then(() =>
        invalidateCache(),
      )
      .then(() =>
        loadRef.current().then(() => {
          for (const entry of toPersist) clearPromotedGroupedDraftTask(entry.workspacePath, entry.taskId, entry.workspaceIdentity);
        }),
      )
      .catch((error) => {
        persistedOrderSignaturesRef.current.delete(signature);
        logger.error("[useGroupedTaskView] 保存 grouped 草稿提升位置失败", error);
      });
  }, [clearPromotedGroupedDraftTask, view, invalidateCache, optimisticOverlays, services.zcodeTaskService, rawView]);

  /** 新建任务事件 → 失效并重载 */
  React.useEffect(() => {
    const subscriptions = workspaceScopes.map((scope) =>
      services.zcodeTaskService.onDynamicWorkspaceEvent(scope)((event) => {
        if (event.type !== "workspace_task_list_changed" || event.reason !== "task_created") return;
        invalidateCache();
        void loadRef.current();
      }),
    );
    return () => subscriptions.forEach((subscription) => subscription.dispose());
  }, [invalidateCache, workspaceScopes, services.zcodeTaskService]);

  React.useEffect(() => {
    void load();
  }, [load, sessionItems]);

  const createGroup = React.useCallback(async () => {
    setSaving(true);
    try {
      const group = await services.zcodeTaskService.createTaskGroup();
      setRawView((current) => prependCreatedGroup(current, group));
      invalidateCache();
      await load();
      return group;
    } catch (error) {
      logger.error("[useGroupedTaskView] 创建 task group 失败", error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [invalidateCache, load, services.zcodeTaskService]);

  const renameGroup = React.useCallback(
    async (groupId: string, title: string) => {
      const previous = rawView;
      const existing = rawView.nodes.find((node) => node.type === "group" && node.group.id === groupId);
      const nextTitle = title.trim() || (existing?.type === "group" ? existing.group.title : "");
      if (!existing || existing.type !== "group" || existing.group.title === nextTitle) return;
      const optimistic: GroupedView = {
        nodes: rawView.nodes.map((node) =>
          node.type === "group" && node.group.id === groupId
            ? { ...node, group: { ...node.group, title: nextTitle, updatedAt: Date.now() } }
            : node,
        ),
      };
      setRawView(optimistic);
      setSaving(true);
      try {
        const renamed = await services.zcodeTaskService.renameTaskGroup({
          groupId,
          title: nextTitle,
          workspaceScopes: collectViewWorkspaceScopes(optimistic),
        });
        invalidateCache();
        setRawView({
          nodes: optimistic.nodes.map((node) => (node.type === "group" && node.group.id === groupId ? { ...node, group: renamed } : node)),
        });
      } catch (error) {
        setRawView(previous);
        logger.error("[useGroupedTaskView] 重命名 task group 失败", error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [invalidateCache, services.zcodeTaskService, rawView],
  );

  const updateGroupColor = React.useCallback(
    async (groupId: string, color: GroupColor) => {
      const previous = rawView;
      const existing = rawView.nodes.find((node) => node.type === "group" && node.group.id === groupId);
      if (!existing || existing.type !== "group" || existing.group.color === color) return;
      const optimistic: GroupedView = {
        nodes: rawView.nodes.map((node) =>
          node.type === "group" && node.group.id === groupId ? { ...node, group: { ...node.group, color, updatedAt: Date.now() } } : node,
        ),
      };
      setRawView(optimistic);
      setSaving(true);
      try {
        const updated = await services.zcodeTaskService.updateTaskGroupColor({
          groupId,
          color,
          workspaceScopes: collectViewWorkspaceScopes(optimistic),
        });
        invalidateCache();
        setRawView({
          nodes: optimistic.nodes.map((node) => (node.type === "group" && node.group.id === groupId ? { ...node, group: updated } : node)),
        });
      } catch (error) {
        setRawView(previous);
        logger.error("[useGroupedTaskView] 更新 task group 颜色失败", error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [invalidateCache, services.zcodeTaskService, rawView],
  );

  const applyOrder = React.useCallback(
    async (nextView: GroupedView) => {
      const previous = rawView;
      setRawView(nextView);
      setSaving(true);
      try {
        await services.zcodeTaskService.applyGroupedTaskViewOrder(serializeGroupedViewOrder({ view: nextView }));
        invalidateCache();
        await loadRef.current();
      } catch (error) {
        setRawView(previous);
        void load();
        logger.error("[useGroupedTaskView] 保存 grouped task 顺序失败", error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [invalidateCache, load, services.zcodeTaskService, rawView],
  );

  const ungroupGroup = React.useCallback(
    async (groupId: string) => {
      const target = rawView.nodes.find((node) => node.type === "group" && node.group.id === groupId);
      if (!target || target.type !== "group") return;
      const flattened: GroupedView = {
        nodes: rawView.nodes.flatMap((node) =>
          node.type === "group" && node.group.id === groupId ? node.tasks.map((task) => ({ type: "task", task } as GroupedViewNode)) : [node],
        ),
      };
      setSaving(true);
      try {
        await applyOrder(flattened);
        await services.zcodeTaskService.deleteTaskGroup({ groupId, workspaceScopes: collectViewWorkspaceScopes(flattened) });
        invalidateCache();
        await load();
      } catch (error) {
        logger.error("[useGroupedTaskView] 取消 task group 分组失败", error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [applyOrder, invalidateCache, load, services.zcodeTaskService, rawView],
  );

  return {
    view,
    setView: setRawView,
    loading,
    initialized,
    saving,
    refresh: load,
    createGroup,
    renameGroup,
    updateGroupColor,
    ungroupGroup,
    applyOrder,
  };
}

/** 原 J3（jsx 113936）：作用域内页签（接口级，Sidebar.tsx 已声明） */
declare function useScopedWorkspaceTabs(args: { workspaceTabs: WorkspaceTab[] }): WorkspaceTab[];

/* ============================================================================
 * 4. 光束动画族（原 ABt + TBt…wBt + 色板，js 156793–157550 / jsx 128919–131170）
 * ==========================================================================*/

/** 原 uBt（— / 128919）：尺寸预设 */
const BEAM_SIZE_PRESETS: Record<"sm" | "md" | "line", { borderRadius: number; borderWidth: number; width?: number; height?: number }> = {
  sm: { borderRadius: 18, borderWidth: 1, width: 70, height: 36 },
  md: { borderRadius: 16, borderWidth: 1 },
  line: { borderRadius: 16, borderWidth: 1 },
};
/** 原 B8（— / 128935）：尺寸×主题 参数 */
const BEAM_THEME_PARAMS: Record<
  "sm" | "md" | "line",
  Record<"dark" | "light", { strokeOpacity: number; innerOpacity: number; bloomOpacity: number; innerShadow: string; saturation: number }>
> = {
  sm: {
    dark: { strokeOpacity: 0.48, innerOpacity: 0.7, bloomOpacity: 0.8, innerShadow: "rgba(255, 255, 255, 0.3)", saturation: 1.2 },
    light: { strokeOpacity: 0.33, innerOpacity: 0.46, bloomOpacity: 0.54, innerShadow: "rgba(0, 0, 0, 0.14)", saturation: 0.96 },
  },
  md: {
    dark: { strokeOpacity: 0.48, innerOpacity: 0.7, bloomOpacity: 0.8, innerShadow: "rgba(255, 255, 255, 0.27)", saturation: 1.2 },
    light: { strokeOpacity: 0.33, innerOpacity: 0.46, bloomOpacity: 0.54, innerShadow: "rgba(0, 0, 0, 0.14)", saturation: 0.96 },
  },
  line: {
    dark: { strokeOpacity: 0.72, innerOpacity: 0.7, bloomOpacity: 0.8, innerShadow: "rgba(255, 255, 255, 0.1)", saturation: 1.2 },
    light: { strokeOpacity: 0.72, innerOpacity: 0.7, bloomOpacity: 0.8, innerShadow: "rgba(0, 0, 0, 0.14)", saturation: 1.2 },
  },
};

interface BeamPaletteStop { color: string; size?: string; sizeW?: number; sizeH?: number; pos?: string; offsetX?: number; offsetY?: number }
type BeamVariant = "colorful" | "mono" | "ocean" | "sunset" | string;

/** 原 V8（— / 128990）：md 色板（border 渐变 + 尖峰主/次色） */
const MD_BEAM_PALETTES: Record<BeamVariant, { border: BeamPaletteStop[]; spike: { primary: string; secondary: string }; spikeLt: { primary: string; secondary: string } }> = {
  colorful: {
    border: [
      { color: "rgb(255, 50, 100)", pos: "33% -7.4%", size: "70px 40px" },
      { color: "rgb(40, 140, 255)", pos: "12% -5%", size: "60px 35px" },
      { color: "rgb(50, 200, 80)", pos: "2.1% 68.3%", size: "40px 70px" },
      { color: "rgb(30, 185, 170)", pos: "2.1% 68.3%", size: "20px 35px" },
      { color: "rgb(100, 70, 255)", pos: "74.4% 100%", size: "180px 32px" },
      { color: "rgb(40, 140, 255)", pos: "55% 100%", size: "85px 26px" },
      { color: "rgb(255, 120, 40)", pos: "93.9% 0%", size: "74px 32px" },
      { color: "rgb(240, 50, 180)", pos: "100% 27.1%", size: "26px 42px" },
      { color: "rgb(180, 40, 240)", pos: "100% 27.1%", size: "52px 48px" },
    ],
    spike: { primary: "rgb(255, 60, 80)", secondary: "rgba(40, 190, 180, 0.98)" },
    spikeLt: { primary: "rgb(200, 30, 60)", secondary: "rgb(20, 150, 140)" },
  },
  mono: {
    border: [
      { color: "rgb(180, 180, 180)", pos: "33% -7.4%", size: "70px 40px" },
      { color: "rgb(140, 140, 140)", pos: "12% -5%", size: "60px 35px" },
      { color: "rgb(160, 160, 160)", pos: "2.1% 68.3%", size: "40px 70px" },
      { color: "rgb(130, 130, 130)", pos: "2.1% 68.3%", size: "20px 35px" },
      { color: "rgb(170, 170, 170)", pos: "74.4% 100%", size: "180px 32px" },
      { color: "rgb(150, 150, 150)", pos: "55% 100%", size: "85px 26px" },
      { color: "rgb(190, 190, 190)", pos: "93.9% 0%", size: "74px 32px" },
      { color: "rgb(145, 145, 145)", pos: "100% 27.1%", size: "26px 42px" },
      { color: "rgb(165, 165, 165)", pos: "100% 27.1%", size: "52px 48px" },
    ],
    spike: { primary: "rgb(200, 200, 200)", secondary: "rgb(170, 170, 170)" },
    spikeLt: { primary: "rgb(80, 80, 80)", secondary: "rgb(120, 120, 120)" },
  },
  ocean: {
    border: [
      { color: "rgb(100, 80, 220)", pos: "33% -7.4%", size: "70px 40px" },
      { color: "rgb(60, 120, 255)", pos: "12% -5%", size: "60px 35px" },
      { color: "rgb(80, 100, 200)", pos: "2.1% 68.3%", size: "40px 70px" },
      { color: "rgb(50, 140, 220)", pos: "2.1% 68.3%", size: "20px 35px" },
      { color: "rgb(120, 80, 255)", pos: "74.4% 100%", size: "180px 32px" },
      { color: "rgb(70, 130, 255)", pos: "55% 100%", size: "85px 26px" },
      { color: "rgb(140, 100, 240)", pos: "93.9% 0%", size: "74px 32px" },
      { color: "rgb(90, 110, 230)", pos: "100% 27.1%", size: "26px 42px" },
      { color: "rgb(130, 70, 255)", pos: "100% 27.1%", size: "52px 48px" },
    ],
    spike: { primary: "rgb(100, 120, 255)", secondary: "rgba(130, 100, 220, 0.98)" },
    spikeLt: { primary: "rgb(60, 60, 180)", secondary: "rgb(80, 100, 200)" },
  },
  sunset: {
    border: [
      { color: "rgb(255, 80, 50)", pos: "33% -7.4%", size: "70px 40px" },
      { color: "rgb(255, 160, 40)", pos: "12% -5%", size: "60px 35px" },
      { color: "rgb(255, 120, 60)", pos: "2.1% 68.3%", size: "40px 70px" },
      { color: "rgb(255, 200, 50)", pos: "2.1% 68.3%", size: "20px 35px" },
      { color: "rgb(255, 100, 80)", pos: "74.4% 100%", size: "180px 32px" },
      { color: "rgb(255, 180, 60)", pos: "55% 100%", size: "85px 26px" },
      { color: "rgb(255, 60, 60)", pos: "93.9% 0%", size: "74px 32px" },
      { color: "rgb(255, 140, 50)", pos: "100% 27.1%", size: "26px 42px" },
      { color: "rgb(255, 90, 70)", pos: "100% 27.1%", size: "52px 48px" },
    ],
    spike: { primary: "rgb(255, 140, 80)", secondary: "rgba(255, 100, 60, 0.98)" },
    spikeLt: { primary: "rgb(200, 80, 40)", secondary: "rgb(220, 120, 30)" },
  },
};

/** 原 dBt（— / 129180）：sm 色板（border + inner） */
const SM_BEAM_PALETTES: Record<BeamVariant, { border: BeamPaletteStop[]; inner: BeamPaletteStop[] }> = {
  colorful: {
    border: [
      { color: "rgb(50, 200, 80)", pos: "2% 68%", size: "9px 18px" },
      { color: "rgb(30, 185, 170)", pos: "2% 68%", size: "4px 8px" },
      { color: "rgb(255, 120, 40)", pos: "72% -3%", size: "59px 9px" },
      { color: "rgb(100, 70, 255)", pos: "74% 100%", size: "42px 7px" },
      { color: "rgb(240, 50, 180)", pos: "100% 27%", size: "10px 17px" },
      { color: "rgb(180, 40, 240)", pos: "100% 27%", size: "10px 18px" },
      { color: "rgb(40, 140, 255)", pos: "100% 27%", size: "5px 10px" },
      { color: "rgb(255, 50, 100)", pos: "100% 27%", size: "11px 12px" },
    ],
    inner: [
      { color: "rgba(50, 200, 80, 0.5)", pos: "2% 68%", size: "9px 18px" },
      { color: "rgba(30, 185, 170, 0.45)", pos: "2% 68%", size: "4px 8px" },
      { color: "rgba(255, 120, 40, 0.35)", pos: "72% -3%", size: "59px 9px" },
      { color: "rgba(100, 70, 255, 0.35)", pos: "74% 100%", size: "42px 7px" },
      { color: "rgba(240, 50, 180, 0.3)", pos: "100% 27%", size: "10px 17px" },
      { color: "rgba(180, 40, 240, 0.4)", pos: "100% 27%", size: "10px 18px" },
      { color: "rgba(40, 140, 255, 0.3)", pos: "100% 27%", size: "5px 10px" },
      { color: "rgba(255, 50, 100, 0.3)", pos: "100% 27%", size: "11px 12px" },
    ],
  },
  mono: {
    border: [
      { color: "rgb(160, 160, 160)", pos: "2% 68%", size: "9px 18px" },
      { color: "rgb(140, 140, 140)", pos: "2% 68%", size: "4px 8px" },
      { color: "rgb(180, 180, 180)", pos: "72% -3%", size: "59px 9px" },
      { color: "rgb(150, 150, 150)", pos: "74% 100%", size: "42px 7px" },
      { color: "rgb(170, 170, 170)", pos: "100% 27%", size: "10px 17px" },
      { color: "rgb(155, 155, 155)", pos: "100% 27%", size: "10px 18px" },
      { color: "rgb(145, 145, 145)", pos: "100% 27%", size: "5px 10px" },
      { color: "rgb(165, 165, 165)", pos: "100% 27%", size: "11px 12px" },
    ],
    inner: [
      { color: "rgba(160, 160, 160, 0.25)", pos: "2% 68%", size: "9px 18px" },
      { color: "rgba(140, 140, 140, 0.22)", pos: "2% 68%", size: "4px 8px" },
      { color: "rgba(180, 180, 180, 0.17)", pos: "72% -3%", size: "59px 9px" },
      { color: "rgba(150, 150, 150, 0.17)", pos: "74% 100%", size: "42px 7px" },
      { color: "rgba(170, 170, 170, 0.15)", pos: "100% 27%", size: "10px 17px" },
      { color: "rgba(155, 155, 155, 0.20)", pos: "100% 27%", size: "10px 18px" },
      { color: "rgba(145, 145, 145, 0.15)", pos: "100% 27%", size: "5px 10px" },
      { color: "rgba(165, 165, 165, 0.15)", pos: "100% 27%", size: "11px 12px" },
    ],
  },
  ocean: {
    border: [
      { color: "rgb(60, 140, 200)", pos: "2% 68%", size: "9px 18px" },
      { color: "rgb(50, 120, 180)", pos: "2% 68%", size: "4px 8px" },
      { color: "rgb(100, 80, 220)", pos: "72% -3%", size: "59px 9px" },
      { color: "rgb(80, 100, 255)", pos: "74% 100%", size: "42px 7px" },
      { color: "rgb(120, 70, 240)", pos: "100% 27%", size: "10px 17px" },
      { color: "rgb(90, 80, 220)", pos: "100% 27%", size: "10px 18px" },
      { color: "rgb(70, 110, 255)", pos: "100% 27%", size: "5px 10px" },
      { color: "rgb(110, 90, 230)", pos: "100% 27%", size: "11px 12px" },
    ],
    inner: [
      { color: "rgba(60, 140, 200, 0.5)", pos: "2% 68%", size: "9px 18px" },
      { color: "rgba(50, 120, 180, 0.45)", pos: "2% 68%", size: "4px 8px" },
      { color: "rgba(100, 80, 220, 0.35)", pos: "72% -3%", size: "59px 9px" },
      { color: "rgba(80, 100, 255, 0.35)", pos: "74% 100%", size: "42px 7px" },
      { color: "rgba(120, 70, 240, 0.3)", pos: "100% 27%", size: "10px 17px" },
      { color: "rgba(90, 80, 220, 0.4)", pos: "100% 27%", size: "10px 18px" },
      { color: "rgba(70, 110, 255, 0.3)", pos: "100% 27%", size: "5px 10px" },
      { color: "rgba(110, 90, 230, 0.3)", pos: "100% 27%", size: "11px 12px" },
    ],
  },
  sunset: {
    border: [
      { color: "rgb(255, 180, 50)", pos: "2% 68%", size: "9px 18px" },
      { color: "rgb(255, 150, 40)", pos: "2% 68%", size: "4px 8px" },
      { color: "rgb(255, 80, 60)", pos: "72% -3%", size: "59px 9px" },
      { color: "rgb(255, 100, 80)", pos: "74% 100%", size: "42px 7px" },
      { color: "rgb(255, 60, 80)", pos: "100% 27%", size: "10px 17px" },
      { color: "rgb(255, 120, 60)", pos: "100% 27%", size: "10px 18px" },
      { color: "rgb(255, 200, 50)", pos: "100% 27%", size: "5px 10px" },
      { color: "rgb(255, 90, 70)", pos: "100% 27%", size: "11px 12px" },
    ],
    inner: [
      { color: "rgba(255, 180, 50, 0.5)", pos: "2% 68%", size: "9px 18px" },
      { color: "rgba(255, 150, 40, 0.45)", pos: "2% 68%", size: "4px 8px" },
      { color: "rgba(255, 80, 60, 0.35)", pos: "72% -3%", size: "59px 9px" },
      { color: "rgba(255, 100, 80, 0.35)", pos: "74% 100%", size: "42px 7px" },
      { color: "rgba(255, 60, 80, 0.3)", pos: "100% 27%", size: "10px 17px" },
      { color: "rgba(255, 120, 60, 0.4)", pos: "100% 27%", size: "10px 18px" },
      { color: "rgba(255, 200, 50, 0.3)", pos: "100% 27%", size: "5px 10px" },
      { color: "rgba(255, 90, 70, 0.3)", pos: "100% 27%", size: "11px 12px" },
    ],
  },
};

/** 原 _Bt（— / 129479）：line 描边色板（变体×主题，9 点） */
const LINE_STROKE_PALETTES: Record<BeamVariant, Record<"dark" | "light", BeamPaletteStop[]>> = {
  colorful: {
    dark: [
      { color: "rgb(255, 50, 100)", sizeW: 36, sizeH: 36, offsetX: 0, offsetY: 2 },
      { color: "rgb(40, 180, 220)", sizeW: 30, sizeH: 32, offsetX: 39, offsetY: 0 },
      { color: "rgb(50, 200, 80)", sizeW: 33, sizeH: 28, offsetX: -36, offsetY: 2 },
      { color: "rgb(180, 40, 240)", sizeW: 29, sizeH: 34, offsetX: -54, offsetY: 0 },
      { color: "rgb(255, 160, 30)", sizeW: 27, sizeH: 30, offsetX: 51, offsetY: -1 },
      { color: "rgb(100, 70, 255)", sizeW: 36, sizeH: 24, offsetX: 21, offsetY: 1 },
      { color: "rgb(40, 140, 255)", sizeW: 30, sizeH: 22, offsetX: -21, offsetY: 0 },
      { color: "rgb(240, 50, 180)", sizeW: 25, sizeH: 28, offsetX: 66, offsetY: 1 },
      { color: "rgb(30, 185, 170)", sizeW: 23, sizeH: 30, offsetX: -66, offsetY: -1 },
    ],
    light: [
      { color: "rgb(255, 50, 100)", sizeW: 45, sizeH: 36, offsetX: 0, offsetY: 2 },
      { color: "rgb(40, 140, 255)", sizeW: 35, sizeH: 32, offsetX: 65, offsetY: 0 },
      { color: "rgb(50, 200, 80)", sizeW: 40, sizeH: 28, offsetX: -60, offsetY: 2 },
      { color: "rgb(180, 40, 240)", sizeW: 35, sizeH: 34, offsetX: -90, offsetY: 0 },
      { color: "rgb(30, 185, 170)", sizeW: 38, sizeH: 30, offsetX: 85, offsetY: -1 },
      { color: "rgb(100, 70, 255)", sizeW: 50, sizeH: 24, offsetX: 35, offsetY: 1 },
      { color: "rgb(40, 140, 255)", sizeW: 40, sizeH: 22, offsetX: -35, offsetY: 0 },
      { color: "rgb(255, 120, 40)", sizeW: 35, sizeH: 28, offsetX: 110, offsetY: 1 },
      { color: "rgb(240, 50, 180)", sizeW: 30, sizeH: 30, offsetX: -110, offsetY: -1 },
    ],
  },
  mono: {
    dark: [
      { color: "rgb(200, 200, 200)", sizeW: 36, sizeH: 36, offsetX: 0, offsetY: 2 },
      { color: "rgb(170, 170, 170)", sizeW: 30, sizeH: 32, offsetX: 39, offsetY: 0 },
      { color: "rgb(155, 155, 155)", sizeW: 33, sizeH: 28, offsetX: -36, offsetY: 2 },
      { color: "rgb(185, 185, 185)", sizeW: 29, sizeH: 34, offsetX: -54, offsetY: 0 },
      { color: "rgb(165, 165, 165)", sizeW: 27, sizeH: 30, offsetX: 51, offsetY: -1 },
      { color: "rgb(180, 180, 180)", sizeW: 36, sizeH: 24, offsetX: 21, offsetY: 1 },
      { color: "rgb(160, 160, 160)", sizeW: 30, sizeH: 22, offsetX: -21, offsetY: 0 },
      { color: "rgb(175, 175, 175)", sizeW: 25, sizeH: 28, offsetX: 66, offsetY: 1 },
      { color: "rgb(190, 190, 190)", sizeW: 23, sizeH: 30, offsetX: -66, offsetY: -1 },
    ],
    light: [
      { color: "rgb(100, 100, 100)", sizeW: 45, sizeH: 36, offsetX: 0, offsetY: 2 },
      { color: "rgb(80, 80, 80)", sizeW: 35, sizeH: 32, offsetX: 65, offsetY: 0 },
      { color: "rgb(90, 90, 90)", sizeW: 40, sizeH: 28, offsetX: -60, offsetY: 2 },
      { color: "rgb(70, 70, 70)", sizeW: 35, sizeH: 34, offsetX: -90, offsetY: 0 },
      { color: "rgb(85, 85, 85)", sizeW: 38, sizeH: 30, offsetX: 85, offsetY: -1 },
      { color: "rgb(95, 95, 95)", sizeW: 50, sizeH: 24, offsetX: 35, offsetY: 1 },
      { color: "rgb(75, 75, 75)", sizeW: 40, sizeH: 22, offsetX: -35, offsetY: 0 },
      { color: "rgb(105, 105, 105)", sizeW: 35, sizeH: 28, offsetX: 110, offsetY: 1 },
      { color: "rgb(65, 65, 65)", sizeW: 30, sizeH: 30, offsetX: -110, offsetY: -1 },
    ],
  },
  ocean: {
    dark: [
      { color: "rgb(100, 80, 220)", sizeW: 36, sizeH: 36, offsetX: 0, offsetY: 2 },
      { color: "rgb(60, 120, 255)", sizeW: 30, sizeH: 32, offsetX: 39, offsetY: 0 },
      { color: "rgb(80, 100, 200)", sizeW: 33, sizeH: 28, offsetX: -36, offsetY: 2 },
      { color: "rgb(130, 70, 255)", sizeW: 29, sizeH: 34, offsetX: -54, offsetY: 0 },
      { color: "rgb(70, 130, 255)", sizeW: 27, sizeH: 30, offsetX: 51, offsetY: -1 },
      { color: "rgb(120, 80, 255)", sizeW: 36, sizeH: 24, offsetX: 21, offsetY: 1 },
      { color: "rgb(90, 110, 230)", sizeW: 30, sizeH: 22, offsetX: -21, offsetY: 0 },
      { color: "rgb(110, 90, 240)", sizeW: 25, sizeH: 28, offsetX: 66, offsetY: 1 },
      { color: "rgb(140, 100, 255)", sizeW: 23, sizeH: 30, offsetX: -66, offsetY: -1 },
    ],
    light: [
      { color: "rgb(80, 60, 200)", sizeW: 45, sizeH: 36, offsetX: 0, offsetY: 2 },
      { color: "rgb(50, 100, 220)", sizeW: 35, sizeH: 32, offsetX: 65, offsetY: 0 },
      { color: "rgb(70, 90, 190)", sizeW: 40, sizeH: 28, offsetX: -60, offsetY: 2 },
      { color: "rgb(110, 60, 220)", sizeW: 35, sizeH: 34, offsetX: -90, offsetY: 0 },
      { color: "rgb(60, 110, 230)", sizeW: 38, sizeH: 30, offsetX: 85, offsetY: -1 },
      { color: "rgb(100, 70, 240)", sizeW: 50, sizeH: 24, offsetX: 35, offsetY: 1 },
      { color: "rgb(80, 100, 210)", sizeW: 40, sizeH: 22, offsetX: -35, offsetY: 0 },
      { color: "rgb(90, 80, 225)", sizeW: 35, sizeH: 28, offsetX: 110, offsetY: 1 },
      { color: "rgb(120, 90, 245)", sizeW: 30, sizeH: 30, offsetX: -110, offsetY: -1 },
    ],
  },
  sunset: {
    dark: [
      { color: "rgb(255, 100, 60)", sizeW: 36, sizeH: 36, offsetX: 0, offsetY: 2 },
      { color: "rgb(255, 180, 50)", sizeW: 30, sizeH: 32, offsetX: 39, offsetY: 0 },
      { color: "rgb(255, 140, 70)", sizeW: 33, sizeH: 28, offsetX: -36, offsetY: 2 },
      { color: "rgb(255, 80, 80)", sizeW: 29, sizeH: 34, offsetX: -54, offsetY: 0 },
      { color: "rgb(255, 200, 60)", sizeW: 27, sizeH: 30, offsetX: 51, offsetY: -1 },
      { color: "rgb(255, 120, 50)", sizeW: 36, sizeH: 24, offsetX: 21, offsetY: 1 },
      { color: "rgb(255, 160, 80)", sizeW: 30, sizeH: 22, offsetX: -21, offsetY: 0 },
      { color: "rgb(255, 90, 60)", sizeW: 25, sizeH: 28, offsetX: 66, offsetY: 1 },
      { color: "rgb(255, 70, 70)", sizeW: 23, sizeH: 30, offsetX: -66, offsetY: -1 },
    ],
    light: [
      { color: "rgb(220, 80, 40)", sizeW: 45, sizeH: 36, offsetX: 0, offsetY: 2 },
      { color: "rgb(230, 150, 30)", sizeW: 35, sizeH: 32, offsetX: 65, offsetY: 0 },
      { color: "rgb(210, 110, 50)", sizeW: 40, sizeH: 28, offsetX: -60, offsetY: 2 },
      { color: "rgb(200, 60, 60)", sizeW: 35, sizeH: 34, offsetX: -90, offsetY: 0 },
      { color: "rgb(220, 170, 40)", sizeW: 38, sizeH: 30, offsetX: 85, offsetY: -1 },
      { color: "rgb(210, 100, 30)", sizeW: 50, sizeH: 24, offsetX: 35, offsetY: 1 },
      { color: "rgb(230, 130, 60)", sizeW: 40, sizeH: 22, offsetX: -35, offsetY: 0 },
      { color: "rgb(190, 70, 50)", sizeW: 35, sizeH: 28, offsetX: 110, offsetY: 1 },
      { color: "rgb(180, 50, 50)", sizeW: 30, sizeH: 30, offsetX: -110, offsetY: -1 },
    ],
  },
};

/** 原 yBt（— / 129940）：line 内部色板（带 alpha） */
const LINE_INNER_PALETTES: Record<BeamVariant, BeamPaletteStop[]> = {
  colorful: [
    { color: "rgba(255, 50, 100, 0.48)", sizeW: 33, sizeH: 30, offsetX: 0, offsetY: 0 },
    { color: "rgba(40, 180, 220, 0.42)", sizeW: 24, sizeH: 26, offsetX: 39, offsetY: -3 },
    { color: "rgba(50, 200, 80, 0.48)", sizeW: 27, sizeH: 24, offsetX: -36, offsetY: 0 },
    { color: "rgba(180, 40, 240, 0.42)", sizeW: 23, sizeH: 28, offsetX: -54, offsetY: -2 },
    { color: "rgba(255, 160, 30, 0.50)", sizeW: 24, sizeH: 24, offsetX: 51, offsetY: -1 },
    { color: "rgba(100, 70, 255, 0.45)", sizeW: 30, sizeH: 20, offsetX: 21, offsetY: 0 },
    { color: "rgba(40, 140, 255, 0.40)", sizeW: 25, sizeH: 18, offsetX: -21, offsetY: -2 },
    { color: "rgba(240, 50, 180, 0.45)", sizeW: 21, sizeH: 24, offsetX: 66, offsetY: 0 },
    { color: "rgba(30, 185, 170, 0.52)", sizeW: 18, sizeH: 26, offsetX: -66, offsetY: -1 },
  ],
  mono: [
    { color: "rgba(200, 200, 200, 0.48)", sizeW: 33, sizeH: 30, offsetX: 0, offsetY: 0 },
    { color: "rgba(170, 170, 170, 0.42)", sizeW: 24, sizeH: 26, offsetX: 39, offsetY: -3 },
    { color: "rgba(155, 155, 155, 0.48)", sizeW: 27, sizeH: 24, offsetX: -36, offsetY: 0 },
    { color: "rgba(185, 185, 185, 0.42)", sizeW: 23, sizeH: 28, offsetX: -54, offsetY: -2 },
    { color: "rgba(165, 165, 165, 0.50)", sizeW: 24, sizeH: 24, offsetX: 51, offsetY: -1 },
    { color: "rgba(180, 180, 180, 0.45)", sizeW: 30, sizeH: 20, offsetX: 21, offsetY: 0 },
    { color: "rgba(160, 160, 160, 0.40)", sizeW: 25, sizeH: 18, offsetX: -21, offsetY: -2 },
    { color: "rgba(175, 175, 175, 0.45)", sizeW: 21, sizeH: 24, offsetX: 66, offsetY: 0 },
    { color: "rgba(190, 190, 190, 0.52)", sizeW: 18, sizeH: 26, offsetX: -66, offsetY: -1 },
  ],
  ocean: [
    { color: "rgba(100, 80, 220, 0.48)", sizeW: 33, sizeH: 30, offsetX: 0, offsetY: 0 },
    { color: "rgba(60, 120, 255, 0.42)", sizeW: 24, sizeH: 26, offsetX: 39, offsetY: -3 },
    { color: "rgba(80, 100, 200, 0.48)", sizeW: 27, sizeH: 24, offsetX: -36, offsetY: 0 },
    { color: "rgba(130, 70, 255, 0.42)", sizeW: 23, sizeH: 28, offsetX: -54, offsetY: -2 },
    { color: "rgba(70, 130, 255, 0.50)", sizeW: 24, sizeH: 24, offsetX: 51, offsetY: -1 },
    { color: "rgba(120, 80, 255, 0.45)", sizeW: 30, sizeH: 20, offsetX: 21, offsetY: 0 },
    { color: "rgba(90, 110, 230, 0.40)", sizeW: 25, sizeH: 18, offsetX: -21, offsetY: -2 },
    { color: "rgba(110, 90, 240, 0.45)", sizeW: 21, sizeH: 24, offsetX: 66, offsetY: 0 },
    { color: "rgba(140, 100, 255, 0.52)", sizeW: 18, sizeH: 26, offsetX: -66, offsetY: -1 },
  ],
  sunset: [
    { color: "rgba(255, 100, 60, 0.48)", sizeW: 33, sizeH: 30, offsetX: 0, offsetY: 0 },
    { color: "rgba(255, 180, 50, 0.42)", sizeW: 24, sizeH: 26, offsetX: 39, offsetY: -3 },
    { color: "rgba(255, 140, 70, 0.48)", sizeW: 27, sizeH: 24, offsetX: -36, offsetY: 0 },
    { color: "rgba(255, 80, 80, 0.42)", sizeW: 23, sizeH: 28, offsetX: -54, offsetY: -2 },
    { color: "rgba(255, 200, 60, 0.50)", sizeW: 24, sizeH: 24, offsetX: 51, offsetY: -1 },
    { color: "rgba(255, 120, 50, 0.45)", sizeW: 30, sizeH: 20, offsetX: 21, offsetY: 0 },
    { color: "rgba(255, 160, 80, 0.40)", sizeW: 25, sizeH: 18, offsetX: -21, offsetY: -2 },
    { color: "rgba(255, 90, 60, 0.45)", sizeW: 21, sizeH: 24, offsetX: 66, offsetY: 0 },
    { color: "rgba(255, 70, 70, 0.52)", sizeW: 18, sizeH: 26, offsetX: -66, offsetY: -1 },
  ],
};

/** 原 xBt（— / 130168）：line 尖峰色板（变体×主题，5 对） */
const LINE_SPIKE_PALETTES: Record<BeamVariant, Record<"dark" | "light", { spikes: Array<{ color1: string; color2: string }> }>> = {
  colorful: {
    dark: {
      spikes: [
        { color1: "rgb(100, 70, 255)", color2: "rgba(100, 70, 255, 1)" },
        { color1: "rgba(255, 170, 40, 0.59)", color2: "rgba(255, 170, 40, 0.29)" },
        { color1: "rgb(50, 200, 100)", color2: "rgba(50, 200, 100, 1)" },
        { color1: "rgba(200, 50, 240, 0.91)", color2: "rgba(200, 50, 240, 0.45)" },
        { color1: "rgb(40, 140, 255)", color2: "rgba(40, 140, 255, 1)" },
      ],
    },
    light: {
      spikes: [
        { color1: "rgb(80, 50, 200)", color2: "rgba(80, 50, 200, 0.8)" },
        { color1: "rgba(210, 130, 0, 0.7)", color2: "rgba(210, 130, 0, 0.46)" },
        { color1: "rgb(30, 160, 70)", color2: "rgba(30, 160, 70, 0.82)" },
        { color1: "rgb(160, 30, 190)", color2: "rgba(160, 30, 190, 0.7)" },
        { color1: "rgb(30, 100, 200)", color2: "rgba(30, 100, 200, 0.78)" },
      ],
    },
  },
  mono: {
    dark: {
      spikes: [
        { color1: "rgb(200, 200, 200)", color2: "rgba(200, 200, 200, 1)" },
        { color1: "rgba(180, 180, 180, 0.59)", color2: "rgba(180, 180, 180, 0.29)" },
        { color1: "rgb(190, 190, 190)", color2: "rgba(190, 190, 190, 1)" },
        { color1: "rgba(170, 170, 170, 0.91)", color2: "rgba(170, 170, 170, 0.45)" },
        { color1: "rgb(185, 185, 185)", color2: "rgba(185, 185, 185, 1)" },
      ],
    },
    light: {
      spikes: [
        { color1: "rgb(80, 80, 80)", color2: "rgba(80, 80, 80, 0.8)" },
        { color1: "rgba(100, 100, 100, 0.7)", color2: "rgba(100, 100, 100, 0.46)" },
        { color1: "rgb(70, 70, 70)", color2: "rgba(70, 70, 70, 0.82)" },
        { color1: "rgb(90, 90, 90)", color2: "rgba(90, 90, 90, 0.7)" },
        { color1: "rgb(85, 85, 85)", color2: "rgba(85, 85, 85, 0.78)" },
      ],
    },
  },
  ocean: {
    dark: {
      spikes: [
        { color1: "rgb(100, 80, 255)", color2: "rgb(100, 80, 255)" },
        { color1: "rgba(80, 130, 220, 0.59)", color2: "rgba(80, 130, 220, 0.29)" },
        { color1: "rgb(60, 100, 255)", color2: "rgb(60, 100, 255)" },
        { color1: "rgba(90, 120, 200, 0.91)", color2: "rgba(90, 120, 200, 0.45)" },
        { color1: "rgb(120, 90, 255)", color2: "rgb(120, 90, 255)" },
      ],
    },
    light: {
      spikes: [
        { color1: "rgb(50, 40, 180)", color2: "rgba(50, 40, 180, 0.8)" },
        { color1: "rgba(40, 80, 200, 0.7)", color2: "rgba(40, 80, 200, 0.46)" },
        { color1: "rgb(30, 50, 190)", color2: "rgba(30, 50, 190, 0.82)" },
        { color1: "rgb(60, 90, 180)", color2: "rgba(60, 90, 180, 0.7)" },
        { color1: "rgb(70, 60, 200)", color2: "rgba(70, 60, 200, 0.78)" },
      ],
    },
  },
  sunset: {
    dark: {
      spikes: [
        { color1: "rgb(255, 100, 80)", color2: "rgb(255, 100, 80)" },
        { color1: "rgba(255, 150, 80, 0.59)", color2: "rgba(255, 150, 80, 0.29)" },
        { color1: "rgb(255, 80, 60)", color2: "rgb(255, 80, 60)" },
        { color1: "rgba(255, 120, 50, 0.91)", color2: "rgba(255, 120, 50, 0.45)" },
        { color1: "rgb(255, 140, 70)", color2: "rgb(255, 140, 70)" },
      ],
    },
    light: {
      spikes: [
        { color1: "rgb(200, 60, 30)", color2: "rgba(200, 60, 30, 0.8)" },
        { color1: "rgba(220, 100, 20, 0.7)", color2: "rgba(220, 100, 20, 0.46)" },
        { color1: "rgb(180, 40, 20)", color2: "rgba(180, 40, 20, 0.82)" },
        { color1: "rgb(210, 80, 10)", color2: "rgba(210, 80, 10, 0.7)" },
        { color1: "rgb(190, 70, 30)", color2: "rgba(190, 70, 30, 0.78)" },
      ],
    },
  },
};

/** 原 fBt/pBt（— / 129454/129458）：sm 边框/内部渐变串 */
function smBorderGradients(variant: BeamVariant): string {
  return SM_BEAM_PALETTES[variant].border.map((stop) => `radial-gradient(ellipse ${stop.size} at ${stop.pos}, ${stop.color}, transparent)`).join(",\n    ");
}
function smInnerGradients(variant: BeamVariant): string {
  return SM_BEAM_PALETTES[variant].inner.map((stop) => `radial-gradient(ellipse ${stop.size} at ${stop.pos}, ${stop.color}, transparent)`).join(",\n    ");
}
/** 原 mBt/hBt（— / 129462/129466）：md 边框/内部渐变串（内部按 0.9 缩放 + alpha） */
function mdBorderGradients(variant: BeamVariant): string {
  return MD_BEAM_PALETTES[variant].border.map((stop) => `radial-gradient(ellipse ${stop.size} at ${stop.pos}, ${stop.color}, transparent)`).join(",\n    ");
}
function mdInnerGradients(variant: BeamVariant): string {
  const palette = MD_BEAM_PALETTES[variant];
  const alpha = variant === "mono" ? 0.225 : 0.45;
  return palette.border.map((stop) => {
    const color = stop.color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
    const size = (stop.size ?? "")
      .split(" ")
      .map((part) => `${Math.round(parseInt(part, 10) * 0.9)}px`)
      .join(" ");
    return `radial-gradient(ellipse ${size} at ${stop.pos}, ${color}, transparent)`;
  }).join(",\n    ");
}
/** 原 gBt（— / 129475）：尖峰主/次色（dark/light） */
function resolveSpikePalette(variant: BeamVariant, dark: boolean): { primary: string; secondary: string } {
  const palette = MD_BEAM_PALETTES[variant];
  return dark ? palette.spike : palette.spikeLt;
}
/** 原 H8（— / 129920）：rgb()/rgba() → 指定 alpha */
function withAlpha(color: string, alpha: number): string {
  const rgbaMatch = color.match(/^rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*[\d.]+\s*\)$/);
  if (rgbaMatch) return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${alpha})`;
  const rgbMatch = color.match(/^rgb\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/);
  return rgbMatch ? `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})` : color;
}

function offsetSuffix(value: number): string {
  return value === 0 ? "" : value > 0 ? ` + ${value}px` : ` - ${Math.abs(value)}px`;
}
/** 原 vBt（— / 129929）：line 描边渐变串（随 --beam-x/--beam-w/--beam-h 动画） */
function lineStrokeGradients(variant: BeamVariant, dark: boolean, id: string): string {
  return LINE_STROKE_PALETTES[variant][dark ? "dark" : "light"]
    .map((stop) => {
      const x = offsetSuffix(stop.offsetX ?? 0);
      const y = offsetSuffix(stop.offsetY ?? 0);
      return `radial-gradient(ellipse calc(${stop.sizeW}px * var(--beam-w-${id})) calc(${stop.sizeH}px * var(--beam-h-${id})) at calc(var(--beam-x-${id}) * 100%${x}) calc(100%${y}), ${stop.color}, transparent)`;
    })
    .join(",\n       ");
}
/** 原 bBt（— / 130159）：line 内部渐变串 */
function lineInnerGradients(variant: BeamVariant, id: string): string {
  return LINE_INNER_PALETTES[variant]
    .map((stop) => {
      const x = offsetSuffix(stop.offsetX ?? 0);
      const y = offsetSuffix(stop.offsetY ?? 0);
      return `radial-gradient(ellipse calc(${stop.sizeW}px * var(--beam-w-${id})) calc(${stop.sizeH}px * var(--beam-h-${id})) at calc(var(--beam-x-${id}) * 100%${x}) calc(100%${y}), ${stop.color}, transparent)`;
    })
    .join(",\n    ");
}
/** 原 CBt（— / 130349）：line mono 尖峰/晕光渐变串 */
function lineBloomMonoGradients(dark: boolean, id: string): string {
  return dark
    ? `radial-gradient(ellipse calc(18px * var(--beam-spike-${id})) calc(30px * var(--beam-h-${id})) at 8% calc(100% - 2px), rgba(200, 200, 200, 0.35), rgba(200, 200, 200, 0.12) 50%, transparent 100%),
       radial-gradient(ellipse calc(14px * var(--beam-spike2-${id})) calc(28px * var(--beam-h-${id})) at 22% calc(100% - 4px), rgba(170, 170, 170, 0.3), rgba(170, 170, 170, 0.1) 50%, transparent 100%),
       radial-gradient(ellipse calc(16px * var(--beam-spike-${id})) calc(32px * var(--beam-h-${id})) at 36% calc(100% - 3px), rgba(190, 190, 190, 0.35), rgba(190, 190, 190, 0.12) 50%, transparent 100%),
       radial-gradient(ellipse calc(20px * var(--beam-spike2-${id})) calc(25px * var(--beam-h-${id})) at 50% calc(100% - 2px), rgba(180, 180, 180, 0.25), rgba(180, 180, 180, 0.08) 55%, transparent 100%),
       radial-gradient(ellipse calc(15px * var(--beam-spike2-${id})) calc(30px * var(--beam-h-${id})) at 64% calc(100% - 4px), rgba(185, 185, 185, 0.32), rgba(185, 185, 185, 0.1) 50%, transparent 100%),
       radial-gradient(ellipse calc(12px * var(--beam-spike-${id})) calc(28px * var(--beam-h-${id})) at 78% calc(100% - 2px), rgba(175, 175, 175, 0.28), rgba(175, 175, 175, 0.09) 50%, transparent 100%),
       radial-gradient(ellipse calc(17px * var(--beam-spike-${id})) calc(26px * var(--beam-h-${id})) at 92% calc(100% - 3px), rgba(195, 195, 195, 0.3), rgba(195, 195, 195, 0.1) 50%, transparent 100%),
       radial-gradient(ellipse calc(21px * var(--beam-spike-${id})) calc(15px * var(--beam-spike2-${id})) at calc(var(--beam-x-${id}) * 100%) calc(100% + 1px), rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.9) 20%, rgba(255, 255, 255, 0.5) 50%, transparent 100%),
       radial-gradient(ellipse calc(42px * var(--beam-w-${id})) calc(40px * var(--beam-h-${id})) at calc(var(--beam-x-${id}) * 100%) 100%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.12) 25%, rgba(255, 255, 255, 0.03) 55%, transparent 80%)`
    : `radial-gradient(ellipse calc(18px * var(--beam-spike-${id})) calc(30px * var(--beam-h-${id})) at 8% calc(100% - 2px), rgba(80, 80, 80, 0.3), rgba(80, 80, 80, 0.1) 50%, transparent 100%),
       radial-gradient(ellipse calc(14px * var(--beam-spike2-${id})) calc(28px * var(--beam-h-${id})) at 22% calc(100% - 4px), rgba(100, 100, 100, 0.25), rgba(100, 100, 100, 0.08) 50%, transparent 100%),
       radial-gradient(ellipse calc(16px * var(--beam-spike-${id})) calc(32px * var(--beam-h-${id})) at 36% calc(100% - 3px), rgba(70, 70, 70, 0.3), rgba(70, 70, 70, 0.1) 50%, transparent 100%),
       radial-gradient(ellipse calc(20px * var(--beam-spike2-${id})) calc(25px * var(--beam-h-${id})) at 50% calc(100% - 2px), rgba(90, 90, 90, 0.22), rgba(90, 90, 90, 0.07) 55%, transparent 100%),
       radial-gradient(ellipse calc(15px * var(--beam-spike2-${id})) calc(30px * var(--beam-h-${id})) at 64% calc(100% - 4px), rgba(85, 85, 85, 0.28), rgba(85, 85, 85, 0.09) 50%, transparent 100%),
       radial-gradient(ellipse calc(12px * var(--beam-spike-${id})) calc(28px * var(--beam-h-${id})) at 78% calc(100% - 2px), rgba(95, 95, 95, 0.24), rgba(95, 95, 95, 0.08) 50%, transparent 100%),
       radial-gradient(ellipse calc(17px * var(--beam-spike-${id})) calc(26px * var(--beam-h-${id})) at 92% calc(100% - 3px), rgba(75, 75, 75, 0.26), rgba(75, 75, 75, 0.08) 50%, transparent 100%),
       radial-gradient(ellipse calc(50px * var(--beam-w-${id})) calc(32px * var(--beam-h-${id})) at calc(var(--beam-x-${id}) * 100%) calc(100%), rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.18) 30%, rgba(0, 0, 0, 0.03) 60%, transparent 85%)`;
}
/** 原 SBt（— / 130327）：line 晕光渐变串（彩色=尖峰色板；mono=CBt） */
function lineBloomGradients(variant: BeamVariant, dark: boolean, id: string): string {
  const spike = resolveSpikePalette(variant, dark);
  const primary = spike.primary;
  const secondary = spike.secondary;
  const spikes = LINE_SPIKE_PALETTES[variant][dark ? "dark" : "light"].spikes;
  if (variant === "mono") return lineBloomMonoGradients(dark, id);
  return dark
    ? `radial-gradient(ellipse calc(0.8px * var(--beam-spike-${id})) calc(92px * var(--beam-h-${id})) at 8% calc(100% - 2px), ${primary}, ${primary} 30%, transparent 88%),
       radial-gradient(ellipse calc(10px * var(--beam-spike2-${id})) calc(35px * var(--beam-h-${id})) at 22% calc(100% - 4px), ${secondary}, ${withAlpha(secondary, 0.49)} 50%, transparent 95%),
       radial-gradient(ellipse calc(2px * (2 - var(--beam-spike-${id}))) calc(72px * var(--beam-h-${id})) at 36% calc(100% - 3px), ${spikes[0].color1}, ${spikes[0].color2} 40%, transparent 90%),
       radial-gradient(ellipse calc(14px * var(--beam-spike2-${id})) calc(28px * var(--beam-h-${id})) at 50% calc(100% - 2px), ${spikes[1].color1}, ${spikes[1].color2} 55%, transparent 96%),
       radial-gradient(ellipse calc(1.2px * (2 - var(--beam-spike2-${id}))) calc(85px * var(--beam-h-${id})) at 64% calc(100% - 4px), ${spikes[2].color1}, ${spikes[2].color2} 35%, transparent 89%),
       radial-gradient(ellipse calc(7px * var(--beam-spike-${id})) calc(45px * var(--beam-h-${id})) at 78% calc(100% - 2px), ${spikes[3].color1}, ${spikes[3].color2} 48%, transparent 94%),
       radial-gradient(ellipse calc(0.6px * (2 - var(--beam-spike-${id}))) calc(60px * var(--beam-h-${id})) at 92% calc(100% - 3px), ${spikes[4].color1}, ${spikes[4].color2} 42%, transparent 91%),
       radial-gradient(ellipse calc(21px * var(--beam-spike-${id})) calc(15px * var(--beam-spike2-${id})) at calc(var(--beam-x-${id}) * 100%) calc(100% + 1px), rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.9) 20%, rgba(255, 255, 255, 0.5) 50%, transparent 100%),
       radial-gradient(ellipse calc(42px * var(--beam-w-${id})) calc(40px * var(--beam-h-${id})) at calc(var(--beam-x-${id}) * 100%) 100%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.12) 25%, rgba(255, 255, 255, 0.03) 55%, transparent 80%)`
    : `radial-gradient(ellipse calc(0.8px * var(--beam-spike-${id})) calc(92px * var(--beam-h-${id})) at 8% calc(100% - 2px), ${primary}, ${withAlpha(primary, 0.85)} 30%, transparent 88%),
       radial-gradient(ellipse calc(10px * var(--beam-spike2-${id})) calc(35px * var(--beam-h-${id})) at 22% calc(100% - 4px), ${secondary}, ${withAlpha(secondary, 0.7)} 50%, transparent 95%),
       radial-gradient(ellipse calc(2px * (2 - var(--beam-spike-${id}))) calc(72px * var(--beam-h-${id})) at 36% calc(100% - 3px), ${spikes[0].color1}, ${spikes[0].color2} 40%, transparent 90%),
       radial-gradient(ellipse calc(14px * var(--beam-spike2-${id})) calc(28px * var(--beam-h-${id})) at 50% calc(100% - 2px), ${spikes[1].color1}, ${spikes[1].color2} 55%, transparent 96%),
       radial-gradient(ellipse calc(1.2px * (2 - var(--beam-spike2-${id}))) calc(85px * var(--beam-h-${id})) at 64% calc(100% - 4px), ${spikes[2].color1}, ${spikes[2].color2} 35%, transparent 89%),
       radial-gradient(ellipse calc(7px * var(--beam-spike-${id})) calc(45px * var(--beam-h-${id})) at 78% calc(100% - 2px), ${spikes[3].color1}, ${spikes[3].color2} 48%, transparent 94%),
       radial-gradient(ellipse calc(1px * (2 - var(--beam-spike-${id}))) calc(60px * var(--beam-h-${id})) at 92% calc(100% - 3px), ${spikes[4].color1}, ${spikes[4].color2} 42%, transparent 91%),
       radial-gradient(ellipse calc(50px * var(--beam-w-${id})) calc(32px * var(--beam-h-${id})) at calc(var(--beam-x-${id}) * 100%) calc(100%), rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.18) 30%, rgba(0, 0, 0, 0.03) 60%, transparent 85%)`;
}

interface BeamCssOptions {
  id: string;
  size?: "sm" | "md" | "line";
  borderRadius: number;
  borderWidth: number;
  duration: number;
  strokeOpacity: number;
  innerOpacity: number;
  bloomOpacity: number;
  innerShadow: string;
  colorVariant: BeamVariant;
  staticColors: boolean;
  brightness: number;
  saturation: number;
  hueRange: number;
  theme: "dark" | "light";
}

/** sm/md 共享的 hue-shift 键帧与静态开关 */
function beamHueShiftParts(options: BeamCssOptions): { animationLine: string; keyframes: string } {
  const { id, staticColors, brightness, saturation, hueRange, brightness: b } = options;
  const animationLine = staticColors ? "" : `animation: beam-hue-shift-${id} 12s ease-in-out infinite;`;
  const keyframes = staticColors
    ? ""
    : `
@keyframes beam-hue-shift-${id} {
  0% { filter: hue-rotate(-${hueRange}deg) brightness(${b.toFixed(2)}) saturate(${saturation.toFixed(2)}); }
  50% { filter: hue-rotate(${hueRange}deg) brightness(${b.toFixed(2)}) saturate(${saturation.toFixed(2)}); }
  100% { filter: hue-rotate(-${hueRange}deg) brightness(${b.toFixed(2)}) saturate(${saturation.toFixed(2)}); }
}`;
  return { animationLine, keyframes };
}
/** sm/md 共享的 conic 描边/晕光渐变（主题相关） */
function beamConicStroke(options: BeamCssOptions): string {
  const { id, theme } = options;
  return theme === "dark"
    ? `conic-gradient(
        from var(--beam-angle-${id}),
        transparent 0%, transparent 54%,
        rgba(255, 255, 255, 0.1) 57%,
        rgba(255, 255, 255, 0.3) 60%,
        rgba(255, 255, 255, 0.6) 63%,
        rgba(255, 255, 255, 0.75) 66%,
        rgba(255, 255, 255, 0.6) 69%,
        rgba(255, 255, 255, 0.3) 72%,
        rgba(255, 255, 255, 0.1) 75%,
        transparent 78%, transparent 100%
      )`
    : `conic-gradient(
        from var(--beam-angle-${id}),
        transparent 0%, transparent 54%,
        rgba(0, 0, 0, 0.08) 57%,
        rgba(0, 0, 0, 0.2) 60%,
        rgba(0, 0, 0, 0.4) 63%,
        rgba(0, 0, 0, 0.55) 66%,
        rgba(0, 0, 0, 0.4) 69%,
        rgba(0, 0, 0, 0.2) 72%,
        rgba(0, 0, 0, 0.08) 75%,
        transparent 78%, transparent 100%
      )`;
}
function beamConicBloom(options: BeamCssOptions): string {
  const { id, theme } = options;
  return theme === "dark"
    ? `conic-gradient(
        from var(--beam-angle-${id}),
        transparent 0%, transparent 58%,
        rgba(255, 255, 255, 0.03) 62%,
        rgba(255, 255, 255, 0.08) 65%,
        rgba(255, 255, 255, 0.2) 67%,
        rgba(255, 255, 255, 0.45) 69%,
        rgba(255, 255, 255, 0.85) 70%,
        rgba(255, 255, 255, 0.85) 70.5%,
        rgba(255, 255, 255, 0.45) 71.5%,
        rgba(255, 255, 255, 0.2) 73%,
        rgba(255, 255, 255, 0.08) 75%,
        rgba(255, 255, 255, 0.03) 78%,
        transparent 82%
      )`
    : `conic-gradient(
        from var(--beam-angle-${id}),
        transparent 0%, transparent 58%,
        rgba(0, 0, 0, 0.02) 62%,
        rgba(0, 0, 0, 0.08) 65%,
        rgba(0, 0, 0, 0.2) 67%,
        rgba(0, 0, 0, 0.4) 69%,
        rgba(0, 0, 0, 0.6) 70%,
        rgba(0, 0, 0, 0.6) 70.5%,
        rgba(0, 0, 0, 0.4) 71.5%,
        rgba(0, 0, 0, 0.2) 73%,
        rgba(0, 0, 0, 0.08) 75%,
        rgba(0, 0, 0, 0.02) 78%,
        transparent 82%
      )`;
}
/** sm 的 ::before 内部遮罩（单 conic 行波） */
function beamSmInnerMask(options: BeamCssOptions): string {
  const { id } = options;
  return `conic-gradient(
      from var(--beam-angle-${id}),
      transparent 0%, transparent 22%,
      rgba(255, 255, 255, 0.12) 28%, rgba(255, 255, 255, 0.4) 36%,
      white 46%, white 82%,
      rgba(255, 255, 255, 0.4) 88%, rgba(255, 255, 255, 0.12) 94%,
      transparent 97%, transparent 100%
    )`;
}
/** sm/md 共享的 ::after 行波遮罩 */
function beamSpinMask(options: BeamCssOptions): string {
  const { id } = options;
  return `conic-gradient(
      from var(--beam-angle-${id}),
      transparent 0%, transparent 30%,
      rgba(255, 255, 255, 0.1) 36%, rgba(255, 255, 255, 0.35) 44%,
      white 52%, white 80%,
      rgba(255, 255, 255, 0.35) 86%, rgba(255, 255, 255, 0.1) 92%,
      transparent 95%, transparent 100%
    )`;
}

/** 原 TBt（— / 130373）：sm 尺寸 CSS（旋转 conic 描边 + 单行波内部） */
export function generateBeamCssSm(options: BeamCssOptions): string {
  const { id, borderRadius, borderWidth, duration, strokeOpacity, innerOpacity, bloomOpacity, innerShadow, colorVariant, staticColors, brightness, saturation, hueRange } = options;
  const innerRadius = Math.max(0, borderRadius - borderWidth);
  const monoFactor = colorVariant === "mono" ? 0.5 : 1;
  const stroke = strokeOpacity * monoFactor;
  const inner = innerOpacity * monoFactor;
  const bloom = bloomOpacity * monoFactor;
  const { animationLine, keyframes } = beamHueShiftParts(options);
  const strokeGradient = beamConicStroke(options);
  const borderColors = smBorderGradients(colorVariant);
  const innerColors = smInnerGradients(colorVariant);
  const bloomGradient = beamConicBloom(options);
  const innerMask = beamSmInnerMask(options);
  const spinMask = beamSpinMask(options);
  return `
@property --beam-angle-${id} {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: true;
}

@property --beam-opacity-${id} {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
}

[data-beam="${id}"] {
  position: relative;
  border-radius: ${borderRadius}px;
  overflow: hidden;
}

[data-beam="${id}"][data-active] {
  animation:
    beam-spin-${id} ${duration}s linear infinite,
    beam-fade-in-${id} 0.6s ease forwards;
}

[data-beam="${id}"][data-fading] {
  animation:
    beam-spin-${id} ${duration}s linear infinite,
    beam-fade-out-${id} 0.5s ease forwards;
}

[data-beam="${id}"][data-active]::after,
[data-beam="${id}"][data-fading]::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: ${innerRadius}px;
  padding: ${borderWidth}px;
  clip-path: inset(0 round ${borderRadius}px);
  background: ${strokeGradient},${borderColors};
  -webkit-mask:
    ${spinMask},
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: source-in, xor;
  mask:
    ${spinMask},
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: intersect, exclude;
  pointer-events: none;
  z-index: 2;
  opacity: calc(var(--beam-opacity-${id}) * ${stroke.toFixed(2)} * var(--beam-strength, 1));
  ${animationLine}
}

[data-beam="${id}"][data-active]::before,
[data-beam="${id}"][data-fading]::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: ${borderRadius}px;
  clip-path: inset(0 round ${borderRadius}px);
  background: ${innerColors};
  box-shadow: inset 0 0 5px 1px ${innerShadow};
  -webkit-mask-image: ${innerMask};
  -webkit-mask-composite: source-over;
  mask-image: ${innerMask};
  mask-composite: add;
  pointer-events: none;
  z-index: 1;
  opacity: calc(var(--beam-opacity-${id}) * ${inner.toFixed(2)} * var(--beam-strength, 1));
  ${animationLine}
}

[data-beam="${id}"] [data-beam-bloom] {
  display: none;
  position: absolute;
  inset: 0;
  border-radius: ${innerRadius}px;
  clip-path: inset(0 round ${borderRadius}px);
  background: ${bloomGradient};
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: ${borderWidth}px;
  filter: blur(8px) brightness(${brightness.toFixed(2)}) saturate(${saturation.toFixed(2)});
  pointer-events: none;
  z-index: 3;
  opacity: 0;
}

[data-beam="${id}"][data-active] [data-beam-bloom],
[data-beam="${id}"][data-fading] [data-beam-bloom] {
  display: block;
  opacity: calc(var(--beam-opacity-${id}) * ${bloom.toFixed(2)} * var(--beam-strength, 1));
}

@keyframes beam-spin-${id} {
  to { --beam-angle-${id}: 360deg; }
}

@keyframes beam-fade-in-${id} {
  to { --beam-opacity-${id}: 1; }
}

@keyframes beam-fade-out-${id} {
  from { --beam-opacity-${id}: 1; }
  to { --beam-opacity-${id}: 0; }
}
${keyframes}
`;
}

/** 原 EBt（— / 130593）：md 尺寸 CSS（内部遮罩=行波+上下/左右 28px 边缘渐隐；内阴影 9px） */
export function generateBeamCssMd(options: BeamCssOptions): string {
  const { id, borderRadius, borderWidth, duration, strokeOpacity, innerOpacity, bloomOpacity, innerShadow, colorVariant, staticColors, brightness, saturation, hueRange } = options;
  const innerRadius = Math.max(0, borderRadius - borderWidth);
  const monoFactor = colorVariant === "mono" ? 0.5 : 1;
  const stroke = strokeOpacity * monoFactor;
  const inner = innerOpacity * monoFactor;
  const bloom = bloomOpacity * monoFactor;
  const { animationLine, keyframes } = beamHueShiftParts(options);
  const strokeGradient = beamConicStroke(options);
  const borderColors = mdBorderGradients(colorVariant);
  const innerColors = mdInnerGradients(colorVariant);
  const bloomGradient = beamConicBloom(options);
  const spinMask = beamSpinMask(options);
  const edgeFade = `linear-gradient(white, transparent 28px, transparent calc(100% - 28px), white),
    linear-gradient(to right, white, transparent 28px, transparent calc(100% - 28px), white)`;
  return `
@property --beam-angle-${id} {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: true;
}

@property --beam-opacity-${id} {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
}

[data-beam="${id}"] {
  position: relative;
  border-radius: ${borderRadius}px;
  overflow: hidden;
}

[data-beam="${id}"][data-active] {
  animation:
    beam-spin-${id} ${duration}s linear infinite,
    beam-fade-in-${id} 0.6s ease forwards;
}

[data-beam="${id}"][data-fading] {
  animation:
    beam-spin-${id} ${duration}s linear infinite,
    beam-fade-out-${id} 0.5s ease forwards;
}

[data-beam="${id}"][data-active]::after,
[data-beam="${id}"][data-fading]::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: ${innerRadius}px;
  padding: ${borderWidth}px;
  clip-path: inset(0 round ${borderRadius}px);
  background: ${strokeGradient},${borderColors};
  -webkit-mask:
    ${spinMask},
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: source-in, xor;
  mask:
    ${spinMask},
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: intersect, exclude;
  pointer-events: none;
  z-index: 2;
  opacity: calc(var(--beam-opacity-${id}) * ${stroke.toFixed(2)} * var(--beam-strength, 1));
  ${animationLine}
}

[data-beam="${id}"][data-active]::before,
[data-beam="${id}"][data-fading]::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: ${borderRadius}px;
  background: ${innerColors};
  box-shadow: inset 0 0 9px 1px ${innerShadow};
  -webkit-mask-image:
    ${spinMask},
    ${edgeFade};
  -webkit-mask-composite: source-in, source-over;
  mask-image:
    ${spinMask},
    ${edgeFade};
  mask-composite: intersect, add;
  pointer-events: none;
  z-index: 1;
  opacity: calc(var(--beam-opacity-${id}) * ${inner.toFixed(2)} * var(--beam-strength, 1));
  clip-path: inset(0 round ${borderRadius}px);
  ${animationLine}
}

[data-beam="${id}"] [data-beam-bloom] {
  display: none;
  position: absolute;
  inset: 0;
  border-radius: ${innerRadius}px;
  clip-path: inset(0 round ${borderRadius}px);
  background: ${bloomGradient};
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: ${borderWidth}px;
  filter: blur(8px) brightness(${brightness.toFixed(2)}) saturate(${saturation.toFixed(2)});
  pointer-events: none;
  z-index: 3;
  opacity: 0;
}

[data-beam="${id}"][data-active] [data-beam-bloom],
[data-beam="${id}"][data-fading] [data-beam-bloom] {
  display: block;
  opacity: calc(var(--beam-opacity-${id}) * ${bloom.toFixed(2)} * var(--beam-strength, 1));
}

@keyframes beam-spin-${id} {
  to { --beam-angle-${id}: 360deg; }
}

@keyframes beam-fade-in-${id} {
  to { --beam-opacity-${id}: 1; }
}

@keyframes beam-fade-out-${id} {
  from { --beam-opacity-${id}: 1; }
  to { --beam-opacity-${id}: 0; }
}
${keyframes}
`;
}

/** 原 DBt（— / 130825）：line 尺寸 CSS（行波 travel + edge-fade + breathe + 双 spike） */
export function generateBeamCssLine(options: BeamCssOptions): string {
  const { id, borderRadius, borderWidth, duration, strokeOpacity, innerOpacity, bloomOpacity, innerShadow, colorVariant, staticColors, brightness, saturation, hueRange } = options;
  const innerRadius = Math.max(0, borderRadius - borderWidth);
  const stroke = strokeOpacity;
  const inner = innerOpacity;
  const bloom = bloomOpacity;
  const strokeAnimation = staticColors ? "" : `animation: beam-hue-shift-${id} 12s ease-in-out infinite;`;
  const bloomAnimation = staticColors ? "" : `animation: beam-hue-shift-bloom-${id} 8s ease-in-out infinite;`;
  const keyframes = staticColors
    ? ""
    : `
@keyframes beam-hue-shift-${id} {
  0% { filter: hue-rotate(-${hueRange}deg) brightness(${brightness.toFixed(2)}) saturate(${saturation.toFixed(2)}); }
  50% { filter: hue-rotate(${hueRange}deg) brightness(${brightness.toFixed(2)}) saturate(${saturation.toFixed(2)}); }
  100% { filter: hue-rotate(-${hueRange}deg) brightness(${brightness.toFixed(2)}) saturate(${saturation.toFixed(2)}); }
}

@keyframes beam-hue-shift-bloom-${id} {
  0% { filter: blur(8px) hue-rotate(-${hueRange + 10}deg) brightness(${brightness.toFixed(2)}) saturate(${saturation.toFixed(2)}); }
  50% { filter: blur(8px) hue-rotate(${hueRange + 10}deg) brightness(${brightness.toFixed(2)}) saturate(${saturation.toFixed(2)}); }
  100% { filter: blur(8px) hue-rotate(-${hueRange + 10}deg) brightness(${brightness.toFixed(2)}) saturate(${saturation.toFixed(2)}); }
}`;
  const dark = options.theme === "dark";
  const strokeHead = dark
    ? `radial-gradient(
        ellipse calc(24px * var(--beam-w-${id})) calc(28px * var(--beam-h-${id})) at calc(var(--beam-x-${id}) * 100%) calc(100% + 2px),
        rgba(255, 255, 255, 0.38) 0%,
        rgba(255, 255, 255, 0.12) 30%,
        transparent 65%
      )`
    : `radial-gradient(
        ellipse calc(35px * var(--beam-w-${id})) calc(28px * var(--beam-h-${id})) at calc(var(--beam-x-${id}) * 100%) calc(100% + 2px),
        rgba(0, 0, 0, 0.6) 0%,
        rgba(0, 0, 0, 0.25) 35%,
        transparent 70%
      )`;
  const strokeColors = lineStrokeGradients(colorVariant, dark, id);
  const innerColors = lineInnerGradients(colorVariant, id);
  const bloomColors = lineBloomGradients(colorVariant, dark, id);
  const travelMask = `radial-gradient(
      ellipse calc(78px * var(--beam-w-${id})) calc(60px * var(--beam-h-${id})) at calc(var(--beam-x-${id}) * 100%) 100%,
      white 0%, rgba(255, 255, 255, 0.5) 45%, transparent 100%
    )`;
  const edgeFade = `linear-gradient(white, transparent 28px, transparent calc(100% - 28px), white),
    linear-gradient(to right, white, transparent 28px, transparent calc(100% - 28px), white)`;
  const bloomMask = `radial-gradient(
    ellipse calc(84px * var(--beam-w-${id})) calc(110px * var(--beam-h-${id})) at calc(var(--beam-x-${id}) * 100%) 100%,
    white 0%, rgba(255, 255, 255, 0.5) 35%, transparent 100%
  )`;
  return `
@property --beam-x-${id} {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
}

@property --beam-w-${id} {
  syntax: "<number>";
  initial-value: 1;
  inherits: true;
}

@property --beam-h-${id} {
  syntax: "<number>";
  initial-value: 1;
  inherits: true;
}

@property --beam-spike-${id} {
  syntax: "<number>";
  initial-value: 1;
  inherits: true;
}

@property --beam-spike2-${id} {
  syntax: "<number>";
  initial-value: 1;
  inherits: true;
}

@property --beam-edge-${id} {
  syntax: "<number>";
  initial-value: 1;
  inherits: true;
}

@property --beam-opacity-${id} {
  syntax: "<number>";
  initial-value: 0;
  inherits: true;
}

[data-beam="${id}"] {
  position: relative;
  border-radius: ${borderRadius}px;
  overflow: hidden;
}

[data-beam="${id}"][data-active] {
  animation:
    beam-travel-${id} ${duration}s linear infinite,
    beam-edge-fade-${id} ${duration}s linear infinite,
    beam-breathe-${id} ${(duration * 1.3).toFixed(1)}s ease-in-out infinite,
    beam-spike-${id} ${(duration * 1.33).toFixed(1)}s ease-in-out infinite,
    beam-spike2-${id} ${(duration * 1.7).toFixed(1)}s ease-in-out infinite,
    beam-fade-in-${id} 0.6s ease forwards;
}

[data-beam="${id}"][data-fading] {
  animation:
    beam-travel-${id} ${duration}s linear infinite,
    beam-edge-fade-${id} ${duration}s linear infinite,
    beam-breathe-${id} ${(duration * 1.3).toFixed(1)}s ease-in-out infinite,
    beam-spike-${id} ${(duration * 1.33).toFixed(1)}s ease-in-out infinite,
    beam-spike2-${id} ${(duration * 1.7).toFixed(1)}s ease-in-out infinite,
    beam-fade-out-${id} 0.5s ease forwards;
}

[data-beam="${id}"][data-active]::after,
[data-beam="${id}"][data-fading]::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: ${innerRadius}px;
  padding: ${borderWidth}px;
  clip-path: inset(0 round ${borderRadius}px);
  background: ${strokeHead}, ${strokeColors};
  -webkit-mask:
    ${travelMask},
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: source-in, xor;
  mask:
    ${travelMask},
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: intersect, exclude;
  pointer-events: none;
  z-index: 2;
  opacity: calc(var(--beam-opacity-${id}) * var(--beam-edge-${id}) * ${stroke.toFixed(2)} * var(--beam-strength, 1));
  ${strokeAnimation}
}

[data-beam="${id}"][data-active]::before,
[data-beam="${id}"][data-fading]::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: ${borderRadius}px;
  background: ${innerColors};
  box-shadow: inset 0 0 9px 1px ${innerShadow};
  -webkit-mask-image:
    ${travelMask},
    ${edgeFade};
  -webkit-mask-composite: source-in, source-over;
  mask-image:
    ${travelMask},
    ${edgeFade};
  mask-composite: intersect, add;
  pointer-events: none;
  z-index: 1;
  opacity: calc(var(--beam-opacity-${id}) * var(--beam-edge-${id}) * ${inner.toFixed(2)} * var(--beam-strength, 1));
  clip-path: inset(0 round ${borderRadius}px);
  ${strokeAnimation}
}

[data-beam="${id}"] [data-beam-bloom] {
  display: none;
  position: absolute;
  inset: 0;
  border-radius: ${innerRadius}px;
  clip-path: inset(0 round ${borderRadius}px);
  padding: 0;
  -webkit-mask: ${bloomMask};
  -webkit-mask-composite: source-over;
  mask: ${bloomMask};
  mask-composite: add;
  background: ${bloomColors};
  pointer-events: none;
  z-index: 3;
  opacity: 0;
}

[data-beam="${id}"][data-active] [data-beam-bloom],
[data-beam="${id}"][data-fading] [data-beam-bloom] {
  display: block;
  opacity: calc(var(--beam-opacity-${id}) * var(--beam-edge-${id}) * ${bloom.toFixed(2)} * var(--beam-strength, 1));
  ${bloomAnimation}
}

@keyframes beam-travel-${id} {
  0%   { --beam-x-${id}: 0.06;  --beam-w-${id}: 0.5; }
  10%  { --beam-x-${id}: 0.15;  --beam-w-${id}: 0.8; }
  20%  { --beam-x-${id}: 0.25;  --beam-w-${id}: 1.1; }
  30%  { --beam-x-${id}: 0.35;  --beam-w-${id}: 1.3; }
  40%  { --beam-x-${id}: 0.44;  --beam-w-${id}: 1.45; }
  50%  { --beam-x-${id}: 0.5;   --beam-w-${id}: 1.5; }
  60%  { --beam-x-${id}: 0.56;  --beam-w-${id}: 1.45; }
  70%  { --beam-x-${id}: 0.65;  --beam-w-${id}: 1.3; }
  80%  { --beam-x-${id}: 0.75;  --beam-w-${id}: 1.1; }
  90%  { --beam-x-${id}: 0.85;  --beam-w-${id}: 0.8; }
  100% { --beam-x-${id}: 0.94;  --beam-w-${id}: 0.5; }
}

@keyframes beam-edge-fade-${id} {
  0%    { --beam-edge-${id}: 0; }
  12.5% { --beam-edge-${id}: 0; }
  32.5% { --beam-edge-${id}: 1; }
  67.5% { --beam-edge-${id}: 1; }
  87.5% { --beam-edge-${id}: 0; }
  100%  { --beam-edge-${id}: 0; }
}

@keyframes beam-breathe-${id} {
  0%, 100% { --beam-h-${id}: 0.8; }
  25%      { --beam-h-${id}: 1.25; }
  55%      { --beam-h-${id}: 0.85; }
  80%      { --beam-h-${id}: 1.3; }
}

@keyframes beam-spike-${id} {
  0%   { --beam-spike-${id}: 0.8; }
  25%  { --beam-spike-${id}: 1.3; }
  50%  { --beam-spike-${id}: 0.9; }
  75%  { --beam-spike-${id}: 1.4; }
  100% { --beam-spike-${id}: 0.8; }
}

@keyframes beam-spike2-${id} {
  0%   { --beam-spike2-${id}: 1.2; }
  25%  { --beam-spike2-${id}: 0.7; }
  50%  { --beam-spike2-${id}: 1.4; }
  75%  { --beam-spike2-${id}: 0.8; }
  100% { --beam-spike2-${id}: 1.2; }
}

@keyframes beam-fade-in-${id} {
  to { --beam-opacity-${id}: 1; }
}

@keyframes beam-fade-out-${id} {
  from { --beam-opacity-${id}: 1; }
  to { --beam-opacity-${id}: 0; }
}
${keyframes}
`;
}

/** 原 wBt（— / 130367）：尺寸分派 */
export function generateBeamCss(options: BeamCssOptions): string {
  return options.size === "line" ? generateBeamCssLine(options) : options.size === "sm" ? generateBeamCssSm(options) : generateBeamCssMd(options);
}

/** 原 OBt（— / 131093）：系统主题偏好侦听 */
export function useSystemThemePreference(): "dark" | "light" {
  const [theme, setTheme] = React.useState<"dark" | "light">(() =>
    typeof window > "u" || window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );
  React.useEffect(() => {
    if (typeof window > "u") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "dark" : "light");
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return theme;
}
/** 原 kBt（— / 131104）：auto → 系统主题 */
function resolveBeamTheme(theme: "auto" | "dark" | "light", system: "dark" | "light"): "dark" | "light" {
  return theme === "auto" ? system : theme;
}

export interface BeamBorderAnimationProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onAnimationEnd"> {
  size?: "sm" | "md" | "line";
  colorVariant?: BeamVariant;
  theme?: "auto" | "dark" | "light";
  staticColors?: boolean;
  duration?: number;
  active?: boolean;
  borderRadius?: number;
  brightness?: number;
  saturation?: number;
  hueRange?: number;
  strength?: number;
  className?: string;
  style?: React.CSSProperties;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onAnimationEnd?: (event: React.AnimationEvent) => void;
  children?: React.ReactNode;
}

/** 原 ABt（157550 / 131107）：光束描边动画容器 */
export const BeamBorderAnimation = React.forwardRef<HTMLDivElement, BeamBorderAnimationProps>(function BeamBorderAnimation(
  {
    children,
    size = "md",
    colorVariant = "colorful",
    theme = "dark",
    staticColors = false,
    duration,
    active = true,
    borderRadius,
    brightness = 1.3,
    saturation,
    hueRange = 30,
    strength = 1,
    className,
    style,
    onActivate,
    onDeactivate,
    onAnimationEnd,
    ...rest
  },
  forwardedRef,
) {
  const id = React.useId().replace(/:/g, "-");
  const systemTheme = useSystemThemePreference();
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const [isActive, setIsActive] = React.useState(active);
  const [isFading, setIsFading] = React.useState(false);
  const [detectedRadius, setDetectedRadius] = React.useState<number | null>(null);

  /** 未显式给圆角时，从首子元素计算样式读取 */
  React.useEffect(() => {
    if (borderRadius != null) return;
    const host = hostRef.current;
    if (!host) return;
    const read = () => {
      const child = host.firstElementChild;
      if (!child) return;
      const computed = getComputedStyle(child);
      const radius = parseFloat(computed.borderTopLeftRadius);
      if (!isNaN(radius) && radius > 0) setDetectedRadius(radius);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(host, { childList: true, subtree: false });
    return () => observer.disconnect();
  }, [borderRadius, children]);

  React.useEffect(() => {
    if (active && !isActive && !isFading) setIsActive(true);
    else if (!active && isActive && !isFading) setIsFading(true);
  }, [active, isActive, isFading]);

  const handleAnimationEnd = React.useCallback(
    (event: React.AnimationEvent) => {
      const name = event.animationName;
      if (name.includes("fade-out")) {
        setIsActive(false);
        setIsFading(false);
        onDeactivate?.();
      } else if (name.includes("fade-in")) {
        onActivate?.();
      }
      onAnimationEnd?.(event);
    },
    [onActivate, onDeactivate, onAnimationEnd],
  );

  const resolvedTheme = resolveBeamTheme(theme, systemTheme);
  const themeParams = BEAM_THEME_PARAMS[size][resolvedTheme];
  const sizePreset = BEAM_SIZE_PRESETS[size];
  const resolvedRadius = borderRadius ?? detectedRadius ?? sizePreset.borderRadius;
  const resolvedDuration = duration ?? (size === "line" ? 2.4 : 1.96);
  const resolvedSaturation = saturation ?? themeParams.saturation;
  const resolvedHueRange = size === "line" ? Math.min(hueRange, 13) : hueRange;
  const resolvedStatic = colorVariant === "mono" ? true : staticColors;

  const css = React.useMemo(
    () =>
      generateBeamCss({
        id,
        borderRadius: resolvedRadius,
        borderWidth: sizePreset.borderWidth,
        duration: resolvedDuration,
        strokeOpacity: themeParams.strokeOpacity,
        innerOpacity: themeParams.innerOpacity,
        bloomOpacity: themeParams.bloomOpacity,
        innerShadow: themeParams.innerShadow,
        size,
        colorVariant,
        staticColors: resolvedStatic,
        brightness,
        saturation: resolvedSaturation,
        hueRange: resolvedHueRange,
        theme: resolvedTheme,
      }),
    [id, resolvedRadius, sizePreset.borderWidth, resolvedDuration, themeParams.strokeOpacity, themeParams.innerOpacity, themeParams.bloomOpacity, themeParams.innerShadow, size, colorVariant, resolvedStatic, brightness, resolvedSaturation, resolvedHueRange, resolvedTheme],
  );

  const attachHost = React.useCallback(
    (element: HTMLDivElement | null) => {
      hostRef.current = element;
      if (typeof forwardedRef === "function") forwardedRef(element);
      else if (forwardedRef) forwardedRef.current = element;
    },
    [forwardedRef],
  );

  const mergedStyle: React.CSSProperties = {
    ...(style ?? {}),
    "--beam-strength": Math.max(0, Math.min(1, strength)),
  } as React.CSSProperties;

  return (
    <>
      <style>{css}</style>
      <div
        {...rest}
        ref={attachHost}
        data-beam={id}
        data-active={isActive && !isFading ? "" : undefined}
        data-fading={isFading ? "" : undefined}
        className={className}
        style={mergedStyle}
        onAnimationEnd={handleAnimationEnd}
      >
        {children}
        <div data-beam-bloom={true} />
      </div>
    </>
  );
});

/* ============================================================================
 * 5. 原 lLt（146823 / 122315）：ArchivedTasksSection —— 归档任务段
 * ==========================================================================*/

export function ArchivedTasksSection({
  workspaceTabs,
  activeWorkspacePath,
  activeWorkspaceIdentity,
  activeTaskId,
  sortBy,
  mobileActiveTaskKey,
  onSelectTask,
}: {
  workspaceTabs: WorkspaceTab[];
  activeWorkspacePath: string;
  activeWorkspaceIdentity?: string | null;
  activeTaskId: string | null;
  sortBy: TaskSortBy;
  mobileActiveTaskKey?: string | null;
  onSelectTask: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => void;
}) {
  const { intl } = useIntlContext();
  const confirm = useConfirmDialog();
  const baseServices = useBaseServices();
  const sessionsById = useSessionRegistryStore((s) => s.sessionsById);
  const sessionIdByWorkspaceIdentity = useSessionRegistryStore((s) => s.sessionIdByWorkspaceIdentity);
  const sessionIdByWorkspacePath = useSessionRegistryStore((s) => s.sessionIdByWorkspacePath);
  const registry = React.useMemo(
    () => ({ sessionsById, sessionIdByWorkspaceIdentity, sessionIdByWorkspacePath }),
    [sessionIdByWorkspaceIdentity, sessionIdByWorkspacePath, sessionsById],
  );
  const [expanded, setExpanded] = React.useState(false);
  const [deletingKeys, setDeletingKeys] = React.useState<Set<string>>(() => new Set());
  const workspaceLabelByKey = React.useMemo(
    () => new Map(workspaceTabs.map((tab) => [workspaceKeyOf(tab.workspacePath, tab.workspaceIdentity), tab.label || workspaceBaseName(tab.workspacePath)])),
    [workspaceTabs],
  );
  const servicesByWorkspaceKey = React.useMemo(() => buildWorkspaceServicesMap(workspaceTabs, baseServices, registry), [baseServices, registry, workspaceTabs]);
  const activeWorkspaceKey = workspaceKeyOf(activeWorkspacePath, activeWorkspaceIdentity);
  const { items, total, loading, syncingRemoteWorkspaces } = useTaskListItems({
    kind: "archived",
    workspaceTabs,
    sortBy,
    searchQuery: "",
    expanded,
    collapsedLimit: 20,
  });
  const hasMore = total > 20;

  if (items.length === 0 && loading) return <TaskListLoadingRow />;
  if (items.length === 0) {
    return <div className="px-3 py-2 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "taskList.noArchivedTasks" })}</div>;
  }
  return (
    <div>
      <ul className="space-y-1 pb-4">
        {items.map((task) => {
          const entry = servicesByWorkspaceKey.get(workspaceKeyOf(task.workspacePath, task.workspaceIdentity));
          if (!entry) return null;
          const { services } = entry;
          const title = task.title || intl.formatMessage({ id: "taskList.untitled" });
          const relativeTime = formatRelativeTime(sortBy === "created" ? task.createdAt : task.updatedAt, intl);
          const changeStat = taskChangeSummary(task);
          const workspaceKey = workspaceKeyOf(task.workspacePath, task.workspaceIdentity);
          const label = workspaceLabelByKey.get(workspaceKey) ?? workspaceBaseName(task.workspacePath);
          const isRemote = !!task.workspaceIdentity?.trim();
          const unarchiveLabel = intl.formatMessage({ id: "taskList.unarchive" });
          const deleteLabel = intl.formatMessage({ id: "taskList.delete" });
          const isActive = workspaceKey === activeWorkspaceKey && task.taskId === activeTaskId;
          const isMobileActive = mobileActiveTaskKey === `${workspaceKey}:${task.taskId}`;
          const rowKey = `${workspaceKey}:${task.taskId}`;
          const isDeleting = deletingKeys.has(rowKey);
          return (
            <li
              key={rowKey}
              data-mobile-active-task={isMobileActive ? "true" : undefined}
              onClick={() => {
                onSelectTask(task.workspacePath, task.taskId, task.workspaceIdentity);
              }}
              className={cn(
                "cursor-pointer rounded-lg px-2.5 py-2 transition-[background-color,border-color,box-shadow]",
                isActive ? "bg-selected" : "hover:bg-surface-hover",
              )}
            >
              <div className="relative flex items-center gap-2">
                {isMobileActive ? (
                  <Tooltip
                    title={intl.formatMessage({ id: "taskList.mobileActive" })}
                    side="right"
                    align="center"
                    triggerClassName="absolute -left-5 top-1/2 z-10 -translate-y-1/2"
                  >
                    <span
                      data-mobile-active-task="true"
                      className="inline-flex size-4 items-center justify-center rounded-sm text-success"
                      aria-label={intl.formatMessage({ id: "taskList.mobileActive" })}
                    >
                      <IconSmartphone className="size-3.5" />
                    </span>
                  </Tooltip>
                ) : null}
                <p className="min-w-0 flex-1 truncate text-ui-base text-foreground" title={title}>
                  {title}
                </p>
                <span className="shrink-0 text-ui-base text-foreground-subtle">{relativeTime}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-ui-base text-foreground-subtle">
                <span className="flex min-w-0 flex-1 items-center gap-1.5" title={task.workspacePath}>
                  {isRemote ? <IconCloud className="size-3 shrink-0" /> : <IconFolder className="size-3 shrink-0" />}
                  <span className="min-w-0 truncate">{label}</span>
                </span>
                {changeStat ? (
                  <span className="shrink-0">
                    {intl.formatMessage({ id: "taskList.changeStats" }, { added: String(changeStat.added), removed: String(changeStat.removed) })}
                  </span>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-foreground-subtle hover:text-foreground"
                  title={unarchiveLabel}
                  aria-label={unarchiveLabel}
                  onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    event.preventDefault();
                    event.stopPropagation();
                    services.zcodeTaskService
                      .unarchiveTask({
                        taskId: task.taskId,
                        workspacePath: task.workspacePath,
                        ...(task.workspaceIdentity ? { workspaceIdentity: task.workspaceIdentity } : {}),
                      })
                      .then((next) => {
                        applyOptimisticTaskMutation({
                          previousTask: task,
                          nextTask: next,
                          previousState: { pinned: false, archived: true },
                          nextState: { pinned: false, archived: false },
                        });
                      })
                      .catch((error) => {
                        logger.error("[WorkspaceArchivedTasksFlatSection] 取消归档 task 失败:", error);
                      });
                  }}
                >
                  {isRemote ? <IconCloudUpload className="size-3.5" /> : <IconArchiveRestore className="size-3.5" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isDeleting}
                  className="shrink-0 text-destructive hover:text-destructive"
                  title={deleteLabel}
                  aria-label={deleteLabel}
                  onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void (async () => {
                      const confirmed = await confirm({
                        title: intl.formatMessage({ id: "confirmDialog.archivedTaskDeleteTitle" }),
                        description: intl.formatMessage({ id: "confirmDialog.archivedTaskDeleteDescription" }),
                        confirmLabel: deleteLabel,
                      });
                      if (!confirmed) return;
                      setDeletingKeys((current) => new Set(current).add(rowKey));
                      try {
                        await services.zcodeTaskService.deleteTask({
                          taskId: task.taskId,
                          workspacePath: task.workspacePath,
                          ...(task.workspaceIdentity ? { workspaceIdentity: task.workspaceIdentity } : {}),
                        });
                        cleanupDeletedTaskState({
                          workspacePath: task.workspacePath,
                          workspaceIdentity: task.workspaceIdentity,
                          taskId: task.taskId,
                        });
                      } catch (error) {
                        logger.error("[WorkspaceArchivedTasksFlatSection] 删除归档 task 失败:", error);
                      } finally {
                        setDeletingKeys((current) => {
                          const next = new Set(current);
                          next.delete(rowKey);
                          return next;
                        });
                      }
                    })();
                  }}
                >
                  <IconX className="size-3.5" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      {syncingRemoteWorkspaces ? <RemoteSyncingRow /> : null}
      {hasMore ? (
        <div className="cursor-pointer pl-8.5 pb-4">
          <span
            className="text-ui-base text-foreground-subtlest hover:text-foreground-subtle"
            onClick={() => {
              setExpanded((current) => !current);
            }}
          >
            {intl.formatMessage({ id: expanded ? "taskList.showLess" : "taskList.showMore" })}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================================
 * 6. 原 mLt（147286 / 122543）+ uLt/aPt/iPt：WebRemoteTaskListSection —— Web 远控列表段
 * ==========================================================================*/

/* ── tombstone〔A1-R52〕：本地三型 WebRemoteWorkspace/WebRemoteTaskIndex/WebRemoteSwitcher 删除——
 * switcher 族属主闭合（六点分叉表 A1-P2-B9.report.md §四 全闭）：改指生产面 components/remote/WebRemote
 * WebRemoteWorkspaceInfo/MobileHomeResult/WebRemoteSwitcherService（文件头 type-only 导入）。
 * 分叉裁定：①workspacePurpose 收 null 支（生产面 `?: string | null`）②索引签名去（消费面无动态访问实证）
 * ③TaskMeta.title 生产面可空为远端载荷真形（bundle 1409xx–1416xx `e.title || taskList.untitled` 三处实证；
 *   本地富化面保留运行时态叠加，载荷缝单断言见 buildWebRemoteTaskViewModel/applyRemoteTaskMembership）
 * ④updateMobileViewState 收 Promise<unknown> + taskId 可参（bundle 140894 单参面/141662 `e ?? void 0` 面实证）
 * ⑤markTaskRead 入生产面声明（bundle 140225 typeof 守卫 + 140235 调用实证；本面消费同形守卫）
 * ⑥内部态联动收 MobileHomeResult（useState 型随动）。 ── */

/** 原 ei：任务的工作区键（identity 优先） */
function taskWorkspaceKey(task: Pick<WorkspaceTab, "workspacePath" | "workspaceIdentity">): string {
  return task.workspaceIdentity?.trim() || task.workspacePath;
}
/** 原 f6（— / 116795）：远控任务行键 */
function webRemoteTaskKey(task: TaskMeta): string {
  return `${taskWorkspaceKey(task)}:${task.taskId}`;
}
/** 原 rPt：重连类错误文案判定 */
function isReconnectRequiredError(message: string): boolean {
  return message.includes("远程工作区尚未连接") || message.includes("请先重连");
}

/** 原 iPt（— / 116801）：打开远控任务（跨工作区切换 + 已读上报 + 查看状态回写） */
async function openWebRemoteTask(args: {
  activeTaskId: string | null;
  activeWorkspaceIdentity?: string | null;
  activeWorkspacePath: string;
  markTaskReadOnOpen?: boolean;
  mobileNavigationIntent?: unknown;
  onNavigateHome?: () => void;
  onNavigateToChat?: () => void;
  onSelectTask?: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => void;
  onSwitchingChange?: (key: string | null) => void;
  onTaskOpen?: (info: { crossWorkspace: boolean }) => void;
  setError: (message: string | null) => void;
  setSwitchingTaskKey: (key: string | null) => void;
  switcher: WebRemoteSwitcherService;
  task: TaskMeta;
}): Promise<void> {
  const {
    activeTaskId,
    activeWorkspaceIdentity,
    activeWorkspacePath,
    markTaskReadOnOpen,
    mobileNavigationIntent,
    onNavigateHome,
    onNavigateToChat,
    onSelectTask,
    onSwitchingChange,
    onTaskOpen,
    setError,
    setSwitchingTaskKey,
    switcher,
    task,
  } = args;
  const activeKey = taskWorkspaceKey({ workspacePath: activeWorkspacePath, workspaceIdentity: activeWorkspaceIdentity });
  const taskKey = taskWorkspaceKey(task);
  const crossWorkspace = taskKey !== activeKey;
  onTaskOpen?.({ crossWorkspace });
  if (!crossWorkspace) {
    if (markTaskReadOnOpen && typeof task.unreadAt === "number" && switcher.markTaskRead) {
      const report = (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn("[useWebRemoteControlTaskOpen] 标记手机端 task 已读失败", { error: message, taskId: task.taskId, workspaceKey: taskKey });
      };
      try {
        switcher.markTaskRead(task).catch(report);
      } catch (error) {
        report(error);
      }
    }
    onSelectTask?.(task.workspacePath, task.taskId, task.workspaceIdentity);
    try {
      await switcher.updateMobileViewState?.(taskKey, task.taskId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("[useWebRemoteControlTaskOpen] 更新手机端查看状态失败", { error: message, taskId: task.taskId, workspaceKey: taskKey });
    }
    return;
  }
  setSwitchingTaskKey(taskKey);
  onSwitchingChange?.(taskKey);
  try {
    const result = await switcher.listWorkspaces();
    const target = result.tasks.find((candidate) => candidate.taskId === task.taskId && taskWorkspaceKey(candidate) === taskKey);
    if (!target) throw Error("task not found in remote index");
    if (mobileNavigationIntent) onNavigateToChat?.();
    else onNavigateHome?.();
    onSelectTask?.(target.workspacePath, target.taskId, target.workspaceIdentity);
    void activeTaskId;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (logger.error("[useWebRemoteControlTaskOpen] 打开远程 task 失败", { error: message, taskId: task.taskId, workspaceKey: taskKey }), isReconnectRequiredError(message)) {
      onNavigateHome?.();
      return;
    }
    setError(message);
  } finally {
    setSwitchingTaskKey(null);
    onSwitchingChange?.(null);
  }
}

/** 原 aPt（— / 116882）：远控切换器钩子（活动键 + 打开 + 切换中键 + 错误） */
function useWebRemoteTaskSwitcher(args: {
  activeTaskId: string | null;
  activeWorkspaceIdentity?: string | null;
  activeWorkspacePath: string;
  markTaskReadOnOpen?: boolean;
  mobileNavigationIntent?: unknown;
  onNavigateHome?: () => void;
  onNavigateToChat?: () => void;
  onSelectTask?: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => void;
  onSwitchingChange?: (key: string | null) => void;
  onTaskOpen?: (info: { crossWorkspace: boolean }) => void;
  switcher: WebRemoteSwitcherService;
}) {
  const [switchingTaskKey, setSwitchingTaskKey] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const activeWorkspaceKey = React.useMemo(
    () => taskWorkspaceKey({ workspacePath: args.activeWorkspacePath, workspaceIdentity: args.activeWorkspaceIdentity }),
    [args.activeWorkspaceIdentity, args.activeWorkspacePath],
  );
  const openTask = React.useCallback(
    (task: TaskMeta) => {
      void openWebRemoteTask({ ...args, setError, setSwitchingTaskKey, task });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [args.activeTaskId, args.activeWorkspaceIdentity, args.activeWorkspacePath, args.markTaskReadOnOpen, args.mobileNavigationIntent, args.onNavigateHome, args.onNavigateToChat, args.onSelectTask, args.onSwitchingChange, args.onTaskOpen, args.switcher],
  );
  return { activeWorkspaceKey, error, openTask, switchingTaskKey };
}

/** 原 mPt/hPt/bPt/xPt（— / 117043–117060）：运行时状态 → 展示状态 */
function isStreamingDisplayStatus(status: string | undefined): boolean {
  return status === "creating" || status === "streaming";
}
function isRunningRuntimeStatus(entry: { displayStatus?: string } | undefined): boolean {
  return !!entry && entry.displayStatus === "running";
}
function normalizeRuntimePhase(phase: string | undefined): string | undefined {
  switch (phase) {
    case "prewarming":
    case "running":
      return "running";
    case "completedSuccess":
    case "completedInterrupted":
      return "completed";
    case "error":
      return "error";
    case "draft":
      return undefined;
  }
  return phase;
}
function resolveTaskDisplayStatus(args: { task: TaskMeta; runtimeStatus?: string }): string {
  const activity = typeof args.task.sessionActivity === "object" && args.task.sessionActivity !== null ? (args.task.sessionActivity as { phase?: string }) : null;
  if (activity) {
    const phase = normalizeRuntimePhase(activity.phase);
    if (phase) return phase;
  }
  return isStreamingDisplayStatus(args.runtimeStatus)
    ? "running"
    : args.runtimeStatus === "failed" || args.task.status === "error"
      ? "error"
      : args.runtimeStatus === "completed" || args.task.status === "completed"
        ? "completed"
        : "idle";
}

/** 原 gPt/_Pt（— / 117026/117029）：远端能力工作区过滤 */
function isRemoteCapableWorkspace(workspace: WebRemoteWorkspaceInfo): boolean {
  return !!(workspace.kind === "remote" || workspace.workspaceIdentity?.trim() || workspace.remoteSessionId?.trim());
}
function filterRemoteCapableWorkspaces(args: { activeWorkspaceIdentity?: string | null; workspaces: WebRemoteWorkspaceInfo[] }): WebRemoteWorkspaceInfo[] {
  return args.activeWorkspaceIdentity?.trim() ? args.workspaces.filter(isRemoteCapableWorkspace) : args.workspaces;
}

/** 原 vPt（— / 117035）：空索引重试判定（活动任务存在且仍有重试次数） */
function shouldRetryEmptyRemoteIndex(args: { activeTaskId: string | null; attempt: number; maxAttempts: number; taskCount: number }): boolean {
  return !!args.activeTaskId && args.taskCount === 0 && args.attempt < args.maxAttempts;
}
/** 原 CPt（— / 117126）：同任务判定 */
function sameTaskRef(a: TaskMeta, b: TaskMeta): boolean {
  return a.taskId === b.taskId && taskWorkspaceKey(a) === taskWorkspaceKey(b);
}
/** 原 wPt（— / 117128）：成员变更叠加（先清除 pinned/archived 再按新成员写入） */
function applyRemoteTaskMembership(args: { result: MobileHomeResult; target: TaskMeta; membership: { pinned?: boolean; archived?: boolean } }): MobileHomeResult {
  // 〔A1-R52〕载荷缝（单断言）：MobileHomeResult.tasks 生产面形（可空 title）→ 本地富化面（sameTaskRef 消费）；
  // 可比性 = 本地面→生产面方向可赋（富化字段全可选 + 可空支兼容），裁定见上墓碑 §③。返回面 TaskMeta[] → 生产面 tasks 同向可赋零断言。
  const tasks = (args.result.tasks ?? []) as TaskMeta[];
  return {
    ...args.result,
    tasks: tasks.map((task) => {
      if (!sameTaskRef(task, args.target)) return task;
      const next = { ...task };
      delete next.pinned;
      delete next.archived;
      return {
        ...next,
        ...(args.membership.pinned ? { pinned: true } : {}),
        ...(args.membership.archived ? { archived: true } : {}),
      };
    }),
  };
}

/** 原 SPt/g6/EPt/_6（— / 117117–117152）：排序与搜索过滤 */
/* ── tombstone（A1-R10 2e）：declare compareTasksForList 四参面（原 Lie，1353）删除，改经文件头
 *    StoresDeep import 消费（canonical = compareTasksActiveFirst；3537 调用点及其 isRunningRuntimeStatus
 *    投射逐字不变）。 ── */
function taskRowComparator(sortBy: TaskSortBy): (a: TaskMeta, b: TaskMeta) => number {
  return (a, b) => compareTasksForList(a, b, sortBy, isRunningRuntimeStatus as unknown as (task: TaskMeta) => boolean);
}
function sortTaskRows(tasks: TaskMeta[], sortBy: TaskSortBy): TaskMeta[] {
  return [...tasks].sort(taskRowComparator(sortBy));
}
function taskMatchesSearch(task: TaskMeta, query: string): boolean {
  return query
    ? [task.title, task.workspaceLabel, task.workspacePath, task.workspaceIdentity ?? "", task.remoteSessionId ?? ""].join(" ").toLocaleLowerCase().includes(query)
    : true;
}
function filterTasksBySearch(tasks: TaskMeta[], query: string): TaskMeta[] {
  const normalized = query.trim().toLocaleLowerCase();
  return normalized ? tasks.filter((task) => taskMatchesSearch(task, normalized)) : [...tasks];
}

/** 原 TPt（— / 117155）：按工作区分组（含未读标记） */
function groupTasksByWorkspace(args: { workspaces: WebRemoteWorkspaceInfo[]; tasks: TaskMeta[]; sortBy?: TaskSortBy }): Array<{
  workspaceKey: string;
  workspace: WebRemoteWorkspaceInfo;
  tasks: TaskMeta[];
  hasUnread: boolean;
}> {
  const sortBy = args.sortBy ?? "updated";
  const groups = args.workspaces.map((workspace) => ({
    workspaceKey: taskWorkspaceKey(workspace),
    workspace,
    tasks: [] as TaskMeta[],
    hasUnread: false,
  }));
  const byKey = new Map(groups.map((group) => [group.workspaceKey, group]));
  for (const task of args.tasks) {
    const group = byKey.get(taskWorkspaceKey(task));
    if (group) group.tasks.push(task);
  }
  return groups.map((group) => ({
    ...group,
    tasks: sortTaskRows(group.tasks, sortBy),
    hasUnread: group.tasks.some((task) => typeof task.unreadAt === "number"),
  }));
}

/** 原 DPt（— / 117181）：视图模型（pinned / groups / timeline / archived + 折叠） */
function buildWebRemoteTaskViewModel(args: {
  result: MobileHomeResult;
  viewMode: string;
  sortBy?: TaskSortBy;
  searchQuery?: string;
  collapsedWorkspaceKeys?: Set<string>;
}): {
  pinnedTasks: TaskMeta[];
  groups: Array<{ workspaceKey: string; workspace: WebRemoteWorkspaceInfo; tasks: TaskMeta[]; hasUnread: boolean; totalTaskCount: number; collapsed: boolean }>;
  timelineTasks: TaskMeta[];
  archivedTasks: TaskMeta[];
  totalTaskCount: number;
} {
  const sortBy = args.sortBy ?? "updated";
  const searchQuery = args.searchQuery ?? "";
  const collapsed = args.collapsedWorkspaceKeys ?? new Set<string>();
  // 〔A1-R52〕载荷缝（单断言）：MobileHomeResult.tasks 生产面形（可空 title，bundle `|| taskList.untitled` 真形）
  // → 本地富化面（§6 运行时态叠加 sessionActivity/status 消费）；可比性 = 本地面→生产面方向可赋，裁定见 §6 头墓碑 §③。
  const tasks = (args.result.tasks ?? []) as TaskMeta[];
  const pinnedTasks = sortTaskRows(filterTasksBySearch(tasks.filter((task) => task.pinned && !task.archived), searchQuery), sortBy);
  const regularTasks = filterTasksBySearch(tasks.filter((task) => !task.pinned && !task.archived), searchQuery);
  const archivedTasks = sortTaskRows(filterTasksBySearch(tasks.filter((task) => task.archived), searchQuery), sortBy);
  const timelineTasks = sortTaskRows(regularTasks, sortBy);
  const groups = groupTasksByWorkspace({ workspaces: args.result.workspaces, tasks: regularTasks, sortBy })
    .filter((group) => group.tasks.length > 0)
    .map((group) => {
      const isCollapsed = collapsed.has(group.workspaceKey);
      return { ...group, totalTaskCount: group.tasks.length, collapsed: isCollapsed, tasks: isCollapsed ? [] : group.tasks };
    });
  return {
    pinnedTasks,
    groups,
    timelineTasks,
    archivedTasks,
    totalTaskCount:
      args.viewMode === "archived"
        ? archivedTasks.length
        : args.viewMode === "timeline"
          ? timelineTasks.length
          : groups.reduce((sum, group) => sum + (group.totalTaskCount ?? group.tasks.length), 0),
  };
}

/** 原 dLt/fLt/pLt（— / 122539–122541）：空索引重试参数 */
const WEB_REMOTE_RETRY_DELAY_MS = 300;
const WEB_REMOTE_MAX_RETRIES = 3;
function waitRetryDelay(): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, WEB_REMOTE_RETRY_DELAY_MS);
  });
}

/** 原 uLt（— / 122425）：远控任务行（未读点/置顶/归档确认/删除 + 悬停动作） */
function WebRemoteTaskRow({
  activeTaskId,
  activeWorkspaceKey,
  canMutateTask,
  intl,
  mutatingTaskKey,
  onArchiveTask,
  onDeleteArchivedTask,
  onOpenTask,
  onToggleTaskPin,
  onUnarchiveTask,
  pendingArchiveTaskKey,
  showWorkspaceLabel = false,
  switchingTaskKey,
  task,
  taskSortBy,
}: {
  activeTaskId: string | null;
  activeWorkspaceKey: string;
  canMutateTask: boolean;
  intl: IntlShape;
  mutatingTaskKey: string | null;
  onArchiveTask: (event: React.MouseEvent, task: TaskMeta) => void;
  onDeleteArchivedTask: (event: React.MouseEvent, task: TaskMeta) => void;
  onOpenTask: (task: TaskMeta) => void;
  onToggleTaskPin: (event: React.MouseEvent, task: TaskMeta) => void;
  onUnarchiveTask: (event: React.MouseEvent, task: TaskMeta) => void;
  pendingArchiveTaskKey: string | null;
  showWorkspaceLabel?: boolean;
  switchingTaskKey: string | null;
  task: TaskMeta;
  taskSortBy: TaskSortBy;
}) {
  const [hovered, setHovered] = React.useState(false);
  const rowKey = webRemoteTaskKey(task);
  const isActive = taskWorkspaceKey(task) === activeWorkspaceKey && task.taskId === activeTaskId;
  const isSwitching = switchingTaskKey === rowKey;
  const isMutating = mutatingTaskKey === rowKey;
  const isPendingArchive = pendingArchiveTaskKey === rowKey;
  const canPin = canMutateTask && !task.archived;
  const canArchive = canMutateTask && !task.archived;
  const canUnarchive = canMutateTask && !!task.archived;
  const canDelete = canMutateTask && !!task.archived;
  const isPinnedVisible = !!(task.pinned && !task.archived);
  const isBusy = !!switchingTaskKey;
  const showPin = canPin && hovered;
  const showArchive = canArchive && (hovered || isPendingArchive);
  const showArchivedActions = (canUnarchive || canDelete) && hovered;
  const title = task.title || intl.formatMessage({ id: "taskList.untitled" });
  const relativeTime = formatRelativeTime(taskSortBy === "created" ? task.createdAt : task.updatedAt, intl);
  const pinLabel = intl.formatMessage({ id: task.pinned ? "taskList.unpin" : "taskList.pin" });
  const archiveLabel = intl.formatMessage({ id: isPendingArchive ? "common.confirm" : "taskList.archive" });
  const unarchiveLabel = intl.formatMessage({ id: "taskList.unarchive" });
  const deleteLabel = intl.formatMessage({ id: "taskList.delete" });
  const isRemoteish = !!(task.workspaceIdentity?.trim() || task.workspaceKind === "remote");

  return (
    <li
      data-web-remote-task-row={rowKey}
      onMouseEnter={React.useCallback(() => {
        setHovered(true);
      }, [])}
      onMouseLeave={React.useCallback(() => {
        setHovered(false);
      }, [])}
      className={cn(
        "group/task-item relative flex w-full cursor-pointer items-center gap-2 rounded-lg text-left transition-[background-color,border-color,box-shadow]",
        isBusy && "cursor-wait opacity-80",
        isActive ? "bg-selected" : "hover:bg-surface-hover",
      )}
    >
      <button
        type="button"
        aria-label={intl.formatMessage({ id: "webRemoteControl.openTask" }, { title })}
        data-testid={joinTestidParts(TESTID_TASK_ITEM, task.taskId)}
        disabled={isBusy}
        onClick={() => onOpenTask(task)}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 pl-2.5 pr-1 text-left disabled:cursor-wait disabled:opacity-80"
      >
        <span className="relative flex size-4 shrink-0 items-center justify-center">
          <span aria-hidden="true" className={cn("flex size-4 items-center justify-center transition-opacity", showPin && "hidden")}>
            {isSwitching || isMutating ? (
              <IconLoader className="size-4 animate-spin text-foreground-subtle" />
            ) : task.unreadAt ? (
              <span data-unread-indicator="true" className="h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-400" />
            ) : isPinnedVisible ? (
              <IconPin className="size-4 text-foreground-subtle" />
            ) : null}
          </span>
        </span>
        <span className="min-w-0 flex h-6 flex-1 flex-wrap items-center gap-1.5">
          <span className="min-w-0 flex-1 truncate text-ui-base text-foreground" title={title}>
            {title}
          </span>
          {showWorkspaceLabel ? (
            <span className="max-w-28 shrink truncate text-ui-base text-foreground-subtlest" title={task.workspaceLabel}>
              {task.workspaceLabel}
            </span>
          ) : null}
        </span>
        <span className={cn("mr-0.5 shrink-0 text-ui-base text-foreground-subtle", showArchive && "hidden")}>{relativeTime}</span>
      </button>
      {showPin ? (
        <Tooltip title={pinLabel} side="right" align="center">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={isBusy || isMutating}
            onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => onToggleTaskPin(event, task)}
            className={cn("absolute left-2.5 top-1/2 z-10 inline-flex size-4 min-w-0 -translate-y-1/2 rounded-sm !bg-transparent p-0 text-foreground-subtle hover:text-foreground")}
            aria-label={pinLabel}
          >
            <IconPin className="size-4" />
          </Button>
        </Tooltip>
      ) : null}
      {showArchive ? (
        <Tooltip title={archiveLabel} side="right" align="center">
          <Button
            type="button"
            variant={isPendingArchive ? "destructive" : "ghost"}
            size={isPendingArchive ? "sm" : "icon-sm"}
            disabled={isBusy || isMutating}
            onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => onArchiveTask(event, task)}
            data-testid={joinTestidParts(TESTID_TASK_ARCHIVE, task.taskId)}
            className={cn("shrink-0", isPendingArchive ? "flex border-destructive/20 px-2" : "flex")}
            aria-label={archiveLabel}
          >
            {isPendingArchive ? <span>{intl.formatMessage({ id: "common.confirm" })}</span> : <IconArchive className="size-3.5" />}
          </Button>
        </Tooltip>
      ) : null}
      {showArchivedActions ? (
        <>
          {canUnarchive ? (
            <Tooltip title={unarchiveLabel} side="right" align="center">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isBusy || isMutating}
                onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => onUnarchiveTask(event, task)}
                className="shrink-0 text-foreground-subtle hover:text-foreground"
                aria-label={unarchiveLabel}
              >
                {isRemoteish ? <IconCloudUpload className="size-3.5" /> : <IconArchiveRestore className="size-3.5" />}
              </Button>
            </Tooltip>
          ) : null}
          {canDelete ? (
            <Tooltip title={deleteLabel} side="right" align="center">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isBusy || isMutating}
                onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => onDeleteArchivedTask(event, task)}
                className="shrink-0 text-destructive hover:text-destructive"
                aria-label={deleteLabel}
              >
                <IconX className="size-3.5" />
              </Button>
            </Tooltip>
          ) : null}
        </>
      ) : null}
    </li>
  );
}

/** 原 mLt（147286 / 122543）：Web 远控任务列表段（pinned + 工作区分组 + timeline + archived） */
export function WebRemoteTaskListSection({
  switcher,
  activeWorkspacePath,
  activeWorkspaceIdentity,
  activeTaskId,
  taskSortBy = "updated",
  taskViewMode = "workspace",
  searchQuery = "",
  collapsedWorkspaceKeys = new Set(),
  initialResult,
  onToggleWorkspaceCollapsed,
  onWorkspaceGroupKeysChange,
  renderBeforePinnedTasks,
  onSelectTask,
  onTaskOpen,
  onCrossWorkspaceSwitchingChange,
}: {
  switcher: WebRemoteSwitcherService;
  activeWorkspacePath: string;
  activeWorkspaceIdentity?: string | null;
  activeTaskId: string | null;
  taskSortBy?: TaskSortBy;
  taskViewMode?: string;
  searchQuery?: string;
  collapsedWorkspaceKeys?: Set<string>;
  initialResult?: MobileHomeResult | null;
  onToggleWorkspaceCollapsed?: (workspaceKey: string) => void;
  onWorkspaceGroupKeysChange?: (keys: string[]) => void;
  renderBeforePinnedTasks?: () => React.ReactNode;
  onSelectTask?: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => void;
  onTaskOpen?: (info: { crossWorkspace: boolean }) => void;
  onCrossWorkspaceSwitchingChange?: (key: string | null) => void;
}) {
  const { intl } = useIntlContext();
  const confirm = useConfirmDialog();
  const baseServices = useBaseServices();
  const removeTaskState = useTaskStore((state) => (state as { removeTaskState?: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => void }).removeTaskState ?? (() => {}));
  const sessionsById = useSessionRegistryStore((s) => s.sessionsById);
  const sessionIdByWorkspaceIdentity = useSessionRegistryStore((s) => s.sessionIdByWorkspaceIdentity);
  const sessionIdByWorkspacePath = useSessionRegistryStore((s) => s.sessionIdByWorkspacePath);
  const registry = React.useMemo(
    () => ({ sessionsById, sessionIdByWorkspaceIdentity, sessionIdByWorkspacePath }),
    [sessionIdByWorkspaceIdentity, sessionIdByWorkspacePath, sessionsById],
  );
  const [result, setResult] = React.useState<MobileHomeResult>(initialResult ?? { workspaces: [], tasks: [] });
  const [loading, setLoading] = React.useState(false);
  const [pendingArchiveTaskKey, setPendingArchiveTaskKey] = React.useState<string | null>(null);
  const [mutatingTaskKey, setMutatingTaskKey] = React.useState<string | null>(null);
  const { activeWorkspaceKey, error: switcherError, openTask, switchingTaskKey } = useWebRemoteTaskSwitcher({
    activeTaskId,
    activeWorkspaceIdentity,
    activeWorkspacePath,
    onSelectTask,
    onSwitchingChange: onCrossWorkspaceSwitchingChange,
    onTaskOpen,
    switcher,
  });
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const displayError = loadError ?? switcherError;

  const viewModel = React.useMemo(
    () =>
      buildWebRemoteTaskViewModel({
        result,
        viewMode: taskViewMode,
        sortBy: taskSortBy,
        searchQuery,
        collapsedWorkspaceKeys,
      }),
    [collapsedWorkspaceKeys, result, searchQuery, taskSortBy, taskViewMode],
  );
  const visibleCount = viewModel.pinnedTasks.length + viewModel.totalTaskCount;
  const groupKeys = React.useMemo(() => viewModel.groups.map((group) => group.workspaceKey), [viewModel.groups]);
  const relevantWorkspaces = React.useMemo(
    () => filterRemoteCapableWorkspaces({ activeWorkspaceIdentity, workspaces: result.workspaces }),
    [activeWorkspaceIdentity, result.workspaces],
  );
  const servicesByWorkspaceKey = React.useMemo(() => buildWorkspaceServicesMap(relevantWorkspaces as WorkspaceTab[], baseServices, registry), [baseServices, relevantWorkspaces, registry]);

  const loadIndex = React.useCallback(
    async (isCancelled: () => boolean = () => false) => {
      setLoading(true);
      setLoadError(null);
      try {
        for (let attempt = 0; attempt <= WEB_REMOTE_MAX_RETRIES; attempt += 1) {
          const fetched = await switcher.listWorkspaces();
          if (
            isCancelled() ||
            (setResult(fetched),
            !shouldRetryEmptyRemoteIndex({ activeTaskId, attempt, maxAttempts: WEB_REMOTE_MAX_RETRIES, taskCount: fetched.tasks?.length ?? 0 })) ||
            (logger.debug("[WebRemoteControlTaskIndex] 远控任务索引为空，等待桌面任务快照同步", {
              activeTaskId,
              activeWorkspaceIdentity,
              activeWorkspacePath,
              attempt,
            }),
            await waitRetryDelay(),
            isCancelled())
          ) {
            return;
          }
        }
      } catch (error) {
        if (isCancelled()) return;
        const message = error instanceof Error ? error.message : String(error);
        logger.error("[WebRemoteControlTaskIndex] 加载远程 task 索引失败", { error: message });
        setLoadError(message);
      } finally {
        if (!isCancelled()) setLoading(false);
      }
    },
    [activeTaskId, activeWorkspaceIdentity, activeWorkspacePath, switcher],
  );

  React.useEffect(() => {
    let cancelled = false;
    void loadIndex(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [loadIndex]);

  React.useEffect(
    () =>
      switcher.onWorkspaceListUpdated?.((next) => {
        setResult(next);
        setLoadError(null);
        setLoading(false);
      }),
    [switcher],
  );

  React.useEffect(() => {
    onWorkspaceGroupKeysChange?.(groupKeys);
  }, [onWorkspaceGroupKeysChange, groupKeys]);

  /** 成员变更（置顶/归档后服务端回推） */
  const applyMembership = React.useCallback((target: TaskMeta, membership: { pinned?: boolean; archived?: boolean }) => {
    setResult((current) => applyRemoteTaskMembership({ result: current, target, membership }));
  }, []);
  const removeTask = React.useCallback((task: TaskMeta) => {
    setResult((current) => ({
      ...current,
      tasks: (current.tasks ?? []).filter((candidate) => candidate.taskId !== task.taskId || taskWorkspaceKey(candidate) !== taskWorkspaceKey(task)),
    }));
  }, []);

  const handleTogglePin = React.useCallback(
    (event: React.MouseEvent, task: TaskMeta) => {
      event.preventDefault();
      event.stopPropagation();
      const workspaceKey = taskWorkspaceKey(task);
      const entry = servicesByWorkspaceKey.get(workspaceKey);
      if (!entry) return;
      const rowKey = webRemoteTaskKey(task);
      const nextPinned = !task.pinned;
      setPendingArchiveTaskKey(null);
      setMutatingTaskKey(rowKey);
      entry.services.zcodeTaskService
        .setTaskPinned({
          taskId: task.taskId,
          workspacePath: task.workspacePath,
          ...(task.workspaceIdentity ? { workspaceIdentity: task.workspaceIdentity } : {}),
          pinned: nextPinned,
        })
        .then(() => {
          applyMembership(task, { pinned: nextPinned, archived: false });
        })
        .catch((error) => {
          logger.warn("[WebRemoteControlTaskIndex] 更新远控任务置顶状态失败", {
            error: error instanceof Error ? error.message : String(error),
            taskId: task.taskId,
            workspaceKey,
          });
          toast(intl.formatMessage({ id: "taskList.pinFailed" }));
        })
        .finally(() => {
          setMutatingTaskKey((current) => (current === rowKey ? null : current));
        });
    },
    [intl, applyMembership, servicesByWorkspaceKey],
  );

  const handleArchive = React.useCallback(
    (event: React.MouseEvent, task: TaskMeta) => {
      event.preventDefault();
      event.stopPropagation();
      const rowKey = webRemoteTaskKey(task);
      if (pendingArchiveTaskKey !== rowKey) {
        setPendingArchiveTaskKey(rowKey);
        return;
      }
      const workspaceKey = taskWorkspaceKey(task);
      const entry = servicesByWorkspaceKey.get(workspaceKey);
      if (!entry) return;
      setPendingArchiveTaskKey(null);
      setMutatingTaskKey(rowKey);
      entry.services.zcodeTaskService
        .archiveTask({
          taskId: task.taskId,
          workspacePath: task.workspacePath,
          ...(task.workspaceIdentity ? { workspaceIdentity: task.workspaceIdentity } : {}),
        })
        .then(() => {
          applyMembership(task, { pinned: false, archived: true });
        })
        .catch((error) => {
          logger.warn("[WebRemoteControlTaskIndex] 归档远控任务失败", {
            error: error instanceof Error ? error.message : String(error),
            taskId: task.taskId,
            workspaceKey,
          });
          toast(intl.formatMessage({ id: "taskList.archiveFailed" }));
        })
        .finally(() => {
          setMutatingTaskKey((current) => (current === rowKey ? null : current));
        });
    },
    [intl, pendingArchiveTaskKey, applyMembership, servicesByWorkspaceKey],
  );

  const handleUnarchive = React.useCallback(
    (event: React.MouseEvent, task: TaskMeta) => {
      event.preventDefault();
      event.stopPropagation();
      const workspaceKey = taskWorkspaceKey(task);
      const entry = servicesByWorkspaceKey.get(workspaceKey);
      if (!entry) return;
      const rowKey = webRemoteTaskKey(task);
      setPendingArchiveTaskKey(null);
      setMutatingTaskKey(rowKey);
      entry.services.zcodeTaskService
        .unarchiveTask({
          taskId: task.taskId,
          workspacePath: task.workspacePath,
          ...(task.workspaceIdentity ? { workspaceIdentity: task.workspaceIdentity } : {}),
        })
        .then(() => {
          applyMembership(task, { pinned: false, archived: false });
        })
        .catch((error) => {
          logger.warn("[WebRemoteControlTaskIndex] 取消归档远控任务失败", {
            error: error instanceof Error ? error.message : String(error),
            taskId: task.taskId,
            workspaceKey,
          });
        })
        .finally(() => {
          setMutatingTaskKey((current) => (current === rowKey ? null : current));
        });
    },
    [applyMembership, servicesByWorkspaceKey],
  );

  const handleDeleteArchived = React.useCallback(
    (event: React.MouseEvent, task: TaskMeta) => {
      event.preventDefault();
      event.stopPropagation();
      void (async () => {
        const confirmed = await confirm({
          title: intl.formatMessage({ id: "confirmDialog.archivedTaskDeleteTitle" }),
          description: intl.formatMessage({ id: "confirmDialog.archivedTaskDeleteDescription" }),
          confirmLabel: intl.formatMessage({ id: "taskList.delete" }),
        });
        if (!confirmed) return;
        const workspaceKey = taskWorkspaceKey(task);
        const entry = servicesByWorkspaceKey.get(workspaceKey);
        if (!entry) return;
        const rowKey = webRemoteTaskKey(task);
        setPendingArchiveTaskKey(null);
        setMutatingTaskKey(rowKey);
        try {
          await entry.services.zcodeTaskService.deleteTask({
            taskId: task.taskId,
            workspacePath: task.workspacePath,
            ...(task.workspaceIdentity ? { workspaceIdentity: task.workspaceIdentity } : {}),
          });
          removeTask(task);
          removeTaskState(task.workspacePath, task.taskId, task.workspaceIdentity);
        } catch (error) {
          logger.warn("[WebRemoteControlTaskIndex] 删除归档远控任务失败", {
            error: error instanceof Error ? error.message : String(error),
            taskId: task.taskId,
            workspaceKey,
          });
        } finally {
          setMutatingTaskKey((current) => (current === rowKey ? null : current));
        }
      })();
    },
    [confirm, intl, removeTask, removeTaskState, servicesByWorkspaceKey],
  );

  const renderRow = React.useCallback(
    (task: TaskMeta, options: { showWorkspaceLabel?: boolean } = {}) => {
      const workspaceKey = taskWorkspaceKey(task);
      return (
        <WebRemoteTaskRow
          key={webRemoteTaskKey(task)}
          activeTaskId={activeTaskId}
          activeWorkspaceKey={activeWorkspaceKey}
          canMutateTask={servicesByWorkspaceKey.has(workspaceKey)}
          intl={intl}
          mutatingTaskKey={mutatingTaskKey}
          onArchiveTask={handleArchive}
          onDeleteArchivedTask={handleDeleteArchived}
          onOpenTask={(target) => {
            setPendingArchiveTaskKey(null);
            openTask(target);
          }}
          onToggleTaskPin={handleTogglePin}
          onUnarchiveTask={handleUnarchive}
          pendingArchiveTaskKey={pendingArchiveTaskKey}
          showWorkspaceLabel={options.showWorkspaceLabel}
          switchingTaskKey={switchingTaskKey}
          task={task}
          taskSortBy={taskSortBy}
        />
      );
    },
    [activeTaskId, activeWorkspaceKey, handleArchive, handleDeleteArchived, handleTogglePin, handleUnarchive, intl, mutatingTaskKey, openTask, pendingArchiveTaskKey, switchingTaskKey, taskSortBy, servicesByWorkspaceKey],
  );

  return (
    <section className="flex min-h-0 flex-col gap-2 px-2">
      {renderBeforePinnedTasks ? renderBeforePinnedTasks() : null}
      {viewModel.pinnedTasks.length > 0 ? (
        <div className="space-y-1">
          <div className="px-2 py-1 text-ui-base text-foreground-subtlest">{intl.formatMessage({ id: "taskList.pinnedSection" })}</div>
          <ul className="space-y-0.5">{viewModel.pinnedTasks.map((task) => renderRow(task))}</ul>
        </div>
      ) : null}
      {loading && visibleCount === 0 ? (
        <div className="flex items-center gap-2 px-2 py-1 text-ui-base text-foreground-subtle">
          <IconLoader className="size-3.5 animate-spin" />
          {intl.formatMessage({ id: "common.loading" })}
        </div>
      ) : null}
      {displayError ? <div className="px-2 py-1 text-ui-base text-foreground-subtle">{displayError}</div> : null}
      {!loading && !displayError && visibleCount === 0 ? (
        <div className="px-2 py-1 text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: taskViewMode === "archived" ? "taskList.noArchivedTasks" : "webRemoteControl.noTasks" })}
        </div>
      ) : null}
      {taskViewMode === "workspace" && viewModel.totalTaskCount > 0 ? (
        <ul className="space-y-2">
          {viewModel.groups.map((group) => (
            <li key={group.workspaceKey} className="space-y-1">
              <button
                type="button"
                className="flex h-8 w-full min-w-0 items-center gap-2 rounded-lg pl-2.5 pr-1 text-left text-foreground hover:bg-surface-hover hover:text-foreground"
                aria-expanded={!group.collapsed}
                onClick={() => onToggleWorkspaceCollapsed?.(group.workspaceKey)}
              >
                <span className="flex size-3 shrink-0 items-center justify-center text-foreground-subtlest">
                  {group.collapsed ? <IconChevronRight className="size-3" /> : <IconChevronDown className="size-3" />}
                </span>
                <span className="flex size-4 shrink-0 items-center justify-center text-foreground-subtle">
                  {group.workspace.workspacePurpose === "conversation" ? (
                    <IconMessageCirclePlus className="size-4" />
                  ) : group.workspace.kind === "remote" ? (
                    <IconCloud className="size-4" />
                  ) : (
                    <IconFolderOpen className="size-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-ui-base text-foreground-subtle">
                  {group.workspace.workspacePurpose === "conversation"
                    ? intl.formatMessage({ id: "workspaceSidebar.conversationsSection" })
                    : group.workspace.label}
                </span>
                {group.collapsed && group.hasUnread ? (
                  <span aria-hidden="true" data-workspace-unread-indicator="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500 dark:bg-sky-400" />
                ) : null}
                <span className="shrink-0 text-ui-base text-foreground-subtlest">{group.totalTaskCount ?? group.tasks.length}</span>
              </button>
              {group.collapsed ? null : <ul className="space-y-0.5">{group.tasks.map((task) => renderRow(task))}</ul>}
            </li>
          ))}
        </ul>
      ) : null}
      {taskViewMode === "timeline" && viewModel.timelineTasks.length > 0 ? (
        <ul className="space-y-0.5">{viewModel.timelineTasks.map((task) => renderRow(task, { showWorkspaceLabel: true }))}</ul>
      ) : null}
      {taskViewMode === "archived" && viewModel.archivedTasks.length > 0 ? (
        <ul className="space-y-0.5 pb-4">{viewModel.archivedTasks.map((task) => renderRow(task, { showWorkspaceLabel: true }))}</ul>
      ) : null}
    </section>
  );
}

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → js 行 / jsx 行；本批次展开的六项叶子 + 依赖助手）
 * ============================================================================
 *  VFt→useWorkspaceTaskGroups 144427/120229 | W6→workspaceLoadingFlags 144363/120160
 *   FFt→readVisibleLimit 144351/120150 | NFt(compose)→composeWorkspaceTaskGroups★声明 144400区
 *  mRt→useSidebarUsageState 150255/124505
 *  uzt→useGroupedTaskView 153205/126735 | KRt→sortTasksByGroupOrder —/126406
 *   qRt→buildGroupedViewFromStructure 152903区/126428 | JRt→applyDraftPromotions —/126470
 *   YRt→findTaskInViewByKey —/126504 | XRt→isTaskFirstInGroup —/126514
 *   ZRt→normalizeWorkspaceScopes —/126518 | j8→collectViewWorkspaceScopes —/126525
 *   QRt→composeOptimisticOverlay 153040区/126543 | $Rt→collectViewTaskKeys —/126621
 *   tzt→isGroupedViewReady —/126635 | nzt→GroupedViewLoadCache —/126641
 *   rzt→prependCreatedGroup —/126669 | izt→resolveVisibleMissingTaskKeys —/126679
 *   azt→viewNodeOrderKey —/126690 | ozt→viewNodesShallowEqual —/126693
 *   szt→mergeGroupedViewPreservingIdentity —/126696 | czt→toTopLevelNodeRef —/126714
 *   lzt→serializeGroupedViewOrder —/126721 | Cx→fetchTaskIndex★声明 29752/27072
 *  ABt→BeamBorderAnimation 157550/131107 | OBt→useSystemThemePreference —/131093
 *   kBt→resolveBeamTheme —/131104 | wBt→generateBeamCss —/130367
 *   TBt→generateBeamCssSm —/130373 | EBt→generateBeamCssMd —/130593 | DBt→generateBeamCssLine —/130825
 *   fBt/pBt→smBorder/InnerGradients —/129454/129458 | mBt/hBt→mdBorder/InnerGradients —/129462/129466
 *   gBt→resolveSpikePalette —/129475 | H8→withAlpha —/129920 | vBt→lineStrokeGradients —/129929
 *   bBt→lineInnerGradients —/130159 | SBt→lineBloomGradients —/130327 | CBt→lineBloomMonoGradients —/130349
 *   uBt→BEAM_SIZE_PRESETS —/128919 | B8→BEAM_THEME_PARAMS —/128935 | V8→MD_BEAM_PALETTES —/128990
 *   dBt→SM_BEAM_PALETTES —/129180 | _Bt→LINE_STROKE_PALETTES —/129479 | yBt→LINE_INNER_PALETTES —/129940
 *   xBt→LINE_SPIKE_PALETTES —/130168
 *  lLt→ArchivedTasksSection 146823/122315
 *  mLt→WebRemoteTaskListSection 147286/122543 | uLt→WebRemoteTaskRow —/122425
 *   aPt→useWebRemoteTaskSwitcher —/116882 | iPt→openWebRemoteTask —/116801
 *   dLt/fLt/pLt→WEB_REMOTE_RETRY_DELAY_MS/MAX_RETRIES/waitRetryDelay —/122539–122541
 *   DPt→buildWebRemoteTaskViewModel —/117181 | TPt→groupTasksByWorkspace —/117155
 *   EPt/_6→taskMatchesSearch/filterTasksBySearch —/117146/117149
 *   g6/SPt→sortTaskRows/taskRowComparator —/117120/117117 | CPt→sameTaskRef —/117126
 *   wPt→applyRemoteTaskMembership —/117128 | _Pt/gPt→filterRemoteCapableWorkspaces/isRemoteCapableWorkspace —/117029/117026
 *   vPt→shouldRetryEmptyRemoteIndex —/117035 | h6/xPt/mPt/hPt/bPt→远控行状态族 —/117043–117063
 *   f6→webRemoteTaskKey —/116795 | ei→taskWorkspaceKey（Io 任务对象形态）
 *   sLt→cleanupDeletedTaskState★声明 —/122284
 * ============================================================================
 */
