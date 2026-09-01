// A1-P3-B2：任务索引/乐观事件族逐字重建（styles js 32249–32720，472 行，72 内部局部，59 顶层符）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 区域原子性：nOe–jOe 59 顶层符连续区；区外消费面 = 批 1 叶 TaskListQueryCore（rx/oOe/sOe/ux/dx/px/Ex/Ox/jOe）
//   + QuickPick/SidebarLeaves 域（_Oe/vOe/yOe 持有臂等，留批收敛）；边界校准：32249–32258 三 reason Set 为
//   nx/oOe 直接依赖的独立 var 语句，纳入区首（原子补正）。
// 转录机制：AST 精确改名（172 处：自由符引用 14 名 + 顶层引用 45 名 + 顶层声明锚 59），往返核对
//   ROUNDTRIP EXACT（472 行）在案（/tmp/a1r0-p3/p3b2-roundtrip.js）；体内 72 局部保留混淆名（B5 约定）。
// 型缝（全型层，禁抑制符）：P1 顶层函数参数宽化 :any ×59 函；S5 模块级容器泛型 ×5
//   （membershipVersionListeners Set<() => void>/recentTaskUnreadSyncs Map<string,number>/
//    recentTaskIndexEvents Map<string,number>/taskIndexCacheMap Map<string,Promise<any>>/
//    serviceIndexIds WeakMap<object,number>）；S4 membershipRefreshHold: any ×1；
//   S6 store getState 面宽化 ×2（invalidateTaskIndexOnEvent 内 i/c 声明位）；S16 any 接收面回调参数
//   ×若干（.map/.filter/.sort/.then/.catch，见体注）。
//
// 映射表（minified → 语义名 → bundle 定义行）：
//   nOe→membershipPreserveReasons(32249) | rOe→metaOnlyChangeReasons(32257) | iOe→membershipFlipReasons(32258)
//   nx→hasMembershipFlipReason(32259) | aOe→isTaskDeletedReason(32261) | rx→isOptimisticMembershipEvent(32264)
//   oOe→isOptimisticCoveredEvent(32271) | ix→optimisticMembershipAction(32276) | sOe→hasOptimisticTaskMeta(32284)
//   ax→optimisticMembershipVersion(32288) | ox→membershipVersionListeners(32289) | sx→bumpMembershipVersion(32291)
//   cOe→subscribeMembershipVersion(32294) | lOe→readMembershipVersion(32301) | cx→taskUnreadSyncDebounceMs(32304)
//   uOe→taskUnreadSyncCacheCap(32305) | lx→recentTaskUnreadSyncs(32306) | ux→syncTaskStatusUnread(32307)
//   dx→useOptimisticMembershipVersion(32327) | dOe→taskIndexEventDedupMs(32330) | fOe→taskIndexEventDedupCap(32331)
//   fx→recentTaskIndexEvents(32332) | pOe→isTerminalTaskStatus(32333) | mOe→taskIndexEventDedupKey(32335)
//   hOe→isDuplicateTaskIndexEvent(32342) | gOe→isBackgroundTerminalUnreadEvent(32353) | px→invalidateTaskIndexOnEvent(32363)
//   mx→membershipRefreshHold(32411) | hx→membershipRefreshHoldState(32412) | _Oe→armMembershipRefreshHold(32413)
//   vOe→releaseMembershipRefreshHold(32426) | yOe→readMembershipRefreshHoldState(32431) | bOe→awaitMembershipRefreshHold(32434)
//   gx→pickScopePathIdentity(32439) | _x→readListSafe(32443) | vx→readListAvailability(32451)
//   yx→collectUnreadAtOverlays(32458) | bx→collectTerminalStatusOverlays(32461) | xx→collectTitleOverrides(32464)
//   Sx→collectCronAutomationIds(32468) | xOe→dedupeTaskIndexItemsByEntityKey(32471) | Cx→readTaskIndexShard(32476)
//   wx→taskIndexCacheMap(32527) | SOe→taskIndexCacheCap(32528) | Tx→serviceIndexIds(32529) | COe→nextServiceIndexId(32530)
//   wOe→serviceIndexOf(32531) | Ex→readTaskIndexCache(32534) | TOe→clearTaskIndexCache(32547)
//   EOe→mergeTaskIndexEndpoints(32551) | DOe→mergeSessionIntoTaskIndexItem(32578) | Dx→applySessionRuntimeToIndexItems(32592)
//   OOe→matchesTaskListKind(32601) | kOe→applyTaskIndexOverlays(32614) | Ox→buildTaskListFromIndex(32647)
//   AOe→mapSessionPhaseToTaskStatus(32666) | jOe→mergeSessionTaskIndexItem(32678)
//   【真实 import（直连）】
//   Q→React | J→logger | xe→useTaskStore（SkillStore）| Vo→useSearchResultsStore（stores/searchResultsStore）
//   Io→taskWorkspaceKey | Fo→compareTasks | Lo→taskEntityKey | Mo→sessionActivityOf | jo→withSessionActivity
//     （stores/searchResultsHelpers；1368/1365/1371/1311/1308，R9/R10 逐字在案）
//   Ho→markWorkspaceKeysStaleNow | tae→setTaskUnreadOverlayNow | nae→reconcileTaskUnreadNow
//   Wo→rollbackTaskUnreadNow（components/quickpick/QuickPickDeep 391/396/400/404 实体化在案）
//   【declare（属主未实体化，留批）】ie→readTaskUnreadIndicator（消费 32388；属主 = stores/taskStore 工作区态读面族）
/* eslint-disable */
import * as React from "react";
import { logger, useTaskStore } from '../../modules/SkillStore'; // 原 J/xe
import { useSearchResultsStore } from '../../stores/searchResultsStore'; // 原 Vo
import { taskWorkspaceKey as workspaceKey, compareTasks, taskEntityKey, sessionActivityOf, withSessionActivity } from '../../stores/searchResultsHelpers'; // 原 Io/Fo/Lo/Mo/jo
import { markWorkspaceKeysStaleNow, setTaskUnreadOverlayNow, reconcileTaskUnreadNow, rollbackTaskUnreadNow } from '../quickpick/QuickPickDeep'; // 原 Ho/tae/nae/Wo

/* ── declare（〔A1-P3-B2〕留批）：真身未实体化；注属主。型面宽化 any。 ── */
/** 原 ie（消费 32388）：工作区态未读指示读面（taskUnreadByTaskId 布尔）；属主 = stores/taskStore 工作区态读面族，留批 */
declare function readTaskUnreadIndicator(workspaceState: any, taskId: string): boolean;

var membershipPreserveReasons = new Set([
    `user_message_saved`,
    `assistant_message_saved`,
    `task_status_changed`,
    `task_meta_changed`,
    `task_model_changed`,
    `task_title_changed`,
  ]),
  metaOnlyChangeReasons = new Set([`task_meta_changed`, `task_model_changed`, `task_title_changed`, `auto_archive`]),
  membershipFlipReasons = new Set([`task_archived`, `task_unarchived`, `task_pinned`, `task_unpinned`]);
function hasMembershipFlipReason(e: any) {
  return membershipFlipReasons.has(e.reason);
}
function isTaskDeletedReason(e: any) {
  return e.reason === `task_deleted`;
}
function isOptimisticMembershipEvent(e: any) {
  return (
    hasMembershipFlipReason(e) ||
    e.reason === `task_created` ||
    e.reason === `task_meta_changed` ||
    e.reason === `task_deleted`
  );
}
function isOptimisticCoveredEvent(e: any) {
  return optimisticMembershipAction(e) ? !1 : hasMembershipFlipReason(e) ? !e.taskMeta : isTaskDeletedReason(e) ? !0 : !metaOnlyChangeReasons.has(e.reason);
}
function optimisticMembershipAction(e: any) {
  return e.taskMeta
    ? e.reason === `task_created`
      ? `insert-active`
      : membershipPreserveReasons.has(e.reason)
        ? `preserve-membership`
        : null
    : null;
}
function hasOptimisticTaskMeta(e: any) {
  return !!optimisticMembershipAction(e);
}
var optimisticMembershipVersion = 0,
  membershipVersionListeners = new Set<() => void>();
function bumpMembershipVersion() {
  optimisticMembershipVersion += 1;
  for (let e of [...membershipVersionListeners]) e();
}
function subscribeMembershipVersion(e: any) {
  return (
    membershipVersionListeners.add(e),
    () => {
      membershipVersionListeners.delete(e);
    }
  );
}
function readMembershipVersion() {
  return optimisticMembershipVersion;
}
var taskUnreadSyncDebounceMs = 500,
  taskUnreadSyncCacheCap = 256,
  recentTaskUnreadSyncs = new Map<string, number>();
function syncTaskStatusUnread(e: any) {
  if (!e.taskMeta || !e.taskId) {
    bumpMembershipVersion();
    return;
  }
  let t = [
      e.workspaceIdentity?.trim() || e.workspacePath,
      e.taskId,
      e.reason,
      e.taskMeta.updatedAt,
      e.taskMeta.unreadAt ?? ``,
    ].join(`::`),
    n = Date.now(),
    r = recentTaskUnreadSyncs.get(t);
  if (!(r !== void 0 && n - r < taskUnreadSyncDebounceMs)) {
    for (let [e, t] of recentTaskUnreadSyncs) n - t >= taskUnreadSyncDebounceMs && recentTaskUnreadSyncs.delete(e);
    (recentTaskUnreadSyncs.size < taskUnreadSyncCacheCap && recentTaskUnreadSyncs.set(t, n), bumpMembershipVersion());
  }
}
function useOptimisticMembershipVersion() {
  return (0, React.useSyncExternalStore)(subscribeMembershipVersion, readMembershipVersion);
}
var taskIndexEventDedupMs = 1e3,
  taskIndexEventDedupCap = 256,
  recentTaskIndexEvents = new Map<string, number>();
function isTerminalTaskStatus(e: any) {
  return e === `completed` || e === `error`;
}
function taskIndexEventDedupKey(e: any, t: any) {
  return [
    workspaceKey(e.workspacePath, e.workspaceIdentity),
    t,
    e.taskMeta?.status ?? ``,
    e.taskMeta?.updatedAt ?? ``,
  ].join(`::`);
}
function isDuplicateTaskIndexEvent(e: any) {
  let t = Date.now();
  for (let [e, n] of recentTaskIndexEvents) t - n > taskIndexEventDedupMs && recentTaskIndexEvents.delete(e);
  if (recentTaskIndexEvents.has(e)) return !0;
  if ((recentTaskIndexEvents.set(e, t), recentTaskIndexEvents.size > taskIndexEventDedupCap)) {
    let e = recentTaskIndexEvents.keys().next().value;
    e && recentTaskIndexEvents.delete(e);
  }
  return !1;
}
function isBackgroundTerminalUnreadEvent(e: any) {
  let t = e.event.taskId ?? e.event.taskMeta?.taskId;
  return (
    e.event.reason === `task_status_changed` &&
    e.event.unreadSignal === `background_terminal` &&
    !!t &&
    isTerminalTaskStatus(e.event.taskMeta?.status) &&
    e.activeTaskId !== t
  );
}
function invalidateTaskIndexOnEvent(e: any) {
  let { event: t, service: n } = e,
    r = t.taskId ?? t.taskMeta?.taskId;
  if (!r || t.reason !== `task_status_changed` || t.unreadSignal !== `background_terminal`) return;
  let i: any = useTaskStore.getState(),
    a = i.getWorkspaceState(t.workspacePath, t.workspaceIdentity);
  if (!isBackgroundTerminalUnreadEvent({ activeTaskId: a.activeTaskId, event: t })) return;
  let o = {
      taskId: r,
      workspacePath: t.workspacePath,
      ...(t.workspaceIdentity ? { workspaceIdentity: t.workspaceIdentity } : {}),
    },
    s = taskEntityKey(o),
    c: any = useSearchResultsStore.getState(),
    l = c.taskMetaByEntityKey[s],
    u = c.taskUnreadOverlayByEntityKey[s],
    d = l?.unreadAt ?? t.taskMeta?.unreadAt ?? (typeof u == `number` ? u : void 0);
  if (typeof d == `number`) {
    (typeof l?.unreadAt != `number` && typeof u != `number` && rollbackTaskUnreadNow(o, d),
      i.setTaskUnreadIndicator(t.workspacePath, r, !0, t.workspaceIdentity));
    return;
  }
  if (isDuplicateTaskIndexEvent(taskIndexEventDedupKey(t, r))) return;
  let f = l?.unreadAt,
    p = readTaskUnreadIndicator(a, r),
    m = Date.now();
  (setTaskUnreadOverlayNow(o, m),
    i.setTaskUnreadIndicator(t.workspacePath, r, !0, t.workspaceIdentity),
    n
      .setTaskUnread({ ...o, unread: !0 })
      .then((e: any) => {
        (reconcileTaskUnreadNow(o, e.unreadAt ?? m),
          i.setTaskUnreadIndicator(t.workspacePath, r, !0, t.workspaceIdentity));
      })
      .catch((e: any) => {
        (rollbackTaskUnreadNow(o, f),
          i.setTaskUnreadIndicator(t.workspacePath, r, p, t.workspaceIdentity),
          markWorkspaceKeysStaleNow([o]),
          bumpMembershipVersion(),
          logger.warn(
            `[taskStatusUnreadSync] 持久化后台终态未读失败`,
            {
              taskId: r,
              workspaceIdentity: t.workspaceIdentity ?? null,
              workspacePath: t.workspacePath,
            },
            e,
          ));
      }));
}
var membershipRefreshHold: any = null,
  membershipRefreshHoldState = { armed: !1, enteredCallCount: 0, released: !0 };
function armMembershipRefreshHold() {
  if (membershipRefreshHold) throw Error(`task list membership refresh hold 已经启动`);
  let e;
  ((membershipRefreshHold = {
    released: new Promise((t) => {
      e = t;
    }),
    release: e,
  }),
    (membershipRefreshHoldState = { armed: !0, enteredCallCount: 0, released: !1 }),
    clearTaskIndexCache());
}
function releaseMembershipRefreshHold() {
  let e = membershipRefreshHold;
  e && ((membershipRefreshHold = null), (membershipRefreshHoldState = { ...membershipRefreshHoldState, armed: !1, released: !0 }), e.release());
}
function readMembershipRefreshHoldState() {
  return { ...membershipRefreshHoldState };
}
async function awaitMembershipRefreshHold() {
  let e = membershipRefreshHold;
  e && ((membershipRefreshHoldState = { ...membershipRefreshHoldState, enteredCallCount: membershipRefreshHoldState.enteredCallCount + 1 }), await e.released);
}
function pickScopePathIdentity(e: any) {
  return {
    workspacePath: e.workspacePath,
    ...(e.workspaceIdentity ? { workspaceIdentity: e.workspaceIdentity } : {}),
  };
}
async function readListSafe(e: any) {
  try {
    return await e();
  } catch {
    return [];
  }
}
async function readListAvailability(e: any) {
  try {
    return { items: await e(), available: !0 };
  } catch {
    return { items: [], available: !1 };
  }
}
function collectUnreadAtOverlays(e: any, t: any) {
  for (let n of t) typeof n.unreadAt == `number` && e.set(n.taskId, n.unreadAt);
}
function collectTerminalStatusOverlays(e: any, t: any) {
  for (let n of t) (n.status === `completed` || n.status === `error`) && e.set(n.taskId, n.status);
}
function collectTitleOverrides(e: any, t: any) {
  for (let n of t)
    n.titleOverridden === !0 && n.title.trim().length > 0 && e.set(n.taskId, n.title);
}
function collectCronAutomationIds(e: any, t: any) {
  for (let n of t) n.cronAutomationId && e.set(n.taskId, n.cronAutomationId);
}
function dedupeTaskIndexItemsByEntityKey(e: any) {
  let t = new Map();
  for (let n of e.flat()) t.set(taskEntityKey(n), n);
  return [...t.values()];
}
async function readTaskIndexShard(e: any) {
  let [t, n, r, i, a] = await Promise.all([
    readListSafe(() => e.service.listPinnedTaskIds()),
    Promise.all(e.scopes.map((t: any) => readListAvailability(() => e.service.listArchivedTasks(pickScopePathIdentity(t))))),
    Promise.all(e.scopes.map((t: any) => readListAvailability(() => e.service.listTasks(pickScopePathIdentity(t))))),
    Promise.all(e.scopes.map((t: any) => readListAvailability(() => e.service.listPinnedTasks(pickScopePathIdentity(t))))),
    Promise.all(
      e.scopes.map((t: any) =>
        e.service.listDeletedTaskIds
          ? readListSafe(() => e.service.listDeletedTaskIds(pickScopePathIdentity(t)))
          : Promise.resolve([]),
      ),
    ),
  ]);
  if (
    (await awaitMembershipRefreshHold(),
    r.some((e) => !e.available) || n.some((e) => !e.available) || i.some((e) => !e.available))
  )
    throw Error(`tasks-index task 行读取不完整`);
  let o = n.map((e: any) => e.items),
    s = r.map((e: any) => e.items),
    c = i.map((e: any) => e.items),
    l = new Map(),
    u = new Map(),
    d = new Map(),
    f = new Map();
  return (
    collectUnreadAtOverlays(l, o.flat()),
    collectUnreadAtOverlays(l, s.flat()),
    collectUnreadAtOverlays(l, c.flat()),
    collectTerminalStatusOverlays(u, o.flat()),
    collectTerminalStatusOverlays(u, s.flat()),
    collectTerminalStatusOverlays(u, c.flat()),
    collectTitleOverrides(d, o.flat()),
    collectTitleOverrides(d, s.flat()),
    collectTitleOverrides(d, c.flat()),
    collectCronAutomationIds(f, o.flat()),
    collectCronAutomationIds(f, s.flat()),
    collectCronAutomationIds(f, c.flat()),
    {
      taskIndexItems: dedupeTaskIndexItemsByEntityKey([s.flat(), c.flat(), o.flat()]),
      pinnedIds: new Set([...t, ...c.flat().map((e: any) => e.taskId)]),
      archivedIds: new Set(o.flat().map((e: any) => e.taskId)),
      deletedIds: new Set(a.flat()),
      unreadAtByTaskId: l,
      terminalStatusByTaskId: u,
      titleOverrideByTaskId: d,
      cronAutomationIdByTaskId: f,
    }
  );
}
var taskIndexCacheMap = new Map<string, Promise<any>>(),
  taskIndexCacheCap = 8,
  serviceIndexIds = new WeakMap<object, number>(),
  nextServiceIndexId = 1;
function serviceIndexOf(e: any) {
  let t = serviceIndexIds.get(e);
  return (t === void 0 && ((t = nextServiceIndexId++), serviceIndexIds.set(e, t)), t);
}
function readTaskIndexCache(e: any) {
  let t = `${e.cacheKey}::svc=${e.endpoints.map((e: any) => serviceIndexOf(e.service)).join(`,`)}`,
    n = taskIndexCacheMap.get(t);
  if (n) return n;
  let r = mergeTaskIndexEndpoints(e.endpoints);
  for (taskIndexCacheMap.set(t, r), r.catch(() => taskIndexCacheMap.delete(t)); taskIndexCacheMap.size > taskIndexCacheCap;) {
    let e = taskIndexCacheMap.keys().next().value;
    if (e === void 0) break;
    taskIndexCacheMap.delete(e);
  }
  return r;
}
function clearTaskIndexCache() {
  taskIndexCacheMap.clear();
}
async function mergeTaskIndexEndpoints(e: any) {
  let t = await Promise.all(
      e.filter((e: any) => e.scopes.length > 0).map((e: any) => readTaskIndexShard({ service: e.service, scopes: e.scopes })),
    ),
    n: any = {
      taskIndexItems: [],
      pinnedIds: new Set(),
      archivedIds: new Set(),
      deletedIds: new Set(),
      unreadAtByTaskId: new Map(),
      terminalStatusByTaskId: new Map(),
      titleOverrideByTaskId: new Map(),
      cronAutomationIdByTaskId: new Map(),
    },
    r = new Map();
  for (let e of t) {
    for (let t of e.taskIndexItems) r.set(taskEntityKey(t), t);
    for (let t of e.pinnedIds) n.pinnedIds.add(t);
    for (let t of e.archivedIds) n.archivedIds.add(t);
    for (let t of e.deletedIds) n.deletedIds.add(t);
    for (let [t, r] of e.unreadAtByTaskId) n.unreadAtByTaskId.set(t, r);
    for (let [t, r] of e.terminalStatusByTaskId) n.terminalStatusByTaskId.set(t, r);
    for (let [t, r] of e.titleOverrideByTaskId) n.titleOverrideByTaskId.set(t, r);
    for (let [t, r] of e.cronAutomationIdByTaskId) n.cronAutomationIdByTaskId.set(t, r);
  }
  return ((n.taskIndexItems = [...r.values()]), n);
}
function mergeSessionIntoTaskIndexItem(e: any, t: any) {
  let n = sessionActivityOf(t),
    r = t.title.trim().length > 0 && (t.titleOverridden === !0 || e.titleOverridden !== !0),
    i = t.titleOverridden === !0 || e.titleOverridden === !0 ? !0 : void 0,
    a = {
      ...e,
      title: r ? t.title : e.title,
      titleOverridden: i,
      createdAt: t.createdAt || e.createdAt,
      updatedAt: (n?.lastActivityAt ?? t.updatedAt) || e.updatedAt,
      status: t.status ?? e.status,
      forkedFromTaskId: t.forkedFromTaskId ?? e.forkedFromTaskId,
      pendingInteraction: t.pendingInteraction,
    };
  return n ? withSessionActivity(a, n) : a;
}
function applySessionRuntimeToIndexItems(e: any) {
  let t = new Map(e.sessions.map((e: any) => [taskEntityKey(e), e]));
  return e.taskIndexItems.map((e: any) => {
    let n = t.get(taskEntityKey(e));
    return n ? mergeSessionIntoTaskIndexItem(e, n) : e;
  });
}
function matchesTaskListKind(e: any, t: any, n: any) {
  switch (e) {
    case `pinned`:
      return t && !n;
    case `archived`:
      return n;
    case `active`:
      return !n;
    case `timeline`:
      return !t && !n;
    default:
      return !1;
  }
}
function applyTaskIndexOverlays(e: any, t: any) {
  let {
    unreadAtByTaskId: n,
    terminalStatusByTaskId: r,
    titleOverrideByTaskId: i,
    cronAutomationIdByTaskId: a,
  } = t;
  return n === void 0 && (!r || r.size === 0) && (!i || i.size === 0) && (!a || a.size === 0)
    ? e
    : e.map((e: any) => {
        let t = sessionActivityOf(e),
          o = n?.get(e.taskId),
          s = r?.get(e.taskId),
          c = e.titleOverridden === !0 ? void 0 : i?.get(e.taskId),
          l = a?.get(e.taskId),
          u = n !== void 0 && (o !== e.unreadAt || (o === void 0 && e.unreadAt !== void 0)),
          d =
            t === null &&
            s !== void 0 &&
            (e.status === void 0 || (s === `error` && e.status === `completed`)),
          f = c !== void 0 && (e.title !== c || e.titleOverridden !== !0),
          p = l !== void 0 && l !== e.cronAutomationId;
        return !u && !d && !f && !p
          ? e
          : {
              ...e,
              ...(u ? { unreadAt: o } : {}),
              ...(d ? { status: s } : {}),
              ...(f ? { title: c, titleOverridden: !0 } : {}),
              ...(p ? { cronAutomationId: l } : {}),
            };
      });
}
function buildTaskListFromIndex(e: any) {
  let t = e.search?.trim().toLocaleLowerCase() ?? ``,
    n = applyTaskIndexOverlays(applySessionRuntimeToIndexItems({ taskIndexItems: e.taskIndexItems, sessions: e.sessions }), {
      unreadAtByTaskId: e.unreadAtByTaskId,
      terminalStatusByTaskId: e.terminalStatusByTaskId,
      titleOverrideByTaskId: e.titleOverrideByTaskId,
      cronAutomationIdByTaskId: e.cronAutomationIdByTaskId,
    }).filter((n: any) => {
      if (e.deletedIds?.has(n.taskId)) return !1;
      let r = e.pinnedIds.has(n.taskId),
        i = e.archivedIds.has(n.taskId);
      return !(!matchesTaskListKind(e.kind, r, i) || (t && !n.title.toLocaleLowerCase().includes(t)));
    });
  n.sort((t: any, n: any) => compareTasks(t, n, e.sortBy));
  let r = n.length;
  return { items: e.limit === void 0 ? n : n.slice(0, e.limit), total: r };
}
function mapSessionPhaseToTaskStatus(e: any) {
  switch (e) {
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
function mergeSessionTaskIndexItem(e: any, t: any) {
  let n = t.previous,
    r = mapSessionPhaseToTaskStatus(e.phase),
    i = e.titleSource === `custom`,
    a = n?.titleOverridden === !0 && !i ? n.title : e.title || n?.title || ``,
    o = i || n?.titleOverridden === !0 ? !0 : void 0;
  return withSessionActivity(
    {
      taskId: e.sessionId,
      traceId: n?.traceId ?? `session-${e.sessionId}`,
      title: a,
      ...(o ? { titleOverridden: o } : {}),
      workspacePath: t.workspacePath,
      ...(t.workspaceIdentity ? { workspaceIdentity: t.workspaceIdentity } : {}),
      createdAt: e.createdAt || n?.createdAt || 0,
      updatedAt: e.lastActivityAt || n?.updatedAt || 0,
      mode: n?.mode ?? `default`,
      ...(n?.model ? { model: n.model } : {}),
      ...(e.parentSessionId ? { forkedFromTaskId: e.parentSessionId } : {}),
      ...(n?.provider ? { provider: n.provider } : {}),
      ...(r ? { status: r } : {}),
      ...(e.pendingInteraction
        ? {
            pendingInteraction: {
              interactionId: e.pendingInteraction.interactionId,
              kind: e.pendingInteraction.kind,
              ...(e.pendingInteraction.toolName ? { toolName: e.pendingInteraction.toolName } : {}),
              ...(e.pendingInteraction.autoResolution
                ? { autoResolution: e.pendingInteraction.autoResolution }
                : {}),
            },
          }
        : {}),
      ...(n?.unreadAt ? { unreadAt: n.unreadAt } : {}),
    },
    {
      phase: e.phase,
      lastActivityAt: e.lastActivityAt,
      hasBackgroundWork: e.hasBackgroundWork,
      ...(e.pendingInteractionSummary ? { pendingInteractions: e.pendingInteractionSummary } : {}),
    },
  );
}

export {
  membershipPreserveReasons, metaOnlyChangeReasons, membershipFlipReasons, hasMembershipFlipReason,
  isTaskDeletedReason, isOptimisticMembershipEvent, isOptimisticCoveredEvent, optimisticMembershipAction,
  hasOptimisticTaskMeta, optimisticMembershipVersion, membershipVersionListeners, bumpMembershipVersion,
  subscribeMembershipVersion, readMembershipVersion, taskUnreadSyncDebounceMs, taskUnreadSyncCacheCap,
  recentTaskUnreadSyncs, syncTaskStatusUnread, useOptimisticMembershipVersion, taskIndexEventDedupMs,
  taskIndexEventDedupCap, recentTaskIndexEvents, isTerminalTaskStatus, taskIndexEventDedupKey,
  isDuplicateTaskIndexEvent, isBackgroundTerminalUnreadEvent, invalidateTaskIndexOnEvent,
  membershipRefreshHold, membershipRefreshHoldState, armMembershipRefreshHold, releaseMembershipRefreshHold,
  readMembershipRefreshHoldState, awaitMembershipRefreshHold, pickScopePathIdentity, readListSafe,
  readListAvailability, collectUnreadAtOverlays, collectTerminalStatusOverlays, collectTitleOverrides,
  collectCronAutomationIds, dedupeTaskIndexItemsByEntityKey, readTaskIndexShard, taskIndexCacheMap,
  taskIndexCacheCap, serviceIndexIds, nextServiceIndexId, serviceIndexOf, readTaskIndexCache,
  clearTaskIndexCache, mergeTaskIndexEndpoints, mergeSessionIntoTaskIndexItem, applySessionRuntimeToIndexItems,
  matchesTaskListKind, applyTaskIndexOverlays, buildTaskListFromIndex, mapSessionPhaseToTaskStatus,
  mergeSessionTaskIndexItem,
};
