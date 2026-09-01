/* eslint-disable */
/**
 * ============================================================================
 * ResizablePanelsCore.tsx —— A1-P2-B2 新叶（B5 语义顶层名 + 头注映射表）
 * ----------------------------------------------------------------------------
 * 真身区段：styles-CdEGpc2x.js 131389–131950（单一连续原子区，562 行，十九件）
 *   aAt → useForceUpdate               强制刷新钩子 (131389-131392)
 *   U4  → useUniqueId                  稳定 id 钩子 (131393-131396)
 *   W4  → useIsomorphicLayoutEffect    SSR 兼容 layoutEffect (131397)
 *   G4  → useEventCallback             事件回调稳定化 (131398-131406)
 *   K4  → useMergedRefs                多 ref 合并 (131407-131421)
 *   q4  → useLatestProps               最新 props 快照 (131422-131430)
 *   oAt → ResizableGroupContext        Group 上下文 (131431)
 *   sAt → useGroupImperativeHandle     Group 命令面 (131432-131438)
 *   cAt → ResizablePanelGroup          Group 引擎 (131439-131615)
 *   J4  → persistentLayoutKey          'react-resizable-panels:{id}:{panels}' (131616-131618)
 *   lAt → readStoredGroupLayout        布局读取 (131619-131647)
 *   uAt → usePersistentGroupLayout     布局持久化钩子 (131648-131707)
 *   dAt → createNoopSubscribe          useSyncExternalStore 空订阅工厂 (131708-131710)
 *   Y4  → useResizableGroupContext     上下文断言钩子 (131711-131717)
 *   fAt → usePanelImperativeHandle     Panel 命令面 (131718-131731)
 *   pAt → ResizablePanel               Panel 引擎 (131732-131818)
 *   mAt → PANEL_RESET_STYLE            Panel 复位样式常量 (131819-131830)
 *   hAt → resolvePanelAriaValues       ARIA 值解析 (131831-131862)
 *   gAt → ResizableSeparator           Separator 引擎 (131863-131950)
 * 〔区段左扩 131389 起（任务面 131422 前六件为簇内独占助手：全树实测零区外消费，
 *   纳入保证原子区连续）；右止 131950：X4(131951)/Z4(131960)/Q4(131961-131981)
 *   为应用包装层，属主在 components/shell/WorkspaceShell.tsx（SplitLayoutGroup/
 *   SplitPanel/SplitSeparator），不入本叶——A0-S3 推迟件裁决见下。〕
 *
 * 一、混淆名 → 语义名 映射表（自由符裁定；函数体内局部保留混淆名）
 *   Q → React（react-BQLj9xdT.js）｜ $ → jsx-runtime（import * as $）
 *   十九件真身映射见上表。
 *
 * 二、A0-S3 推迟件裁决（react-resizable-panels 包装面）
 *   X4 = SplitLayoutGroup、Z4 = SplitPanel 已在 WorkspaceShell.tsx §4 重建（R2-R4 域）；
 *   Q4 = SplitSeparator 本批按 bundle 131961-131981 补建于 WorkspaceShell.tsx。
 *   三包装均消费本叶导出（cAt/pAt/gAt/uAt）；包装面不入叶，避免与既有
 *   split-layout 实体（modules/SplitLayoutDeep.tsx 分屏逻辑域 js 121373-122819、
 *   modules/SplitLayoutUiDeep.tsx 表现层域）混属——本簇为 vendored 可缩放面板引擎
 *   （131xxx 独立 bundle 域），与 SplitLayoutDeep 零符号相交。
 *
 * 三、推迟件（留批）：vendored 引擎深区 130122–130968 内部件 ×18
 *   本叶以 declare const : any 留守（编译期擦除，emit 中立）；深区转录时替换真身。
 *   _4(130122) v4(130164) y4(130167) D4(130504) A4(130520) _kt(130363) S4(130366)
 *   w4(130373) T4(130378) j4(130646) M4(130651) jkt(130682) Nkt(130810) L4(130933)
 *   Fkt(130936) Rkt(130968) z4(130969) iAt(131289)
 *
 * 四、型缝（〔A1-P2-B2〕标注，60 处，逐行登记 /tmp/a1r0-p2/split/split-seam-log.txt）
 *   S1 函数/箭头参数 : any ×46（bundle 无型面；纯型层）
 *   S2 剩余参数 : any[] ×2（useEventCallback 内箭头、useMergedRefs）
 *   S3 displayName cast ×3（纯函数声明无 displayName 面，(X as any).displayName）
 *   S4 推断塌缩 cast ×9（createContext(null) 型塌 null；useRef 空对象参；
 *      useRef(null) 写回面 ×2；useState({}) 读面 ×2；空对象字面索引写面 ×3
 *      ——束真运行期值不变，纯型层）
 *
 * 五、逐字证明
 *   ROUNDTRIP EXACT（562 行）：缝后体逆归一（S1–S4 逐行）+ 逆改名（语义→混淆）
 *   与 bundle 131389–131950 逐字一致；SHORTHAND_RENAMED_SITES 0。
 * ============================================================================
 */

import * as React from "react";
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）

/* 推迟件：vendored 引擎深区内部（130122–131289），留批转录时替换真身 */
declare const _4: any; // 原 _4（130122）
declare const v4: any; // 原 v4（130164）
declare const y4: any; // 原 y4（130167）
declare const D4: any; // 原 D4（130504）
declare const A4: any; // 原 A4（130520）
declare const _kt: any; // 原 _kt（130363）
declare const S4: any; // 原 S4（130366）
declare const w4: any; // 原 w4（130373）
declare const T4: any; // 原 T4（130378）
declare const j4: any; // 原 j4（130646）
declare const M4: any; // 原 M4（130651）
declare const jkt: any; // 原 jkt（130682）
declare const Nkt: any; // 原 Nkt（130810）
declare const L4: any; // 原 L4（130933）
declare const Fkt: any; // 原 Fkt（130936）
declare const Rkt: any; // 原 Rkt（130968）
declare const z4: any; // 原 z4（130969）
declare const iAt: any; // 原 iAt（131289）

function useForceUpdate() {
  let [e, t] = (0, React.useState)({} as any);
  return [e, (0, React.useCallback)(() => t({}), [])];
}
function useUniqueId(e: any) {
  let t = (0, React.useId)();
  return `${e ?? t}`;
}
var useIsomorphicLayoutEffect = typeof window < `u` ? React.useLayoutEffect : React.useEffect;
function useEventCallback(e: any) {
  let t = (0, React.useRef)(e);
  return (
    useIsomorphicLayoutEffect(() => {
      t.current = e;
    }, [e]),
    (0, React.useCallback)((...e: any[]) => t.current?.(...e), [t])
  );
}
function useMergedRefs(...e: any[]) {
  return useEventCallback((t: any) => {
    e.forEach((e: any) => {
      if (e)
        switch (typeof e) {
          case `function`:
            e(t);
            break;
          case `object`:
            e.current = t;
            break;
        }
    });
  });
}
function useLatestProps(e: any) {
  let t = (0, React.useRef)({ ...e });
  return (
    useIsomorphicLayoutEffect(() => {
      for (let n in e) t.current[n] = e[n];
    }, [e]),
    t.current
  );
}
var ResizableGroupContext = (0, React.createContext)(null as any);
function useGroupImperativeHandle(e: any, t: any) {
  let n = (0, React.useRef)({ getLayout: () => ({}), setLayout: Rkt });
  ((0, React.useImperativeHandle)(t, () => n.current, []),
    useIsomorphicLayoutEffect(() => {
      Object.assign(n.current, Nkt({ groupId: e }));
    }));
}
function ResizablePanelGroup({
  children: e,
  className: t,
  defaultLayout: n,
  disableCursor: r,
  disabled: i,
  elementRef: a,
  groupRef: o,
  id: s,
  onLayoutChange: c,
  onLayoutChanged: l,
  orientation: u = `horizontal`,
  resizeTargetMinimumSize: d = { coarse: 20, fine: 10 },
  style: f,
  ...p
}: any) {
  let m = (0, React.useRef)({ onLayoutChange: {}, onLayoutChanged: {} }),
    h = useEventCallback((e: any) => {
      j4(m.current.onLayoutChange, e) || ((m.current.onLayoutChange = e), c?.(e));
    }),
    g = useEventCallback((e: any) => {
      j4(m.current.onLayoutChanged, e) || ((m.current.onLayoutChanged = e), l?.(e));
    }),
    _ = useUniqueId(s),
    v = (0, React.useRef)(null),
    [y, b] = useForceUpdate(),
    x = (0, React.useRef)({
      lastExpandedPanelSizes: {},
      layouts: {},
      panels: [],
      resizeTargetMinimumSize: d,
      separators: [],
    } as any),
    S = useMergedRefs(v, a);
  useGroupImperativeHandle(_, o);
  let C = useEventCallback((e: any, t: any) => {
      let r = L4(),
        i = _kt(e),
        a = S4(e);
      if (a) {
        let e = !1;
        switch (r.state) {
          case `active`:
            e = r.hitRegions.some((e: any) => e.group === i);
            break;
        }
        return { flexGrow: a.layout[t] ?? 1, pointerEvents: e ? `none` : void 0 };
      }
      if (n?.[t]) return { flexGrow: n?.[t] };
    }),
    w = useLatestProps({ defaultLayout: n, disableCursor: r }),
    T = (0, React.useMemo)(
      () => ({
        get disableCursor() {
          return !!w.disableCursor;
        },
        getPanelStyles: C,
        id: _,
        orientation: u,
        registerPanel: (e: any) => {
          let t = x.current;
          return (
            (t.panels = y4(u, [...t.panels, e])),
            b(),
            () => {
              ((t.panels = t.panels.filter((t: any) => t !== e)), b());
            }
          );
        },
        registerSeparator: (e: any) => {
          let t = x.current;
          return (
            (t.separators = y4(u, [...t.separators, e])),
            b(),
            () => {
              ((t.separators = t.separators.filter((t: any) => t !== e)), b());
            }
          );
        },
        updatePanelProps: (e: any, { disabled: t }: any) => {
          let n = x.current.panels.find((t: any) => t.id === e);
          n && (n.panelConstraints.disabled = t);
          let r = _kt(_),
            i = S4(_);
          r && i && T4(r, { ...i, derivedPanelConstraints: _4(r) });
        },
        updateSeparatorProps: (e: any, { disabled: t, disableDoubleClick: n }: any) => {
          let r = x.current.separators.find((t: any) => t.id === e);
          r && ((r.disabled = t), (r.disableDoubleClick = n));
        },
      }),
      [C, _, b, u, w],
    ),
    E = (0, React.useRef)(null as any);
  return (
    useIsomorphicLayoutEffect(() => {
      let e = v.current;
      if (e === null) return;
      let t = x.current,
        n;
      if (w.defaultLayout !== void 0 && Object.keys(w.defaultLayout).length === t.panels.length) {
        n = {} as any;
        for (let e of t.panels) {
          let t = w.defaultLayout[e.id];
          t !== void 0 && (n[e.id] = t);
        }
      }
      let r = {
        disabled: !!i,
        element: e,
        id: _,
        mutableState: {
          defaultLayout: n,
          disableCursor: !!w.disableCursor,
          expandedPanelSizes: x.current.lastExpandedPanelSizes,
          layouts: x.current.layouts,
        },
        orientation: u,
        panels: t.panels,
        resizeTargetMinimumSize: t.resizeTargetMinimumSize,
        separators: t.separators,
      };
      E.current = r;
      let a = iAt(r),
        { defaultLayoutDeferred: o, derivedPanelConstraints: s, layout: c } = S4(r.id, !0);
      !o && s.length > 0 && (h(c), g(c));
      let l = w4(_, (e: any) => {
        let { defaultLayoutDeferred: t, derivedPanelConstraints: n, layout: i } = e.next;
        if (t || n.length === 0) return;
        let a = r.panels.map(({ id: e }: any) => e).join(`,`);
        ((r.mutableState.layouts[a] = i),
          n.forEach((t: any) => {
            if (t.collapsible) {
              let { layout: n } = e.prev ?? {};
              if (n) {
                let e = D4(t.collapsedSize, i[t.panelId]),
                  a = D4(t.collapsedSize, n[t.panelId]);
                e && !a && (r.mutableState.expandedPanelSizes[t.panelId] = n[t.panelId]);
              }
            }
          }));
        let o = L4().state !== `active`;
        (h(i), o && g(i));
      });
      return () => {
        ((E.current = null), a(), l());
      };
    }, [i, _, g, h, u, y, w]),
    (0, React.useEffect)(() => {
      let e = E.current;
      e && ((e.mutableState.defaultLayout = n), (e.mutableState.disableCursor = !!r));
    }),
    (0, $.jsx)(ResizableGroupContext.Provider, {
      value: T,
      children: (0, $.jsx)(`div`, {
        ...p,
        className: t,
        "data-group": !0,
        "data-testid": _,
        id: _,
        ref: S,
        style: {
          height: `100%`,
          width: `100%`,
          overflow: `hidden`,
          ...f,
          display: `flex`,
          flexDirection: u === `horizontal` ? `row` : `column`,
          flexWrap: `nowrap`,
          touchAction: u === `horizontal` ? `pan-y` : `pan-x`,
        },
        children: e,
      }),
    })
  );
}
(ResizablePanelGroup as any).displayName = `Group`;
function persistentLayoutKey(e: any, t: any) {
  return `react-resizable-panels:${[e, ...t].join(`:`)}`;
}
function readStoredGroupLayout({ id: e, panelIds: t, storage: n }: any) {
  let r = persistentLayoutKey(e, []),
    i = n.getItem(r);
  if (i)
    try {
      let e = JSON.parse(i);
      if (t) {
        let n = e[t.join(`,`)];
        if (n && Array.isArray(n.layout) && t.length === n.layout.length) {
          let e = {} as any;
          for (let r = 0; r < t.length; r++) e[t[r]] = n.layout[r];
          return e;
        }
      } else {
        let t = Object.keys(e);
        if (t.length === 1) {
          let n = e[t[0]];
          if (n && Array.isArray(n.layout)) {
            let e = t[0].split(`,`);
            if (e.length === n.layout.length) {
              let t = {} as any;
              for (let r = 0; r < e.length; r++) t[e[r]] = n.layout[r];
              return t;
            }
          }
        }
      }
    } catch {}
}
function usePersistentGroupLayout({ debounceSaveMs: e = 100, panelIds: t, storage: n = localStorage, ...r }: any) {
  let i = t !== void 0,
    a = `id` in r ? r.id : r.groupId,
    o = persistentLayoutKey(a, t ?? []),
    s = (0, React.useSyncExternalStore)(
      createNoopSubscribe,
      () => n.getItem(o),
      () => n.getItem(o),
    ),
    c = (0, React.useMemo)(() => {
      if (s) {
        let e = JSON.parse(s),
          t = Object.values(e);
        if (Array.from(t).every((e: any) => typeof e == `number`)) return e;
      }
    }, [s]),
    l = (0, React.useMemo)(() => {
      if (!c) return readStoredGroupLayout({ id: a, panelIds: t, storage: n });
    }, [c, a, t, n]),
    u = c ?? l,
    d = (0, React.useRef)(null as any),
    f = (0, React.useCallback)(() => {
      let e = d.current;
      e && ((d.current = null), clearTimeout(e));
    }, []);
  (0, React.useLayoutEffect)(
    () => () => {
      f();
    },
    [f],
  );
  let p = (0, React.useCallback)(
    (e: any) => {
      f();
      let t;
      t = i ? persistentLayoutKey(a, Object.keys(e)) : persistentLayoutKey(a, []);
      try {
        n.setItem(t, JSON.stringify(e));
      } catch (e) {
        console.error(e);
      }
    },
    [f, i, a, n],
  );
  return {
    defaultLayout: u,
    onLayoutChange: (0, React.useCallback)(
      (t: any) => {
        (f(),
          e === 0
            ? p(t)
            : (d.current = setTimeout(() => {
                p(t);
              }, e)));
      },
      [f, e, p],
    ),
    onLayoutChanged: p,
  };
}
function createNoopSubscribe() {
  return function () {};
}
function useResizableGroupContext() {
  let e = (0, React.useContext)(ResizableGroupContext);
  return (
    v4(e, `Group Context not found; did you render a Panel or Separator outside of a Group?`),
    e
  );
}
function usePanelImperativeHandle(e: any, t: any) {
  let { id: n } = useResizableGroupContext(),
    r = (0, React.useRef)({
      collapse: z4,
      expand: z4,
      getSize: () => ({ asPercentage: 0, inPixels: 0 }),
      isCollapsed: () => !1,
      resize: z4,
    });
  ((0, React.useImperativeHandle)(t, () => r.current, []),
    useIsomorphicLayoutEffect(() => {
      Object.assign(r.current, jkt({ groupId: n, panelId: e }));
    }));
}
function ResizablePanel({
  children: e,
  className: t,
  collapsedSize: n = `0%`,
  collapsible: r = !1,
  defaultSize: i,
  disabled: a,
  elementRef: o,
  groupResizeBehavior: s = `preserve-relative-size`,
  id: c,
  maxSize: l = `100%`,
  minSize: u = `0%`,
  onResize: d,
  panelRef: f,
  style: p,
  ...m
}: any) {
  let h = !!c,
    g = useUniqueId(c),
    _ = useLatestProps({ disabled: a }),
    v = (0, React.useRef)(null),
    y = useMergedRefs(v, o),
    { getPanelStyles: b, id: x, orientation: S, registerPanel: C, updatePanelProps: w } = useResizableGroupContext(),
    T = d !== null,
    E = useEventCallback((e: any, t: any, n: any) => {
      d?.(e, c, n);
    });
  (useIsomorphicLayoutEffect(() => {
    let e = v.current;
    if (e !== null)
      return C({
        element: e,
        id: g,
        idIsStable: h,
        mutableValues: { expandToSize: void 0, prevSize: void 0 },
        onResize: T ? E : void 0,
        panelConstraints: {
          groupResizeBehavior: s,
          collapsedSize: n,
          collapsible: r,
          defaultSize: i,
          disabled: _.disabled,
          maxSize: l,
          minSize: u,
        },
      });
  }, [s, n, r, i, T, g, h, l, u, E, C, _]),
    (0, React.useEffect)(() => {
      w(g, { disabled: a });
    }, [a, g, w]),
    usePanelImperativeHandle(g, f));
  let D = () => {
      let e = b(x, g);
      if (e) return JSON.stringify(e);
    },
    O = (0, React.useSyncExternalStore)((e: any) => w4(x, e), D, D),
    k;
  return (
    (k = O
      ? JSON.parse(O)
      : i
        ? { flexGrow: void 0, flexShrink: void 0, flexBasis: i }
        : { flexGrow: 1 }),
    (0, $.jsx)(`div`, {
      ...m,
      "data-disabled": a || void 0,
      "data-panel": !0,
      "data-testid": g,
      id: g,
      ref: y,
      style: { ...PANEL_RESET_STYLE, display: `flex`, flexBasis: 0, flexShrink: 1, overflow: `visible`, ...k },
      children: (0, $.jsx)(`div`, {
        className: t,
        style: {
          maxHeight: `100%`,
          maxWidth: `100%`,
          flexGrow: 1,
          overflow: `auto`,
          ...p,
          touchAction: S === `horizontal` ? `pan-y` : `pan-x`,
        },
        children: e,
      }),
    })
  );
}
(ResizablePanel as any).displayName = `Panel`;
var PANEL_RESET_STYLE = {
  minHeight: 0,
  maxHeight: `100%`,
  height: `auto`,
  minWidth: 0,
  maxWidth: `100%`,
  width: `auto`,
  border: `none`,
  borderWidth: 0,
  padding: 0,
  margin: 0,
};
function resolvePanelAriaValues({ layout: e, panelConstraints: t, panelId: n, panelIndex: r }: any) {
  let i,
    a,
    o = e[n],
    s = t.find((e: any) => e.panelId === n);
  if (s) {
    let c = s.maxSize,
      l = s.collapsible ? s.collapsedSize : s.minSize,
      u = [r, r + 1];
    ((a = M4({
      layout: A4({
        delta: l - o,
        initialLayout: e,
        panelConstraints: t,
        pivotIndices: u,
        prevLayout: e,
      }),
      panelConstraints: t,
    })[n]),
      (i = M4({
        layout: A4({
          delta: c - o,
          initialLayout: e,
          panelConstraints: t,
          pivotIndices: u,
          prevLayout: e,
        }),
        panelConstraints: t,
      })[n]));
  }
  return { valueControls: n, valueMax: i, valueMin: a, valueNow: o };
}
function ResizableSeparator({
  children: e,
  className: t,
  disabled: n,
  disableDoubleClick: r,
  elementRef: i,
  id: a,
  style: o,
  ...s
}: any) {
  let c = useUniqueId(a),
    l = useLatestProps({ disabled: n, disableDoubleClick: r }),
    [u, d] = (0, React.useState)({} as any),
    [f, p] = (0, React.useState)(`inactive`),
    [m, h] = (0, React.useState)(!1),
    g = (0, React.useRef)(null),
    _ = useMergedRefs(g, i),
    {
      disableCursor: v,
      id: y,
      orientation: b,
      registerSeparator: x,
      updateSeparatorProps: S,
    } = useResizableGroupContext(),
    C = b === `horizontal` ? `vertical` : `horizontal`;
  (useIsomorphicLayoutEffect(() => {
    let e = g.current;
    if (e !== null) {
      let t = { disabled: l.disabled, disableDoubleClick: l.disableDoubleClick, element: e, id: c },
        n = x(t),
        r = Fkt((e: any) => {
          p(
            e.next.state !== `inactive` && e.next.hitRegions.some((e: any) => e.separator === t)
              ? e.next.state
              : `inactive`,
          );
        }),
        i = w4(y, (e: any) => {
          let { derivedPanelConstraints: n, layout: r, separatorToPanels: i } = e.next,
            a = i.get(t);
          if (a) {
            let e = a[0],
              t = a.indexOf(e);
            d(resolvePanelAriaValues({ layout: r, panelConstraints: n, panelId: e.id, panelIndex: t }));
          }
        });
      return () => {
        (r(), i(), n());
      };
    }
  }, [y, c, x, l]),
    (0, React.useEffect)(() => {
      S(c, { disabled: n, disableDoubleClick: r });
    }, [n, r, c, S]));
  let w;
  n && !v && (w = `not-allowed`);
  let T;
  if (n) T = `disabled`;
  else
    switch (f) {
      case `active`:
        T = `active`;
        break;
      default:
        T = m ? `focus` : f;
    }
  return (0, $.jsx)(`div`, {
    ...s,
    "aria-controls": u.valueControls,
    "aria-disabled": n || void 0,
    "aria-orientation": C,
    "aria-valuemax": u.valueMax,
    "aria-valuemin": u.valueMin,
    "aria-valuenow": u.valueNow,
    children: e,
    className: t,
    "data-separator": T,
    "data-testid": c,
    id: c,
    onBlur: () => h(!1),
    onFocus: () => h(!0),
    ref: _,
    role: `separator`,
    style: { flexBasis: `auto`, cursor: w, ...o, flexGrow: 0, flexShrink: 0, touchAction: `none` },
    tabIndex: n ? void 0 : 0,
  });
}
(ResizableSeparator as any).displayName = `Separator`;

export {
  useForceUpdate, useUniqueId, useIsomorphicLayoutEffect, useEventCallback,
  useMergedRefs, useLatestProps, ResizableGroupContext, useGroupImperativeHandle,
  ResizablePanelGroup, persistentLayoutKey, readStoredGroupLayout,
  usePersistentGroupLayout, createNoopSubscribe, useResizableGroupContext,
  usePanelImperativeHandle, ResizablePanel, PANEL_RESET_STYLE,
  resolvePanelAriaValues, ResizableSeparator,
};
