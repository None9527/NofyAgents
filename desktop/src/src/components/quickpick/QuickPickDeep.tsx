// A0-S4-4c: 自 modules/QuickPickDeep.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/quickpick/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * QuickPickDeep.tsx — ZS useGlobalTaskList 深部助手 + 分组拖拽碰撞 + 协议宿主常量
 * （B5-07 批次 A 段 · 解混淆逐字重建）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,979 行，只读）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 行号口径：本文件行号 = 上述本机 chunk 行（闭区间）。旧报告（TopBar/QuickPick/
 *   COVERAGE-LEDGER）口径为 213,695 行旧拷贝；本机拷贝在 A 段区偏移 +48
 *   （如 ZS 35727→35775、Ex 32488→32536），拖拽碰撞区偏移 +48
 *   （155200→155248），协议常量区偏移 +290（34696→34986 区，见报告 §2）。
 * 登记：QuickPick.report.md §1.4/§8「ZS 深部 13 助手」+ Sidebar.report §7/
 *   COVERAGE-LEDGER §c #14「分组拖拽碰撞助手 Kzt…Bzt」+ COVERAGE-LEDGER §c #15
 *   「协议宿主常量 6 + YAe」之 styles 侧部分（标题「协议/杂项常量」）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（js 行 = 本机 chunk 行）
 * ----------------------------------------------------------------------------
 *  §1 任务列表事件分类与归属意图（32249–32287）：
 *   nOe → TASK_META_REFRESH_REASONS   (32249)  6 原因集
 *   rOe → META_ONLY_REFRESH_REASONS   (32257)  4 原因集
 *   iOe → MEMBERSHIP_TOGGLE_REASONS   (32258)  4 原因集
 *   nx  → isMembershipToggleReason    (32259)
 *   aOe → isTaskDeletedReason         (32262)
 *   rx  → isListMembershipChanged     (32265)
 *   oOe → shouldInvalidateShardCache  (32273)
 *   ix  → resolveMembershipIntent     (32276)  insert-active/preserve-membership/null
 *   sOe → hasMembershipIntent         (32285)
 *  （ax/ox/sx/cOe/lOe/cx/uOe/lx/ux/dx = 未读修订计数/去重 → services.tsx §G.1 已实体化，排除）
 *  §2 后台终端终态未读同步（32330–32413）：
 *   dOe → UNREAD_PERSIST_DEDUPE_MS=1e3 (32330) | fOe → UNREAD_PERSIST_DEDUPE_MAX=256 (32331)
 *   fx  → unreadPersistDedupe          (32332) | pOe → isTerminalStatus (32333)
 *   mOe → unreadPersistDedupeKey       (32336) | hOe → isUnreadPersistDeduped (32344)
 *   gOe → isBackgroundTerminalUnreadEvent (32354) | px → syncBackgroundTerminalUnread (32364)
 *   tae → setTaskUnreadOverlayNow (1905) | nae → reconcileTaskUnreadNow (1908)
 *   Wo  → rollbackTaskUnreadNow (1911) | Ho → markWorkspaceKeysStaleNow (1885)
 *  §3 成员刷新保持（membership refresh hold，32414–32438）：
 *   mx/hx → membershipHold/membershipHoldStats (32414/32415)
 *   _Oe → armMembershipRefreshHold (32416) | vOe → releaseMembershipRefreshHold (32428)
 *   yOe → getMembershipHoldStats (32432) | bOe → awaitMembershipRefreshHold (32435)
 *  §4 跨分片任务索引加载（32439–32527）：
 *   gx → scopeOf (32439) | _x → listPinnedIdsSafe (32445) | vx → listTasksWithAvailability (32452)
 *   yx → collectUnreadAt (32459) | bx → collectTerminalStatus (32462)
 *   xx → collectTitleOverrides (32465) | Sx → collectCronAutomationIds (32469)
 *   xOe → dedupeTaskRowsByEntityKey (32472) | Cx → loadTaskIndexShard (32477)
 *  §5 快照缓存（32528–32577）：
 *   wx → taskIndexSnapshotCache (32528) | SOe → SNAPSHOT_CACHE_MAX=8 (32529)
 *   Tx → serviceIdWeakMap (32530) | COe → nextServiceId (32531)
 *   wOe → serviceIdOf (32532) | Ex → acquireTaskIndexSnapshot (32536)
 *   TOe → clearTaskIndexSnapshots (32548) | EOe → loadMergedTaskIndex (32551)
 *  §6 会话合并/水合/过滤投影（32578–32721）：
 *   DOe → mergeSessionIntoTask (32578) | Dx → hydrateTaskIndexItems (32594)
 *   OOe → matchesMembershipKind (32601) | kOe → applyIndexOverlay (32615)
 *   Ox  → projectTaskIndex (32648) | AOe → mapSessionPhaseToStatus (32665)
 *   jOe → sessionRowToTaskMeta (32679)
 *  §7 协议宿主常量 + 帧纯函数（横切 services 余量，34986–35028）：
 *   FS  → INITIAL_SESSION_INDEX_STATE (34986)
 *   UAe → RUNTIME_RESTART_BASE_DELAY_MS=100 (34987)
 *   WAe → RUNTIME_RESTART_MAX_DELAY_MS=5e3 (34988)
 *   GAe → RUNTIME_RESTART_RESET_MS=3e4 (34989)
 *   KAe → SUBSCRIBE_RETRY_BACKOFF_MS=[250,1e3,3e3] (34990)
 *   qAe → isDormantSubscribeError (34991) | JAe → isTransientSubscribeError (35000)
 *   IS  → unsubscribeTransportSafe (35003) | YAe → applyFrameToIndexState (35012)
 *   （Tte/Ane = base64/crc32，源自 src-HCld2afU.js，B5-10 领地，仅注记）
 *  §8 会话索引键助手（35443–35658；zS/BS/VS/HS/QAe/XAe 归 services.tsx §G.5/G.6）：
 *   US → subscriptionScopeKey (35443) | ZAe → isSameSubscriptionEntry (35446)
 *   GS → scopeStoreKey (35529) | $Ae → scopeStoreKeyAlias (35532)
 *   KS → toSessionIndexScope (35535) | qS → shardCacheKeyOf (35543)
 *   eje → isIdleEmptyIndexStore (35546)
 *   JS → useSessionIndexShards (35552)  ZS 深部主钩子
 *   YS → entityPrevKeyOf (35625) | tje → sessionPrevKeyOf (35628)
 *   nje → deepValueEqual (35631) | rje → reuseUnchangedTaskRows (35649)
 *   XS/ije → dynamicSubsByService/dynamicScopeKey (35659/35660)
 *  §9 动态事件订阅 + 分片规划 + 缓存收窄（35663–35754）：
 *   aje → subscribeDynamicWorkspaceEvents (35663)
 *   oje → normalizeShardScopes (35695) | sje → buildShardPlan (35700)
 *   cje → narrowCachedShardToDescriptor (35730)
 *   lje → applyRuntimeStateEvent (35745)
 *  §10 分组拖拽碰撞（F01 侧栏族，155248–155500）：
 *   Lzt → pointerPositionOf (155248) | Rzt → trackPointerPosition (155253)
 *   F8  → findScrollableAncestor (155281) | zzt → groupSignaturesEqual (155290)
 *   Bzt → stringArraysEqual (155296) | I8 → taskKeyOfDropData (155299)
 *   L8 → groupIdOfDropData (155304) | R8 → dropDataTypeOf (155309)
 *   Vzt → groupIdOfGroupOver (155314) | Hzt → groupIdOfCollapsedGroup (155319)
 *   Uzt → groupIdOfExpandedHeader (155324) | Wzt → groupIdOfExpandedFooter (155331)
 *   Gzt → groupIdOfEmptyDropZone (155338) | Kzt → groupedCollisionDetection (155343)
 *   qzt → applyTaskOverTaskDrop (155353) | Jzt → applyTaskOverCollapsedDrop (155358)
 *   Yzt → applyTaskOverExpandedHeaderDrop (155363)
 *   Xzt → applyTaskOverExpandedFooterDrop (155372)
 *   Zzt → applyTaskOverEmptyZoneDrop (155381) | Qzt → applyGroupOverGroupDrop (155386)
 *   $zt → applyGroupOverTaskDrop (155393) | z8 → groupedLayoutFingerprint (155400)
 *   eBt → DROP_ANIMATION_CONFIG (155407) | tBt → AUTO_SCROLL_THRESHOLDS (155408)
 *   nBt → measureGroupedLayout (155409) | rBt → measureGroupedTaskWidth (155427)
 *   iBt → measureGroupItemWidth (155434) | aBt → findStickyCollapsedGroupId (155440)
 *   oBt → replayGroupedLayoutAnimations (155460)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk / 既有产物，此处声明接口）
 * ----------------------------------------------------------------------------
 *  1. react（Q）；2. logger（J，logger-PFDwl5Yq.js）；
 *  3. useTaskStore（xe=h，skillStore-BmeKHDBI.js）+ 工作区状态读取 ie（skillStore L 导出：
 *     (workspaceState, taskId) → 未读指示布尔）；
 *  4. Vo 搜索结果 store（本 chunk 1553；QuickPick.tsx §1.2 已实体化）——
 *     taskMetaByEntityKey/taskUnreadOverlayByEntityKey + setTaskUnreadOverlay/
 *     reconcileTaskUnread/rollbackTaskUnread/markWorkspaceKeysStale；
 *  5. StoresDeep.tsx §A（Vo 合并助手族）：jo 附挂会话活动态(1308)/Mo 读活动态(1311)/
 *     Fo 活动态优先比较(1365)/Io 工作区键(1368)/Lo 实体键(1371)/Ro 作用域去重(1374)；
 *  6. services.tsx §G.1：sx 未读修订自增（32290，notifyTaskUnreadChange 内部）；
 *  7. services.tsx §G.5/G.6：XAe SessionIndexStore / QAe WorkspaceSubscriptionSet /
 *     zS createWorkspaceSessionIndexTransport / WS workspaceIdentityOf /
 *     VS acquireSessionIndexStore / HS releaseSessionIndexStore / BS sessionIndexPoolKey /
 *     Xs serviceGeneration(4351)；
 *  8. 会话注册表解析 gc/vc/_c（4814–4825，services/stores-session 层）；
 *  9. Sidebar.tsx 分组拖拽状态操作（接口级声明）：vIt 任务跨组移动(145090)/
 *     u8 组外放置(145103)/d8 组首放置(145109)/bIt 组尾追加(145117)/
 *     xIt 组级移动(145128)/n8 分组视图任务键(144952)；
 *  10. vendored dnd-kit：KX 基线碰撞检测（92249，VENDOR-MANIFEST-LIBS @dnd-kit）。
 *
 * ----------------------------------------------------------------------------
 * 〔A1-P3-B10〕批 10 改指/登记修订（取证见 A1-P3-B10.report.md）
 * ----------------------------------------------------------------------------
 *  - ie → 改指：declare readTaskUnreadIndicator 删除，文件头 SkillStore import
 *    `isTaskUnread as readTaskUnreadIndicator`（canonical = stores/taskStore::isTaskUnread，jsx 246 逐字）。
 *  - zte → 改指：declare isLockFileExistsError 删除，文件头 SrcSharedA import
 *    `isFileLockTimeoutError as isLockFileExistsError`（canonical = lib/errorUtils，jsx 136/js 113 逐字）。
 *  - jo → 〔A1-R49〕改指闭合：declare attachSessionActivity 删除，文件头 StoresDeep import
 *    `withSessionActivity as attachSessionActivity`（canonical 泛型重载同批受理；调用点 801/926 不变）。
 *  - sx → 〔A1-R49〕改指闭合：declare bumpUnreadRevision 删除，文件头 services import
 *    `bumpUnreadNotificationVersion as bumpUnreadRevision`（commandQueueProtocol §G.1 补导出；调用点 730 不变）。
 *  - KX → vendor 裁定：styles 91850–94592 = @dnd-kit/core+sortable vendored 区（取证见报告 §三），
 *    declare dndBaselineCollision 为 vendor 边界占位，不转录。
 * ============================================================================
 */

import * as React from "react";
import { workspaceKeyOf } from '../../modules/CodeViewer';
import { logger, useTaskStore, resolveWorkspaceKey, isTaskUnread as readTaskUnreadIndicator } from '../../modules/SkillStore'; // 〔A1-P3-B9〕+resolveWorkspaceKey（原 skillStore-b/jsx 155，styles U 二跳：`H as U` ← skillStore 出口 `b as H`；DnD 族 workspaceScopeKey 消费）；〔A1-P3-B10〕+isTaskUnread as readTaskUnreadIndicator（原 ie：styles 383 `L as ie` ← skillStore 2494 `ge as L`；canonical = stores/taskStore::isTaskUnread jsx 246 逐字、A0-S4-3 迁；declare 改指，调用点 682 不变）
import { dedupeWorkspaceScopes, sessionActivityOf, compareTasks as compareTaskRecency, taskEntityKey as entityKeyOf, withSessionActivity as attachSessionActivity } from '../../modules/StoresDeep'; // +compareTaskRecency/entityKeyOf（A1-R10 2e：原 Fo（1365）/Lo（1371）declare 改指 canonical = helpers compareTasks/taskEntityKey 逐字；调用点 849/1326 与 471/607/720/760/762 逐字不变）；〔A1-R49〕+withSessionActivity as attachSessionActivity（原 jo，styles 1308 逐字；canonical = stores/searchResultsHelpers，泛型重载同批受理；调用点 801/926 逐字不变）
import { isFileLockTimeoutError as isLockFileExistsError } from '../../modules/SrcSharedA'; // 〔A1-P3-B10〕原 zte（styles 711 `ks as zte` ← src 9949 `te as ks`）；canonical = lib/errorUtils::isFileLockTimeoutError（jsx 136/js 113 逐字，A0-S4-1 实体迁，SrcSharedA 311 再导出）；declare 改指，调用点 949 不变
import { SessionIndexStore, WorkspaceSubscriptionSet, sessionIndexPoolKey, useBaseServices, bumpUnreadNotificationVersion as bumpUnreadRevision, type SessionIndexScope } from '../../modules/services'; // 〔A1-R49〕+bumpUnreadNotificationVersion as bumpUnreadRevision（原 sx，styles 32290–32293 逐字；canonical 状态面 = services/commandQueueProtocol §G.1 单一模块态，同批补导出受理；调用点 730 逐字不变）
/* ── A0-D-Misc 接线：Vo 搜索结果 store 属主 = QuickPick（useSearchResultsStore，QuickPick.tsx 1553–1878） ── */
import { useSearchResultsStore as SearchResultsStore } from '../../modules/QuickPick'; // 原 Vo（QuickPick.tsx 已实体化）：搜索结果/未读覆盖 store
import { armMembershipRefreshHold, releaseMembershipRefreshHold, readMembershipRefreshHoldState, awaitMembershipRefreshHold } from '../shell/TaskIndexCore';
import { pickScopePathIdentity, readListSafe, readListAvailability, collectUnreadAtOverlays, collectTerminalStatusOverlays, collectTitleOverrides, collectCronAutomationIds, dedupeTaskIndexItemsByEntityKey, readTaskIndexShard, serviceIndexOf, readTaskIndexCache, clearTaskIndexCache, mergeTaskIndexEndpoints } from '../shell/TaskIndexCore'; // 〔A1-P3-B4〕§4/§5 孪生余量改指逐字 canonical 之再导出源（本叶无本地调用面，仅供别名再导出；环安全同 B3 §3）
import { scopeSubscriptionLabel, sameScopeSubscriptionEntry, sessionScopeWorkspaceKey, sessionStoreKey, storeKeyOfRegistrySession, resolveSessionScope, sessionSubscriptionKey, isSessionStoreHydrating } from '../shell/SessionStoreCore'; // 〔A1-P3-B4〕§8 键助手簇 + WS 改指逐字 canonical（styles 35443–35454/35526–35551）。环安全：SessionStoreCore→modules/services→sessionIndex→modules/QuickPickDeep→本叶既有环同构，顶层全函数/再导出，ESM 提升安全
import { resolveTabRemoteSessionId, tabHasRemoteBacking, resolveTabServicesBinding } from '../../modules/WorkspaceTabsDeep'; // 〔A1-P3-B4〕原 gc/_c/vc declare 改指 canonical（styles 4814/4822/4825，WTBD 头注 §[C]/[D] 双归属裁决在案）。环安全：WTBD 值闭包（zustand/e2eStoreBridge/uuid/SkillStore/sessionRegistryStore/remoteServices→stores-core 族）不达 components/quickpick（实测），无新环
import type { BaseServices, SessionRegistryState } from '../../stores/sessionRegistryStore'; // 〔A1-P3-B4〕型别导入（零 emit）：gc/vc/_c 改指后 buildShardPlan 参数形 // 〔A1-P3-B3〕§3 持有臂归一：原 mx/hx/_Oe/vOe/yOe/bOe 语义实体改指逐字 canonical（styles 32411–32438，A1-P3-B2 转录）；环安全见 §3 墓碑注

/* ============================================================================
 * 0. 外部依赖类型声明
 * ==========================================================================*/

interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}

/** 任务元数据（stores 层口径，节录） */
interface TaskMeta {
  taskId: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  title: string;
  titleOverridden?: boolean;
  createdAt: number;
  updatedAt: number;
  status?: string;
  unreadAt?: number;
  mode?: string;
  model?: string;
  provider?: string;
  forkedFromTaskId?: string;
  cronAutomationId?: string;
  pendingInteraction?: unknown;
  traceId?: string;
  [key: string]: unknown;
}
interface TaskListEvent {
  reason: string;
  taskId?: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  taskMeta?: {
    updatedAt?: number;
    unreadAt?: number | null;
    taskId?: string;
    status?: string;
  } | null;
  unreadSignal?: string;
}
interface WorkspaceScope {
  workspacePath: string;
  workspaceIdentity?: string | null;
}
interface TaskIndexRow extends TaskMeta {}
interface TaskIndexShard {
  taskIndexItems: TaskIndexRow[];
  pinnedIds: Set<string>;
  archivedIds: Set<string>;
  deletedIds: Set<string>;
  unreadAtByTaskId: Map<string, number>;
  terminalStatusByTaskId: Map<string, string>;
  titleOverrideByTaskId: Map<string, string>;
  cronAutomationIdByTaskId: Map<string, string>;
}
interface TaskIndexEndpoint {
  service: WorkspaceAgentService;
  scopes: WorkspaceScope[];
}
interface WorkspaceAgentService {
  listTasks(scope: WorkspaceScope): Promise<TaskIndexRow[]>;
  listArchivedTasks(scope: WorkspaceScope): Promise<TaskIndexRow[]>;
  listPinnedTasks(scope: WorkspaceScope): Promise<TaskIndexRow[]>;
  listPinnedTaskIds(): Promise<string[]>;
  listDeletedTaskIds?(scope: WorkspaceScope): Promise<string[]>;
  onDynamicWorkspaceEvent(scope: WorkspaceScope): (
    listener: (event: unknown) => void,
  ) => { dispose(): void };
  [key: string]: unknown;
}
interface WorkspaceStateLike {
  activeTaskId: string | null;
  taskListVersion?: number;
}
interface TaskStoreApi {
  getState(): {
    getWorkspaceState(workspacePath: string, workspaceIdentity?: string | null): WorkspaceStateLike;
    setTaskUnreadIndicator(
      workspacePath: string,
      taskId: string,
      unread: boolean,
      workspaceIdentity?: string | null,
    ): void;
    setTaskRuntimeState(
      workspacePath: string,
      taskId: string,
      status: string,
      error?: string,
      workspaceIdentity?: string | null,
      provider?: string,
    ): void;
  };
}
/* ── tombstone（A1-P3-B10）：declare readTaskUnreadIndicator（原 ie，styles 383 `L as ie` ← skillStore 2494 `ge as L`）删除，
 *    改经文件头 SkillStore import `isTaskUnread as readTaskUnreadIndicator` 消费（canonical = stores/taskStore::isTaskUnread，jsx 246 逐字、A0-S4-3 实体迁；
 *    调用点 682 不变；实参 workspaceState 实型 = WorkspaceTaskState（taskStore getWorkspaceState 2946 返回型），与 canonical 首参同型，WorkspaceStateLike 窄型仅余 TaskStoreApi 死型面）。 ── */

/* A0-D-Misc：原 SearchResultsStoreApi declare 删除——Vo 已改真实 import
 * （QuickPick.useSearchResultsStore，getState() 面逐方法核验兼容）。 */

/* StoresDeep.tsx §A 已实体化的 Vo 合并助手族 */
/* ── tombstone（A1-R49）：declare attachSessionActivity（原 jo，styles 1308–1310）删除——
 *    改经文件头 StoresDeep import `withSessionActivity as attachSessionActivity` 消费
 *    （canonical = stores/searchResultsHelpers::withSessionActivity 逐字；泛型重载
 *    `<T extends Record<string,unknown>>(meta: T, activity: SessionActivity): T` 同批受理，
 *    A1-P3-B10 §2-3 申请闭合）。型相容核验：调用点 801（bundle 32592，DOe 尾句
 *    `return n ? jo(a, n) : a`）实参 merged: TaskIndexRow——含 `[key: string]: unknown`
 *    索引签名，纳 T 约束，回带 TaskIndexRow 与原契契同；调用点 926（bundle 32685，
 *    jOe 尾句）实参对象字面量隐式索引签名纳约束，回带字面型纳 TaskMeta 返回契。
 *    第二实参型缝收口：SessionIndexRow.pendingInteractionSummary 宽化 unknown →
 *    bundle 真形精化（pke=pendingInteractionSummaryCounts，styles 33294/33306，
 *    sessionsIndexSchemaCore 79/91 逐字在案），纳 SessionActivity.pendingInteractions。 ── */
/* ── tombstone（A1-R10 2e）：declare compareTaskRecency（原 Fo，1365）/entityKeyOf（原 Lo，1371）删除，
 *    改经文件头 StoresDeep import 消费（canonical = helpers compareTasks/taskEntityKey 逐字）。 ── */

/* services.tsx §G.1 已实体化：未读修订自增（原 sx） */
/* ── tombstone（A1-R49）：declare bumpUnreadRevision（原 sx，styles 32290–32293）删除——
 *    改经文件头 services import `bumpUnreadNotificationVersion as bumpUnreadRevision` 消费
 *    （canonical 状态面 ax/ox = services/commandQueueProtocol §G.1 unreadNotifyVersion/
 *    unreadNotifyListeners 单一模块态；补导出同批受理，A1-P3-B10 §2-4 申请闭合）。
 *    调用点 730（bundle 32402，taskStatusUnreadSync catch 分支 `sx(),`）逐字不变。
 *    零本地转录：状态面与 cOe/lOe/ux/dx（subscribe/get/notify/use 四导出）共享不分裂。 ── */

/* services.tsx §G.5/G.6 已实体化（SessionIndexScope 改自 services 类型导入，A0-D-Misc） */
export interface SessionIndexRow {
  sessionId: string;
  phase: string;
  title: string;
  titleSource?: string;
  createdAt: number;
  lastActivityAt: number;
  parentSessionId?: string;
  provider?: string;
  hasBackgroundWork?: boolean;
  pendingInteraction?: {
    interactionId: string;
    kind: string;
    toolName?: string;
    autoResolution?: unknown;
  } | null;
  /** 〔A1-R49〕型缝精化（宽化→真形）：原 `unknown` → bundle pke 真形
   * （pendingInteractionSummaryCounts，styles 33294/33306 = sessionsIndexSchemaCore 79/91
   * 逐字 `zObject({ permissionCount, userInputCount })`）；消费面仅 938（jOe 活动态构造），
   * 精化后纳 SessionActivity.pendingInteractions 型契（jo 改指前置，A1-P3-B10 §2-3）。 */
  pendingInteractionSummary?: { permissionCount: number; userInputCount: number };
  [key: string]: unknown;
}
/* ── tombstone（A1-P3-B4）：六件 declare 删除——
 *    zS createWorkspaceSessionIndexTransport：零消费（本叶无调用面，shim 未再导出）；
 *      canonical = services/sessionIndex §B5-transport 逐字（styles 35405，A1-P3-B3 转录）。
 *    Xs serviceGenerationOf：零消费；canonical = modules/stores-core serviceGeneration（原 4351）。
 *    WS workspaceIdentityOf：调用面 988/1003/1279 改指 SessionStoreCore.sessionScopeWorkspaceKey
 *      （styles 35526 逐字，A1-P3-B2）；同形证据见 A1-P3-B4.report.md §五。
 *    gc resolveRemoteSessionId / _c isSessionMissing / vc resolveSessionServices（styles 4814/4822/4825）：
 *      改指 WorkspaceTabsDeep canonical resolveTabRemoteSessionId/tabHasRemoteBacking/
 *      resolveTabServicesBinding（语义重建，双归属裁决见 WTBD 头注）；buildShardPlan 参数形
 *      随之改型（BaseServices/SessionRegistryState，零消费者，运行时值不变）。
 *      同形证据见报告 §五；环证据见报告 §四（WTBD 闭包不达本叶，无新环）。 ── */
interface WorkspaceTabLike {
  workspacePath: string;
  workspaceIdentity?: string | null;
  [key: string]: unknown;
}

/* Sidebar.tsx 接口级声明的分组拖拽状态操作（144952–145128） */
interface GroupedViewState {
  nodes: Array<
    | { type: "task"; task: TaskMeta }
    | { type: "group"; group: { id: string }; tasks: TaskMeta[] }
  >;
  [key: string]: unknown;
}
interface DragCollisionArgs {
  active: { data: { current: unknown } };
  over?: { data: { current: unknown } } | null;
  droppableContainers: Array<{ data: { current: unknown }; [key: string]: unknown }>;
  [key: string]: unknown;
}
/* ── 〔A1-P3-B9〕逐字转录：DnD 组操作簇（styles 1368–1370 Io + 144952–145140 n8…xIt，192 行 26 符）──
 * 闭合证据：n8→Io(1368)→U；U = styles 裸导入 `H as U`(379) ← skillStore 出口 `b as H` ← b(e,t)=t?.trim()||e(166)
 *   = taskStore::resolveWorkspaceKey(282，原 b/jsx 155，头部 import 接线)；余 25 符全 span 内互引纯函数，模块初始化安全。
 * 映射：Io→workspaceScopeKey(1368) | n8→groupedTaskKeyOf(144952) | sIt→cloneGroupedViewDeep(144955) |
 *   r8→cloneViewNodes(144960) | i8→cloneGroupNode(144963) | a8→removeTaskFromView(144966) | o8→insertTaskIntoGroup(144985) |
 *   cIt→removeTaskFromGroups(144994) | s8→findTaskInView(145004) | lIt→replaceTaskInView(145014) | uIt→listGroupIds(145026) |
 *   dIt→everyKeyAbsent(145029) | fIt→intersectKeySets(145032) | pIt→findParentGroupId(145036) | mIt→findRootTaskIndex(145041) |
 *   c8→findGroupNodeIndex(145044) | hIt→findParentGroupIdOfTask(145047) | l8→locateTaskInView(145052) | gIt→describeDropTarget(145071) |
 *   _It→insertTaskAtAnchor(145076) | yIt→insertTaskAtGroupEdge(144998) | vIt→moveTaskOverTask(145090) | u8→placeTaskOutsideGroup(145103) |
 *   d8→placeTaskAtGroupHead(145109) | bIt→appendTaskToGroupTail(145117) | xIt→moveGroupOver(145128)。
 * 转录机制：AST 精确改名（71 处），往返核对 ROUNDTRIP[dnd] EXACT（192 行）在案（/tmp/a1r0-p3/p3b9-roundtrip.js）；
 *   体内局部保留混淆名（B5 约定）。型缝 ×74：P1 顶层函数参数 :any ×53 + S16 any 接收面回调参数 :any ×21。
 * 孪生注记：Sidebar.tsx §617 段（P2 泳道）为本簇语义孪生面（js 144872–145136 A0 行号误标族），跨泳道孪生登记见 A1-P3-B9.report.md §二。
 * 消费面登记：n8/vIt/u8/d8/bIt/xIt 区外消费 153007/154273+/155356–155398 = Sidebar 任务列 DnD 域（P2 逐字段），跨泳道登记。 ── */
function workspaceScopeKey(e: any, t: any) {
  return resolveWorkspaceKey(e, t);
}
function groupedTaskKeyOf(e: any) {
  return `${workspaceScopeKey(e.workspacePath, e.workspaceIdentity)}\u0000${e.taskId}`;
}
function cloneGroupedViewDeep(e: any) {
  return {
    nodes: e.nodes.map((e: any) => (e.type === `task` ? { ...e } : { ...e, tasks: [...e.tasks] })),
  };
}
function cloneViewNodes(e: any) {
  return [...e.nodes];
}
function cloneGroupNode(e: any) {
  return { ...e, tasks: [...e.tasks] };
}
function removeTaskFromView(e: any, t: any) {
  let n = cloneViewNodes(e);
  for (let e = 0; e < n.length; e += 1) {
    let r = n[e];
    if (r) {
      if (r.type === `task` && groupedTaskKeyOf(r.task) === t)
        return (n.splice(e, 1), { nextView: { nodes: n }, task: r.task });
      if (r.type === `group`) {
        let i = r.tasks.findIndex((e: any) => groupedTaskKeyOf(e) === t);
        if (i >= 0) {
          let t = cloneGroupNode(r),
            [a] = t.tasks.splice(i, 1);
          return ((n[e] = t), { nextView: { nodes: n }, task: a ?? null });
        }
      }
    }
  }
  return { nextView: { nodes: n }, task: null };
}
function insertTaskIntoGroup(e: any, t: any, n: any, r: any) {
  let i = cloneViewNodes(e),
    a = i.findIndex((e: any) => e.type === `group` && e.group.id === n),
    o = i[a];
  if (!o || o.type !== `group`) return { nodes: i };
  let s = cloneGroupNode(o),
    c = r === null ? s.tasks.length : s.tasks.findIndex((e: any) => groupedTaskKeyOf(e) === r);
  return (s.tasks.splice(c < 0 ? s.tasks.length : c, 0, t), (i[a] = s), { nodes: i });
}
function removeTaskFromGroups(e: any, t: any) {
  let n = cloneGroupedViewDeep(e);
  for (let e of n.nodes) {
    if (e.type !== `group`) continue;
    let r = e.tasks.findIndex((e: any) => groupedTaskKeyOf(e) === t);
    if (r >= 0) return (e.tasks.splice(r, 1), n);
  }
  let r = n.nodes.findIndex((e: any) => e.type === `task` && groupedTaskKeyOf(e.task) === t);
  return (r >= 0 && n.nodes.splice(r, 1), n);
}
function findTaskInView(e: any, t: any) {
  for (let n of e.nodes) {
    if (n.type === `task` && groupedTaskKeyOf(n.task) === t) return n.task;
    if (n.type === `group`) {
      let e = n.tasks.find((e: any) => groupedTaskKeyOf(e) === t);
      if (e) return e;
    }
  }
  return null;
}
function replaceTaskInView(e: any, t: any) {
  let n = groupedTaskKeyOf(t);
  return {
    nodes: e.nodes.map((e: any) =>
      e.type === `task`
        ? groupedTaskKeyOf(e.task) === n
          ? { ...e, task: t }
          : e
        : { ...e, tasks: e.tasks.map((e: any) => (groupedTaskKeyOf(e) === n ? t : e)) },
    ),
  };
}
function listGroupIds(e: any) {
  return e.nodes.flatMap((e: any) => (e.type === `group` ? [e.group.id] : []));
}
function everyKeyAbsent(e: any, t: any) {
  return e.length > 0 && e.every((e: any) => !t.has(e));
}
function intersectKeySets(e: any, t: any) {
  let n = new Set(t);
  return new Set([...e].filter((e: any) => n.has(e)));
}
function findParentGroupId(e: any, t: any) {
  for (let n of e.nodes)
    if (n.type === `group` && n.tasks.some((e: any) => groupedTaskKeyOf(e) === t)) return n.group.id;
  return null;
}
function findRootTaskIndex(e: any, t: any) {
  return e.nodes.findIndex((e: any) => e.type === `task` && groupedTaskKeyOf(e.task) === t);
}
function findGroupNodeIndex(e: any, t: any) {
  return e.nodes.findIndex((e: any) => e.type === `group` && e.group.id === t);
}
function findParentGroupIdOfTask(e: any, t: any) {
  for (let n of e.nodes)
    if (n.type === `group` && n.tasks.some((e: any) => groupedTaskKeyOf(e) === t)) return n.group.id;
  return null;
}
function locateTaskInView(e: any, t: any) {
  for (let n = 0; n < e.nodes.length; n += 1) {
    let r = e.nodes[n];
    if (r) {
      if (r.type === `task` && groupedTaskKeyOf(r.task) === t)
        return { parent: `root`, nodeIndex: n, task: r.task };
      if (r.type === `group`) {
        let e = r.tasks.findIndex((e: any) => groupedTaskKeyOf(e) === t);
        if (e >= 0) {
          let t = r.tasks[e];
          return t
            ? { parent: `group`, groupId: r.group.id, nodeIndex: n, taskIndex: e, task: t }
            : null;
        }
      }
    }
  }
  return null;
}
function describeDropTarget(e: any, t: any) {
  if (!t) return { type: `top` };
  let n = locateTaskInView(e, t);
  return n?.parent === `group` ? { type: `group`, groupId: n.groupId } : { type: `top` };
}
function insertTaskAtAnchor(e: any, t: any, n: any, r: any) {
  let i = cloneViewNodes(e),
    a = locateTaskInView({ nodes: i }, n);
  if (!a) return { nodes: i };
  if (a.parent === `root`) {
    let e = a.nodeIndex + +(r === `after`);
    return (i.splice(e, 0, { type: `task`, task: t }), { nodes: i });
  }
  let o = i[a.nodeIndex];
  if (!o || o.type !== `group`) return { nodes: i };
  let s = cloneGroupNode(o),
    c = a.taskIndex + +(r === `after`);
  return (s.tasks.splice(c, 0, t), (i[a.nodeIndex] = s), { nodes: i });
}
function moveTaskOverTask(e: any, t: any) {
  if (t.activeTaskKey === t.overTaskKey) return e;
  let n = locateTaskInView(e, t.activeTaskKey),
    r = locateTaskInView(e, t.overTaskKey);
  if (!n || !r) return e;
  let { nextView: i, task: a } = removeTaskFromView(e, t.activeTaskKey);
  return a ? insertTaskAtAnchor(i, a, t.overTaskKey, t.position) : e;
}
function insertTaskAtGroupEdge(e: any, t: any, n: any, r: any) {
  let i = cloneViewNodes(e),
    a = i.findIndex((e: any) => e.type === `group` && e.group.id === n);
  return (a < 0 || i.splice(a + +(r === `after`), 0, { type: `task`, task: t }), { nodes: i });
}
function placeTaskOutsideGroup(e: any, t: any) {
  let n = e.nodes.find((e: any) => e.type === `group` && e.group.id === t.groupId);
  if (!n || n.type !== `group`) return e;
  let { nextView: r, task: i } = removeTaskFromView(e, t.activeTaskKey);
  return i ? insertTaskAtGroupEdge(r, i, t.groupId, t.position) : e;
}
function placeTaskAtGroupHead(e: any, t: any) {
  let { nextView: n, task: r } = removeTaskFromView(e, t.activeTaskKey);
  if (!r) return e;
  let i = n.nodes.find((e: any) => e.type === `group` && e.group.id === t.groupId);
  if (!i || i.type !== `group`) return e;
  let a = i.tasks[0] ? groupedTaskKeyOf(i.tasks[0]) : null;
  return insertTaskIntoGroup(n, r, t.groupId, a);
}
function appendTaskToGroupTail(e: any, t: any) {
  let { nextView: n, task: r } = removeTaskFromView(e, t.activeTaskKey);
  if (!r) return e;
  let i = findGroupNodeIndex(n, t.groupId),
    a = n.nodes[i];
  if (!a || a.type !== `group`) return e;
  let o = cloneGroupNode(a);
  o.tasks.push(r);
  let s = cloneViewNodes(n);
  return ((s[i] = o), { nodes: s });
}
function moveGroupOver(e: any, t: any) {
  if (t.over.type === `group` && t.activeGroupId === t.over.groupId) return e;
  let n = t.over.type === `task` ? findParentGroupIdOfTask(e, t.over.taskKey) : null;
  if (n === t.activeGroupId) return e;
  let r = cloneViewNodes(e),
    i = r.findIndex((e: any) => e.type === `group` && e.group.id === t.activeGroupId);
  if (i < 0) return e;
  let [a] = r.splice(i, 1);
  if (!a || a.type !== `group`) return e;
  let o = { nodes: r },
    s = t.over.type === `group` ? findGroupNodeIndex(o, t.over.groupId) : n ? findGroupNodeIndex(o, n) : findRootTaskIndex(o, t.over.taskKey);
  return s < 0 ? e : (r.splice(s + +(t.position === `after`), 0, a), { nodes: r });
}
/** 原 KX（92249，vendored dnd-kit 变体基线碰撞） */
declare function dndBaselineCollision(args: DragCollisionArgs): unknown;

/* ============================================================================
 * §1 任务列表事件分类与归属意图（原 32249–32287）
 * ==========================================================================*/

/** 原 nOe（32249）：需要元数据级刷新的事件原因集 */
export const TASK_META_REFRESH_REASONS = new Set([
  `user_message_saved`,
  `assistant_message_saved`,
  `task_status_changed`,
  `task_meta_changed`,
  `task_model_changed`,
  `task_title_changed`,
]);
/** 原 rOe（32257）：仅元数据变化（不改变成员归属）的原因集 */
export const META_ONLY_REFRESH_REASONS = new Set([
  `task_meta_changed`,
  `task_model_changed`,
  `task_title_changed`,
  `auto_archive`,
]);
/** 原 iOe（32258）：成员归属开关类原因集 */
export const MEMBERSHIP_TOGGLE_REASONS = new Set([
  `task_archived`,
  `task_unarchived`,
  `task_pinned`,
  `task_unpinned`,
]);

/** 原 nx（32259） */
export function isMembershipToggleReason(event: { reason: string }): boolean {
  return MEMBERSHIP_TOGGLE_REASONS.has(event.reason);
}
/** 原 aOe（32262） */
export function isTaskDeletedReason(event: { reason: string }): boolean {
  return event.reason === `task_deleted`;
}
/** 原 rx（32265）：列表成员是否可能变化 */
export function isListMembershipChanged(event: { reason: string }): boolean {
  return (
    isMembershipToggleReason(event) ||
    event.reason === `task_created` ||
    event.reason === `task_meta_changed` ||
    event.reason === `task_deleted`
  );
}
/** 原 ix（32276）：带元数据事件的归属意图 */
export function resolveMembershipIntent(event: {
  reason: string;
  taskMeta?: unknown;
}): "insert-active" | "preserve-membership" | null {
  return event.taskMeta
    ? event.reason === `task_created`
      ? `insert-active`
      : TASK_META_REFRESH_REASONS.has(event.reason)
        ? `preserve-membership`
        : null
    : null;
}
/** 原 oOe（32273）：是否应使分片缓存失效 */
export function shouldInvalidateShardCache(event: {
  reason: string;
  taskMeta?: unknown;
}): boolean {
  return resolveMembershipIntent(event)
    ? !1
    : isMembershipToggleReason(event)
      ? !event.taskMeta
      : isTaskDeletedReason(event)
        ? !0
        : !META_ONLY_REFRESH_REASONS.has(event.reason);
}
/** 原 sOe（32285） */
export function hasMembershipIntent(event: { reason: string; taskMeta?: unknown }): boolean {
  return !!resolveMembershipIntent(event);
}

/* ============================================================================
 * §2 后台终端终态未读同步（原 32330–32413；Vo 动作包装 1885–1913）
 * ==========================================================================*/

/** 原 Ho（1885）：标记工作区键陈旧 */
export function markWorkspaceKeysStaleNow(entities: WorkspaceScope[]): void {
  const keys = entities.map((e) => workspaceKeyOf(e.workspacePath, e.workspaceIdentity));
  SearchResultsStore.getState().markWorkspaceKeysStale(keys);
}
/** 原 tae（1905） */
export function setTaskUnreadOverlayNow(entity: WorkspaceScope & { taskId: string }, unreadAt: number): void {
  SearchResultsStore.getState().setTaskUnreadOverlay(entity, unreadAt);
}
/** 原 nae（1908） */
export function reconcileTaskUnreadNow(entity: WorkspaceScope & { taskId: string }, unreadAt: number): void {
  SearchResultsStore.getState().reconcileTaskUnread(entity, unreadAt);
}
/** 原 Wo（1911） */
export function rollbackTaskUnreadNow(entity: WorkspaceScope & { taskId: string }, unreadAt?: number | null): void { // Vo store 侧接受 number|null|undefined，放宽形参（A0-D-Misc）
  SearchResultsStore.getState().rollbackTaskUnread(entity, unreadAt);
}

const UNREAD_PERSIST_DEDUPE_MS = 1e3; // 原 dOe
const UNREAD_PERSIST_DEDUPE_MAX = 256; // 原 fOe
const unreadPersistDedupe = new Map<string, number>(); // 原 fx

/** 原 pOe（32333） */
export function isTerminalStatus(status: string): boolean {
  return status === `completed` || status === `error`;
}
/** 原 mOe（32336） */
export function unreadPersistDedupeKey(scope: WorkspaceScope, taskId: string, taskMeta?: { status?: string; updatedAt?: string | number } | null): string {
  return [
    workspaceKeyOf(scope.workspacePath, scope.workspaceIdentity),
    taskId,
    taskMeta?.status ?? ``,
    taskMeta?.updatedAt ?? ``,
  ].join(`::`);
}
/** 原 hOe（32344）：1s 内同键只持久化一次；表满按插入序淘汰 */
export function isUnreadPersistDeduped(key: string): boolean {
  const now = Date.now();
  for (const [k, at] of unreadPersistDedupe) if (now - at > UNREAD_PERSIST_DEDUPE_MS) unreadPersistDedupe.delete(k);
  if (unreadPersistDedupe.has(key)) return !0;
  unreadPersistDedupe.set(key, now);
  if (unreadPersistDedupe.size > UNREAD_PERSIST_DEDUPE_MAX) {
    const oldest = unreadPersistDedupe.keys().next().value;
    if (oldest) unreadPersistDedupe.delete(oldest);
  }
  return !1;
}
/** 原 gOe（32354）：后台终端终态且非当前活动任务的未读信号 */
export function isBackgroundTerminalUnreadEvent(args: {
  activeTaskId: string | null;
  event: {
    taskId?: string;
    reason: string;
    unreadSignal?: string;
    taskMeta?: { taskId?: string; status?: string } | null;
  };
}): boolean {
  const taskId = args.event.taskId ?? args.event.taskMeta?.taskId;
  return (
    args.event.reason === `task_status_changed` &&
    args.event.unreadSignal === `background_terminal` &&
    !!taskId &&
    args.activeTaskId !== taskId
  );
}
/** 原 px（32364）：后台终端终态未读的乐观置位 + 持久化 + 失败回滚 */
export function syncBackgroundTerminalUnread(args: {
  event: TaskListEvent & { unreadSignal?: string };
  service: { setTaskUnread(entity: WorkspaceScope & { taskId: string; unread: boolean }): Promise<{ unreadAt?: number }> };
}): void {
  const { event: t, service: n } = args;
  const taskId = t.taskId ?? t.taskMeta?.taskId;
  if (!taskId || t.reason !== `task_status_changed` || t.unreadSignal !== `background_terminal`) return;
  const store = useTaskStore.getState();
  const workspaceState = store.getWorkspaceState(t.workspacePath, t.workspaceIdentity);
  if (!isBackgroundTerminalUnreadEvent({ activeTaskId: workspaceState.activeTaskId, event: t })) return;
  const entity = {
    taskId,
    workspacePath: t.workspacePath,
    ...(t.workspaceIdentity ? { workspaceIdentity: t.workspaceIdentity } : {}),
  };
  const entityKey = entityKeyOf(entity);
  const searchState = SearchResultsStore.getState();
  const cachedMeta = searchState.taskMetaByEntityKey[entityKey];
  const cachedOverlay = searchState.taskUnreadOverlayByEntityKey[entityKey];
  const unreadAt =
    cachedMeta?.unreadAt ?? t.taskMeta?.unreadAt ?? (typeof cachedOverlay == `number` ? cachedOverlay : void 0);
  if (typeof unreadAt == `number`) {
    if (typeof cachedMeta?.unreadAt != `number` && typeof cachedOverlay != `number`) {
      setTaskUnreadOverlayNow(entity, unreadAt);
    }
    store.setTaskUnreadIndicator(t.workspacePath, taskId, !0, t.workspaceIdentity);
    return;
  }
  if (isUnreadPersistDeduped(unreadPersistDedupeKey(t, taskId, t.taskMeta))) return;
  const previousUnreadAt = cachedMeta?.unreadAt;
  const previousIndicator = readTaskUnreadIndicator(workspaceState, taskId);
  const now = Date.now();
  setTaskUnreadOverlayNow(entity, now);
  store.setTaskUnreadIndicator(t.workspacePath, taskId, !0, t.workspaceIdentity);
  n.setTaskUnread({ ...entity, unread: !0 })
    .then((result) => {
      reconcileTaskUnreadNow(entity, result.unreadAt ?? now);
      store.setTaskUnreadIndicator(t.workspacePath, taskId, !0, t.workspaceIdentity);
    })
    .catch((error) => {
      rollbackTaskUnreadNow(entity, previousUnreadAt);
      store.setTaskUnreadIndicator(t.workspacePath, taskId, previousIndicator, t.workspaceIdentity);
      markWorkspaceKeysStaleNow([entity]);
      bumpUnreadRevision();
      logger.warn(
        `[taskStatusUnreadSync] 持久化后台终态未读失败`,
        {
          taskId,
          workspaceIdentity: t.workspaceIdentity ?? null,
          workspacePath: t.workspacePath,
        },
        error,
      );
    });
}

/* ============================================================================
 * §3 成员刷新保持（原 32414–32438）
 * ----------------------------------------------------------------------------
 * 〔A1-P3-B3〕收敛墓碑：本节语义实体（原 mx/hx/_Oe/vOe/yOe/bOe）与 TaskIndexCore 逐字转录
 *   （styles 32411–32438，A1-P3-B2）消费面行为实测同形（证据见 A1-P3-B3.report.md §五）：
 *   同状态机 {armed, enteredCallCount, released}、重复 arm 同抛错、await 同计数并等释放。
 *   canonical = 逐字方（TaskIndexCore）；本节四实体删除，改文件头 import + 原处再导出，
 *   导出面不变（getMembershipHoldStats = readMembershipRefreshHoldState 别名）。
 *   arm 清空目标随归一改逐字方 clearTaskIndexCache（原 TOe）；本叶 §5 clearTaskIndexSnapshots
 *   及其 taskIndexSnapshotCache 属 §4/§5 语义孪生余量，留批裁定（A1-P3-B3.report.md §七）。
 *   环安全：TaskIndexCore→本叶（4 Now 包装）与本叶→TaskIndexCore（本节 4 臂）互为环边，
 *   双方顶层全函数/var 声明、零顶层即刻跨模块调用，ESM 提升安全（本叶↔modules/services↔
 *   services/sessionIndex↔modules/QuickPickDeep 既有环同构，fresh boot 实测在案）。
 * ==========================================================================*/

export { armMembershipRefreshHold, releaseMembershipRefreshHold, awaitMembershipRefreshHold };
export { readMembershipRefreshHoldState as getMembershipHoldStats };

/* ============================================================================
 * §4 跨分片任务索引加载（原 32439–32527）+ §5 快照缓存（原 32528–32577）
 * ----------------------------------------------------------------------------
 * 〔A1-P3-B4〕收敛墓碑：本节语义实体（原 gx/_x/vx/yx/bx/xx/Sx/xOe/Cx +
 *   wx/SOe/Tx/COe/wOe/Ex/TOe/EOe）与 TaskIndexCore 逐字转录（styles 32439–32577，
 *   A1-P3-B2）消费面行为实测同形（证据见 A1-P3-B4.report.md §五）：同五路并发读 +
 *   成员保持等待 + 不完整即抛错（loadTaskIndexShard ≡ readTaskIndexShard），同覆盖四集
 *   收集序，同实体键去重（后出现者覆盖），同 8 位快照缓存（插入序淘汰 + 失败自删，
 *   acquireTaskIndexSnapshot ≡ readTaskIndexCache），同服务对象弱引用稳定编号。
 *   canonical = 逐字方（TaskIndexCore）；本节 13 实体删除，改别名再导出（导出面不变），
 *   模块状态 wx/SOe/Tx/COe 归 canonical 侧 taskIndexCacheMap/taskIndexCacheCap/
 *   serviceIndexIds/nextServiceIndexId。外部消费者全树实测为零；本叶内调用面原全在
 *   本节体内，随删而尽（B3 §3 墓碑「§4/§5 语义孪生余量留批」 hereby 收口）。
 *   环安全同 B3 §3（TaskIndexCore↔本叶互为环边，双方顶层全函数/var 声明，
 *   零顶层即刻跨模块调用，fresh boot 实测在案）。
 * ==========================================================================*/

export { pickScopePathIdentity as scopeOf, readListSafe as listPinnedIdsSafe, readListAvailability as listTasksWithAvailability, collectUnreadAtOverlays as collectUnreadAt, collectTerminalStatusOverlays as collectTerminalStatus, dedupeTaskIndexItemsByEntityKey as dedupeTaskRowsByEntityKey, readTaskIndexShard as loadTaskIndexShard, serviceIndexOf as serviceIdOf, readTaskIndexCache as acquireTaskIndexSnapshot, clearTaskIndexCache as clearTaskIndexSnapshots, mergeTaskIndexEndpoints as loadMergedTaskIndex } from '../shell/TaskIndexCore';
export { collectTitleOverrides, collectCronAutomationIds } from '../shell/TaskIndexCore';

/* ============================================================================
 * §6 会话合并/水合/过滤投影（原 32578–32721）
 * ==========================================================================*/

/** 原 DOe（32578）：索引行 ⊕ 会话行合并（标题覆盖语义 + 活动态附挂） */
export function mergeSessionIntoTask(row: TaskIndexRow, session: TaskMeta): TaskIndexRow {
  const activity = sessionActivityOf(session);
  const titleWins = session.title.trim().length > 0 && (session.titleOverridden === !0 || row.titleOverridden !== !0);
  const titleOverridden =
    session.titleOverridden === !0 || row.titleOverridden === !0 ? !0 : void 0;
  const merged: TaskIndexRow = {
    ...row,
    title: titleWins ? session.title : row.title,
    titleOverridden,
    createdAt: session.createdAt || row.createdAt,
    updatedAt: (activity?.lastActivityAt ?? session.updatedAt) || row.updatedAt,
    status: session.status ?? row.status,
    forkedFromTaskId: session.forkedFromTaskId ?? row.forkedFromTaskId,
    pendingInteraction: session.pendingInteraction,
  };
  return activity ? attachSessionActivity(merged, activity) : merged;
}
/** 原 Dx（32594）：按实体键水合会话行 */
export function hydrateTaskIndexItems(shard: {
  taskIndexItems: TaskIndexRow[];
  sessions: TaskMeta[];
}): TaskIndexRow[] {
  const sessionByEntityKey = new Map(shard.sessions.map((s) => [entityKeyOf(s), s]));
  return shard.taskIndexItems.map((row) => {
    const session = sessionByEntityKey.get(entityKeyOf(row));
    return session ? mergeSessionIntoTask(row, session) : row;
  });
}
/** 原 OOe（32601）：pinned/archived/active/timeline 四型成员谓词 */
export function matchesMembershipKind(kind: string, pinned: boolean, archived: boolean): boolean {
  switch (kind) {
    case `pinned`:
      return pinned && !archived;
    case `archived`:
      return archived;
    case `active`:
      return !archived;
    case `timeline`:
      return !pinned && !archived;
    default:
      return !1;
  }
}
/** 原 kOe（32615）：未读/终态/标题覆盖/自动化 id 四覆盖集按需映射 */
export function applyIndexOverlay(
  rows: TaskIndexRow[],
  overlay: {
    unreadAtByTaskId?: Map<string, number>;
    terminalStatusByTaskId?: Map<string, string>;
    titleOverrideByTaskId?: Map<string, string>;
    cronAutomationIdByTaskId?: Map<string, string>;
  },
): TaskIndexRow[] {
  const { unreadAtByTaskId: n, terminalStatusByTaskId: r, titleOverrideByTaskId: i, cronAutomationIdByTaskId: a } = overlay;
  return n === void 0 && (!r || r.size === 0) && (!i || i.size === 0) && (!a || a.size === 0)
    ? rows
    : rows.map((row) => {
        const activity = sessionActivityOf(row);
        const unreadAt = n?.get(row.taskId);
        const terminalStatus = r?.get(row.taskId);
        const titleOverride = row.titleOverridden === !0 ? void 0 : i?.get(row.taskId);
        const cronAutomationId = a?.get(row.taskId);
        const hasUnreadDelta = n !== void 0 && (unreadAt !== row.unreadAt || (unreadAt === void 0 && row.unreadAt !== void 0));
        const hasTerminalDelta =
          activity === null &&
          terminalStatus !== void 0 &&
          (row.status === void 0 || (terminalStatus === `error` && row.status === `completed`));
        const hasTitleDelta = titleOverride !== void 0 && (row.title !== titleOverride || row.titleOverridden !== !0);
        const hasCronDelta = cronAutomationId !== void 0 && cronAutomationId !== row.cronAutomationId;
        return !hasUnreadDelta && !hasTerminalDelta && !hasTitleDelta && !hasCronDelta
          ? row
          : {
              ...row,
              ...(hasUnreadDelta ? { unreadAt } : {}),
              ...(hasTerminalDelta ? { status: terminalStatus } : {}),
              ...(hasTitleDelta ? { title: titleOverride, titleOverridden: !0 } : {}),
              ...(hasCronDelta ? { cronAutomationId } : {}),
            };
      });
}
/** 原 Ox（32648）：水合→覆盖→删除过滤→成员/搜索过滤→排序→截断 */
export function projectTaskIndex(args: {
  taskIndexItems: TaskIndexRow[];
  sessions: TaskMeta[];
  unreadAtByTaskId?: Map<string, number>;
  terminalStatusByTaskId?: Map<string, string>;
  titleOverrideByTaskId?: Map<string, string>;
  cronAutomationIdByTaskId?: Map<string, string>;
  deletedIds?: Set<string>;
  pinnedIds: Set<string>;
  archivedIds: Set<string>;
  kind: string;
  search?: string;
  sortBy: string;
  limit?: number;
}): { items: TaskIndexRow[]; total: number } {
  const query = args.search?.trim().toLocaleLowerCase() ?? ``;
  const filtered = applyIndexOverlay(
    hydrateTaskIndexItems({ taskIndexItems: args.taskIndexItems, sessions: args.sessions }),
    {
      unreadAtByTaskId: args.unreadAtByTaskId,
      terminalStatusByTaskId: args.terminalStatusByTaskId,
      titleOverrideByTaskId: args.titleOverrideByTaskId,
      cronAutomationIdByTaskId: args.cronAutomationIdByTaskId,
    },
  ).filter((row) => {
    if (args.deletedIds?.has(row.taskId)) return !1;
    const pinned = args.pinnedIds.has(row.taskId);
    const archived = args.archivedIds.has(row.taskId);
    return !(!matchesMembershipKind(args.kind, pinned, archived) || (query && !row.title.toLocaleLowerCase().includes(query)));
  });
  filtered.sort((a, b) => compareTaskRecency(a, b, args.sortBy));
  const total = filtered.length;
  return { items: args.limit === void 0 ? filtered : filtered.slice(0, args.limit), total };
}
/** 原 AOe（32665）：会话相位 → 任务状态 */
export function mapSessionPhaseToStatus(phase: string): string | undefined {
  switch (phase) {
    case `running`:
    case `prewarming`:
      return `running`;
    case `completedSuccess`:
    case `completedInterrupted`:
      return `completed`;
    case `error`:
      return `error`;
    default:
      return;
  }
}
/** 原 jOe（32679）：会话索引行 → 任务元数据（含 fork/交互/未读继承 + 活动态附挂） */
export function sessionRowToTaskMeta(
  row: SessionIndexRow,
  ctx: { workspacePath: string; workspaceIdentity?: string | null; previous?: TaskMeta },
): TaskMeta {
  const previous = ctx.previous;
  const status = mapSessionPhaseToStatus(row.phase);
  const customTitle = row.titleSource === `custom`;
  const title = customTitle || previous?.titleOverridden === !0 ? row.title : row.title || previous?.title || ``;
  const titleOverridden = customTitle || previous?.titleOverridden === !0 ? !0 : void 0;
  return attachSessionActivity(
    {
      taskId: row.sessionId,
      traceId: previous?.traceId ?? `session-${row.sessionId}`,
      title,
      ...(titleOverridden ? { titleOverridden } : {}),
      workspacePath: ctx.workspacePath,
      ...(ctx.workspaceIdentity ? { workspaceIdentity: ctx.workspaceIdentity } : {}),
      createdAt: row.createdAt || previous?.createdAt || 0,
      updatedAt: row.lastActivityAt || previous?.updatedAt || 0,
      mode: previous?.mode ?? `default`,
      ...(previous?.model ? { model: previous.model } : {}),
      ...(row.parentSessionId ? { forkedFromTaskId: row.parentSessionId } : {}),
      ...(previous?.provider ? { provider: previous.provider } : {}),
      ...(status ? { status } : {}),
      ...(row.pendingInteraction
        ? {
            pendingInteraction: {
              interactionId: row.pendingInteraction.interactionId,
              kind: row.pendingInteraction.kind,
              ...(row.pendingInteraction.toolName ? { toolName: row.pendingInteraction.toolName } : {}),
              ...(row.pendingInteraction.autoResolution
                ? { autoResolution: row.pendingInteraction.autoResolution }
                : {}),
            },
          }
        : {}),
      ...(previous?.unreadAt ? { unreadAt: previous.unreadAt } : {}),
    },
    {
      phase: row.phase,
      lastActivityAt: row.lastActivityAt,
      hasBackgroundWork: row.hasBackgroundWork,
      ...(row.pendingInteractionSummary ? { pendingInteractions: row.pendingInteractionSummary } : {}),
    },
  );
}

/* ============================================================================
 * §7 协议宿主常量 + 帧纯函数（横切 services 余量；services.tsx 3752–3759 declare 对应）
 * ==========================================================================*/

/** 原 FS（34986）：会话索引初始状态 */
export const INITIAL_SESSION_INDEX_STATE = {
  workspaceId: null as string | null,
  logEpoch: null as string | null, // bundle schema hke@styles33313：logEpoch: K() = z.string()
  seq: 0,
  sessions: new Map<string, SessionIndexRow>(),
};
export const RUNTIME_RESTART_BASE_DELAY_MS = 100; // 原 UAe（34987）
export const RUNTIME_RESTART_MAX_DELAY_MS = 5e3; // 原 WAe（34988）
export const RUNTIME_RESTART_RESET_MS = 3e4; // 原 GAe（34989）
export const SUBSCRIBE_RETRY_BACKOFF_MS = [250, 1e3, 3e3]; // 原 KAe（34990）

/* ── tombstone（A1-P3-B10）：declare isLockFileExistsError（原 zte，styles 711 `ks as zte` ← src-HCld2afU 9949 `te as ks`）删除，
 *    改经文件头 SrcSharedA import `isFileLockTimeoutError as isLockFileExistsError` 消费（canonical = lib/errorUtils::isFileLockTimeoutError，jsx 136/js 113 逐字、A0-S4-1 实体迁；
 *    调用点 949 不变；canonical 参数 (value: any) 包容 (error: unknown) 调用，返回 boolean 同型）。 ── */
/** 原 qAe（34991）：休眠态订阅错误（锁类 errno / config.json.lock） */
export function isDormantSubscribeError(error: unknown): boolean {
  if (isLockFileExistsError(error)) return !0;
  const code = typeof error == `object` && error && `code` in error ? String((error as { code?: unknown }).code ?? ``) : ``;
  const message = error instanceof Error ? error.message : String(error);
  return [`EBUSY`, `EMFILE`, `ENFILE`].includes(code) ||
    (code === `EEXIST` && message.includes(`config.json.lock`))
    ? !0
    : /\b(?:EBUSY|EMFILE|ENFILE)\b/.test(message) || message.includes(`config.json.lock`);
}
/** 原 JAe（35000）：运行时不可用错误码 */
export function isTransientSubscribeError(error: unknown): boolean {
  return typeof error == `object` && !!error && `code` in error && (error as { code?: unknown }).code === `ZCODE_AGENT_RUNTIME_UNAVAILABLE`;
}
/** 原 IS（35003）：忽略失败的退订 */
export async function unsubscribeTransportSafe(
  transport: { unsubscribe(id: string): Promise<void> | void },
  subscriptionId: string,
): Promise<void> {
  try {
    await transport.unsubscribe(subscriptionId);
  } catch (error) {
    logger.warn(
      `[v4-sessions-index] unsubscribe ${subscriptionId} 失败（忽略）: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
/** 原 YAe（35012）：snapshot 全量替换 / delta 序贯应用；断档标记 gap */
export function applyFrameToIndexState(
  state: typeof INITIAL_SESSION_INDEX_STATE,
  frame: {
    toSeq: number;
    fromSeq?: number;
    payload:
      | { kind: `snapshot`; snapshot: { workspaceId: string | null; logEpoch: string | null; sessions: SessionIndexRow[] } }
      | { kind: `deltas`; deltas: Array<{ op: string; session?: SessionIndexRow; sessionId?: string }> };
  },
): { state: typeof INITIAL_SESSION_INDEX_STATE; gap: boolean } {
  if (frame.payload.kind === `snapshot`) {
    const snapshot = frame.payload.snapshot;
    const sessions = new Map<string, SessionIndexRow>();
    for (const session of snapshot.sessions) sessions.set(session.sessionId, session);
    return {
      gap: !1,
      state: { workspaceId: snapshot.workspaceId, logEpoch: snapshot.logEpoch, seq: frame.toSeq, sessions },
    };
  }
  if (frame.toSeq <= state.seq) return { state, gap: !1 };
  if (frame.fromSeq !== state.seq) return { state, gap: !0 };
  const sessions = new Map(state.sessions);
  for (const delta of frame.payload.deltas) {
    if (delta.op === `session.upserted` && delta.session) sessions.set(delta.session.sessionId, delta.session);
    else if (delta.sessionId) sessions.delete(delta.sessionId);
  }
  return { gap: !1, state: { ...state, seq: frame.toSeq, sessions } };
}

/* ============================================================================
 * §8 会话索引键助手 + ZS 深部主钩子（原 35443–35658）
 * ==========================================================================*/

/* ----------------------------------------------------------------------------
 * 〔A1-P3-B4〕收敛墓碑：§8 键助手孪生簇（原 US/ZAe + GS/$Ae/KS/qS/eje，styles
 *   35443–35551）改指逐字 canonical：
 *   US subscriptionScopeKey ≡ scopeSubscriptionLabel | ZAe isSameSubscriptionEntry
 *     ≡ sameScopeSubscriptionEntry（canonical 位 services/sessionIndex §B5-transport，
 *     styles 35443–35454；同形已证 A1-P3-B3 §四，五字段比较逐字吻合）；
 *   GS scopeStoreKey ≡ sessionStoreKey | $Ae scopeStoreKeyAlias ≡ storeKeyOfRegistrySession |
 *   KS toSessionIndexScope ≡ resolveSessionScope | qS shardCacheKeyOf ≡ sessionSubscriptionKey |
 *   eje isIdleEmptyIndexStore ≡ isSessionStoreHydrating | WS workspaceIdentityOf
 *     ≡ sessionScopeWorkspaceKey（canonical 位 components/shell/SessionStoreCore，
 *     styles 35526–35551，A1-P3-B2 转录；同形证据见 A1-P3-B4.report.md §五）。
 *   七实体删除，改别名再导出（导出面不变）；内部调用面改直名 canonical
 *   （resolveSessionScope/sessionStoreKey/sessionSubscriptionKey/
 *   sessionScopeWorkspaceKey/isSessionStoreHydrating）。
 *   环安全：SessionStoreCore→modules/services→services/sessionIndex→
 *   modules/QuickPickDeep→本叶，既有环同构（同 B3 §3 墓碑），双方顶层全函数/再导出，
 *   零顶层即刻跨模块读，ESM 提升安全。
 * --------------------------------------------------------------------------*/
export { scopeSubscriptionLabel as subscriptionScopeKey, sameScopeSubscriptionEntry as isSameSubscriptionEntry, sessionStoreKey as scopeStoreKey, storeKeyOfRegistrySession as scopeStoreKeyAlias, resolveSessionScope as toSessionIndexScope, sessionSubscriptionKey as shardCacheKeyOf, isSessionStoreHydrating as isIdleEmptyIndexStore } from '../shell/SessionStoreCore';

/** 原 YS（35625） */
export function entityPrevKeyOf(entity: { workspacePath: string; workspaceIdentity?: string | null; taskId: string }): string {
  return `${entity.workspaceIdentity?.trim() || entity.workspacePath}::${entity.taskId}`;
}
/** 原 tje（35628） */
export function sessionPrevKeyOf(tab: { workspacePath: string; workspaceIdentity?: string | null }, sessionId: string): string {
  return `${tab.workspaceIdentity?.trim() || tab.workspacePath}::${sessionId}`;
}
/** 原 nje（35631）：浅层深比较（对象层 JSON 串相等） */
export function deepValueEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return !1;
  for (const key of keys) {
    const left = a[key];
    const right = b[key];
    if (left !== right) {
      if (typeof left == `object` && left && typeof right == `object` && right) {
        if (JSON.stringify(left) !== JSON.stringify(right)) return !1;
        continue;
      }
      return !1;
    }
  }
  return !0;
}
/** 原 rje（35649）：引用复用——内容未变的行保持旧引用（利于 memo） */
export function reuseUnchangedTaskRows(previous: TaskMeta[], next: TaskMeta[]): TaskMeta[] {
  if (previous.length === 0) return next;
  const prevByKey = new Map(previous.map((row) => [entityPrevKeyOf(row as TaskMeta & { workspacePath: string }), row]));
  let sameOrder = previous.length === next.length;
  const reused = next.map((row, index) => {
    const match = prevByKey.get(entityPrevKeyOf(row as TaskMeta & { workspacePath: string }));
    if (match && deepValueEqual(match as Record<string, unknown>, row as Record<string, unknown>)) {
      if (sameOrder && previous[index] !== match) sameOrder = !1;
      return match;
    }
    sameOrder = !1;
    return row;
  });
  return sameOrder ? previous : reused;
}

const dynamicSubsByService = new WeakMap<
  WorkspaceAgentService,
  Map<string, { listeners: Set<(event: unknown) => void>; disposable: { dispose(): void } }>
>(); // 原 XS

/** 原 ije（35660） */
export function dynamicScopeKey(scope: WorkspaceScope): string {
  return `${scope.workspaceIdentity?.trim() || ``}\u0000${scope.workspacePath}`;
}
/** 原 aje（35663）：按服务×作用域共享的动态工作区事件订阅（末位监听者退订即销毁） */
export function subscribeDynamicWorkspaceEvents(args: {
  service: WorkspaceAgentService;
  scope: WorkspaceScope;
  listener: (event: unknown) => void;
}): { dispose(): void } {
  let byScope = dynamicSubsByService.get(args.service);
  if (!byScope) {
    byScope = new Map();
    dynamicSubsByService.set(args.service, byScope);
  }
  const key = dynamicScopeKey(args.scope);
  let entry = byScope.get(key);
  if (!entry) {
    const listeners = new Set<(event: unknown) => void>();
    entry = {
      listeners,
      disposable: args.service.onDynamicWorkspaceEvent({
        workspacePath: args.scope.workspacePath,
        ...(args.scope.workspaceIdentity ? { workspaceIdentity: args.scope.workspaceIdentity } : {}),
      })((event) => {
        const snapshot = Array.from(listeners);
        for (const listener of snapshot) listener(event);
      }),
    };
    byScope.set(key, entry);
  }
  entry.listeners.add(args.listener);
  return {
    dispose() {
      const current = byScope!.get(key);
      if (current) {
        current.listeners.delete(args.listener);
        if (!(current.listeners.size > 0)) {
          current.disposable.dispose();
          byScope!.delete(key);
          if (byScope!.size === 0) dynamicSubsByService.delete(args.service);
        }
      }
    },
  };
}

interface SessionIndexShardDescriptor {
  kind: string;
  sortBy: string;
  search?: string;
  workspaceKeys: string[];
  visibleLimit: number | null;
}
/** 原 oje（35695）：作用域 → 工作区键去重排序集 */
export function normalizeShardScopes(scopes: WorkspaceScope[]): string[] {
  return dedupeWorkspaceScopes(
    scopes.map((s) => ({ workspacePath: s.workspacePath, workspaceIdentity: s.workspaceIdentity })),
  ).map((s) => workspaceKeyOf(s.workspacePath, s.workspaceIdentity));
}
/** 原 sje（35700）：标签页 → 分片规划（按远端会话分组 + 缺失会话收集） */
export function buildShardPlan(
  tabs: WorkspaceTabLike[],
  baseServices: BaseServices,
  registry: SessionRegistryState,
): {
  shards: Array<{
    shardKey: string;
    services: BaseServices;
    workspaceScopes: WorkspaceScope[];
  }>;
  missingSessionIds: string[];
} {
  const bySession = new Map<string, { services: BaseServices; workspaceScopes: WorkspaceScope[] }>();
  const missing = new Set<string>();
  for (const tab of tabs) {
    const remoteSessionId = resolveTabRemoteSessionId(tab, registry);
    const resolved = resolveTabServicesBinding(tab, baseServices, registry);
    if (!resolved) {
      if (tabHasRemoteBacking(tab, remoteSessionId)) {
        missing.add(remoteSessionId ?? workspaceKeyOf(tab.workspacePath, tab.workspaceIdentity));
      }
      continue;
    }
    const sessionId = resolved.remoteSessionId ?? `__base__`;
    const entry = bySession.get(sessionId) ?? { services: resolved.services, workspaceScopes: [] };
    entry.workspaceScopes.push({
      workspacePath: tab.workspacePath,
      workspaceIdentity: tab.workspaceIdentity,
    });
    bySession.set(sessionId, entry);
  }
  return {
    shards: [...bySession.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([shardKey, entry]) => ({
        shardKey,
        services: entry.services,
        workspaceScopes: dedupeWorkspaceScopes(entry.workspaceScopes),
      }))
      .filter((shard) => shard.workspaceScopes.length > 0),
    missingSessionIds: [...missing].sort((a, b) => a.localeCompare(b)),
  };
}
/** 原 cje（35730）：缓存分片按新描述符收窄（键集子集才命中） */
export function narrowCachedShardToDescriptor(
  cached: { descriptor: SessionIndexShardDescriptor; items: TaskMeta[]; total: number; hasMore: boolean },
  descriptor: SessionIndexShardDescriptor,
): { descriptor: SessionIndexShardDescriptor; items: TaskMeta[]; total: number; hasMore: boolean } | null {
  if (
    cached.descriptor.kind !== descriptor.kind ||
    cached.descriptor.sortBy !== descriptor.sortBy ||
    cached.descriptor.search !== descriptor.search
  ) {
    return null;
  }
  const wantedKeys = new Set(descriptor.workspaceKeys);
  const items = cached.items.filter((row) =>
    wantedKeys.has(workspaceKeyOf((row as TaskMeta).workspacePath, (row as TaskMeta).workspaceIdentity)),
  );
  if (items.length === 0) return null;
  const visible = descriptor.visibleLimit === null ? items : items.slice(0, descriptor.visibleLimit);
  const coveredAll = cached.descriptor.workspaceKeys.every((key) => wantedKeys.has(key));
  const total = coveredAll ? Math.max(cached.total, visible.length) : visible.length;
  return { descriptor, items: visible, total, hasMore: coveredAll ? cached.hasMore || total > visible.length : !1 };
}
/** 原 lje（35745）：运行态事件 → taskStore 运行态投影 */
export function applyRuntimeStateEvent(event: {
  status?: string;
  lastError?: { message?: string };
  workspacePath: string;
  taskId: string;
  workspaceIdentity?: string | null;
  provider?: string;
}): void {
  if (!event.status) return;
  const status = event.status === `running` ? `streaming` : event.status === `completed` ? `completed` : `failed`;
  useTaskStore.getState().setTaskRuntimeState(
    event.workspacePath,
    event.taskId,
    status,
    (event.status === `error` ? event.lastError?.message : void 0) ?? null, // bundle 传 undefined 面；SkillStore 签名 string|null，?? null 零语义差
    event.workspaceIdentity,
    event.provider,
  );
}

interface SessionIndexShardHookTab {
  workspacePath: string;
  workspaceIdentity?: string | null;
  endpointKey?: string;
  agentService?: WorkspaceAgentService | null;
}
/** 原 Ec（4897）：基础服务钩子（跨 chunk 横切）→ { zcodeAgentService } */

/** 原 JS（35552）：ZS 深部主钩子——多标签会话索引分片聚合（QAe 对账 + 行复用 + 水合中端点集） */
export function useSessionIndexShards(tabs: SessionIndexShardHookTab[]): {
  items: TaskMeta[];
  sourceRevisionByScopeKey: Record<string, string>;
  hydratingEndpointKeys: string[];
} {
  const baseAgentService = useBaseServices().zcodeAgentService as unknown as WorkspaceAgentService | null; // A0-CLEANUP3 3b：zcodeAgentService 已具型为 AutomationsAgentService，与本地 WorkspaceAgentService 不重叠，双重收敛
  const shardsRevision = React.useMemo(
    () =>
      tabs
        .map((tab) => {
          const service = tab.agentService ?? baseAgentService;
          return service ? sessionSubscriptionKey(tab, service) : `${sessionStoreKey(tab)} ${tab.workspacePath} service-unavailable`;
        })
        .sort()
        .join(`|`),
    [tabs, baseAgentService],
  );
  const tabsRef = React.useRef(tabs);
  tabsRef.current = tabs;
  const [revision, forceUpdate] = React.useState(0);
  const bump = React.useCallback(() => forceUpdate((v) => v + 1), []);
  const setRef = React.useRef<WorkspaceSubscriptionSet | null>(null);
  if (setRef.current === null) setRef.current = new WorkspaceSubscriptionSet(bump);
  const subscriptionSet = setRef.current;
  React.useEffect(() => {
    const entries: { scope: SessionIndexScope; agentService: WorkspaceAgentService }[] = [];
    for (const tab of tabsRef.current) {
      const service = tab.agentService ?? baseAgentService;
      if (service) entries.push({ scope: resolveSessionScope(tab), agentService: service });
    }
    subscriptionSet.reconcile(entries);
  }, [shardsRevision, baseAgentService, subscriptionSet]);
  React.useEffect(
    () => () => {
      subscriptionSet.dispose();
    },
    [subscriptionSet],
  );
  const previousRowsRef = React.useRef<TaskMeta[]>([]);
  const hydratingRef = React.useRef<string[]>([]);
  return React.useMemo(() => {
    const items: TaskMeta[] = [];
    const idleEndpoints = new Set<string>();
    const sourceRevisionByScopeKey: Record<string, string> = {};
    const prevByKey = new Map(previousRowsRef.current.map((row) => [entityPrevKeyOf(row as TaskMeta & { workspacePath: string }), row]));
    for (const tab of tabsRef.current) {
      const scopeKey = sessionStoreKey(tab);
      const service = tab.agentService ?? baseAgentService;
      const shardKey = service ? sessionSubscriptionKey(tab, service) : `${scopeKey} ${tab.workspacePath} service-unavailable`;
      const store = subscriptionSet.getStore({
        workspaceKey: sessionScopeWorkspaceKey(tab),
        ...(tab.endpointKey ? { endpointKey: tab.endpointKey } : {}),
      }); // A0-CLEANUP3 #40：同 scopeStoreKey，断言移除
      if (!store) {
        sourceRevisionByScopeKey[scopeKey] = `${shardKey}:missing`;
        continue;
      }
      const state = store.getState();
      sourceRevisionByScopeKey[scopeKey] = `${shardKey}:${state.logEpoch ?? `none`}:${state.seq}:${store.getStatus()}`;
      if (isSessionStoreHydrating(store)) idleEndpoints.add(tab.endpointKey ?? `__base__`);
      for (const session of store.getSessions()) {
        items.push(
          sessionRowToTaskMeta(session as SessionIndexRow, { // services SessionIndexEntry 为弱形（索引签名），按本族行形收敛
            workspacePath: tab.workspacePath,
            ...(tab.workspaceIdentity ? { workspaceIdentity: tab.workspaceIdentity } : {}),
            previous: prevByKey.get(sessionPrevKeyOf(tab, session.sessionId)),
          }),
        );
      }
    }
    items.sort((a, b) => compareTaskRecency(a, b, `updated`));
    const reused = reuseUnchangedTaskRows(previousRowsRef.current, items);
    previousRowsRef.current = reused;
    const hydrating = [...idleEndpoints].sort();
    const hydratingStable =
      hydrating.length === hydratingRef.current.length && hydrating.every((k, i) => k === hydratingRef.current[i])
        ? hydratingRef.current
        : hydrating;
    hydratingRef.current = hydratingStable;
    return { items: reused, sourceRevisionByScopeKey, hydratingEndpointKeys: hydratingStable };
  }, [shardsRevision, subscriptionSet, revision]); // 原依赖 [n, c, i]
}

/* ============================================================================
 * §10 分组拖拽碰撞（F01 侧栏族，原 155248–155500）
 * ==========================================================================*/

/** 原 Lzt（155248） */
export function pointerPositionOf(e: unknown): { x: number; y: number } | null {
  if (!(`clientX` in (e as object)) || !(`clientY` in (e as object))) return null;
  const { clientX: x, clientY: y } = e as { clientX: unknown; clientY: unknown };
  return typeof x == `number` && typeof y == `number` ? { x, y } : null;
}
/** 原 Rzt（155253）：capture 阶段指针跟踪（dispose 幂等） */
export function trackPointerPosition(
  target: {
    addEventListener(type: string, listener: (e: PointerEvent) => void, capture: boolean): void;
    removeEventListener(type: string, listener: (e: PointerEvent) => void, capture: boolean): void;
  },
  initial: PointerEvent,
): { dispose(): void; getPosition(): { x: number; y: number } } | null {
  const start = pointerPositionOf(initial);
  if (!start) return null;
  let current = start;
  let disposed = !1;
  const dispose = () => {
    if (disposed) return;
    disposed = !0;
    target.removeEventListener(`pointermove`, onMove, !0);
    target.removeEventListener(`pointerup`, onUp, !0);
    target.removeEventListener(`pointercancel`, onCancel, !0);
  };
  const onMove = (e: PointerEvent) => {
    current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    current = { x: e.clientX, y: e.clientY };
    dispose();
  };
  const onCancel = () => {
    dispose();
  };
  target.addEventListener(`pointermove`, onMove, !0);
  target.addEventListener(`pointerup`, onUp, !0);
  target.addEventListener(`pointercancel`, onCancel, !0);
  return { dispose, getPosition: () => current };
}
/** 原 F8（155281）：最近的可纵向滚动祖先 */
export function findScrollableAncestor(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    if (/(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight) return parent;
    parent = parent.parentElement;
  }
  return null;
}
/** 原 zzt（155290） */
export function groupSignaturesEqual(
  a: Array<{ id: string; title: string; color: string }>,
  b: Array<{ id: string; title: string; color: string }>,
): boolean {
  return (
    a.length === b.length &&
    a.every((group, index) => group.id === b[index]?.id && group.title === b[index]?.title && group.color === b[index]?.color)
  );
}
/** 原 Bzt（155296） */
export function stringArraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
/** 原 I8（155299） */
export function taskKeyOfDropData(data: unknown): string | null {
  if (!data || typeof data != `object`) return null;
  const d = data as { type?: unknown; taskKey?: unknown };
  return d.type === `grouped-task` && typeof d.taskKey == `string` ? d.taskKey : null;
}
/** 原 L8（155304） */
export function groupIdOfDropData(data: unknown): string | null {
  if (!data || typeof data != `object`) return null;
  const d = data as { type?: unknown; groupId?: unknown };
  return d.type === `grouped-group` && typeof d.groupId == `string` ? d.groupId : null;
}
/** 原 R8（155309） */
export function dropDataTypeOf(data: unknown): string | null {
  if (!data || typeof data != `object`) return null;
  const d = data as { type?: unknown };
  return typeof d.type == `string` ? d.type : null;
}
/** 原 Vzt（155314） */
export function groupIdOfGroupOver(data: unknown): string | null {
  if (!data || typeof data != `object`) return null;
  const d = data as { type?: unknown; groupId?: unknown };
  return d.type === `grouped-group-over` && typeof d.groupId == `string` ? d.groupId : null;
}
/** 原 Hzt（155319） */
export function groupIdOfCollapsedGroup(data: unknown): string | null {
  if (!data || typeof data != `object`) return null;
  const d = data as { type?: unknown; groupId?: unknown };
  return d.type === `grouped-collapsed-group` && typeof d.groupId == `string` ? d.groupId : null;
}
/** 原 Uzt（155324） */
export function groupIdOfExpandedHeader(data: unknown): string | null {
  if (!data || typeof data != `object`) return null;
  const d = data as { type?: unknown; groupId?: unknown };
  return d.type === `grouped-expanded-group-header` && typeof d.groupId == `string` ? d.groupId : null;
}
/** 原 Wzt（155331） */
export function groupIdOfExpandedFooter(data: unknown): string | null {
  if (!data || typeof data != `object`) return null;
  const d = data as { type?: unknown; groupId?: unknown };
  return d.type === `grouped-expanded-group-footer` && typeof d.groupId == `string` ? d.groupId : null;
}
/** 原 Gzt（155338） */
export function groupIdOfEmptyDropZone(data: unknown): string | null {
  if (!data || typeof data != `object`) return null;
  const d = data as { type?: unknown; groupId?: unknown };
  return d.type === `grouped-empty-drop-zone` && typeof d.groupId == `string` ? d.groupId : null;
}
/** 原 Kzt（155343）：分组拖拽碰撞过滤——组拖动只落任务/组悬浮区；其余排除组悬浮区 */
export const groupedCollisionDetection = (args: DragCollisionArgs): unknown => {
  const filtered =
    dropDataTypeOf(args.active.data.current) === `grouped-group`
      ? args.droppableContainers.filter((container) => {
          const type = dropDataTypeOf(container.data.current);
          return type === `grouped-task` || type === `grouped-group-over`;
        })
      : args.droppableContainers.filter((container) => dropDataTypeOf(container.data.current) !== `grouped-group-over`);
  return dndBaselineCollision({ ...args, droppableContainers: filtered });
};
/** 原 qzt（155353）：任务 over 任务 */
export function applyTaskOverTaskDrop(state: GroupedViewState, event: DragOverEvent, position: string): GroupedViewState {
  const activeTaskKey = taskKeyOfDropData(event.active.data.current);
  const overTaskKey = taskKeyOfDropData(event.over?.data.current);
  return !activeTaskKey || !overTaskKey || activeTaskKey === overTaskKey
    ? state
    : moveTaskOverTask(state, { activeTaskKey, overTaskKey, position });
}
/** 原 Jzt（155358）：任务 over 折叠组头 */
export function applyTaskOverCollapsedDrop(state: GroupedViewState, event: DragOverEvent, position: string): GroupedViewState {
  const activeTaskKey = taskKeyOfDropData(event.active.data.current);
  const groupId = groupIdOfCollapsedGroup(event.over?.data.current);
  return !activeTaskKey || !groupId ? state : placeTaskOutsideGroup(state, { activeTaskKey, groupId, position });
}
/** 原 Yzt（155363）：任务 over 展开组头（before 组外前 / 否则组首） */
export function applyTaskOverExpandedHeaderDrop(state: GroupedViewState, event: DragOverEvent, position: string): GroupedViewState {
  const activeTaskKey = taskKeyOfDropData(event.active.data.current);
  const groupId = groupIdOfExpandedHeader(event.over?.data.current);
  return !activeTaskKey || !groupId
    ? state
    : position === `before`
      ? placeTaskOutsideGroup(state, { activeTaskKey, groupId, position: `before` })
      : placeTaskAtGroupHead(state, { activeTaskKey, groupId });
}
/** 原 Xzt（155372）：任务 over 展开组尾（before 组尾 / 否则组外后） */
export function applyTaskOverExpandedFooterDrop(state: GroupedViewState, event: DragOverEvent, position: string): GroupedViewState {
  const activeTaskKey = taskKeyOfDropData(event.active.data.current);
  const groupId = groupIdOfExpandedFooter(event.over?.data.current);
  return !activeTaskKey || !groupId
    ? state
    : position === `before`
      ? appendTaskToGroupTail(state, { activeTaskKey, groupId })
      : placeTaskOutsideGroup(state, { activeTaskKey, groupId, position: `after` });
}
/** 原 Zzt（155381）：任务 over 空组投放区 */
export function applyTaskOverEmptyZoneDrop(state: GroupedViewState, event: DragOverEvent): GroupedViewState {
  const activeTaskKey = taskKeyOfDropData(event.active.data.current);
  const groupId = groupIdOfEmptyDropZone(event.over?.data.current);
  return !activeTaskKey || !groupId ? state : placeTaskAtGroupHead(state, { activeTaskKey, groupId });
}
/** 原 Qzt（155386）：组 over 组 */
export function applyGroupOverGroupDrop(state: GroupedViewState, event: DragOverEvent, position: string): GroupedViewState {
  const activeGroupId = groupIdOfDropData(event.active.data.current);
  const overGroupId = groupIdOfGroupOver(event.over?.data.current);
  return !activeGroupId || !overGroupId || activeGroupId === overGroupId
    ? state
    : moveGroupOver(state, { activeGroupId, over: { type: `group`, groupId: overGroupId }, position });
}
/** 原 $zt（155393）：组 over 任务 */
export function applyGroupOverTaskDrop(state: GroupedViewState, event: DragOverEvent, position: string): GroupedViewState {
  const activeGroupId = groupIdOfDropData(event.active.data.current);
  const overTaskKey = taskKeyOfDropData(event.over?.data.current);
  return !activeGroupId || !overTaskKey
    ? state
    : moveGroupOver(state, { activeGroupId, over: { type: `task`, taskKey: overTaskKey }, position });
}
interface DragOverEvent {
  active: { data: { current: unknown } };
  over?: { data: { current: unknown } } | null;
}
/** 原 z8（155400）：分组视图结构指纹（task/组内任务键串） */
export function groupedLayoutFingerprint(view: GroupedViewState): string {
  return view.nodes
    .map((node) =>
      node.type === `task` ? `t:${groupedTaskKeyOf(node.task)}` : `g:${node.group.id}[${node.tasks.map(groupedTaskKeyOf).join(`,`)}]`,
    )
    .join(`|`);
}
/** 原 eBt（155407）：拖拽落回动画配置 */
export const DROP_ANIMATION_CONFIG = { duration: 150, easing: `cubic-bezier(0.2, 0, 0, 1)` };
/** 原 tBt（155408）：dnd autoScroll 阈值 */
export const AUTO_SCROLL_THRESHOLDS = { x: 0.1, y: 0.1 };
/** 原 nBt（155409）：测量分组布局键/任务键几何表 */
export function measureGroupedLayout(container: HTMLElement | null): Map<string, { height: number; left: number; top: number }> {
  const rects = new Map<string, { height: number; left: number; top: number }>();
  if (!container) return rects;
  container.querySelectorAll(`[data-grouped-layout-key]`).forEach((el) => {
    const key = el.getAttribute(`data-grouped-layout-key`);
    if (!key) return;
    const rect = el.getBoundingClientRect();
    rects.set(`layout:${key}`, { height: rect.height, left: rect.left, top: rect.top });
  });
  container.querySelectorAll(`[data-grouped-task-key]`).forEach((el) => {
    const key = el.getAttribute(`data-grouped-task-key`);
    if (!key) return;
    const rect = el.getBoundingClientRect();
    rects.set(`task:${key}`, { height: rect.height, left: rect.left, top: rect.top });
  });
  return rects;
}
/** 原 rBt（155427） */
export function measureGroupedTaskWidth(container: HTMLElement | null, taskKey: string): number | null {
  if (!container) return null;
  const encoded = encodeURIComponent(taskKey);
  for (const el of Array.from(container.querySelectorAll(`[data-grouped-task-key]`))) {
    if (el.getAttribute(`data-grouped-task-key`) === encoded) return el.getBoundingClientRect().width;
  }
  return null;
}
/** 原 iBt（155434） */
export function measureGroupItemWidth(container: HTMLElement | null, groupItemId: string): number | null {
  if (!container) return null;
  for (const el of Array.from(container.querySelectorAll(`[data-grouped-group-item-id]`))) {
    if (el.getAttribute(`data-grouped-group-item-id`) === groupItemId) return el.getBoundingClientRect().width;
  }
  return null;
}
/** 原 aBt（155440）：粘性头下被遮挡的折叠组 id（上下越界判定，头高缺省 32） */
export function findStickyCollapsedGroupId(container: HTMLElement | null): string | null {
  if (!container) return null;
  const sticky = findScrollableAncestor(container);
  if (!sticky) return null;
  const stickyTop = sticky.getBoundingClientRect().top;
  let covered: string | null = null;
  for (const item of Array.from(container.querySelectorAll(`[data-grouped-group-item-id]`))) {
    const id = item.getAttribute(`data-grouped-group-item-id`);
    if (item.getAttribute(`data-group-collapsed`) === `true`) continue;
    const header = id ? container.querySelector(`[data-grouped-group-header-id="${CSS.escape(id)}"]`) : null;
    if (!id || !header) continue;
    const itemRect = item.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const headerHeight = headerRect.height || 32;
    const above = headerRect.top < stickyTop - 0.5;
    const below = itemRect.bottom > stickyTop + headerHeight + 0.5;
    if (above && below) covered = id;
  }
  return covered;
}
/** 原 oBt（155460）：FLIP 回放分组布局动画（降动效跳过；高度差 ≥0.5 才补高度轨） */
export function replayGroupedLayoutAnimations(
  container: HTMLElement | null,
  previous: Map<string, { height: number; left: number; top: number }>,
): void {
  if (!container || previous.size === 0) return;
  if (window.matchMedia(`(prefers-reduced-motion: reduce)`).matches) return;
  container.querySelectorAll(`[data-grouped-layout-key], [data-grouped-task-key]`).forEach((el) => {
    const layoutKey = el.getAttribute(`data-grouped-layout-key`);
    const taskKey = el.getAttribute(`data-grouped-task-key`);
    const prev = layoutKey ? previous.get(`layout:${layoutKey}`) : taskKey ? previous.get(`task:${taskKey}`) : null;
    if (!prev) return;
    const rect = el.getBoundingClientRect();
    const dx = prev.left - rect.left;
    const dy = prev.top - rect.top;
    const dh = prev.height - rect.height;
    const animateHeight = !!layoutKey && Math.abs(dh) >= 0.5;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && !animateHeight) return;
    (el as HTMLElement).getAnimations().forEach((animation) => animation.cancel());
    const previousOverflow = (el as HTMLElement).style.overflow;
    if (animateHeight) (el as HTMLElement).style.overflow = `hidden`;
    const animation = (el as HTMLElement).animate(
      [
        { height: animateHeight ? `${prev.height}px` : void 0, transform: `translate(${dx}px, ${dy}px)` },
        { height: animateHeight ? `${rect.height}px` : void 0, transform: `translate(0, 0)` },
      ],
      { duration: 150, easing: `cubic-bezier(0.2, 0, 0, 1)` },
    );
    animation.addEventListener(
      `finish`,
      () => {
        (el as HTMLElement).style.overflow = previousOverflow;
      },
      { once: !0 },
    );
    animation.addEventListener(
      `cancel`,
      () => {
        (el as HTMLElement).style.overflow = previousOverflow;
      },
      { once: !0 },
    );
  });
}

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → 本机 js 行；旧口径行见头注偏移）
 * ============================================================================
 *  §1：nOe 32249 | rOe 32257 | iOe 32258 | nx 32259 | aOe 32262 | rx 32265
 *   oOe 32273 | ix 32276 | sOe 32285
 *  §2：dOe 32330 | fOe 32331 | fx 32332 | pOe 32333 | mOe 32336 | hOe 32344
 *   gOe 32354 | px 32364 | Ho 1885 | tae 1905 | nae 1908 | Wo 1911
 *  §3：mx 32414 | hx 32415 | _Oe 32416 | vOe 32428 | yOe 32432 | bOe 32435
 *  §4：gx 32439 | _x 32445 | vx 32452 | yx 32459 | bx 32462 | xx 32465
 *   Sx 32469 | xOe 32472 | Cx 32477
 *  §5：wx 32528 | SOe 32529 | Tx 32530 | COe 32531 | wOe 32532 | Ex 32536
 *   TOe 32548 | EOe 32551
 *  §6：DOe 32578 | Dx 32594 | OOe 32601 | kOe 32615 | Ox 32648 | AOe 32665 | jOe 32679
 *  §7：FS 34986 | UAe 34987 | WAe 34988 | GAe 34989 | KAe 34990 | qAe 34991
 *   JAe 35000 | IS 35003 | YAe 35012
 *  §8：US 35443 | ZAe 35446 | GS 35529 | $Ae 35532 | KS 35535 | qS 35543
 *   eje 35546 | JS 35552 | YS 35625 | tje 35628 | nje 35631 | rje 35649
 *   XS 35659 | ije 35660
 *  §9：aje 35663 | oje 35695 | sje 35700 | cje 35730 | lje 35745
 *  §10：Lzt 155248 | Rzt 155253 | F8 155281 | zzt 155290 | Bzt 155296 | I8 155299
 *   L8 155304 | R8 155309 | Vzt 155314 | Hzt 155319 | Uzt 155324 | Wzt 155331
 *   Gzt 155338 | Kzt 155343 | qzt 155353 | Jzt 155358 | Yzt 155363 | Xzt 155372
 *   Zzt 155381 | Qzt 155386 | $zt 155393 | z8 155400 | eBt 155407 | tBt 155408
 *   nBt 155409 | rBt 155427 | iBt 155434 | aBt 155440 | oBt 155460
 * ============================================================================
 */
