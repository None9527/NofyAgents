import { s as e, t } from "./chunk-Cq_f4orQ.js";
import { t as n } from "./react-BQLj9xdT.js";
import "./IntlProvider-C321H7m8.js";
import { t as r } from "./jsx-runtime-B5yMD3-t.js";
import { a as i } from "./keyboardShortcuts-BGHopxr9.js";
import {
  _ as a,
  a as o,
  c as s,
  d as c,
  i as l,
  l as u,
  m as d,
  n as f,
  p,
  r as m,
  s as h,
  t as g,
  v as _,
} from "./dist-DJJArJ7D.js";
import { a as v, r as y } from "./dist-vnZIbudW.js";
import { t as b } from "./utils-CEEH0K_K.js";
var x = e(n(), 1),
  S = r(),
  C = Object.freeze({
    position: `absolute`,
    border: 0,
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: `hidden`,
    clip: `rect(0, 0, 0, 0)`,
    whiteSpace: `nowrap`,
    wordWrap: `normal`,
  }),
  w = `VisuallyHidden`,
  T = x.forwardRef((e, t) => (0, S.jsx)(c.span, { ...e, ref: t, style: { ...C, ...e.style } }));
T.displayName = w;
var E = T,
  D = t((e) => {
    var t = n();
    function r(e, t) {
      return (e === t && (e !== 0 || 1 / e == 1 / t)) || (e !== e && t !== t);
    }
    var i = typeof Object.is == `function` ? Object.is : r,
      a = t.useState,
      o = t.useEffect,
      s = t.useLayoutEffect,
      c = t.useDebugValue;
    function l(e, t) {
      var n = t(),
        r = a({ inst: { value: n, getSnapshot: t } }),
        i = r[0].inst,
        l = r[1];
      return (
        s(
          function () {
            ((i.value = n), (i.getSnapshot = t), u(i) && l({ inst: i }));
          },
          [e, n, t],
        ),
        o(
          function () {
            return (
              u(i) && l({ inst: i }),
              e(function () {
                u(i) && l({ inst: i });
              })
            );
          },
          [e],
        ),
        c(n),
        n
      );
    }
    function u(e) {
      var t = e.getSnapshot;
      e = e.value;
      try {
        var n = t();
        return !i(e, n);
      } catch {
        return !0;
      }
    }
    function d(e, t) {
      return t();
    }
    var f =
      typeof window > `u` || window.document === void 0 || window.document.createElement === void 0
        ? d
        : l;
    e.useSyncExternalStore = t.useSyncExternalStore === void 0 ? f : t.useSyncExternalStore;
  }),
  ee = t((e, t) => {
    t.exports = D();
  }),
  [O, te] = a(`Tooltip`, [o]),
  k = o(),
  A = `TooltipProvider`,
  ne = 700,
  j = `tooltip.open`,
  [re, M] = O(A),
  N = (e) => {
    let {
        __scopeTooltip: t,
        delayDuration: n = ne,
        skipDelayDuration: r = 300,
        disableHoverableContent: i = !1,
        children: a,
      } = e,
      o = x.useRef(!0),
      s = x.useRef(!1),
      c = x.useRef(0);
    return (
      x.useEffect(() => {
        let e = c.current;
        return () => window.clearTimeout(e);
      }, []),
      (0, S.jsx)(re, {
        scope: t,
        isOpenDelayedRef: o,
        delayDuration: n,
        onOpen: x.useCallback(() => {
          (window.clearTimeout(c.current), (o.current = !1));
        }, []),
        onClose: x.useCallback(() => {
          (window.clearTimeout(c.current),
            (c.current = window.setTimeout(() => (o.current = !0), r)));
        }, [r]),
        isPointerInTransitRef: s,
        onPointerInTransitChange: x.useCallback((e) => {
          s.current = e;
        }, []),
        disableHoverableContent: i,
        children: a,
      })
    );
  };
N.displayName = A;
var P = `Tooltip`,
  [ie, F] = O(P),
  I = (e) => {
    let {
        __scopeTooltip: t,
        children: n,
        open: r,
        defaultOpen: i,
        onOpenChange: a,
        disableHoverableContent: o,
        delayDuration: s,
      } = e,
      c = M(P, e.__scopeTooltip),
      u = k(t),
      [f, m] = x.useState(null),
      h = d(),
      g = x.useRef(0),
      _ = o ?? c.disableHoverableContent,
      v = s ?? c.delayDuration,
      y = x.useRef(!1),
      [b, C] = p({
        prop: r,
        defaultProp: i ?? !1,
        onChange: (e) => {
          (e ? (c.onOpen(), document.dispatchEvent(new CustomEvent(j))) : c.onClose(), a?.(e));
        },
        caller: P,
      }),
      w = x.useMemo(() => (b ? (y.current ? `delayed-open` : `instant-open`) : `closed`), [b]),
      T = x.useCallback(() => {
        (window.clearTimeout(g.current), (g.current = 0), (y.current = !1), C(!0));
      }, [C]),
      E = x.useCallback(() => {
        (window.clearTimeout(g.current), (g.current = 0), C(!1));
      }, [C]),
      D = x.useCallback(() => {
        (window.clearTimeout(g.current),
          (g.current = window.setTimeout(() => {
            ((y.current = !0), C(!0), (g.current = 0));
          }, v)));
      }, [v, C]);
    return (
      x.useEffect(
        () => () => {
          g.current &&= (window.clearTimeout(g.current), 0);
        },
        [],
      ),
      (0, S.jsx)(l, {
        ...u,
        children: (0, S.jsx)(ie, {
          scope: t,
          contentId: h,
          open: b,
          stateAttribute: w,
          trigger: f,
          onTriggerChange: m,
          onTriggerEnter: x.useCallback(() => {
            c.isOpenDelayedRef.current ? D() : T();
          }, [c.isOpenDelayedRef, D, T]),
          onTriggerLeave: x.useCallback(() => {
            _ ? E() : (window.clearTimeout(g.current), (g.current = 0));
          }, [E, _]),
          onOpen: T,
          onClose: E,
          disableHoverableContent: _,
          children: n,
        }),
      })
    );
  };
I.displayName = P;
var L = `TooltipTrigger`,
  R = x.forwardRef((e, t) => {
    let { __scopeTooltip: n, ...r } = e,
      i = F(L, n),
      a = M(L, n),
      o = k(n),
      s = v(t, x.useRef(null), i.onTriggerChange),
      l = x.useRef(!1),
      u = x.useRef(!1),
      d = x.useCallback(() => (l.current = !1), []);
    return (
      x.useEffect(() => () => document.removeEventListener(`pointerup`, d), [d]),
      (0, S.jsx)(g, {
        asChild: !0,
        ...o,
        children: (0, S.jsx)(c.button, {
          "aria-describedby": i.open ? i.contentId : void 0,
          "data-state": i.stateAttribute,
          ...r,
          ref: s,
          onPointerMove: _(e.onPointerMove, (e) => {
            e.pointerType !== `touch` &&
              !u.current &&
              !a.isPointerInTransitRef.current &&
              (i.onTriggerEnter(), (u.current = !0));
          }),
          onPointerLeave: _(e.onPointerLeave, () => {
            (i.onTriggerLeave(), (u.current = !1));
          }),
          onPointerDown: _(e.onPointerDown, () => {
            (i.open && i.onClose(),
              (l.current = !0),
              document.addEventListener(`pointerup`, d, { once: !0 }));
          }),
          onFocus: _(e.onFocus, () => {
            l.current || i.onOpen();
          }),
          onBlur: _(e.onBlur, i.onClose),
          onClick: _(e.onClick, i.onClose),
        }),
      })
    );
  });
R.displayName = L;
var z = `TooltipPortal`,
  [ae, oe] = O(z, { forceMount: void 0 }),
  B = (e) => {
    let { __scopeTooltip: t, forceMount: n, children: r, container: i } = e,
      a = F(z, t);
    return (0, S.jsx)(ae, {
      scope: t,
      forceMount: n,
      children: (0, S.jsx)(h, {
        present: n || a.open,
        children: (0, S.jsx)(s, { asChild: !0, container: i, children: r }),
      }),
    });
  };
B.displayName = z;
var V = `TooltipContent`,
  H = x.forwardRef((e, t) => {
    let n = oe(V, e.__scopeTooltip),
      { forceMount: r = n.forceMount, side: i = `top`, ...a } = e,
      o = F(V, e.__scopeTooltip);
    return (0, S.jsx)(h, {
      present: r || o.open,
      children: o.disableHoverableContent
        ? (0, S.jsx)(U, { side: i, ...a, ref: t })
        : (0, S.jsx)(se, { side: i, ...a, ref: t }),
    });
  }),
  se = x.forwardRef((e, t) => {
    let n = F(V, e.__scopeTooltip),
      r = M(V, e.__scopeTooltip),
      i = x.useRef(null),
      a = v(t, i),
      [o, s] = x.useState(null),
      { trigger: c, onClose: l } = n,
      u = i.current,
      { onPointerInTransitChange: d } = r,
      f = x.useCallback(() => {
        (s(null), d(!1));
      }, [d]),
      p = x.useCallback(
        (e, t) => {
          let n = e.currentTarget,
            r = { x: e.clientX, y: e.clientY },
            i = pe(r, fe(r, n.getBoundingClientRect())),
            a = me(t.getBoundingClientRect());
          (s(ge([...i, ...a])), d(!0));
        },
        [d],
      );
    return (
      x.useEffect(() => () => f(), [f]),
      x.useEffect(() => {
        if (c && u) {
          let e = (e) => p(e, u),
            t = (e) => p(e, c);
          return (
            c.addEventListener(`pointerleave`, e),
            u.addEventListener(`pointerleave`, t),
            () => {
              (c.removeEventListener(`pointerleave`, e), u.removeEventListener(`pointerleave`, t));
            }
          );
        }
      }, [c, u, p, f]),
      x.useEffect(() => {
        if (o) {
          let e = (e) => {
            let t = e.target,
              n = { x: e.clientX, y: e.clientY },
              r = c?.contains(t) || u?.contains(t),
              i = !he(n, o);
            r ? f() : i && (f(), l());
          };
          return (
            document.addEventListener(`pointermove`, e),
            () => document.removeEventListener(`pointermove`, e)
          );
        }
      }, [c, u, o, l, f]),
      (0, S.jsx)(U, { ...e, ref: a })
    );
  }),
  [ce, le] = O(P, { isInside: !1 }),
  ue = y(`TooltipContent`),
  U = x.forwardRef((e, t) => {
    let {
        __scopeTooltip: n,
        children: r,
        "aria-label": i,
        onEscapeKeyDown: a,
        onPointerDownOutside: o,
        ...s
      } = e,
      c = F(V, n),
      l = k(n),
      { onClose: d } = c;
    return (
      x.useEffect(
        () => (document.addEventListener(j, d), () => document.removeEventListener(j, d)),
        [d],
      ),
      x.useEffect(() => {
        if (c.trigger) {
          let e = (e) => {
            e.target?.contains(c.trigger) && d();
          };
          return (
            window.addEventListener(`scroll`, e, { capture: !0 }),
            () => window.removeEventListener(`scroll`, e, { capture: !0 })
          );
        }
      }, [c.trigger, d]),
      (0, S.jsx)(u, {
        asChild: !0,
        disableOutsidePointerEvents: !1,
        onEscapeKeyDown: a,
        onPointerDownOutside: o,
        onFocusOutside: (e) => e.preventDefault(),
        onDismiss: d,
        children: (0, S.jsxs)(m, {
          "data-state": c.stateAttribute,
          ...l,
          ...s,
          ref: t,
          style: {
            ...s.style,
            "--radix-tooltip-content-transform-origin": `var(--radix-popper-transform-origin)`,
            "--radix-tooltip-content-available-width": `var(--radix-popper-available-width)`,
            "--radix-tooltip-content-available-height": `var(--radix-popper-available-height)`,
            "--radix-tooltip-trigger-width": `var(--radix-popper-anchor-width)`,
            "--radix-tooltip-trigger-height": `var(--radix-popper-anchor-height)`,
          },
          children: [
            (0, S.jsx)(ue, { children: r }),
            (0, S.jsx)(ce, {
              scope: n,
              isInside: !0,
              children: (0, S.jsx)(E, { id: c.contentId, role: `tooltip`, children: i || r }),
            }),
          ],
        }),
      })
    );
  });
H.displayName = V;
var W = `TooltipArrow`,
  de = x.forwardRef((e, t) => {
    let { __scopeTooltip: n, ...r } = e,
      i = k(n);
    return le(W, n).isInside ? null : (0, S.jsx)(f, { ...i, ...r, ref: t });
  });
de.displayName = W;
function fe(e, t) {
  let n = Math.abs(t.top - e.y),
    r = Math.abs(t.bottom - e.y),
    i = Math.abs(t.right - e.x),
    a = Math.abs(t.left - e.x);
  switch (Math.min(n, r, i, a)) {
    case a:
      return `left`;
    case i:
      return `right`;
    case n:
      return `top`;
    case r:
      return `bottom`;
    default:
      throw Error(`unreachable`);
  }
}
function pe(e, t, n = 5) {
  let r = [];
  switch (t) {
    case `top`:
      r.push({ x: e.x - n, y: e.y + n }, { x: e.x + n, y: e.y + n });
      break;
    case `bottom`:
      r.push({ x: e.x - n, y: e.y - n }, { x: e.x + n, y: e.y - n });
      break;
    case `left`:
      r.push({ x: e.x + n, y: e.y - n }, { x: e.x + n, y: e.y + n });
      break;
    case `right`:
      r.push({ x: e.x - n, y: e.y - n }, { x: e.x - n, y: e.y + n });
      break;
  }
  return r;
}
function me(e) {
  let { top: t, right: n, bottom: r, left: i } = e;
  return [
    { x: i, y: t },
    { x: n, y: t },
    { x: n, y: r },
    { x: i, y: r },
  ];
}
function he(e, t) {
  let { x: n, y: r } = e,
    i = !1;
  for (let e = 0, a = t.length - 1; e < t.length; a = e++) {
    let o = t[e],
      s = t[a],
      c = o.x,
      l = o.y,
      u = s.x,
      d = s.y;
    l > r != d > r && n < ((u - c) * (r - l)) / (d - l) + c && (i = !i);
  }
  return i;
}
function ge(e) {
  let t = e.slice();
  return (
    t.sort((e, t) => (e.x < t.x ? -1 : e.x > t.x ? 1 : e.y < t.y ? -1 : +(e.y > t.y))),
    _e(t)
  );
}
function _e(e) {
  if (e.length <= 1) return e.slice();
  let t = [];
  for (let n = 0; n < e.length; n++) {
    let r = e[n];
    for (; t.length >= 2;) {
      let e = t[t.length - 1],
        n = t[t.length - 2];
      if ((e.x - n.x) * (r.y - n.y) >= (e.y - n.y) * (r.x - n.x)) t.pop();
      else break;
    }
    t.push(r);
  }
  t.pop();
  let n = [];
  for (let t = e.length - 1; t >= 0; t--) {
    let r = e[t];
    for (; n.length >= 2;) {
      let e = n[n.length - 1],
        t = n[n.length - 2];
      if ((e.x - t.x) * (r.y - t.y) >= (e.y - t.y) * (r.x - t.x)) n.pop();
      else break;
    }
    n.push(r);
  }
  return (
    n.pop(),
    t.length === 1 && n.length === 1 && t[0].x === n[0].x && t[0].y === n[0].y ? t : t.concat(n)
  );
}
var ve = N,
  ye = I,
  be = R,
  xe = B,
  Se = H;
function Ce({ delayDuration: e = 0, ...t }) {
  return (0, S.jsx)(ve, { "data-slot": `tooltip-provider`, delayDuration: e, ...t });
}
function G({ ...e }) {
  return (0, S.jsx)(ye, { "data-slot": `tooltip`, ...e });
}
function K({ ...e }) {
  return (0, S.jsx)(be, { "data-slot": `tooltip-trigger`, ...e });
}
function q({ className: e, sideOffset: t = 0, children: n, ...r }) {
  return (0, S.jsx)(xe, {
    children: (0, S.jsx)(Se, {
      "data-slot": `tooltip-content`,
      sideOffset: t,
      className: b(
        `z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 rounded-lg border border-border bg-tooltip px-3 py-1.5 text-ui-sm text-tooltip-foreground has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`,
        e,
      ),
      ...r,
      children: n,
    }),
  });
}
var J = `rounded-md h-4 inline-flex items-center bg-tooltip-tag px-1.5 text-ui-xs font-medium text-tooltip-tag-foreground`;
function Y(e, t) {
  if (e) {
    if (typeof e == `function`) {
      e(t);
      return;
    }
    e.current = t;
  }
}
function X({
  children: e,
  title: t,
  description: n,
  shortcut: r,
  open: a,
  onOpenChange: o,
  side: s = `top`,
  align: c = `center`,
  sideOffset: l = 2,
  className: u,
  triggerClassName: d,
  triggerRef: f,
}) {
  let p = i(),
    m = p ? `tracking-normal` : `font-mono`,
    h = p
      ? {
          fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif`,
        }
      : void 0,
    g = (0, x.isValidElement)(e),
    _ = g ? e.props.ref : void 0,
    v = (0, x.useCallback)(
      (e) => {
        (Y(_, e), Y(f, e));
      },
      [_, f],
    );
  return (0, S.jsxs)(G, {
    open: a,
    onOpenChange: o,
    children: [
      (0, S.jsx)(K, {
        asChild: !0,
        children: g
          ? (0, x.cloneElement)(e, { className: b(`shrink-0`, e.props.className, d), ref: v })
          : (0, S.jsx)(`span`, { ref: f, className: b(`inline-flex shrink-0`, d), children: e }),
      }),
      (0, S.jsxs)(q, {
        align: c,
        side: s,
        sideOffset: l,
        className: b(
          n
            ? `max-w-72 flex-col items-start gap-1.5 px-3 py-2 text-left`
            : `max-w-[min(28rem,calc(100vw-1rem))] items-center gap-2 px-2.5 py-1 text-left has-data-[slot=kbd]:pr-1`,
          u,
        ),
        children: [
          n
            ? (0, S.jsxs)(`div`, {
                className: `flex w-full items-start justify-between gap-3`,
                children: [
                  (0, S.jsx)(`span`, {
                    className: `text-ui-sm font-medium leading-4 text-tooltip-foreground`,
                    children: t,
                  }),
                  r
                    ? (0, S.jsx)(`kbd`, {
                        "data-slot": `kbd`,
                        className: b(J, m, `shrink-0`),
                        style: h,
                        children: r,
                      })
                    : null,
                ],
              })
            : (0, S.jsx)(`span`, {
                className: `text-ui-sm font-medium whitespace-normal break-words text-tooltip-foreground`,
                children: t,
              }),
          n
            ? (0, S.jsx)(`span`, {
                className: `max-w-64 text-ui-sm/relaxed text-tooltip-foreground/80`,
                children: n,
              })
            : null,
          !n && r
            ? (0, S.jsx)(`kbd`, {
                "data-slot": `kbd`,
                className: b(J, m, `shrink-0`),
                style: h,
                children: r,
              })
            : null,
        ],
      }),
    ],
  });
}
function Z(e, t, n = {}) {
  if (!Number.isFinite(t)) return ``;
  let r = n.maximumFractionDigits ?? 1,
    i = Math.abs(t);
  return new Intl.NumberFormat(e || void 0, {
    notation: i >= 1e3 ? `compact` : `standard`,
    maximumFractionDigits: r,
    minimumFractionDigits: 0,
  }).format(t);
}
var Q = [
    `var(--color-usage-heatmap-0)`,
    `var(--color-usage-heatmap-1)`,
    `var(--color-usage-heatmap-2)`,
    `var(--color-usage-heatmap-3)`,
    `var(--color-usage-heatmap-4)`,
  ],
  we = 53,
  $ = 7,
  Te = 864e5;
function Ee(e, t) {
  return new Intl.NumberFormat(e, {
    notation: t >= 1e3 ? `compact` : `standard`,
    maximumFractionDigits: +(t >= 1e3),
  }).format(t);
}
function De(e, t) {
  return Z(e, t);
}
function Oe(e, t) {
  return new Intl.NumberFormat(e, {
    style: `percent`,
    maximumFractionDigits: t >= 0.1 ? 0 : 1,
  }).format(t);
}
function ke(e, t) {
  if (!t) return `--`;
  let n = new Date(`${t}T00:00:00.000Z`);
  return Number.isNaN(n.getTime())
    ? t
    : new Intl.DateTimeFormat(e, { timeZone: `UTC`, month: `short`, day: `numeric` }).format(n);
}
function Ae(e, t) {
  return t?.trim() || e.formatMessage({ id: `settings.usage.unknownModel` });
}
function je(e) {
  return { backgroundColor: Q[e] ?? Q[0] };
}
function Me(e, t, n) {
  return t.formatMessage(
    { id: `settings.usage.heatmapCell` },
    { date: ke(e, n.date), tokens: De(e, n.totalTokens), turns: Ee(e, n.turnCount) },
  );
}
function Ne({
  icon: e,
  label: t,
  value: n,
  helper: r,
  helperPlacement: i = `below`,
  valueSize: a = `xl`,
}) {
  let o = (0, S.jsx)(`div`, {
    className: b(
      `truncate font-semibold text-foreground`,
      a === `sm`
        ? `text-ui-base`
        : a === `base`
          ? `text-ui-lg`
          : a === `lg`
            ? `text-lg`
            : `text-3xl`,
    ),
    children: n,
  });
  return (0, S.jsxs)(`div`, {
    className: `min-w-0 rounded-lg bg-surface px-3.5 py-3`,
    children: [
      (0, S.jsxs)(`div`, {
        className: `flex min-w-0 items-center gap-2 text-ui-base text-foreground-subtle`,
        children: [
          (0, S.jsx)(e, { className: `size-3.5 shrink-0 text-foreground-subtle` }),
          (0, S.jsx)(`span`, { className: `truncate`, children: t }),
        ],
      }),
      i === `inline` && r
        ? (0, S.jsxs)(`div`, {
            className: `mt-2 flex min-w-0 items-baseline gap-2`,
            children: [
              o,
              (0, S.jsx)(`div`, {
                className: `min-w-0 truncate text-ui-base text-foreground-subtle`,
                children: r,
              }),
            ],
          })
        : (0, S.jsx)(`div`, { className: `mt-2`, children: o }),
      r && i === `below`
        ? (0, S.jsx)(`div`, {
            className: `mt-0.5 truncate text-ui-base text-foreground-subtle`,
            children: r,
          })
        : null,
    ],
  });
}
function Pe({ title: e, description: t }) {
  return (0, S.jsxs)(`div`, {
    className: `rounded-lg border border-dashed border-border px-4 py-10 text-center`,
    children: [
      (0, S.jsx)(`div`, { className: `text-ui-base font-medium text-foreground`, children: e }),
      (0, S.jsx)(`div`, { className: `mt-2 text-ui-base text-foreground-subtle`, children: t }),
    ],
  });
}
function Fe(e) {
  let t = new Date(`${e}T00:00:00.000Z`);
  return Number.isNaN(t.getTime()) ? null : Math.floor(t.getTime() / Te);
}
function Ie(e) {
  return new Date(e * Te).toISOString().slice(0, 10);
}
function Le(e) {
  return { date: e, level: 0, totalTokens: 0, turnCount: 0, toolCallCount: 0 };
}
function Re(e) {
  let t = e
    .flatMap((e) => e.days)
    .filter((e) => e !== null)
    .map((e) => ({ cell: e, dayIndex: Fe(e.date) }))
    .filter((e) => e.dayIndex !== null);
  if (t.length === 0) return e;
  let n = new Map(t.map(({ cell: e }) => [e.date, e])),
    r = Math.max(...t.map(({ dayIndex: e }) => e)) - we * $ + 1;
  return Array.from({ length: we }, (e, t) => ({
    weekIndex: t,
    days: Array.from({ length: $ }, (e, i) => {
      let a = Ie(r + t * $ + i);
      return n.get(a) ?? Le(a);
    }),
  }));
}
function ze({ locale: e, intl: t, weeks: n }) {
  let r = (0, x.useRef)(null),
    i = Re(n);
  return (
    (0, x.useEffect)(() => {
      let e = r.current;
      if (!e) return;
      let t = window.requestAnimationFrame(() => {
        e.scrollLeft = e.scrollWidth - e.clientWidth;
      });
      return () => {
        window.cancelAnimationFrame(t);
      };
    }, [n.map((e) => e.days.map((e) => e?.date ?? `empty`).join(`:`)).join(`|`)]),
    (0, S.jsx)(`div`, {
      className: `space-y-4`,
      children: (0, S.jsxs)(`div`, {
        className: `rounded-lg bg-surface px-3 py-3`,
        children: [
          (0, S.jsxs)(`div`, {
            className: `mb-3 flex items-center justify-between gap-3`,
            children: [
              (0, S.jsx)(`h3`, {
                className: `min-w-0 truncate text-ui-base font-medium text-foreground`,
                children: t.formatMessage({ id: `settings.usage.heatmapTitle` }),
              }),
              (0, S.jsxs)(`div`, {
                className: `flex shrink-0 items-center gap-2 text-ui-xs text-foreground-subtle`,
                children: [
                  (0, S.jsx)(`span`, {
                    children: t.formatMessage({ id: `settings.usage.heatmap.less` }),
                  }),
                  Q.map((e, t) =>
                    (0, S.jsx)(
                      `div`,
                      { className: `size-3.5 rounded-[4px] border border-border`, style: je(t) },
                      t,
                    ),
                  ),
                  (0, S.jsx)(`span`, {
                    children: t.formatMessage({ id: `settings.usage.heatmap.more` }),
                  }),
                ],
              }),
            ],
          }),
          (0, S.jsx)(`div`, {
            ref: r,
            className: `overflow-x-auto !scrollbar-hide`,
            children: (0, S.jsx)(`div`, {
              className: `min-w-max pr-2`,
              children: (0, S.jsx)(`div`, {
                className: `flex gap-1.5`,
                children: i.map((n) =>
                  (0, S.jsx)(
                    `div`,
                    {
                      className: `flex flex-col gap-1.5`,
                      children: n.days.map((r, i) =>
                        (0, S.jsx)(
                          Be,
                          { cell: r, locale: e, intl: t },
                          r?.date ?? `empty-${n.weekIndex}-${i}`,
                        ),
                      ),
                    },
                    n.weekIndex,
                  ),
                ),
              }),
            }),
          }),
        ],
      }),
    })
  );
}
function Be({ cell: e, locale: t, intl: n }) {
  let r = (0, S.jsx)(`div`, {
    className: b(
      `size-3.5 rounded-[4px] border transition-transform hover:scale-110 hover:border-border-hover`,
      (e?.totalTokens ?? 0) > 0 ? `border-border` : `border-transparent`,
      !e && `bg-background`,
    ),
    style: e ? je(e.level) : void 0,
  });
  return e ? (0, S.jsx)(X, { title: Me(t, n, e), children: r }) : r;
}
export {
  De as a,
  Ae as c,
  G as d,
  q as f,
  C as g,
  ee as h,
  Ee as i,
  Z as l,
  K as m,
  ze as n,
  ke as o,
  Ce as p,
  Ne as r,
  Oe as s,
  Pe as t,
  X as u,
};
