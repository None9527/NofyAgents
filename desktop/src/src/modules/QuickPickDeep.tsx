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
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/quickpick/QuickPickDeep.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  TASK_META_REFRESH_REASONS,
  META_ONLY_REFRESH_REASONS,
  MEMBERSHIP_TOGGLE_REASONS,
  isMembershipToggleReason,
  isTaskDeletedReason,
  isListMembershipChanged,
  resolveMembershipIntent,
  shouldInvalidateShardCache,
  hasMembershipIntent,
  markWorkspaceKeysStaleNow,
  setTaskUnreadOverlayNow,
  reconcileTaskUnreadNow,
  rollbackTaskUnreadNow,
  isTerminalStatus,
  unreadPersistDedupeKey,
  isUnreadPersistDeduped,
  isBackgroundTerminalUnreadEvent,
  syncBackgroundTerminalUnread,
  armMembershipRefreshHold,
  releaseMembershipRefreshHold,
  getMembershipHoldStats,
  awaitMembershipRefreshHold,
  scopeOf,
  listPinnedIdsSafe,
  listTasksWithAvailability,
  collectUnreadAt,
  collectTerminalStatus,
  collectTitleOverrides,
  collectCronAutomationIds,
  dedupeTaskRowsByEntityKey,
  loadTaskIndexShard,
  serviceIdOf,
  acquireTaskIndexSnapshot,
  clearTaskIndexSnapshots,
  loadMergedTaskIndex,
  mergeSessionIntoTask,
  hydrateTaskIndexItems,
  matchesMembershipKind,
  applyIndexOverlay,
  projectTaskIndex,
  mapSessionPhaseToStatus,
  sessionRowToTaskMeta,
  INITIAL_SESSION_INDEX_STATE,
  RUNTIME_RESTART_BASE_DELAY_MS,
  RUNTIME_RESTART_MAX_DELAY_MS,
  RUNTIME_RESTART_RESET_MS,
  SUBSCRIBE_RETRY_BACKOFF_MS,
  isDormantSubscribeError,
  isTransientSubscribeError,
  unsubscribeTransportSafe,
  applyFrameToIndexState,
  subscriptionScopeKey,
  isSameSubscriptionEntry,
  scopeStoreKey,
  scopeStoreKeyAlias,
  toSessionIndexScope,
  shardCacheKeyOf,
  isIdleEmptyIndexStore,
  entityPrevKeyOf,
  sessionPrevKeyOf,
  deepValueEqual,
  reuseUnchangedTaskRows,
  dynamicScopeKey,
  subscribeDynamicWorkspaceEvents,
  normalizeShardScopes,
  buildShardPlan,
  narrowCachedShardToDescriptor,
  applyRuntimeStateEvent,
  useSessionIndexShards,
  pointerPositionOf,
  trackPointerPosition,
  findScrollableAncestor,
  groupSignaturesEqual,
  stringArraysEqual,
  taskKeyOfDropData,
  groupIdOfDropData,
  dropDataTypeOf,
  groupIdOfGroupOver,
  groupIdOfCollapsedGroup,
  groupIdOfExpandedHeader,
  groupIdOfExpandedFooter,
  groupIdOfEmptyDropZone,
  groupedCollisionDetection,
  applyTaskOverTaskDrop,
  applyTaskOverCollapsedDrop,
  applyTaskOverExpandedHeaderDrop,
  applyTaskOverExpandedFooterDrop,
  applyTaskOverEmptyZoneDrop,
  applyGroupOverGroupDrop,
  applyGroupOverTaskDrop,
  groupedLayoutFingerprint,
  DROP_ANIMATION_CONFIG,
  AUTO_SCROLL_THRESHOLDS,
  measureGroupedLayout,
  measureGroupedTaskWidth,
  measureGroupItemWidth,
  findStickyCollapsedGroupId,
  replayGroupedLayoutAnimations,
} from '../components/quickpick/QuickPickDeep';
export type {
  SessionIndexRow,
} from '../components/quickpick/QuickPickDeep';
