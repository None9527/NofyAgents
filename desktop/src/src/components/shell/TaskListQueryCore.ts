// A1-P3-B1：侧栏域任务列表查询族逐字重建（styles js 35552–36118，567 行，61 内部局部，32 外部消费面）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 区域原子性：区内 14 顶层符（useHydratingSessions 簇 + useTaskListItems）；区外消费仅 JS（6 处：
//   11381/14060/65576/101056/144567/153276）与 ZS（9 处：36527/36535/143568/146904/151843/152358/
//   212820/212828/212836）；其余 12 符零区外消费（模块私有，忠实 bundle）。
// 落点裁定：新叶。Sidebar.tsx declare useTaskListItems（原 ZS）本批收敛改指本叶；
//   modules/AppRootLeaves.tsx / components/shell/TopBar.tsx / modules/TopBar.tsx 同面 declare 属他域，
//   跨域 export 申请见 A1-P3-B1.report.md §六。
// 转录机制：AST 精确改名（仅自由标识符引用位点 + 顶层声明位点；属性名/解构键/标签不动）——117 处引用改名
//   + 14 顶层声明改名，往返核对（逆映射还原 ≡ bundle 逐字）ROUNDTRIP EXACT 在案
//   （/tmp/a1r0-p3/p3-roundtrip.js）；函数体内 61 局部保留混淆名（B5 约定）。
// 型缝 14 处全型层（/tmp/a1r0-p3/p3-seam-log.txt）：P1×13 顶层函数参数宽化 :any（真身缺位调用面逐字优先）；
//   P2×1 WeakMap<object, any>（hydratedItemWeakMap 键面 = 服务对象，宽化）。
//   〔A1-P3-B2〕+1 S16：useHydratingSessions 内 e.sort 回调参数宽化（mergeSessionTaskIndexItem 真身回面
//   Record<string,unknown>，原 declare any 契据；见体注）。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   【区内顶层（本叶实体）】
//   JS→useHydratingSessions(35552) | YS→hydratedTaskKey(35625) | tje→hydratedSessionKey(35628)
//   nje→shallowRecordEqualLoose(35631) | rje→reusePreviousResult(35649) | XS→hydratedItemWeakMap(35659)
//   ije→dynamicEventScopeKey(35660) | aje→subscribeWorkspaceTaskList(35663) | oje→workspaceScopesOfTabs(35695)
//   sje→resolveTaskListShards(35700) | cje→reusePreviousQueryResult(35730) | lje→applyRuntimeStateFromTaskMeta(35745)
//   uje→mergeTaskListShardResults(35757) | ZS→useTaskListItems(35775)
//   （regions.tsv 35552–35775 行六名对照：useHydratingSessions/subscribeWorkspaceTaskList/
//     resolveTaskListShards/reusePreviousResult/applyRuntimeStateFromTaskMeta/useTaskListItems）
//   【真实 import（直连）】
//   Q→React | J→logger（SkillStore）
//   xe→useTaskStore | fe→getWorkspaceTaskStateAlias（SkillStore；skillStore chunk `U as fe` ← `_e as U`，_e@251=S 委托）
//   Zs→useSessionRegistryStore（stores-core 转导出；styles 4357 真身）
//   Vo→useSearchResultsStore | Zie→selectQueryResult（stores/searchResultsStore 转导出；Vo@1553/Zie@1878）
//   Ec→useBaseServices（modules/services；styles 4945）
//   Io→taskWorkspaceKey | Fo→compareTasks | Ro→dedupeWorkspaceScopes | Lo→taskEntityKey
//   zie→normalizeSearchDescriptor | Bie→descriptorCacheKey（stores/searchResultsHelpers；1368/1365/1374/1371/1385/1396）
//   【declare 群（〔A1-P3-B1〕§0；B2 已闭合 15 件改指真身，见 tombstone；余 3 件留批；型面宽化 any）】
//   qS→sessionSubscriptionKey(35543) | GS→sessionStoreKey(35529) | KS→resolveSessionScope(35535)
//   WS→sessionScopeWorkspaceKey(35526) | QAe→SessionStoreReconciler(35455 class) | eje→isSessionStoreHydrating(35546)
//     ——属主：会话注册表订阅基建（styles 35405–35551）；B2 闭合：qS/GS/KS/WS/eje→./SessionStoreCore 逐字、
//       QAe→modules/services WorkspaceSubscriptionSet（sessionIndex A0-S4-5 语义重建）
//   jOe→mergeSessionTaskIndexItem(32679) | dx→useOptimisticMembershipVersion(32327)
//   px→invalidateTaskIndexOnEvent(32364) | rx→isOptimisticMembershipEvent(32265) | ux→syncTaskStatusUnread(32308)
//   sOe→hasOptimisticTaskMeta(32285) | oOe→isOptimisticCoveredEvent(32273) | Ex→readTaskIndexCache(32536)
//   Ox→buildTaskListFromIndex(32648)
//     ——属主：任务索引/乐观事件族（styles 32249–32721）；B2 闭合：九件 → ./TaskIndexCore 逐字真身
//   gc→remoteSessionIdOfTab(4814) | vc→resolveTabServicesEntry(4825) | _c→taskQueryScopeOfTab(4822)
//     ——属主：工作区标签 store 簇（styles 4397–4997；WorkspaceShell/TabStore 域，P2 泳道邻域），留批
//     （gc/_c 同面 declare 亦在 components/shell/Sidebar.tsx:1129/1131，双域同注一致）
/* eslint-disable */
import * as React from "react";
import { logger, useTaskStore, getWorkspaceTaskStateAlias as getWorkspaceSlice } from '../../modules/SkillStore'; // 原 J/xe/fe（skillStore-BmeKHDBI.js :: t/h/U）
import { useSessionRegistryStore } from '../../modules/stores-core'; // 原 Zs（styles 4357；stores/sessionRegistryStore 真身转导出）
import { useSearchResultsStore, selectQueryResult } from '../../stores/searchResultsStore'; // 原 Vo/Zie（styles 1878/1878；canonical 面 components/quickpick/QuickPick 转导出）
import { useBaseServices } from '../../modules/services'; // 原 Ec（styles 4945；services/remoteServices 真身转导出）
import { taskWorkspaceKey as workspaceKey, compareTasks, dedupeWorkspaceScopes, taskEntityKey, normalizeSearchDescriptor, descriptorCacheKey } from '../../stores/searchResultsHelpers'; // 原 Io/Fo/Ro/Lo/zie/Bie（styles 1396/1365/1374/1371/1385/1396；R9/R10 逐字转录在案）
import { sessionSubscriptionKey, sessionStoreKey, resolveSessionScope, sessionScopeWorkspaceKey, isSessionStoreHydrating } from './SessionStoreCore'; // 〔A1-P3-B2〕原 qS/GS/KS/WS/eje（styles 35546/35529/35535/35526/35546）收敛改指逐字真身叶（ROUNDTRIP EXACT 在案）
import { WorkspaceSubscriptionSet as SessionStoreReconciler } from '../../modules/services'; // 〔A1-P3-B2〕原 QAe（styles 35455）收敛改指 services/sessionIndex（A0-S4-5 语义重建 554；类面同形 reconcile/getStore/size/dispose）
import { mergeSessionTaskIndexItem, useOptimisticMembershipVersion, invalidateTaskIndexOnEvent, isOptimisticMembershipEvent, syncTaskStatusUnread, hasOptimisticTaskMeta, isOptimisticCoveredEvent, readTaskIndexCache, buildTaskListFromIndex } from './TaskIndexCore'; // 〔A1-P3-B2〕原 jOe/dx/px/rx/ux/sOe/oOe/Ex/Ox（styles 32648/32327/32363/32264/32307/32284/32271/32534/32647）收敛改指逐字真身叶

/* ── declare 群（〔A1-P3-B1〕§0）：真身未实体化；各注属主与留批去向。型面宽化 any。 ── */

/* ── tombstone〔A1-P3-B2〕：declare sessionSubscriptionKey/sessionStoreKey/resolveSessionScope/
 *    sessionScopeWorkspaceKey/isSessionStoreHydrating（原 qS/GS/KS/WS/eje）删除 → 改指 ./SessionStoreCore
 *    逐字真身（styles 35526–35551 转录，ROUNDTRIP EXACT 在案 /tmp/a1r0-p3/p3b2-roundtrip.js）。 ── */
/* ── tombstone〔A1-P3-B2〕：declare class SessionStoreReconciler（原 QAe）删除 → 改指 canonical =
 *    modules/services WorkspaceSubscriptionSet（services/sessionIndex.ts 554，A0-S4-5 语义重建；
 *    类面同形 constructor(onStoreChange)/reconcile/getStore/size/dispose）。 ── */
/* ── tombstone〔A1-P3-B2〕：declare mergeSessionTaskIndexItem/useOptimisticMembershipVersion/
 *    invalidateTaskIndexOnEvent/isOptimisticMembershipEvent/syncTaskStatusUnread/hasOptimisticTaskMeta/
 *    isOptimisticCoveredEvent/readTaskIndexCache/buildTaskListFromIndex（原 jOe/dx/px/rx/ux/sOe/oOe/Ex/Ox）
 *    删除 → 改指 ./TaskIndexCore 逐字真身（styles 32249–32721 转录，ROUNDTRIP EXACT 在案）。 ── */
/** 原 gc（js 4814）：标签的远端会话 id 解析；属主 = 工作区标签 store 簇（4397–4997，WorkspaceShell/TabStore 域），留批；同面 declare Sidebar.tsx:1129 */
declare function remoteSessionIdOfTab(tab: any, sessionMaps: any): string | undefined;
/** 原 vc（js 4825）：标签服务条目解析（远端服务/本地回退）；属主同上，留批 */
declare function resolveTabServicesEntry(tab: any, baseServices: any, sessionMaps: any): any;
/** 原 _c（js 4822）：任务查询作用域判定（identity || remoteTarget || 远端会话）；属主同上，留批；同面 declare Sidebar.tsx:1131 */
declare function taskQueryScopeOfTab(tab: any, remoteSessionId?: string): boolean;

function useHydratingSessions(e: any) {
  let t = useBaseServices().zcodeAgentService,
    n = (0, React.useMemo)(
      () =>
        e
          .map((e: any) => {
            let n = e.agentService ?? t;
            return n ? sessionSubscriptionKey(e, n) : `${sessionStoreKey(e)} ${e.workspacePath} service-unavailable`;
          })
          .sort()
          .join(`|`),
      [e, t],
    ),
    r = (0, React.useRef)(e);
  r.current = e;
  let [i, a] = (0, React.useState)(0),
    o = (0, React.useCallback)(() => a((e) => e + 1), []),
    s = React.useRef<any>(null);
  s.current === null && (s.current = new SessionStoreReconciler(o));
  let c = s.current;
  ((0, React.useEffect)(() => {
    let e = [];
    for (let n of r.current) {
      let r = n.agentService ?? t;
      r && e.push({ scope: resolveSessionScope(n), agentService: r });
    }
    c.reconcile(e);
  }, [n, t, c]),
    (0, React.useEffect)(
      () => () => {
        c.dispose();
      },
      [c],
    ));
  let l = React.useRef<any[]>([]),
    u = React.useRef<any[]>([]);
  return (0, React.useMemo)(() => {
    let e = [],
      n = new Set<string>(),
      i: Record<string, string> = {},
      a = new Map(l.current.map((e) => [hydratedTaskKey(e), e]));
    for (let o of r.current) {
      let r = sessionStoreKey(o),
        s = o.agentService ?? t,
        l = s ? sessionSubscriptionKey(o, s) : `${r} service-unavailable`,
        u = c.getStore({
          workspaceKey: sessionScopeWorkspaceKey(o),
          ...(o.endpointKey ? { endpointKey: o.endpointKey } : {}),
        });
      if (!u) {
        i[r] = `${l}:missing`;
        continue;
      }
      let d = u.getState();
      ((i[r] = `${l}:${d.logEpoch ?? `none`}:${d.seq}:${u.getStatus()}`),
        isSessionStoreHydrating(u) && n.add(o.endpointKey ?? `__base__`));
      for (let t of u.getSessions())
        e.push(
          mergeSessionTaskIndexItem(t, {
            workspacePath: o.workspacePath,
            ...(o.workspaceIdentity ? { workspaceIdentity: o.workspaceIdentity } : {}),
            previous: a.get(hydratedSessionKey(o, t.sessionId)),
          }),
        );
    }
    e.sort((e: any, t: any /* 〔A1-P3-B2〕S16 缝：mergeSessionTaskIndexItem 真身回面 Record<string,unknown>（withSessionActivity 型面），原 declare any 契据 */) => compareTasks(e, t, `updated`));
    let o = reusePreviousResult(l.current, e);
    l.current = o;
    let s = [...n].sort(),
      d = s.length === u.current.length && s.every((e, t) => e === u.current[t]) ? u.current : s;
    return ((u.current = d), { items: o, sourceRevisionByScopeKey: i, hydratingEndpointKeys: d });
  }, [n, c, i]);
}
function hydratedTaskKey(e: any) {
  return `${e.workspaceIdentity?.trim() || e.workspacePath}::${e.taskId}`;
}
function hydratedSessionKey(e: any, t: any) {
  return `${e.workspaceIdentity?.trim() || e.workspacePath}::${t}`;
}
function shallowRecordEqualLoose(e: any, t: any) {
  let n = e,
    r = t,
    i = Object.keys(n);
  if (i.length !== Object.keys(r).length) return !1;
  for (let e of i) {
    let t = n[e],
      i = r[e];
    if (t !== i) {
      if (typeof t == `object` && t && typeof i == `object` && i) {
        if (JSON.stringify(t) !== JSON.stringify(i)) return !1;
        continue;
      }
      return !1;
    }
  }
  return !0;
}
function reusePreviousResult(e: any, t: any) {
  if (e.length === 0) return t;
  let n = new Map(e.map((e: any) => [hydratedTaskKey(e), e])),
    r = e.length === t.length,
    i = t.map((t: any, i: any) => {
      let a = n.get(hydratedTaskKey(t));
      return a && shallowRecordEqualLoose(a, t) ? (r && e[i] !== a && (r = !1), a) : ((r = !1), t);
    });
  return r ? e : i;
}
var hydratedItemWeakMap = new WeakMap<object, any>();
function dynamicEventScopeKey(e: any) {
  return `${e.workspaceIdentity?.trim() || ``}\u0000${e.workspacePath}`;
}
function subscribeWorkspaceTaskList(e: any) {
  let t = hydratedItemWeakMap.get(e.service);
  t || ((t = new Map()), hydratedItemWeakMap.set(e.service, t));
  let n = dynamicEventScopeKey(e.scope),
    r = t.get(n);
  if (!r) {
    let i = new Set<any>();
    ((r = {
      listeners: i,
      disposable: e.service.onDynamicWorkspaceEvent({
        workspacePath: e.scope.workspacePath,
        ...(e.scope.workspaceIdentity ? { workspaceIdentity: e.scope.workspaceIdentity } : {}),
      })((e: any) => {
        let t = Array.from(i);
        for (let n of t) n(e);
      }),
    }),
      t.set(n, r));
  }
  return (
    r.listeners.add(e.listener),
    {
      dispose() {
        let r = t.get(n);
        r &&
          (r.listeners.delete(e.listener),
          !(r.listeners.size > 0) &&
            (r.disposable.dispose(), t.delete(n), t.size === 0 && hydratedItemWeakMap.delete(e.service)));
      },
    }
  );
}
function workspaceScopesOfTabs(e: any) {
  return dedupeWorkspaceScopes(
    e.map((e: any) => ({ workspacePath: e.workspacePath, workspaceIdentity: e.workspaceIdentity })),
  );
}
function resolveTaskListShards(e: any, t: any, n: any) {
  let r = new Map(),
    i = new Set<string>();
  for (let a of e) {
    let e = remoteSessionIdOfTab(a, n),
      o = resolveTabServicesEntry(a, t, n);
    if (!o) {
      taskQueryScopeOfTab(a, e) && i.add(e ?? workspaceKey(a.workspacePath, a.workspaceIdentity));
      continue;
    }
    let s = o.remoteSessionId ?? `__base__`,
      c = r.get(s) ?? { services: o.services, workspaceScopes: [] };
    (c.workspaceScopes.push({
      workspacePath: a.workspacePath,
      workspaceIdentity: a.workspaceIdentity,
    }),
      r.set(s, c));
  }
  return {
    shards: [...r.entries()]
      .sort(([e], [t]) => e.localeCompare(t))
      .map(([e, t]) => ({
        shardKey: e,
        services: t.services,
        workspaceScopes: dedupeWorkspaceScopes(t.workspaceScopes),
      }))
      .filter((e) => e.workspaceScopes.length > 0),
    missingSessionIds: [...i].sort((e, t) => e.localeCompare(t)),
  };
}
function reusePreviousQueryResult(e: any, t: any) {
  if (
    e.descriptor.kind !== t.kind ||
    e.descriptor.sortBy !== t.sortBy ||
    e.descriptor.search !== t.search
  )
    return null;
  let n = new Set(t.workspaceKeys),
    r = e.items.filter((e: any) => n.has(workspaceKey(e.workspacePath, e.workspaceIdentity)));
  if (r.length === 0) return null;
  let i = t.visibleLimit === null ? r : r.slice(0, t.visibleLimit),
    a = e.descriptor.workspaceKeys.every((e: any) => n.has(e)),
    o = a ? Math.max(e.total, i.length) : i.length;
  return { descriptor: t, items: i, total: o, hasMore: a ? e.hasMore || o > i.length : !1 };
}
function applyRuntimeStateFromTaskMeta(e: any) {
  if (!e.status) return;
  let t = e.status === `running` ? `streaming` : e.status === `completed` ? `completed` : `failed`;
  useTaskStore.getState().setTaskRuntimeState(
    e.workspacePath,
    e.taskId,
    t,
    e.status === `error` ? e.lastError?.message : void 0,
    e.workspaceIdentity,
    e.provider,
  );
}
function mergeTaskListShardResults(e: any) {
  let t = new Map(),
    n = 0;
  for (let r of e.results) {
    n += r.total;
    for (let e of r.items) t.set(taskEntityKey(e), e);
  }
  let r = [...t.values()].sort((t, n) => compareTasks(t, n, e.sortBy)),
    i = e.expanded ? r : r.slice(0, e.collapsedLimit);
  return {
    items: i,
    total: n,
    hasMore: n > i.length,
    partial: (e.loadingShardKeys?.length ?? 0) > 0 || (e.failedShardKeys?.length ?? 0) > 0,
    loadingShardKeys: e.loadingShardKeys ?? [],
    failedShardKeys: e.failedShardKeys ?? [],
  };
}
function useTaskListItems(e: any) {
  let t = useBaseServices(),
    n = useSessionRegistryStore((e) => e.sessionsById),
    r = useSessionRegistryStore((e) => e.sessionIdByWorkspaceIdentity),
    i = useSessionRegistryStore((e) => e.sessionIdByWorkspacePath),
    a = (0, React.useMemo)(
      () => ({ sessionsById: n, sessionIdByWorkspaceIdentity: r, sessionIdByWorkspacePath: i }),
      [r, i, n],
    ),
    o = useTaskStore((t) =>
      e.workspaceTabs
        .map((e: any) => {
          let n = getWorkspaceSlice(t, e.workspacePath, e.workspaceIdentity);
          return `${e.workspacePath}:${e.workspaceIdentity ?? ``}:${n.taskListVersion}`;
        })
        .join(`|`),
    ),
    s = (0, React.useMemo)(() => workspaceScopesOfTabs(e.workspaceTabs), [e.workspaceTabs]),
    { shards: c, missingSessionIds: l } = (0, React.useMemo)(
      () => resolveTaskListShards(e.workspaceTabs, t, a),
      [t, e.workspaceTabs, a],
    ),
    u = e.searchQuery.trim() === ``,
    d = (0, React.useMemo)(
      () =>
        u
          ? c.flatMap((e) =>
              e.workspaceScopes.map((t) => ({
                workspacePath: t.workspacePath,
                ...(t.workspaceIdentity ? { workspaceIdentity: t.workspaceIdentity } : {}),
                ...(e.shardKey === `__base__` ? {} : { endpointKey: e.shardKey }),
                agentService: e.services.zcodeAgentService,
              })),
            )
          : [],
      [u, c],
    ),
    { items: f, hydratingEndpointKeys: p } = useHydratingSessions(d),
    m = (0, React.useMemo)(
      () => c.map((e) => ({ service: e.services.zcodeTaskService, scopes: e.workspaceScopes })),
      [c],
    ),
    h = useOptimisticMembershipVersion(),
    g = (0, React.useMemo)(
      () =>
        normalizeSearchDescriptor({
          kind: e.kind,
          workspaceScopes: s,
          sortBy: e.sortBy,
          search: e.searchQuery,
          expanded: e.expanded,
          visibleLimit: e.collapsedLimit,
        }),
      [e.collapsedLimit, e.expanded, e.kind, e.searchQuery, e.sortBy, s],
    ),
    _ = (0, React.useMemo)(() => descriptorCacheKey(g) + `::version=${o}`, [g, o]),
    v = useSearchResultsStore(selectQueryResult(_)),
    y = useSearchResultsStore((e) => e.taskMetaByEntityKey),
    b = useSearchResultsStore((e) => e.setQueryResult),
    [x, S] = (0, React.useState)(() => s.length > 0 && (v === null || v.stale)),
    C = React.useRef<any>(null),
    w = (0, React.useMemo)(
      () =>
        s
          .map((e) => `${e.workspaceIdentity?.trim() || e.workspacePath}::${e.workspacePath}`)
          .join(`|`),
      [s],
    ),
    T = (0, React.useMemo)(
      () =>
        c
          .map(
            (e) =>
              `${e.shardKey}:${e.workspaceScopes.map((e) => workspaceKey(e.workspacePath, e.workspaceIdentity)).join(`|`)}`,
          )
          .join(`||`),
      [c],
    ),
    E = (0, React.useMemo)(() => new Set(c.map((e) => e.shardKey)), [c]),
    D = (0, React.useMemo)(
      () => new Set(c.map((e) => e.shardKey).filter((e) => e !== `__base__`)),
      [c],
    ),
    O = (0, React.useMemo)(() => l.join(`|`), [l]),
    k = (0, React.useMemo)(
      () =>
        v
          ? v.taskKeys
              .map((e) => {
                let t = y[e],
                  n = v.searchSnippetsByTaskKey?.[e],
                  r = v.searchSnippetListsByTaskKey?.[e];
                return t && (n || r) ? { ...t, searchSnippet: n, searchSnippets: r } : t;
              })
              .filter((e) => !!e)
          : [],
      [v, y],
    ),
    A = React.useRef<any>(null),
    j = !v && A.current ? reusePreviousQueryResult(A.current, g) : null,
    M = j?.items ?? k,
    N = j?.total ?? v?.total ?? 0,
    P = j?.hasMore ?? v?.hasMore ?? !1;
  (0, React.useEffect)(() => {
    v && (A.current = { descriptor: v.descriptor, items: k, total: v.total, hasMore: v.hasMore });
  }, [k, v]);
  let F = (0, React.useCallback)(async () => {
      if (s.length === 0) {
        S(!1);
        return;
      }
      if (u) return;
      let t = `${_}::endpoints=${T}::missing=${O}`;
      if (C.current === t) return;
      ((C.current = t), S(!0));
      let n = new Map(),
        r = new Set<string>(),
        i = new Set(c.map((e) => e.shardKey)),
        a = new Set([...c.map((e) => e.shardKey), ...l]),
        o = () => [...a].some((e) => i.has(e)) || r.size > 0,
        d = () => {
          if (n.size === 0 && M.length > 0) {
            (b({
              queryKey: _,
              descriptor: g,
              items: M,
              total: N,
              hasMore: P,
              partial: a.size > 0 || r.size > 0,
              loadingShardKeys: [...a],
              failedShardKeys: [...r],
            }),
              S(o()));
            return;
          }
          let t = mergeTaskListShardResults({
            results: [...n.values()],
            sortBy: e.sortBy,
            expanded: e.expanded,
            collapsedLimit: e.collapsedLimit,
            loadingShardKeys: [...a],
            failedShardKeys: [...r],
          });
          (b({
            queryKey: _,
            descriptor: g,
            items: t.items,
            total: t.total,
            hasMore: t.hasMore,
            partial: t.partial,
            loadingShardKeys: t.loadingShardKeys,
            failedShardKeys: t.failedShardKeys,
          }),
            S(o()));
        };
      if ((d(), c.length === 0)) {
        (C.current === t && (C.current = null), S(!1));
        return;
      }
      (await Promise.allSettled(
        c.map(async (i) => {
          try {
            let r = await i.services.zcodeTaskService.listTaskList({
              kind: e.kind,
              workspaceScopes: i.workspaceScopes,
              sortBy: e.sortBy,
              search: e.searchQuery.trim() || void 0,
              limit: e.expanded ? void 0 : e.collapsedLimit,
            });
            if (C.current !== t) return;
            n.set(i.shardKey, { shardKey: i.shardKey, items: r.items, total: r.total });
          } catch (n) {
            if (C.current !== t) return;
            (r.add(i.shardKey),
              logger.error(`[useGlobalTaskList] 加载 ${e.kind} task 列表 shard=${i.shardKey} 失败`, n));
          } finally {
            C.current === t && (a.delete(i.shardKey), d());
          }
        }),
      ),
        C.current === t && ((C.current = null), S(!1)));
    }, [
      e.collapsedLimit,
      e.expanded,
      e.kind,
      e.searchQuery,
      e.sortBy,
      T,
      c,
      l,
      O,
      g,
      _,
      b,
      P,
      M,
      N,
      s,
      u,
    ]),
    I = (0, React.useRef)(d);
  I.current = d;
  let L = (0, React.useRef)(m);
  L.current = m;
  let R = (0, React.useRef)(p);
  R.current = p;
  let z = (0, React.useRef)(g);
  z.current = g;
  let B = (0, React.useRef)({ items: M, total: N, hasMore: P });
  B.current = { items: M, total: N, hasMore: P };
  let V = React.useRef<any>(null),
    H = `${_}::membership=${h}::hydrating=${p.join(`,`)}`;
  (0, React.useEffect)(() => {
    if (!u) return;
    if (I.current.length === 0) {
      s.length > 0 && S(!1);
      return;
    }
    let t = V.current;
    if (t && t.key === H && t.items === f) return;
    V.current = { key: H, items: f };
    let n = !1;
    return (
      (async () => {
        try {
          let t = await readTaskIndexCache({ cacheKey: `${h}::tasks=${o}::${T}`, endpoints: L.current });
          if (n) return;
          let r = R.current;
          if (r.length > 0 && B.current.items.length > 0) {
            (b({
              queryKey: _,
              descriptor: z.current,
              items: B.current.items,
              total: B.current.total,
              hasMore: B.current.hasMore,
              partial: !0,
              loadingShardKeys: r,
              failedShardKeys: [],
            }),
              S(!0));
            return;
          }
          let i = buildTaskListFromIndex({
            taskIndexItems: t.taskIndexItems,
            sessions: f,
            kind: e.kind,
            pinnedIds: t.pinnedIds,
            archivedIds: t.archivedIds,
            deletedIds: t.deletedIds,
            unreadAtByTaskId: t.unreadAtByTaskId,
            terminalStatusByTaskId: t.terminalStatusByTaskId,
            titleOverrideByTaskId: t.titleOverrideByTaskId,
            cronAutomationIdByTaskId: t.cronAutomationIdByTaskId,
            sortBy: e.sortBy,
            ...(e.expanded ? {} : { limit: e.collapsedLimit }),
          });
          (b({
            queryKey: _,
            descriptor: z.current,
            items: i.items,
            total: i.total,
            hasMore: !e.expanded && i.total > i.items.length,
            partial: r.length > 0,
            loadingShardKeys: r,
            failedShardKeys: [],
          }),
            S(r.length > 0));
        } catch (e) {
          n || (logger.warn(`[useGlobalTaskList] 读取 tasks-index task 行失败，保留旧列表`, e), S(!1));
        }
      })(),
      () => {
        n = !0;
      }
    );
  }, [u, H, h, o, T, f, e.kind, e.sortBy, e.expanded, e.collapsedLimit, _, b, s.length]);
  let ee = (0, React.useRef)(F),
    U = (0, React.useRef)(e.kind),
    te = (0, React.useRef)(c);
  return (
    (ee.current = F),
    (U.current = e.kind),
    (te.current = c),
    (0, React.useEffect)(() => {
      if (s.length === 0) {
        S(!1);
        return;
      }
      if (v && !v.stale) {
        let e = new Set(l);
        if (v.loadingShardKeys.some((t) => !e.has(t))) {
          F();
          return;
        }
        S(v.loadingShardKeys.some((e) => E.has(e)) || v.failedShardKeys.length > 0);
        return;
      }
      F();
    }, [v, k, E, T, l.length, O, _, F, w, s.length]),
    (0, React.useEffect)(() => {
      let e = te.current;
      if (e.length === 0) return;
      let t = [];
      for (let n of e)
        for (let e of n.workspaceScopes) {
          let r = subscribeWorkspaceTaskList({
            service: n.services.zcodeTaskService,
            scope: e,
            listener: (t: any) => {
              if (t.type === `workspace_task_list_changed`) {
                if (
                  (invalidateTaskIndexOnEvent({ event: t, service: n.services.zcodeTaskService }),
                  isOptimisticMembershipEvent(t) && syncTaskStatusUnread(t),
                  hasOptimisticTaskMeta(t) && applyRuntimeStateFromTaskMeta(t.taskMeta),
                  !isOptimisticCoveredEvent(t))
                ) {
                  logger.debug(
                    `[useGlobalTaskList] 跳过乐观更新已覆盖的列表刷新 kind=${U.current} workspace=${e.workspacePath} reason=${t.reason}`,
                  );
                  return;
                }
                (logger.info(
                  `[useGlobalTaskList] 收到 workspace_task_list_changed，触发列表刷新 kind=${U.current} workspace=${e.workspacePath} reason=${t.reason ?? `unknown`}`,
                ),
                  ee.current());
              }
            },
          });
          t.push(r);
        }
      return () => {
        for (let e of t) e.dispose();
      };
    }, [T]),
    {
      items: M,
      total: N,
      hasMore: P,
      loading: x,
      syncingRemoteWorkspaces: v?.loadingShardKeys.some((e) => D.has(e)) ?? !1,
      refresh: F,
    }
  );
}

/* ── 导出面：bundle 区外消费仅 JS（6 处）/ZS（9 处），其余 12 符模块私有（忠实 bundle）。 ── */
export { useHydratingSessions, useTaskListItems };
