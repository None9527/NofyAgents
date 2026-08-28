import { s as e } from "./chunk-Cq_f4orQ.js";
import { t } from "./react-BQLj9xdT.js";
import {
  F as n,
  M as r,
  P as i,
  Y as a,
  ds as o,
  ot as s,
  q as c,
  us as l,
} from "./src-HCld2afU.js";
import { t as u } from "./logger-PFDwl5Yq.js";
var d = e(t(), 1),
  f = (e) => {
    let t,
      n = new Set(),
      r = (e, r) => {
        let i = typeof e == `function` ? e(t) : e;
        if (!Object.is(i, t)) {
          let e = t;
          ((t = (r ?? (typeof i != `object` || !i)) ? i : Object.assign({}, t, i)),
            n.forEach((n) => n(t, e)));
        }
      },
      i = () => t,
      a = {
        setState: r,
        getState: i,
        getInitialState: () => o,
        subscribe: (e) => (n.add(e), () => n.delete(e)),
      },
      o = (t = e(r, i, a));
    return a;
  },
  p = (e) => (e ? f(e) : f),
  m = (e) => e;
function h(e, t = m) {
  let n = d.useSyncExternalStore(
    e.subscribe,
    d.useCallback(() => t(e.getState()), [e, t]),
    d.useCallback(() => t(e.getInitialState()), [e, t]),
  );
  return (d.useDebugValue(n), n);
}
var g = (e) => {
    let t = p(e),
      n = (e) => h(t, e);
    return (Object.assign(n, t), n);
  },
  _ = (e) => (e ? g(e) : g);
function ee() {
  return {
    BASE_URL: `./`,
    DEV: !1,
    MODE: `production`,
    PROD: !0,
    SSR: !1,
    VITE_ZCODE_BASE_URL: `https://zcode.z.ai`,
    VITE_ZCODE_E2E_STORE_BRIDGE: ``,
    VITE_ZCODE_ENDPOINT_ORIGIN: `https://zcode.z.ai`,
  };
}
function v(e = ee()) {
  return typeof window < `u` && e.VITE_ZCODE_E2E_STORE_BRIDGE === `1`;
}
var te = { status: `idle`, error: null, attempts: 0 },
  ne = `glm`,
  re = {
    permissionRequest: null,
    pendingPermissionRequests: [],
    elicitationRequest: null,
    pendingElicitationRequests: [],
    elicitationFormDraftsByRequestId: {},
    error: null,
  },
  ie = {
    status: `notReady`,
    error: null,
    provider: void 0,
    contextWindow: null,
    usage: null,
    apiRetry: null,
    backgroundTaskControls: [],
    activeTurnKind: void 0,
    activeInputId: void 0,
    activeInputOwnerClientId: void 0,
  };
function ae(e) {
  return {
    activeTaskId: null,
    workspaceInit: { ...te },
    draftRuntime: { status: `idle`, error: null },
    draftSessionId: null,
    draftRuntimeInvalidationVersion: 0,
    composerTextInsertVersion: 0,
    composerTextInsertRequest: null,
    draftPreferredModel: null,
    draftPreferredMode: null,
    draftPreferredThoughtLevel: null,
    draftError: null,
    modelSwitchRequestId: null,
    modelSwitchPending: !1,
    modelSwitchStage: `idle`,
    taskRuntimeByTaskId: {},
    taskUiByTaskId: {},
    taskConfigOptionsByTaskId: {},
    taskConfigOptionsStatusByTaskId: {},
    taskUnreadByTaskId: {},
    optimisticTaskListByTaskId: {},
    groupedDraftTask: null,
    promotedGroupedDraftTaskByTaskId: {},
    selectedProvider: e,
    selectedSupplierKey: r(e),
    isGhostSupplier: !1,
    supplierMismatchReason: null,
    configOptions: null,
    configOptionsStatus: `idle`,
    slashCommands: [],
    taskListVersion: 0,
    taskListCache: null,
    draftFocusVersion: 0,
  };
}
var oe = ae(ne);
function se() {
  return oe;
}
function ce(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function le(e) {
  let t = e.trim().toLocaleLowerCase();
  return t.length === 0 || t === `new session`;
}
function ue(e, t) {
  return (t.titleOverridden && !e.titleOverridden) || (le(e.title) && !le(t.title))
    ? t.title
    : e.title;
}
function y(e, t) {
  let n =
      t.updatedAt > e.updatedAt || (t.updatedAt === e.updatedAt && t.title.length > e.title.length),
    r = n ? t : e,
    i = n ? e : t,
    a = ce(t, `unreadAt`) ? t.unreadAt : (r.unreadAt ?? i.unreadAt);
  return {
    ...r,
    changeSummary: r.changeSummary ?? i.changeSummary,
    model: r.model ?? i.model,
    provider: r.provider ?? i.provider,
    title: ue(r, i),
    titleOverridden:
      r.titleOverridden === !0 || i.titleOverridden === !0
        ? !0
        : (r.titleOverridden ?? i.titleOverridden),
    status: r.status ?? i.status,
    unreadAt: a,
  };
}
function de(...e) {
  let t;
  for (let n of e) n && (t = t ? y(n, t) : n);
  return t;
}
function b(e, t) {
  return t?.trim() || e;
}
function x(e, t) {
  let n = Object.entries(e).filter(([e]) => t.has(e));
  return n.length > 0 ? Object.fromEntries(n) : {};
}
function fe(e, t) {
  let n = t.trim(),
    r = new Set();
  for (let t of e.taskListCache ?? []) t.workspaceIdentity?.trim() === n && r.add(t.taskId);
  for (let t of Object.values(e.optimisticTaskListByTaskId))
    t.workspaceIdentity?.trim() === n && r.add(t.taskId);
  return r;
}
function pe(e, t) {
  if (!e) return ae(se().selectedProvider);
  let n = ae(e.selectedProvider),
    r = t ? fe(e, t) : new Set(),
    i = e.taskListCache?.filter((e) => r.has(e.taskId)) ?? null;
  return {
    ...n,
    selectedSupplierKey: e.selectedSupplierKey,
    isGhostSupplier: e.isGhostSupplier,
    supplierMismatchReason: e.supplierMismatchReason,
    configOptions: e.configOptions,
    configOptionsStatus: e.configOptionsStatus,
    slashCommands: e.slashCommands,
    ...(r.size > 0
      ? {
          activeTaskId: e.activeTaskId && r.has(e.activeTaskId) ? e.activeTaskId : n.activeTaskId,
          optimisticTaskListByTaskId: x(e.optimisticTaskListByTaskId, r),
          taskConfigOptionsByTaskId: x(e.taskConfigOptionsByTaskId, r),
          taskConfigOptionsStatusByTaskId: x(e.taskConfigOptionsStatusByTaskId, r),
          taskListCache: i,
          taskListVersion: e.taskListVersion,
          taskRuntimeByTaskId: x(e.taskRuntimeByTaskId, r),
          taskUiByTaskId: x(e.taskUiByTaskId, r),
          taskUnreadByTaskId: x(e.taskUnreadByTaskId, r),
        }
      : {}),
  };
}
function S(e, t, n) {
  let r = e.workspaces[t] ?? se(),
    i = b(t, n);
  return i === t ? r : e.workspaces[i] || r;
}
function C(e, t, n, r) {
  let i = b(t, r),
    a = i === t ? S(e, t, r) : (e.workspaces[i] ?? pe(e.workspaces[t], r)),
    o = n(a);
  return o === a
    ? { workspaces: e.workspaces }
    : i === t
      ? { workspaces: { ...e.workspaces, [t]: o } }
      : { workspaces: { ...e.workspaces, [i]: o } };
}
function w(e, t) {
  return e.taskRuntimeByTaskId[t] ?? ie;
}
function me(e) {
  if (!e.activeTaskId)
    return { taskStatus: e.draftRuntime.status, taskError: e.draftRuntime.error };
  let t = w(e, e.activeTaskId);
  return { taskStatus: t.status, taskError: t.error };
}
function T(e, t) {
  return e.taskUiByTaskId[t] ?? re;
}
function E(e, t) {
  let n = e.optimisticTaskListByTaskId?.[t],
    r = e.taskListCache?.find((e) => e.taskId === t) ?? null;
  return n ? (r ? y(r, n) : n) : r;
}
function he(e) {
  let t = new Map();
  for (let n of e.taskListCache ?? []) t.set(n.taskId, n);
  for (let n of Object.values(e.optimisticTaskListByTaskId ?? {}))
    t.set(n.taskId, E(e, n.taskId) ?? n);
  return Array.from(t.values());
}
function ge(e, t, n) {
  return !!(E(e, t) ?? n)?.unreadAt || e.taskUnreadByTaskId?.[t] === !0;
}
function _e(e, t, n) {
  return S(e, t, n);
}
function ve(e) {
  return e.workspaceInit ?? te;
}
var ye = 50;
function be() {
  return { entries: [], cursor: -1 };
}
function xe(e) {
  return e.kind === `task`;
}
function Se(e) {
  return e.kind === `automations`;
}
function Ce(e, t) {
  return e.kind !== t.kind ||
    e.workspacePath !== t.workspacePath ||
    e.workspaceIdentity !== t.workspaceIdentity
    ? !1
    : e.kind === `task`
      ? e.taskId === t.taskId
      : e.automationId === t.automationId;
}
function we(e, t) {
  let n = e.cursor >= 0 ? e.entries[e.cursor] : null;
  if (n && Ce(n, t)) return e;
  let r = [...e.entries.slice(0, e.cursor + 1), t];
  if (r.length > ye) {
    let e = r.length - ye;
    return { entries: r.slice(e), cursor: r.length - e - 1 };
  }
  return { entries: r, cursor: r.length - 1 };
}
function Te(e, t, n, r) {
  return we(e, {
    kind: `task`,
    workspacePath: t,
    ...(r ? { workspaceIdentity: r } : {}),
    taskId: n,
  });
}
function Ee(e, t, n, r) {
  return we(e, {
    kind: `automations`,
    workspacePath: t,
    ...(n ? { workspaceIdentity: n } : {}),
    ...(r ? { automationId: r } : {}),
  });
}
function De(e) {
  return e.cursor > 0;
}
function Oe(e) {
  return e.cursor < e.entries.length - 1;
}
function ke(e) {
  if (!De(e)) return null;
  let t = e.cursor - 1,
    n = e.entries[t];
  return n ? { history: { ...e, cursor: t }, entry: n } : null;
}
function Ae(e) {
  if (!Oe(e)) return null;
  let t = e.cursor + 1,
    n = e.entries[t];
  return n ? { history: { ...e, cursor: t }, entry: n } : null;
}
function je(e, t) {
  let n = e.cursor >= 0 ? e.entries[e.cursor] : null,
    r = e.entries.filter((e) => !xe(e) || e.taskId !== t);
  if (r.length === e.entries.length) return e;
  if (r.length === 0) return be();
  let i = n ? r.indexOf(n) : -1;
  return { entries: r, cursor: i >= 0 ? i : Math.min(e.cursor, r.length - 1) };
}
function Me(e, t) {
  return {
    taskNavHistory: be(),
    taskNavPushAutomations: (t, n, r) => {
      e((e) => ({ taskNavHistory: Ee(e.taskNavHistory, t, n, r) }));
    },
    taskNavGoBack: () => {
      let n = ke(t().taskNavHistory);
      return n ? (e({ taskNavHistory: n.history }), n.entry) : null;
    },
    taskNavGoForward: () => {
      let n = Ae(t().taskNavHistory);
      return n ? (e({ taskNavHistory: n.history }), n.entry) : null;
    },
    removeTaskFromNavHistory: (t) => {
      e((e) => ({ taskNavHistory: je(e.taskNavHistory, t) }));
    },
  };
}
var Ne = `zcode-chat-composer-drafts:v1:`,
  Pe = `__draft__`;
function Fe() {
  if (typeof window > `u`) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function Ie(e, t) {
  let n = t?.trim() || e;
  return `${Ne}${encodeURIComponent(n)}`;
}
function Le(e, t) {
  let n = null;
  try {
    n = e?.getItem(t) ?? null;
  } catch (e) {
    u.warn(`[chatComposerDraftStorage] 读取 composer 草稿持久化失败`, {
      error: e instanceof Error ? e.message : String(e),
      key: t,
    });
  }
  if (!n) return null;
  try {
    let e = JSON.parse(n);
    return e.version !== 1 || typeof e.scopes != `object` || e.scopes === null
      ? null
      : { version: 1, scopes: e.scopes };
  } catch {
    return null;
  }
}
function Re(e, t, n, r = Fe()) {
  let i = Ie(e, n),
    a = Le(r, i);
  if (a) {
    delete a.scopes[t ?? Pe];
    try {
      Object.keys(a.scopes).length === 0 ? r?.removeItem(i) : r?.setItem(i, JSON.stringify(a));
    } catch (e) {
      u.warn(`[chatComposerDraftStorage] 清理 composer 草稿持久化失败`, {
        error: e instanceof Error ? e.message : String(e),
        key: i,
      });
    }
  }
}
function ze(e, t) {
  return JSON.stringify(e) === JSON.stringify(t);
}
function Be(e, t) {
  return e === t
    ? !0
    : !e || !t || e.length !== t.length
      ? !1
      : e.every((e, n) => {
          let r = t[n];
          return !!r && ze(e, r);
        });
}
function Ve(e) {
  return [...e].sort((e, t) =>
    t.updatedAt === e.updatedAt
      ? t.createdAt === e.createdAt
        ? t.taskId.localeCompare(e.taskId)
        : t.createdAt - e.createdAt
      : t.updatedAt - e.updatedAt,
  );
}
function He(e, t) {
  return e.length === t.length
    ? e.every((e, n) => {
        let r = t[n];
        return r ? e.optionId === r.optionId && e.kind === r.kind && e.name === r.name : !1;
      })
    : !1;
}
function Ue(e, t) {
  return e === t
    ? !0
    : e.requestId === t.requestId &&
        e.taskId === t.taskId &&
        e.traceId === t.traceId &&
        e.inputId === t.inputId &&
        e.kind === t.kind &&
        e.title === t.title &&
        e.description === t.description &&
        He(e.options, t.options);
}
function We(e, t) {
  let n = e ?? null,
    r = t ?? null;
  return n === null || r === null ? n === r : n.amount === r.amount && n.currency === r.currency;
}
function Ge(e, t) {
  return e === t
    ? !0
    : !e || !t
      ? !1
      : e.inputTokens === t.inputTokens &&
        e.cacheReadTokens === t.cacheReadTokens &&
        e.cacheWriteTokens === t.cacheWriteTokens &&
        e.latestHitRate === t.latestHitRate &&
        e.hitRate === t.hitRate &&
        e.hitRateRequestCount === t.hitRateRequestCount &&
        e.totalInputTokens === t.totalInputTokens &&
        e.totalCacheReadTokens === t.totalCacheReadTokens &&
        e.totalCacheWriteTokens === t.totalCacheWriteTokens;
}
function Ke(e, t) {
  return e === t
    ? !0
    : !e || !t || e.length !== t.length
      ? !1
      : e.every((e, n) => e.source === t[n]?.source && e.chars === t[n]?.chars);
}
function qe(e, t) {
  return e === t
    ? !0
    : !e || !t
      ? !1
      : e.size === t.size &&
        e.used === t.used &&
        We(e.cost, t.cost) &&
        Ge(e.cache, t.cache) &&
        Ke(e.breakdown, t.breakdown);
}
function Je(e) {
  return e === null || !Number.isFinite(e) || e <= 0 ? null : Math.floor(e);
}
function Ye(e, t, n, r) {
  let i = b(t, n);
  if (i === t) return C(e, t, r);
  let a = e.workspaces[i] ?? se();
  return { workspaces: { ...e.workspaces, [i]: r(a) } };
}
function Xe(e) {
  return {
    setTaskRuntimeState: (t, n, r, i, a, o) => {
      e((e) =>
        C(
          e,
          t,
          (e) => {
            let t = w(e, n),
              a = r === `creating` || r === `restoring` || r === `streaming`,
              s = {
                ...t,
                status: r,
                error: i ?? null,
                provider: o ?? t.provider,
                activeTurnKind: a ? t.activeTurnKind : void 0,
                activeInputId: a ? t.activeInputId : void 0,
                activeInputOwnerClientId: a ? t.activeInputOwnerClientId : void 0,
              };
            return { ...e, taskRuntimeByTaskId: { ...e.taskRuntimeByTaskId, [n]: s } };
          },
          a,
        ),
      );
    },
    setTaskUsage: (t, n, r, i) => {
      e((e) =>
        qe(w(S(e, t, i), n).usage, r)
          ? e
          : Ye(e, t, i, (e) => ({
              ...e,
              taskRuntimeByTaskId: { ...e.taskRuntimeByTaskId, [n]: { ...w(e, n), usage: r } },
            })),
      );
    },
    setTaskContextWindow: (t, n, r, i) => {
      let a = Je(r);
      e((e) =>
        w(S(e, t, i), n).contextWindow === a
          ? e
          : Ye(e, t, i, (e) => ({
              ...e,
              taskRuntimeByTaskId: {
                ...e.taskRuntimeByTaskId,
                [n]: { ...w(e, n), contextWindow: a },
              },
            })),
      );
    },
    setTaskApiRetryStatus: (t, n, r, i) => {
      e((e) =>
        C(
          e,
          t,
          (e) => ({
            ...e,
            taskRuntimeByTaskId: { ...e.taskRuntimeByTaskId, [n]: { ...w(e, n), apiRetry: r } },
          }),
          i,
        ),
      );
    },
    setTaskConfigOptions: (t, n, r, i, a = `ready`) => {
      let o = [...r];
      e((e) => {
        let r = S(e, t, i),
          s = r.taskConfigOptionsByTaskId[n] ?? [];
        return (r.taskConfigOptionsStatusByTaskId[n] ?? `ready`) === a && Be(s, o)
          ? e
          : C(
              e,
              t,
              (e) => ({
                ...e,
                taskConfigOptionsByTaskId: { ...e.taskConfigOptionsByTaskId, [n]: o },
                taskConfigOptionsStatusByTaskId: { ...e.taskConfigOptionsStatusByTaskId, [n]: a },
              }),
              i,
            );
      });
    },
    setTaskPermissionRequest: (t, n, r, i) => {
      e((e) =>
        C(
          e,
          t,
          (e) => {
            let t = T(e, n);
            if (r === null)
              return t.permissionRequest === null && t.pendingPermissionRequests.length === 0
                ? e
                : {
                    ...e,
                    taskUiByTaskId: {
                      ...e.taskUiByTaskId,
                      [n]: { ...t, permissionRequest: null, pendingPermissionRequests: [] },
                    },
                  };
            let i = t.permissionRequest,
              a = t.pendingPermissionRequests ?? [],
              o = i,
              s = a;
            if (i?.requestId === r.requestId) {
              if (Ue(i, r)) return e;
              o = r;
            } else if (i === null) ((o = r), (s = a.filter((e) => e.requestId !== r.requestId)));
            else {
              let t = a.findIndex((e) => e.requestId === r.requestId);
              if (t >= 0) {
                let n = a[t];
                if (!n || Ue(n, r)) return e;
                s = a.map((e, n) => (n === t ? r : e));
              } else s = [...a, r];
            }
            return {
              ...e,
              taskUiByTaskId: {
                ...e.taskUiByTaskId,
                [n]: { ...t, permissionRequest: o, pendingPermissionRequests: s },
              },
            };
          },
          i,
        ),
      );
    },
    removeTaskPermissionRequest: (t, n, r, i) => {
      e((e) =>
        C(
          e,
          t,
          (e) => {
            let t = T(e, n),
              i = t.permissionRequest,
              a = t.pendingPermissionRequests ?? [];
            if (i?.requestId === r) {
              let [r, ...i] = a;
              return {
                ...e,
                taskUiByTaskId: {
                  ...e.taskUiByTaskId,
                  [n]: { ...t, permissionRequest: r ?? null, pendingPermissionRequests: i },
                },
              };
            }
            let o = a.findIndex((e) => e.requestId === r);
            return o < 0
              ? e
              : {
                  ...e,
                  taskUiByTaskId: {
                    ...e.taskUiByTaskId,
                    [n]: { ...t, pendingPermissionRequests: a.filter((e, t) => t !== o) },
                  },
                };
          },
          i,
        ),
      );
    },
    setTaskElicitationRequest: (t, n, r, i) => {
      e((e) =>
        C(
          e,
          t,
          (e) => {
            let t = T(e, n);
            if (r === null)
              return {
                ...e,
                taskUiByTaskId: {
                  ...e.taskUiByTaskId,
                  [n]: { ...t, elicitationRequest: null, pendingElicitationRequests: [] },
                },
              };
            let i = t.elicitationRequest,
              a = t.pendingElicitationRequests ?? [],
              o = i,
              s = a;
            if (i?.requestId === r.requestId) o = r;
            else if (i === null) ((o = r), (s = a.filter((e) => e.requestId !== r.requestId)));
            else {
              let e = a.findIndex((e) => e.requestId === r.requestId);
              s = e >= 0 ? a.map((t, n) => (n === e ? r : t)) : [...a, r];
            }
            return {
              ...e,
              taskUiByTaskId: {
                ...e.taskUiByTaskId,
                [n]: { ...t, elicitationRequest: o, pendingElicitationRequests: s },
              },
            };
          },
          i,
        ),
      );
    },
    removeTaskElicitationRequest: (t, n, r, i) => {
      e((e) =>
        C(
          e,
          t,
          (e) => {
            let t = T(e, n),
              i = t.elicitationRequest,
              a = t.pendingElicitationRequests ?? [];
            if (i?.requestId === r) {
              let [r, ...i] = a;
              return {
                ...e,
                taskUiByTaskId: {
                  ...e.taskUiByTaskId,
                  [n]: { ...t, elicitationRequest: r ?? null, pendingElicitationRequests: i },
                },
              };
            }
            return {
              ...e,
              taskUiByTaskId: {
                ...e.taskUiByTaskId,
                [n]: { ...t, pendingElicitationRequests: a.filter((e) => e.requestId !== r) },
              },
            };
          },
          i,
        ),
      );
    },
    setTaskElicitationFormDraft: (t, n, r, i, a) => {
      e((e) =>
        C(
          e,
          t,
          (e) => {
            let t = T(e, n);
            return {
              ...e,
              taskUiByTaskId: {
                ...e.taskUiByTaskId,
                [n]: {
                  ...t,
                  elicitationFormDraftsByRequestId: {
                    ...t.elicitationFormDraftsByRequestId,
                    [r]: i,
                  },
                },
              },
            };
          },
          a,
        ),
      );
    },
    removeTaskElicitationFormDraft: (t, n, r, i) => {
      e((e) =>
        C(
          e,
          t,
          (e) => {
            let t = T(e, n);
            if (!(r in t.elicitationFormDraftsByRequestId)) return e;
            let i = { ...t.elicitationFormDraftsByRequestId };
            return (
              delete i[r],
              {
                ...e,
                taskUiByTaskId: {
                  ...e.taskUiByTaskId,
                  [n]: { ...t, elicitationFormDraftsByRequestId: i },
                },
              }
            );
          },
          i,
        ),
      );
    },
    setTaskError: (t, n, r, i) => {
      e((e) =>
        C(
          e,
          t,
          (e) => ({ ...e, taskUiByTaskId: { ...e.taskUiByTaskId, [n]: { ...T(e, n), error: r } } }),
          i,
        ),
      );
    },
    initializeBackgroundTaskRuntime: (t, n) => {
      e((e) =>
        C(
          e,
          t,
          (e) => {
            let t = e.optimisticTaskListByTaskId[n.task.taskId],
              r = t ? y(n.task, t) : n.task,
              i = w(e, n.task.taskId),
              a = e.taskListCache ?? [],
              s =
                e.taskListCache === null
                  ? e.taskListCache
                  : Ve([r, ...a.filter((e) => e.taskId !== n.task.taskId)]);
            return {
              ...e,
              selectedProvider: o(n.provider),
              optimisticTaskListByTaskId: { ...e.optimisticTaskListByTaskId, [n.task.taskId]: r },
              taskListCache: s,
              taskRuntimeByTaskId: {
                ...e.taskRuntimeByTaskId,
                [n.task.taskId]: {
                  ...i,
                  status: `streaming`,
                  error: null,
                  provider: n.provider,
                  activeInputId: n.activeInputId,
                },
              },
            };
          },
          n.workspaceIdentity ?? n.task.workspaceIdentity,
        ),
      );
    },
    upsertOptimisticTaskListItem: (t, n, r) => {
      e((e) =>
        C(
          e,
          t,
          (e) => {
            let t = e.optimisticTaskListByTaskId[n.taskId],
              r = t ? y(n, t) : n;
            return {
              ...e,
              optimisticTaskListByTaskId: { ...e.optimisticTaskListByTaskId, [n.taskId]: r },
            };
          },
          r ?? n.workspaceIdentity,
        ),
      );
    },
    removeOptimisticTaskListItem: (t, n, r) => {
      e((e) =>
        C(
          e,
          t,
          (e) => {
            let { [n]: t, ...r } = e.optimisticTaskListByTaskId;
            return { ...e, optimisticTaskListByTaskId: r };
          },
          r,
        ),
      );
    },
    removeTaskState: (t, n, r) => {
      (Re(t, n, r),
        e((e) => ({
          ...C(
            e,
            t,
            (e) => {
              let { [n]: t, ...r } = e.taskRuntimeByTaskId,
                { [n]: i, ...a } = e.taskUiByTaskId,
                { [n]: o, ...s } = e.taskConfigOptionsByTaskId,
                { [n]: c, ...l } = e.taskConfigOptionsStatusByTaskId,
                { [n]: u, ...d } = e.taskUnreadByTaskId,
                { [n]: f, ...p } = e.optimisticTaskListByTaskId,
                { [n]: m, ...h } = e.promotedGroupedDraftTaskByTaskId,
                g = e.activeTaskId === n;
              return {
                ...e,
                activeTaskId: g ? null : e.activeTaskId,
                draftRuntime: g ? { status: `idle`, error: null } : e.draftRuntime,
                taskRuntimeByTaskId: r,
                taskUiByTaskId: a,
                taskConfigOptionsByTaskId: s,
                taskConfigOptionsStatusByTaskId: l,
                taskUnreadByTaskId: d,
                optimisticTaskListByTaskId: p,
                promotedGroupedDraftTaskByTaskId: h,
              };
            },
            r,
          ),
          taskNavHistory: je(e.taskNavHistory, n),
        })));
    },
  };
}
var Ze = `zcode-last-agent-provider`;
function Qe() {
  if (typeof window > `u`) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function $e(e, t = Qe()) {
  t?.setItem(Ze, o(e));
}
var et = new Set([`zcode-anthropic`, `zcode-openai-compatible`]);
function tt(e) {
  let t = e.trim(),
    n = t.indexOf(`/`);
  if (n <= 0 || n >= t.length - 1) return null;
  let r = t.slice(0, n);
  if (!et.has(r)) return null;
  let i = t.slice(n + 1).trim();
  return i.length > 0 ? i : null;
}
function nt(e) {
  if (tt(e.value) || e.origin === `injected`) return !0;
  if (e.origin === `native`) return !1;
  let t = e.description?.trim().toLowerCase();
  return !!(t && t.startsWith(`custom model`));
}
function rt(e, t) {
  return n(e, t);
}
function D(e) {
  return i(e);
}
function it(e, t, n) {
  return e.filter((e) => !nt(e));
}
var O = `zcode-last-agent-model`,
  at = `zcode-last-agent-thought-level`,
  ot = `zcode-last-agent-config`,
  k = `__global__`,
  A = 1,
  st = `glm-5.2`,
  ct = /^glm-\d{4}(?:$|[^0-9a-z])/,
  lt = `max`,
  ut = new Set([`disabled`, `off`]);
function j() {
  if (typeof window > `u`) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function dt(e, t) {
  return t?.trim() || e;
}
function M(e, t, n) {
  return `${O}:${e}:${dt(t, n)}`;
}
function ft(e, t, n) {
  return l(e) ? `${O}:${e}:${k}` : M(e, t, n);
}
function pt(e) {
  return `${O}:${e}:${k}`;
}
function N(e) {
  return `${at}:${e}:${k}`;
}
function P(e) {
  return `${ot}:${e}:${k}`;
}
function F(e, t) {
  return `${O}:${e}:${t}`;
}
function mt(e) {
  return e.find((e) => e.category === `model` && e.type === `select`);
}
function ht(e) {
  return e.find((e) => e.category === `thought_level` && e.type === `select`);
}
function gt(e, t) {
  let n = e.trim();
  if (!n) return [];
  let r = D(n);
  if (r?.modelName) {
    let e = [r.modelName];
    if (t === `opencode` && r.providerId)
      try {
        e.push(c(r.providerId, r.modelName));
      } catch {}
    return e;
  }
  return [n];
}
function _t(e) {
  let t = e.trim();
  if (!t) return null;
  let n = D(t);
  if (!n) return t;
  if (!n.modelName) return null;
  let r = n.modelName.trim();
  return r.length > 0 ? r : null;
}
function vt(e, t) {
  if (e !== `glm` && e !== `codex` && e !== `claude` && e !== `gemini` && e !== `opencode`)
    return !1;
  let n = D(t.trim());
  return !!(n?.providerId && n.modelName?.trim().length);
}
function I(e) {
  let t = mt(e);
  return !t || typeof t.currentValue != `string` || t.currentValue.length === 0
    ? null
    : t.currentValue;
}
function yt(e) {
  let t = ht(e);
  return !t || typeof t.currentValue != `string` || t.currentValue.length === 0
    ? null
    : t.currentValue;
}
function bt(e) {
  if (!e) return null;
  try {
    let t = JSON.parse(e),
      n = typeof t.model == `string` ? t.model.trim() : ``,
      r = typeof t.thoughtLevel == `string` ? t.thoughtLevel.trim() : null;
    return t.schemaVersion !== A || !n
      ? null
      : { schemaVersion: A, model: n, thoughtLevel: r || null };
  } catch {
    return null;
  }
}
function xt(e, t) {
  return bt(t?.getItem(P(e)));
}
function St(e, t, n, r = j()) {
  if (l(e)) {
    let i = pt(e);
    return (
      r?.getItem(i)?.trim() || r?.getItem(M(e, t, n))?.trim() || r?.getItem(F(e, t))?.trim() || null
    );
  }
  let i = n?.trim();
  if (i) {
    let n = r?.getItem(ft(e, t, i));
    if (n) return n;
  }
  return r?.getItem(F(e, t)) || null;
}
function Ct(e, t, n, r) {
  (r?.removeItem?.(pt(e)),
    r?.removeItem?.(M(e, t, n)),
    r?.removeItem?.(F(e, t)),
    r?.removeItem?.(N(e)));
}
function L(e, t, n, r, i = j()) {
  let a = n.model.trim();
  if (a) {
    if (l(e)) {
      let o = n.thoughtLevel?.trim() || null;
      (i?.setItem(P(e), JSON.stringify({ schemaVersion: A, model: a, thoughtLevel: o })),
        Ct(e, t, r, i));
      return;
    }
    i?.setItem(ft(e, t, r), a);
  }
}
function wt(e, t, n, r, i, a = j()) {
  let o = R(e, t, i, a);
  return !o || o.model !== n.model || o.thoughtLevel !== n.thoughtLevel
    ? !1
    : (L(e, t, r, i, a), !0);
}
function R(e, t, n, r = j()) {
  if (!l(e)) {
    let i = St(e, t, n, r);
    return i ? { schemaVersion: A, model: i, thoughtLevel: null } : null;
  }
  let i = xt(e, r);
  if (i) return i;
  let a = St(e, t, n, r),
    o = r?.getItem(N(e))?.trim();
  if (!a) return (r?.removeItem?.(N(e)), null);
  let s = { schemaVersion: A, model: a, thoughtLevel: o || null };
  return (L(e, t, s, n, r), s);
}
function Tt(e, t, n, r = j()) {
  return R(e, t, n, r)?.model ?? null;
}
function Et(e, t, n, r, i = j()) {
  let a = n.trim();
  if (!a) return;
  let o = l(e) ? R(e, t, r, i) : null;
  L(e, t, { model: a, thoughtLevel: o?.model === a ? o.thoughtLevel : null }, r, i);
}
function Dt(e, t, n, r = j()) {
  l(e) && (r?.removeItem?.(P(e)), r?.removeItem?.(pt(e)), r?.removeItem?.(N(e)));
  let i = n?.trim();
  (i && r?.removeItem?.(M(e, t, i)), r?.removeItem?.(F(e, t)));
}
function Ot(e, t, n) {
  let r = gt(t, n);
  if (r.length === 0) return [...e];
  let i = vt(n, t),
    a = !1,
    o = e.map((e) =>
      e.category !== `model` ||
      e.type !== `select` ||
      (!e.options?.some((e) => r.includes(e.value)) && !i) ||
      e.currentValue === t
        ? e
        : ((a = !0), { ...e, currentValue: t }),
    );
  return a ? o : [...e];
}
function z(e, t) {
  let n = t?.trim() ?? ``;
  return n ? !!ht(e)?.options?.some((e) => e.value === n) : !1;
}
function kt(e, t) {
  let n = t?.trim() ?? ``;
  if (!z(e, n)) return [...e];
  let r = !1,
    i = e.map((e) =>
      e.category !== `thought_level` || e.type !== `select` || e.currentValue === n
        ? e
        : ((r = !0), { ...e, currentValue: n }),
    );
  return r ? i : [...e];
}
function At(e, t) {
  return Mt(e, t) ?? t;
}
function jt(e) {
  return !Pt(e) || !z(e, lt) ? null : lt;
}
function Mt(e, t) {
  return Nt(t) ? jt(e) : null;
}
function Nt(e) {
  return ut.has(e?.trim().toLowerCase() ?? ``);
}
function Pt(e) {
  let t = I(e);
  return t ? B(t).some((e) => e.startsWith(st) || ct.test(e)) : !1;
}
function B(e) {
  let t = _t(e)?.toLowerCase();
  if (!t) return [];
  let n = t.split(`/`).filter(Boolean).at(-1);
  return !n || n === t ? [t] : [t, n];
}
function Ft(e, t, n, r, i = j()) {
  let a = R(e, t, r, i);
  if (!a) return [...n];
  let o = Ot(n, a.model, e);
  return I(o) === a.model ? kt(o, At(o, a.thoughtLevel)) : o;
}
function It(e) {
  return e.find((e) => e.category === `mode` && e.type === `select`) ?? null;
}
function Lt(e) {
  let t = It(e);
  if (typeof t?.currentValue != `string`) return null;
  let n = t.currentValue.trim();
  return n.length > 0 ? n : null;
}
var Rt = new Map();
function V(e) {
  if (typeof e != `string`) return null;
  let t = e.trim();
  return t.length > 0 ? t : null;
}
function zt(e, t) {
  return e?.find((e) => e.category === t && e.type === `select`) ?? null;
}
function Bt(e, t) {
  return V(zt(e, t)?.currentValue);
}
function Vt(e, t) {
  let n = new Set(B(t));
  return B(e).some((e) => n.has(e));
}
function Ht(e, t) {
  let n = b(e, t),
    r = Rt.get(n);
  return r ? (r.expiresAt <= Date.now() ? (Rt.delete(n), null) : r) : null;
}
function Ut(e, t) {
  return (
    e.find((e) => e.type === `select` && e.id === t.id && e.category === t.category) ??
    e.find((e) => e.type === `select` && e.category === t.category) ??
    null
  );
}
function Wt(e, t) {
  return !!e.options?.some((e) => e.value === t);
}
function Gt(e, t) {
  return e.category === `model` ? !0 : Wt(e, t);
}
function Kt(e) {
  let t = V(e.currentOption.currentValue),
    n = V(e.nextOption.currentValue);
  return !t || !Vt(t, e.guard.model) ? !1 : !n || !Vt(n, e.guard.model);
}
function qt(e) {
  let t = V(e.currentOption.currentValue);
  return !t || !Gt(e.currentOption, t) || Wt(e.nextOption, t) ? e.nextOption : e.currentOption;
}
function Jt(e) {
  let t = Ht(e.workspacePath, e.workspaceIdentity);
  if (!t) return [...e.nextOptions];
  let n = Bt(e.currentOptions, `model`);
  if (!n || !Vt(n, t.model)) return [...e.nextOptions];
  let r = e.currentOptions ?? [],
    i = !1,
    a = e.nextOptions.map((e) => {
      if (e.type !== `select`) return e;
      let n = Ut(r, e);
      if (!n) return e;
      if (e.category === `model`)
        return Kt({ guard: t, currentOption: n, nextOption: e }) ? ((i = !0), n) : e;
      if (t.stage !== `authoritativeConfig`) return e;
      let a = qt({ currentOption: n, nextOption: e });
      return (a !== e && (i = !0), a);
    });
  for (let e of r) {
    if (
      e.type !== `select` ||
      e.category === `model` ||
      t.stage !== `authoritativeConfig` ||
      a.some((t) => t.type === `select` && t.id === e.id && t.category === e.category)
    )
      continue;
    let n = V(e.currentValue);
    !n || !Gt(e, n) || ((i = !0), a.push(e));
  }
  return i ? a : [...e.nextOptions];
}
function Yt(e) {
  let t = e.trim(),
    n = t.indexOf(`/`);
  if (n <= 0 || n >= t.length - 1) return null;
  let r = t.slice(0, n).trim(),
    i = t.slice(n + 1).trim();
  return !r || !i ? null : { providerId: r, modelName: i };
}
function Xt(e) {
  return e.trim().toLocaleLowerCase() === `<synthetic>`;
}
function Zt(e) {
  let t = e?.trim();
  if (!t || Xt(t)) return null;
  let n = D(t);
  if (n?.providerId && n.modelName) return t;
  let r = Yt(t);
  return r ? rt(r.providerId, r.modelName) : t;
}
function Qt(e) {
  let t = e.model?.trim();
  return !t || Xt(t) ? null : e.provider === `glm` ? Zt(t) : t;
}
function $t(e) {
  let t = D(e),
    n = Yt(e);
  return t?.modelName?.trim() || n?.modelName || e;
}
function en(e, t) {
  let n = e.options ?? [],
    r = n.some((e) => e.value === t);
  return r && e.currentValue === t
    ? e
    : { ...e, currentValue: t, options: r ? n : [...n, { name: $t(t), value: t }] };
}
function tn(e) {
  return {
    category: `model`,
    currentValue: e,
    id: `model`,
    name: `Model`,
    options: [{ name: $t(e), value: e }],
    type: `select`,
  };
}
function nn(e) {
  return {
    category: `mode`,
    currentValue: e,
    id: `mode`,
    name: `Mode`,
    options: a(),
    type: `select`,
  };
}
function rn(e) {
  return {
    category: `thought_level`,
    currentValue: e,
    id: `thought_level`,
    name: `Effort`,
    options: [{ name: e, value: e }],
    type: `select`,
  };
}
function an(e, t) {
  let n = e.options ?? [],
    r = n.some((e) => e.value === t);
  return r && e.currentValue === t
    ? e
    : { ...e, currentValue: t, options: r ? n : [...n, { name: t, value: t }] };
}
function on({ taskMeta: e, configOptions: t }) {
  let n = Qt(e);
  if (!n) return null;
  let r = !1,
    i = !1,
    a = t.map((e) => {
      if (e.category !== `model` || e.type !== `select`) return e;
      r = !0;
      let t = en(e, n);
      return ((i ||= t !== e), t);
    });
  return r ? (i ? a : null) : [tn(n), ...a];
}
function sn({ taskMeta: e, cachedTaskConfigOptions: t }) {
  let n = [...(t ?? [])],
    r = on({ taskMeta: e, configOptions: n });
  r && (n = r);
  let i = e.mode?.trim();
  if (e.provider === `glm` && i) {
    let e = !1;
    ((n = n.map((t) => (t.category !== `mode` || t.type !== `select` ? t : ((e = !0), an(t, i))))),
      e || (n = [nn(i), ...n]));
  }
  let a = e.thoughtLevel?.trim();
  if (e.provider === `glm` && a) {
    let e = !1;
    ((n = n.map((t) =>
      t.category !== `thought_level` || t.type !== `select` ? t : ((e = !0), an(t, a)),
    )),
      e || (n = [...n, rn(a)]));
  }
  return n;
}
var cn = 0;
function ln(e) {
  return ((cn += 1), `grouped-draft-${e}-${cn}`);
}
function un(e) {
  if (e.type !== `select` || (e.id !== `thought_level` && e.category !== `thought_level`)) return e;
  let t = typeof e.currentValue == `string` ? e.currentValue : ``;
  if (e.options?.some((e) => e.value === t)) return e;
  let n = e.options?.[0]?.value;
  return n ? { ...e, currentValue: n } : e;
}
function H(e) {
  return e.map(un);
}
function dn(e) {
  return e.map((e) => ({ ...e, options: e.options?.map((e) => ({ ...e })) }));
}
function fn(e, t) {
  return e.type === t.type
    ? e.type === `top`
      ? !0
      : t.type === `group` && e.groupId === t.groupId
    : !1;
}
function pn(e) {
  return e.category === `mode` && e.type === `select`;
}
function mn(e) {
  let t = e.options?.length ? e.options : [{ value: e.currentModeId, name: e.currentModeId }];
  return {
    id: `mode`,
    name: `Mode`,
    category: `mode`,
    type: `select`,
    currentValue: e.currentModeId,
    options: t,
  };
}
function U(e, t) {
  let n = e ?? [],
    r = n.findIndex(pn);
  return r === -1
    ? t
      ? H([...n, t])
      : e
    : H(t ? [...n.slice(0, r), t, ...n.slice(r + 1)] : [...n.slice(0, r), ...n.slice(r + 1)]);
}
function hn(e, t) {
  let n = (e ?? []).find(pn);
  return t
    ? n
      ? U(e, { ...n, currentValue: t })
      : U(e, mn({ currentModeId: t }))
    : n
      ? (n.options?.length ?? 0) === 0
        ? U(e, null)
        : U(e, { ...n, currentValue: `` })
      : e;
}
function gn(e, t) {
  let n = e.activeTaskId;
  if (!n) return null;
  let r = e.taskConfigOptionsByTaskId[n];
  if (!r) return null;
  let i = t(r);
  return i === r || !i
    ? null
    : { taskConfigOptionsByTaskId: { ...e.taskConfigOptionsByTaskId, [n]: i } };
}
function _n(e, t) {
  let n = e.taskConfigOptionsByTaskId[t];
  if (n) return { configOptions: n, status: e.taskConfigOptionsStatusByTaskId[t] ?? `ready` };
  let r = E(e, t),
    i = H(
      sn({
        taskMeta: {
          provider: r?.provider ?? e.selectedProvider,
          model: r?.model,
          mode: r?.mode,
          thoughtLevel: r?.thoughtLevel,
        },
      }),
    );
  return i.length === 0 ? null : { configOptions: i, status: `loading` };
}
function vn(e) {
  return {
    setActiveTaskId: (t, n, r) => {
      e((e) => {
        let i = C(
            e,
            t,
            (e) => {
              let { [n ?? ``]: t, ...r } = e.taskUnreadByTaskId,
                i = n ? e.optimisticTaskListByTaskId[n] : void 0,
                a =
                  n && typeof i?.unreadAt == `number`
                    ? { ...e.optimisticTaskListByTaskId, [n]: { ...i, unreadAt: void 0 } }
                    : e.optimisticTaskListByTaskId,
                o = n,
                s = o ? _n(e, o) : null,
                c = {
                  ...e,
                  taskUnreadByTaskId: r,
                  optimisticTaskListByTaskId: a,
                  activeTaskId: n,
                  groupedDraftTask: n ? null : e.groupedDraftTask,
                };
              return o && s
                ? {
                    ...c,
                    taskConfigOptionsByTaskId: {
                      ...e.taskConfigOptionsByTaskId,
                      [o]: s.configOptions,
                    },
                    taskConfigOptionsStatusByTaskId: {
                      ...e.taskConfigOptionsStatusByTaskId,
                      [o]: s.status,
                    },
                  }
                : c;
            },
            r,
          ),
          a = n ? { taskNavHistory: Te(e.taskNavHistory, t, n, r) } : {};
        return { ...i, ...a };
      });
    },
    promoteGroupedDraftTask: (t, n, r, i) => {
      e((e) =>
        C(
          e,
          t,
          (e) => {
            let a = {
              taskId: n,
              traceId: `session-${n}`,
              title: ``,
              workspacePath: t,
              ...(i ? { workspaceIdentity: i } : {}),
              createdAt: r.createdAt,
              updatedAt: 0,
              mode: `default`,
              provider: e.selectedProvider,
            };
            return {
              ...e,
              groupedDraftTask:
                e.groupedDraftTask?.draftId === r.draftId ? null : e.groupedDraftTask,
              optimisticTaskListByTaskId: {
                ...e.optimisticTaskListByTaskId,
                [n]: e.optimisticTaskListByTaskId[n] ?? a,
              },
              promotedGroupedDraftTaskByTaskId: { ...e.promotedGroupedDraftTaskByTaskId, [n]: r },
            };
          },
          i,
        ),
      );
    },
    clearPromotedGroupedDraftTask: (t, n, r) => {
      e((e) =>
        C(
          e,
          t,
          (e) => {
            if (!e.promotedGroupedDraftTaskByTaskId[n]) return e;
            let { [n]: t, ...r } = e.promotedGroupedDraftTaskByTaskId;
            return { ...e, promotedGroupedDraftTaskByTaskId: r };
          },
          r,
        ),
      );
    },
    setDraftSessionId: (t, n, r) => {
      e((e) => C(e, t, (e) => (e.draftSessionId === n ? e : { ...e, draftSessionId: n }), r));
    },
    invalidateDraftRuntime: (t, n) => {
      e((e) =>
        C(
          e,
          t,
          (e) => ({
            ...e,
            draftRuntimeInvalidationVersion: e.draftRuntimeInvalidationVersion + 1,
            draftSessionId: null,
          }),
          n,
        ),
      );
    },
    requestComposerTextInsert: (t, n, r, i) => {
      e((e) =>
        C(
          e,
          t,
          (e) => {
            let t = e.composerTextInsertVersion + 1;
            return {
              ...e,
              composerTextInsertVersion: t,
              composerTextInsertRequest: { requestId: t, text: n, ...(i ? { mention: i } : {}) },
            };
          },
          r,
        ),
      );
    },
    clearComposerTextInsertRequest: (t, n, r) => {
      e((e) =>
        C(
          e,
          t,
          (e) =>
            e.composerTextInsertRequest?.requestId === n
              ? { ...e, composerTextInsertRequest: null }
              : e,
          r,
        ),
      );
    },
    startDraft: (t, n, i, a) => {
      let s = n ? o(n) : void 0;
      (s && $e(s),
        e((e) =>
          C(
            e,
            t,
            (e) => {
              let n = o(s ?? e.selectedProvider),
                c = !!s && n !== e.selectedProvider,
                l = e.activeTaskId !== null || c,
                u = e.activeTaskId !== null && !c ? e.activeTaskId : null,
                d = u ? e.taskConfigOptionsByTaskId[u] : null,
                f = d && d.length > 0 ? dn(d) : null,
                p = f ? I(f) : null,
                m = f ? Lt(f) : null,
                h = f ? yt(f) : null,
                g =
                  e.activeTaskId && f
                    ? (e.taskConfigOptionsStatusByTaskId[e.activeTaskId] ?? `ready`)
                    : e.configOptionsStatus,
                _ = (() => {
                  let n = a?.groupedDraftPlacement;
                  if (!n) return null;
                  if (
                    e.activeTaskId === null &&
                    e.groupedDraftTask &&
                    fn(e.groupedDraftTask.placement, n)
                  )
                    return e.groupedDraftTask;
                  if (e.activeTaskId === null && e.groupedDraftTask)
                    return {
                      ...e.groupedDraftTask,
                      workspacePath: t,
                      ...(i ? { workspaceIdentity: i } : {}),
                      placement: n,
                    };
                  let r = Date.now();
                  return {
                    draftId: ln(r),
                    workspacePath: t,
                    ...(i ? { workspaceIdentity: i } : {}),
                    placement: n,
                    createdAt: r,
                  };
                })();
              return {
                ...e,
                activeTaskId: null,
                groupedDraftTask: _,
                draftRuntime: { status: `idle`, error: null },
                ...(f
                  ? {
                      configOptions: f,
                      configOptionsStatus: g,
                      draftPreferredModel: p,
                      draftPreferredMode: m,
                      draftPreferredThoughtLevel: h,
                      draftSessionId: null,
                    }
                  : {
                      draftPreferredModel: null,
                      draftPreferredMode: null,
                      draftPreferredThoughtLevel: null,
                    }),
                draftError: null,
                modelSwitchRequestId: null,
                modelSwitchPending: !1,
                modelSwitchStage: `idle`,
                draftFocusVersion: e.draftFocusVersion + 1,
                optimisticMessages: [],
                ...(l ? { slashCommands: [] } : {}),
                ...(s ? { selectedProvider: n } : {}),
                ...(c
                  ? { selectedSupplierKey: r(n), isGhostSupplier: !1, supplierMismatchReason: null }
                  : {}),
              };
            },
            i,
          ),
        ));
    },
    clearGroupedDraftTask: (t, n) => {
      e((e) => C(e, t, (e) => (e.groupedDraftTask ? { ...e, groupedDraftTask: null } : e), n));
    },
    bindRuntimeProvider: (t, n, r) =>
      e((e) => C(e, t, (e) => ({ ...e, selectedProvider: o(n) }), r)),
    setModelSelectionResolution: (t, n, r) => {
      e((e) =>
        C(
          e,
          t,
          (e) => ({
            ...e,
            selectedSupplierKey: n.selectedSupplierKey,
            isGhostSupplier: n.isGhostSupplier,
            supplierMismatchReason: n.supplierMismatchReason,
          }),
          r,
        ),
      );
    },
    setWorkspaceInitState: (t, n, r, i) => {
      e((e) =>
        C(e, t, (e) => ({ ...e, workspaceInit: { ...ve(e), status: n, error: r ?? null } }), i),
      );
    },
    setWorkspaceInitAttempts: (t, n, r) => {
      e((e) => C(e, t, (e) => ({ ...e, workspaceInit: { ...ve(e), attempts: n } }), r));
    },
    setTaskState: (t, n, r, i) => {
      e((e) => C(e, t, (e) => ({ ...e, draftRuntime: { status: n, error: r ?? null } }), i));
    },
    setDraftError: (t, n, r) => {
      e((e) => C(e, t, (e) => ({ ...e, draftError: n }), r));
    },
    startModelSwitch: (t, n, r = `settingModel`, i, a) => {
      e((e) =>
        C(
          e,
          t,
          (e) => ({
            ...e,
            modelSwitchRequestId: n,
            modelSwitchPending: a?.pending ?? !0,
            modelSwitchStage: r,
          }),
          i,
        ),
      );
    },
    updateModelSwitchStage: (t, n, r, i) => {
      e((e) =>
        C(e, t, (e) => (e.modelSwitchRequestId === n ? { ...e, modelSwitchStage: r } : e), i),
      );
    },
    finishModelSwitch: (t, n, r) => {
      e((e) =>
        C(
          e,
          t,
          (e) =>
            e.modelSwitchRequestId === n
              ? {
                  ...e,
                  modelSwitchRequestId: null,
                  modelSwitchPending: !1,
                  modelSwitchStage: `idle`,
                }
              : e,
          r,
        ),
      );
    },
    setConfigOptions: (t, n, r) => {
      e((e) => {
        let i = S(e, t, r),
          a = Jt({
            workspacePath: t,
            workspaceIdentity: r,
            currentOptions: i.configOptions,
            nextOptions: H(n),
          }),
          o = (e) =>
            String(
              e?.find((e) => e.category === `model` && e.type === `select`)?.currentValue ?? ``,
            ),
          s = Be(i.configOptions, a);
        return (
          u.info(`[store] setConfigOptions`, {
            workspacePath: t,
            currentModelValue: o(i.configOptions),
            incomingModelValue: o(n),
            normalizedModelValue: o(a),
            skippedAsEquivalent: s,
          }),
          s
            ? e
            : C(
                e,
                t,
                (e) => ({
                  ...e,
                  configOptions: a,
                  draftPreferredModel: null,
                  draftPreferredMode: null,
                  draftPreferredThoughtLevel: null,
                }),
                r,
              )
        );
      });
    },
    setConfigOptionsStatus: (t, n, r) => {
      e((e) => C(e, t, (e) => ({ ...e, configOptionsStatus: n }), r));
    },
    setSlashCommands: (t, n, r) => {
      e((e) => C(e, t, (e) => ({ ...e, slashCommands: n }), r));
    },
    setCurrentModeId: (t, n, r) => {
      e((e) =>
        C(
          e,
          t,
          (e) => {
            let t = hn(e.configOptions, n),
              r = gn(e, (e) => hn(e, n));
            return t === e.configOptions && !r ? e : { ...e, configOptions: t, ...r };
          },
          r,
        ),
      );
    },
    bumpTaskListVersion: (t, n) => {
      e((e) => C(e, t, (e) => ({ ...e, taskListVersion: e.taskListVersion + 1 }), n));
    },
    setTaskListCache: (t, n, r) => {
      e((e) =>
        C(e, t, (e) => ({ ...e, taskListCache: n, taskUnreadByTaskId: e.taskUnreadByTaskId }), r),
      );
    },
    setTaskUnreadIndicator: (t, n, r, i) => {
      e((e) =>
        C(
          e,
          t,
          (e) => {
            let t = e.optimisticTaskListByTaskId[n],
              i = e.taskListCache?.find((e) => e.taskId === n),
              a = t ?? i,
              o = e.taskUnreadByTaskId[n] === !0,
              s = t?.unreadAt ?? i?.unreadAt;
            if (r) {
              let t = a?.unreadAt ?? Date.now();
              if (o && s === t) return e;
              let r = a
                ? { ...e.optimisticTaskListByTaskId, [n]: { ...a, unreadAt: t } }
                : e.optimisticTaskListByTaskId;
              return {
                ...e,
                optimisticTaskListByTaskId: r,
                taskUnreadByTaskId: { ...e.taskUnreadByTaskId, [n]: !0 },
              };
            }
            if (!o && s === void 0) return e;
            let { [n]: c, ...l } = e.taskUnreadByTaskId,
              u = a
                ? { ...e.optimisticTaskListByTaskId, [n]: { ...a, unreadAt: void 0 } }
                : e.optimisticTaskListByTaskId;
            return { ...e, optimisticTaskListByTaskId: u, taskUnreadByTaskId: l };
          },
          i,
        ),
      );
    },
  };
}
var yn = _()((e, t) => ({
  workspaces: {},
  ...Me(e, t),
  ...vn(e),
  ...Xe(e),
  getWorkspaceState: (e, n) => S(t(), e, n),
}));
v() && (window.__zcodeSessionStoreE2E = yn);
var bn = 1280,
  xn = 800,
  Sn = `#111827`,
  Cn = `zcode:add-whiteboard-to-chat`,
  wn = `#ffffff`;
function W({ workspacePath: e, workspaceIdentity: t }) {
  return t?.trim() || e;
}
function Tn(e) {
  let t = Date.now();
  return {
    id: `whiteboard:${s()}`,
    name: En(e.existingNames, e.defaultNamePrefix),
    width: bn,
    height: xn,
    strokes: [],
    undoneStrokes: [],
    createdAt: t,
    updatedAt: t,
  };
}
function En(e, t) {
  let n = t.trim() || `Whiteboard`,
    r = new Set(e.map((e) => e.trim())),
    i = 1;
  for (; r.has(`${n} ${i}`);) i += 1;
  return `${n} ${i}`;
}
function Dn(e) {
  return { id: `stroke:${s()}`, tool: e.tool, color: e.color, width: e.width, points: e.points };
}
function On(e, t, n = {}) {
  let r = n.scale ?? 1,
    i = n.backgroundColor ?? wn;
  (e.save(),
    e.setTransform(r, 0, 0, r, 0, 0),
    e.clearRect(0, 0, t.width, t.height),
    (e.fillStyle = i),
    e.fillRect(0, 0, t.width, t.height));
  for (let r of [...t.strokes, ...(n.draftStroke ? [n.draftStroke] : [])]) kn(e, r, i);
  e.restore();
}
function kn(e, t, n) {
  let r = t.points[0];
  if (r) {
    if (
      (e.save(),
      (e.globalCompositeOperation = `source-over`),
      (e.strokeStyle = t.tool === `eraser` ? n : t.color),
      (e.fillStyle = t.tool === `eraser` ? n : t.color),
      (e.lineWidth = t.width),
      (e.lineCap = `round`),
      (e.lineJoin = `round`),
      t.points.length === 1)
    ) {
      (e.beginPath(), e.arc(r.x, r.y, t.width / 2, 0, Math.PI * 2), e.fill(), e.restore());
      return;
    }
    (e.beginPath(), e.moveTo(r.x, r.y));
    for (let n of t.points.slice(1)) e.lineTo(n.x, n.y);
    (e.stroke(), e.restore());
  }
}
function An(e) {
  let t = document.createElement(`canvas`);
  ((t.width = e.width), (t.height = e.height));
  let n = t.getContext(`2d`);
  if (!n) throw Error(`Canvas context is unavailable.`);
  return (On(n, e), t.toDataURL(`image/png`));
}
function jn(e) {
  let t = An(e),
    n = t.indexOf(`,`);
  if (n === -1) throw Error(`Whiteboard image data is invalid.`);
  let r = atob(t.slice(n + 1)),
    i = new Uint8Array(r.length);
  for (let e = 0; e < r.length; e += 1) i[e] = r.charCodeAt(e);
  return new File([i], `${Pn(e.name)}.png`, { type: `image/png` });
}
function Mn(e) {
  return (
    e.type === `zcode:add-whiteboard-to-chat` &&
    typeof CustomEvent < `u` &&
    e instanceof CustomEvent &&
    Fn(e.detail)
  );
}
function Nn(e) {
  if (typeof window > `u`) return !1;
  let t = new CustomEvent(Cn, { cancelable: !0, detail: e });
  return !window.dispatchEvent(t);
}
function Pn(e) {
  return (
    Array.from(e.trim().replace(/[<>:"/\\|?*]+/gu, `-`))
      .filter((e) => e.charCodeAt(0) >= 32)
      .join(``)
      .replace(/^\.+|\.+$/gu, ``) || `whiteboard`
  );
}
function Fn(e) {
  if (typeof e != `object` || !e) return !1;
  let t = e;
  return (
    typeof t.workspacePath == `string` &&
    t.workspacePath.length > 0 &&
    typeof t.boardId == `string` &&
    t.boardId.length > 0 &&
    (t.workspaceIdentity === void 0 || typeof t.workspaceIdentity == `string`)
  );
}
function G(e, t) {
  return e.workspaces[t] ?? { boardIds: [], boardsById: {} };
}
function K(e, t) {
  let n = W(t),
    r = G(e, n),
    i = r.boardsById[t.boardId];
  return i
    ? {
        workspaces: {
          ...e.workspaces,
          [n]: { ...r, boardsById: { ...r.boardsById, [t.boardId]: t.updater(i) } },
        },
      }
    : { workspaces: e.workspaces };
}
var In = _()((e, t) => ({
  workspaces: {},
  createBoard: (n) => {
    let r = W(n),
      i = G(t(), r),
      a = Tn({
        defaultNamePrefix: n.defaultNamePrefix,
        existingNames: i.boardIds.map((e) => i.boardsById[e]?.name ?? ``),
      });
    return (
      e((e) => {
        let t = G(e, r);
        return {
          workspaces: {
            ...e.workspaces,
            [r]: { boardIds: [...t.boardIds, a.id], boardsById: { ...t.boardsById, [a.id]: a } },
          },
        };
      }),
      a
    );
  },
  renameBoard: (t) => {
    let n = t.name.trim();
    n && e((e) => K(e, { ...t, updater: (e) => ({ ...e, name: n, updatedAt: Date.now() }) }));
  },
  addStroke: (t) => {
    e((e) =>
      K(e, {
        ...t,
        updater: (e) => ({
          ...e,
          strokes: [...e.strokes, t.stroke],
          undoneStrokes: [],
          updatedAt: Date.now(),
        }),
      }),
    );
  },
  undoStroke: (t) => {
    e((e) =>
      K(e, {
        ...t,
        updater: (e) => {
          let t = e.strokes.at(-1);
          return t
            ? {
                ...e,
                strokes: e.strokes.slice(0, -1),
                undoneStrokes: [...e.undoneStrokes, t],
                updatedAt: Date.now(),
              }
            : e;
        },
      }),
    );
  },
  redoStroke: (t) => {
    e((e) =>
      K(e, {
        ...t,
        updater: (e) => {
          let t = e.undoneStrokes.at(-1);
          return t
            ? {
                ...e,
                strokes: [...e.strokes, t],
                undoneStrokes: e.undoneStrokes.slice(0, -1),
                updatedAt: Date.now(),
              }
            : e;
        },
      }),
    );
  },
  clearBoard: (t) => {
    e((e) =>
      K(e, {
        ...t,
        updater: (e) => ({ ...e, strokes: [], undoneStrokes: [], updatedAt: Date.now() }),
      }),
    );
  },
  getBoard: (e) => {
    let n = W(e);
    return t().workspaces[n]?.boardsById[e.boardId] ?? null;
  },
}));
v() && (window.__whiteboardStoreE2E = In);
var q = new Map(),
  J = new Map(),
  Ln = 0;
function Y(e, t, n) {
  return `${n?.trim() || e}::${o(t)}`;
}
function X(e, t, n) {
  return { contexts: { ...e.contexts, [t]: n } };
}
function Rn(e, t, n, r, i, a = !1) {
  if (!a) {
    let t = q.get(e);
    if (t) return t;
  }
  let o = r.list({ workspacePath: t, workspaceIdentity: i, provider: n }).finally(() => {
    q.get(e) === o && q.delete(e);
  });
  return (q.set(e, o), o);
}
async function zn(e, t, n) {
  let r = o(e.provider),
    i = e.workspaceIdentity?.trim() || void 0,
    a = Y(e.workspacePath, r, i),
    s = n().contexts[a],
    c = ++Ln;
  (J.set(a, c),
    t((t) =>
      X(t, a, {
        workspacePath: e.workspacePath,
        workspaceIdentity: i ?? null,
        provider: r,
        agents: s?.agents ?? [],
        capability: s?.capability ?? null,
        loading: s?.loaded !== !0,
        loaded: s?.loaded ?? !1,
        error: null,
      }),
    ));
  try {
    let n = await Rn(a, e.workspacePath, r, e.subagentsService, i, e.bypassCache);
    if (J.get(a) !== c) return;
    t((t) =>
      X(t, a, {
        workspacePath: e.workspacePath,
        workspaceIdentity: i ?? null,
        provider: r,
        agents: n.agents,
        capability: n.capability,
        loading: !1,
        loaded: !0,
        error: null,
      }),
    );
  } catch (n) {
    if (J.get(a) !== c) return;
    let o = n instanceof Error ? n.message : String(n);
    (u.error(`[subagents] workspace context load failed`, {
      workspacePath: e.workspacePath,
      workspaceIdentity: i,
      provider: r,
      error: o,
    }),
      t((t) =>
        X(t, a, {
          ...(t.contexts[a] ?? {
            workspacePath: e.workspacePath,
            workspaceIdentity: i ?? null,
            provider: r,
            agents: [],
            capability: null,
            loaded: !1,
          }),
          loading: !1,
          error: o,
        }),
      ));
  }
}
var Bn = _((e, t) => ({
    contexts: {},
    async initialize(n, r, i, a) {
      let o = Y(n, r, a);
      t().contexts[o] ||
        (await zn(
          {
            workspacePath: n,
            provider: r,
            subagentsService: i,
            workspaceIdentity: a,
            bypassCache: !1,
          },
          e,
          t,
        ));
    },
    async refresh(n, r, i, a) {
      await zn(
        {
          workspacePath: n,
          provider: r,
          subagentsService: i,
          workspaceIdentity: a,
          bypassCache: !0,
        },
        e,
        t,
      );
    },
    async setEnabled(n, r, i, a, o, s) {
      try {
        (await o.setEnabled({ agentId: i, enabled: a }), await t().refresh(n, r, o, s));
      } catch (t) {
        let i = Y(n, r, s),
          a = t instanceof Error ? t.message : String(t);
        e((e) => {
          let t = e.contexts[i];
          return t ? X(e, i, { ...t, loading: !1, error: a }) : {};
        });
      }
    },
  })),
  Z = new Map(),
  Vn = 0;
function Hn(e, t, n) {
  return `${n?.trim() || e}::${t}`;
}
function Un(e, t, n, r, i = {}) {
  let a = Hn(e, t, r);
  if (!i.bypassCache) {
    let e = Z.get(a);
    if (e) return e;
  }
  let o = n.list({ workspacePath: e, workspaceIdentity: r, provider: t }).finally(() => {
    Z.get(a) === o && Z.delete(a);
  });
  return (Z.set(a, o), o);
}
function Wn() {
  return ((Vn += 1), Vn);
}
function Q(e) {
  return e === Vn;
}
var Gn = _((e, t) => ({
  workspacePath: null,
  workspaceIdentity: null,
  loadedWorkspacePath: null,
  loadedWorkspaceIdentity: null,
  provider: `glm`,
  loadedProvider: null,
  agents: [],
  capability: null,
  loading: !1,
  error: null,
  operatingAgentId: null,
  async initialize(n, r, i, a) {
    let s = t(),
      c = typeof r == `string`,
      l = o(c ? r : `glm`),
      d = c ? i : r,
      f = a?.trim() || null;
    if (!d) {
      e({
        workspacePath: n,
        workspaceIdentity: f,
        provider: l,
        loading: !1,
        error: `subagentsService is required`,
        loadedWorkspacePath: n,
        loadedWorkspaceIdentity: f,
        loadedProvider: l,
      });
      return;
    }
    let p =
      s.agents.length > 0 &&
      s.loadedWorkspacePath === n &&
      s.loadedWorkspaceIdentity === f &&
      s.loadedProvider === l;
    e({
      workspacePath: n,
      workspaceIdentity: f,
      provider: l,
      agents: p ? s.agents : [],
      capability: p ? s.capability : null,
      loading: !p,
      error: null,
    });
    let m = Wn();
    try {
      let t = await Un(n, l, d, f ?? void 0);
      if (!Q(m)) return;
      e({
        agents: t.agents,
        capability: t.capability,
        loading: !1,
        loadedWorkspacePath: n,
        loadedWorkspaceIdentity: f,
        loadedProvider: l,
      });
    } catch (t) {
      if (!Q(m)) return;
      (u.error(`[subagents] initialize failed`, {
        workspacePath: n,
        provider: l,
        error: t instanceof Error ? t.message : String(t),
      }),
        e({
          loading: !1,
          error: t instanceof Error ? t.message : String(t),
          loadedWorkspacePath: n,
          loadedWorkspaceIdentity: f,
          loadedProvider: l,
        }));
    }
  },
  async refresh(n, r) {
    let i = t().workspacePath;
    if (!i) return;
    let a = r?.trim() || t().workspaceIdentity || void 0,
      s = o(t().provider);
    e({ loading: !(t().agents.length > 0), error: null });
    let c = Wn();
    try {
      let t = await Un(i, s, n, a, { bypassCache: !0 });
      if (!Q(c)) return;
      e({
        agents: t.agents,
        capability: t.capability,
        loading: !1,
        loadedWorkspacePath: i,
        loadedWorkspaceIdentity: a ?? null,
        loadedProvider: s,
      });
    } catch (t) {
      if (!Q(c)) return;
      (u.error(`[subagents] refresh failed`, {
        workspacePath: i,
        provider: s,
        error: t instanceof Error ? t.message : String(t),
      }),
        e({
          loading: !1,
          error: t instanceof Error ? t.message : String(t),
          loadedWorkspacePath: i,
          loadedWorkspaceIdentity: a ?? null,
          loadedProvider: s,
        }));
    }
  },
  async setEnabled(n, r, i, a) {
    if (!t().workspacePath) return;
    let o = a?.trim() || t().workspaceIdentity || void 0;
    e({ operatingAgentId: n });
    try {
      (await i.setEnabled({ agentId: n, enabled: r }), await t().refresh(i, o));
    } catch (t) {
      e({ error: t instanceof Error ? t.message : String(t) });
    } finally {
      e({ operatingAgentId: null });
    }
  },
  async createAgent(n, r, i, a) {
    if (!t().workspacePath) return null;
    let s = a?.trim() || t().workspaceIdentity || void 0;
    e({ operatingAgentId: `new:${n.name}` });
    try {
      let e = await i.createAgent({ config: n, provider: o(r) });
      return (await t().refresh(i, s), e.agent);
    } catch (t) {
      return (e({ error: t instanceof Error ? t.message : String(t) }), null);
    } finally {
      e({ operatingAgentId: null });
    }
  },
  async updateAgent(n, r, i, a, s, c) {
    if (!t().workspacePath) return null;
    let l = c?.trim() || t().workspaceIdentity || void 0;
    e({ operatingAgentId: n });
    try {
      let e = await s.updateAgent({ agentId: n, config: r, oldFilePath: i, provider: o(a) });
      return (await t().refresh(s, l), e.agent);
    } catch (t) {
      return (e({ error: t instanceof Error ? t.message : String(t) }), null);
    } finally {
      e({ operatingAgentId: null });
    }
  },
  async deleteAgent(n, r, i, a) {
    if (!t().workspacePath) return !1;
    let o = a?.trim() || t().workspaceIdentity || void 0;
    e({ operatingAgentId: n });
    try {
      return (await i.deleteAgent({ agentId: n, filePath: r }), await t().refresh(i, o), !0);
    } catch (t) {
      return (e({ error: t instanceof Error ? t.message : String(t) }), !1);
    } finally {
      e({ operatingAgentId: null });
    }
  },
}));
v() && (window.__subagentsStoreE2E = Gn);
async function Kn(e) {
  let t = e.workspacePath?.trim();
  if (!t) return;
  let n = e.workspaceIdentity?.trim() || null,
    r = Gn.getState(),
    i = [];
  r.workspacePath === t &&
    r.workspaceIdentity === n &&
    i.push(r.refresh(e.subagentsService, n ?? void 0));
  let a = Bn.getState(),
    o = Y(t, `glm`, n);
  (a.contexts[o] && i.push(a.refresh(t, `glm`, e.subagentsService, n ?? void 0)),
    await Promise.all(i));
}
var $ = new Map();
function qn(e, t, n) {
  return `${n?.trim() || e}::${t}`;
}
function Jn(e, t, n, r, i = {}) {
  let a = qn(e, t, r);
  if (!i.bypassCache) {
    let e = $.get(a);
    if (e) return e;
  }
  let o = n.list({ workspacePath: e, workspaceIdentity: r, provider: t }).finally(() => {
    $.get(a) === o && $.delete(a);
  });
  return ($.set(a, o), o);
}
var Yn = _((e, t) => ({
  workspacePath: null,
  workspaceIdentity: null,
  loadedWorkspacePath: null,
  loadedWorkspaceIdentity: null,
  provider: `glm`,
  loadedProvider: null,
  skills: [],
  capability: null,
  loading: !1,
  error: null,
  async initialize(n, r, i, a) {
    let s = t(),
      c = typeof r == `string`,
      l = o(c ? r : `glm`),
      d = c ? i : r,
      f = a?.trim() || null;
    if (!d) {
      e({
        workspacePath: n,
        workspaceIdentity: f,
        provider: l,
        loading: !1,
        error: `skillsService is required`,
        loadedWorkspacePath: n,
        loadedWorkspaceIdentity: f,
        loadedProvider: l,
      });
      return;
    }
    let p =
      s.skills.length > 0 &&
      s.loadedWorkspacePath === n &&
      s.loadedWorkspaceIdentity === f &&
      s.loadedProvider === l;
    e({
      workspacePath: n,
      workspaceIdentity: f,
      provider: l,
      skills: p ? s.skills : [],
      capability: p ? s.capability : null,
      loading: !p,
      error: null,
    });
    try {
      let t = await Jn(n, l, d, f ?? void 0);
      e({
        skills: t.skills,
        capability: t.capability,
        loading: !1,
        loadedWorkspacePath: n,
        loadedWorkspaceIdentity: f,
        loadedProvider: l,
      });
    } catch (t) {
      (u.error(`[skills] initialize failed`, {
        workspacePath: n,
        provider: l,
        error: t instanceof Error ? t.message : String(t),
      }),
        e({
          loading: !1,
          error: t instanceof Error ? t.message : String(t),
          loadedWorkspacePath: n,
          loadedWorkspaceIdentity: f,
          loadedProvider: l,
        }));
    }
  },
  async refresh(n, r) {
    let i = t().workspacePath;
    if (!i) return;
    let a = r?.trim() || t().workspaceIdentity || void 0,
      s = o(t().provider);
    (e({ loading: !(t().skills.length > 0), error: null }), $.delete(qn(i, s, a)));
    try {
      let t = await Jn(i, s, n, a);
      e({
        skills: t.skills,
        capability: t.capability,
        loading: !1,
        loadedWorkspacePath: i,
        loadedWorkspaceIdentity: a ?? null,
        loadedProvider: s,
      });
    } catch (t) {
      (u.error(`[skills] refresh failed`, {
        workspacePath: i,
        provider: s,
        error: t instanceof Error ? t.message : String(t),
      }),
        e({
          loading: !1,
          error: t instanceof Error ? t.message : String(t),
          loadedWorkspacePath: i,
          loadedWorkspaceIdentity: a ?? null,
          loadedProvider: s,
        }));
    }
  },
  async setEnabled(n, r, i, a, s, c) {
    let l = t().workspacePath;
    if (!l) return;
    let u = c?.trim() || t().workspaceIdentity || void 0,
      d = typeof r == `boolean`,
      f = o(d ? t().provider : r),
      p = d ? void 0 : i,
      m = d ? r : a,
      h = d ? i : s;
    if (!h) {
      e({ error: `skillsService is required` });
      return;
    }
    try {
      (await h.setEnabled({
        workspacePath: l,
        workspaceIdentity: u,
        provider: f,
        ...(p ? { scope: p } : {}),
        skillId: n,
        enabled: m,
      }),
        await t().refresh(h, u));
    } catch (t) {
      e({ error: t instanceof Error ? t.message : String(t) });
    }
  },
}));
v() && (window.__skillStoreE2E = Yn);
export {
  it as A,
  ve as B,
  Et as C,
  Tt as D,
  R as E,
  w as F,
  y as G,
  b as H,
  T as I,
  h as J,
  v as K,
  ge as L,
  Oe as M,
  Se as N,
  D as O,
  E as P,
  he as R,
  wt as S,
  yt as T,
  _e as U,
  S as V,
  de as W,
  Ft as _,
  Bn as a,
  z as b,
  Sn as c,
  Dn as d,
  Nn as f,
  sn as g,
  yn as h,
  Y as i,
  De as j,
  rt as k,
  W as l,
  Mn as m,
  Kn as n,
  In as o,
  On as p,
  _ as q,
  Gn as r,
  Cn as s,
  Yn as t,
  jn as u,
  Ot as v,
  I as w,
  L as x,
  Dt as y,
  me as z,
};
