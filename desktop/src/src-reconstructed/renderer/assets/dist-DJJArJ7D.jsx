import { s as e } from "./chunk-Cq_f4orQ.js";
import { t } from "./react-BQLj9xdT.js";
import { t as n } from "./react-dom-BlRPXJso.js";
import { t as r } from "./jsx-runtime-B5yMD3-t.js";
import { a as i, n as a } from "./dist-vnZIbudW.js";
var o = e(t(), 1);
typeof window < `u` && window.document && window.document.createElement;
function s(e, t, {
  checkForDefaultPrevented: n = !0
} = {}) {
  return function (r) {
    if (e?.(r), n === !1 || !r.defaultPrevented) return t?.(r);
  };
}
var c = e(n(), 1),
  l = r();
function u(e, t) {
  let n = o.createContext(t),
    r = e => {
      let {
          children: t,
          ...r
        } = e,
        i = o.useMemo(() => r, Object.values(r));
      return <n.Provider value={i}>{t}</n.Provider>;
    };
  r.displayName = e + `Provider`;
  function i(r) {
    let i = o.useContext(n);
    if (i) return i;
    if (t !== void 0) return t;
    throw Error(`\`${r}\` must be used within \`${e}\``);
  }
  return [r, i];
}
function d(e, t = []) {
  let n = [];
  function r(t, r) {
    let i = o.createContext(r),
      a = n.length;
    n = [...n, r];
    let s = t => {
      let {
          scope: n,
          children: r,
          ...s
        } = t,
        c = n?.[e]?.[a] || i,
        u = o.useMemo(() => s, Object.values(s));
      return <c.Provider value={u}>{r}</c.Provider>;
    };
    s.displayName = t + `Provider`;
    function c(n, s) {
      let c = s?.[e]?.[a] || i,
        l = o.useContext(c);
      if (l) return l;
      if (r !== void 0) return r;
      throw Error(`\`${n}\` must be used within \`${t}\``);
    }
    return [s, c];
  }
  let i = () => {
    let t = n.map(e => o.createContext(e));
    return function (n) {
      let r = n?.[e] || t;
      return o.useMemo(() => ({
        [`__scope${e}`]: {
          ...n,
          [e]: r
        }
      }), [n, r]);
    };
  };
  return i.scopeName = e, [r, f(i, ...t)];
}
function f(...e) {
  let t = e[0];
  if (e.length === 1) return t;
  let n = () => {
    let n = e.map(e => ({
      useScope: e(),
      scopeName: e.scopeName
    }));
    return function (e) {
      let r = n.reduce((t, {
        useScope: n,
        scopeName: r
      }) => {
        let i = n(e)[`__scope${r}`];
        return {
          ...t,
          ...i
        };
      }, {});
      return o.useMemo(() => ({
        [`__scope${t.scopeName}`]: r
      }), [r]);
    };
  };
  return n.scopeName = t.scopeName, n;
}
var p = globalThis?.document ? o.useLayoutEffect : () => {},
  m = o.useId || (() => void 0),
  h = 0;
function g(e) {
  let [t, n] = o.useState(m());
  return p(() => {
    e || n(e => e ?? String(h++));
  }, [e]), e || (t ? `radix-${t}` : ``);
}
var _ = o.useInsertionEffect || p;
function v({
  prop: e,
  defaultProp: t,
  onChange: n = () => {},
  caller: r
}) {
  let [i, a, s] = y({
      defaultProp: t,
      onChange: n
    }),
    c = e !== void 0,
    l = c ? e : i;
  {
    let t = o.useRef(e !== void 0);
    o.useEffect(() => {
      let e = t.current;
      e !== c && console.warn(`${r} is changing from ${e ? `controlled` : `uncontrolled`} to ${c ? `controlled` : `uncontrolled`}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`), t.current = c;
    }, [c, r]);
  }
  return [l, o.useCallback(t => {
    if (c) {
      let n = b(t) ? t(e) : t;
      n !== e && s.current?.(n);
    } else a(t);
  }, [c, e, a, s])];
}
function y({
  defaultProp: e,
  onChange: t
}) {
  let [n, r] = o.useState(e),
    i = o.useRef(n),
    a = o.useRef(t);
  return _(() => {
    a.current = t;
  }, [t]), o.useEffect(() => {
    i.current !== n && (a.current?.(n), i.current = n);
  }, [n, i]), [n, r, a];
}
function b(e) {
  return typeof e == `function`;
}
var x = [`a`, `button`, `div`, `form`, `h2`, `h3`, `img`, `input`, `label`, `li`, `nav`, `ol`, `p`, `select`, `span`, `svg`, `ul`].reduce((e, t) => {
  let n = a(`Primitive.${t}`),
    r = o.forwardRef((e, r) => {
      let {
          asChild: i,
          ...a
        } = e,
        o = i ? n : t;
      return typeof window < `u` && (window[Symbol.for(`radix-ui`)] = !0), (0, l.jsx)(o, {
        ...a,
        ref: r
      });
    });
  return r.displayName = `Primitive.${t}`, {
    ...e,
    [t]: r
  };
}, {});
function S(e, t) {
  e && c.flushSync(() => e.dispatchEvent(t));
}
function C(e) {
  let t = o.useRef(e);
  return o.useEffect(() => {
    t.current = e;
  }), o.useMemo(() => (...e) => t.current?.(...e), []);
}
function w(e, t = globalThis?.document) {
  let n = C(e);
  o.useEffect(() => {
    let e = e => {
      e.key === `Escape` && n(e);
    };
    return t.addEventListener(`keydown`, e, {
      capture: !0
    }), () => t.removeEventListener(`keydown`, e, {
      capture: !0
    });
  }, [n, t]);
}
var T = `DismissableLayer`,
  E = `dismissableLayer.update`,
  D = `dismissableLayer.pointerDownOutside`,
  O = `dismissableLayer.focusOutside`,
  k,
  A = o.createContext({
    layers: new Set(),
    layersWithOutsidePointerEventsDisabled: new Set(),
    branches: new Set()
  }),
  j = o.forwardRef((e, t) => {
    let {
        disableOutsidePointerEvents: n = !1,
        onEscapeKeyDown: r,
        onPointerDownOutside: a,
        onFocusOutside: c,
        onInteractOutside: u,
        onDismiss: d,
        ...f
      } = e,
      p = o.useContext(A),
      [m, h] = o.useState(null),
      g = m?.ownerDocument ?? globalThis?.document,
      [, _] = o.useState({}),
      v = i(t, e => h(e)),
      y = Array.from(p.layers),
      [b] = [...p.layersWithOutsidePointerEventsDisabled].slice(-1),
      S = y.indexOf(b),
      C = m ? y.indexOf(m) : -1,
      T = p.layersWithOutsidePointerEventsDisabled.size > 0,
      D = C >= S,
      O = P(e => {
        let t = e.target,
          n = [...p.branches].some(e => e.contains(t));
        !D || n || (a?.(e), u?.(e), e.defaultPrevented || d?.());
      }, g),
      j = F(e => {
        let t = e.target;
        [...p.branches].some(e => e.contains(t)) || (c?.(e), u?.(e), e.defaultPrevented || d?.());
      }, g);
    return w(e => {
      C === p.layers.size - 1 && (r?.(e), !e.defaultPrevented && d && (e.preventDefault(), d()));
    }, g), o.useEffect(() => {
      if (m) return n && (p.layersWithOutsidePointerEventsDisabled.size === 0 && (k = g.body.style.pointerEvents, g.body.style.pointerEvents = `none`), p.layersWithOutsidePointerEventsDisabled.add(m)), p.layers.add(m), ee(), () => {
        n && p.layersWithOutsidePointerEventsDisabled.size === 1 && (g.body.style.pointerEvents = k);
      };
    }, [m, g, n, p]), o.useEffect(() => () => {
      m && (p.layers.delete(m), p.layersWithOutsidePointerEventsDisabled.delete(m), ee());
    }, [m, p]), o.useEffect(() => {
      let e = () => _({});
      return document.addEventListener(E, e), () => document.removeEventListener(E, e);
    }, []), <x.div {...f} ref={v} style={{
      pointerEvents: T ? D ? `auto` : `none` : void 0,
      ...e.style
    }} onFocusCapture={s(e.onFocusCapture, j.onFocusCapture)} onBlurCapture={s(e.onBlurCapture, j.onBlurCapture)} onPointerDownCapture={s(e.onPointerDownCapture, O.onPointerDownCapture)} />;
  });
j.displayName = T;
var M = `DismissableLayerBranch`,
  N = o.forwardRef((e, t) => {
    let n = o.useContext(A),
      r = o.useRef(null),
      a = i(t, r);
    return o.useEffect(() => {
      let e = r.current;
      if (e) return n.branches.add(e), () => {
        n.branches.delete(e);
      };
    }, [n.branches]), <x.div {...e} ref={a} />;
  });
N.displayName = M;
function P(e, t = globalThis?.document) {
  let n = C(e),
    r = o.useRef(!1),
    i = o.useRef(() => {});
  return o.useEffect(() => {
    let e = e => {
        if (e.target && !r.current) {
          let r = function () {
              te(D, n, a, {
                discrete: !0
              });
            },
            a = {
              originalEvent: e
            };
          e.pointerType === `touch` ? (t.removeEventListener(`click`, i.current), i.current = r, t.addEventListener(`click`, i.current, {
            once: !0
          })) : r();
        } else t.removeEventListener(`click`, i.current);
        r.current = !1;
      },
      a = window.setTimeout(() => {
        t.addEventListener(`pointerdown`, e);
      }, 0);
    return () => {
      window.clearTimeout(a), t.removeEventListener(`pointerdown`, e), t.removeEventListener(`click`, i.current);
    };
  }, [t, n]), {
    onPointerDownCapture: () => r.current = !0
  };
}
function F(e, t = globalThis?.document) {
  let n = C(e),
    r = o.useRef(!1);
  return o.useEffect(() => {
    let e = e => {
      e.target && !r.current && te(O, n, {
        originalEvent: e
      }, {
        discrete: !1
      });
    };
    return t.addEventListener(`focusin`, e), () => t.removeEventListener(`focusin`, e);
  }, [t, n]), {
    onFocusCapture: () => r.current = !0,
    onBlurCapture: () => r.current = !1
  };
}
function ee() {
  let e = new CustomEvent(E);
  document.dispatchEvent(e);
}
function te(e, t, n, {
  discrete: r
}) {
  let i = n.originalEvent.target,
    a = new CustomEvent(e, {
      bubbles: !1,
      cancelable: !0,
      detail: n
    });
  t && i.addEventListener(e, t, {
    once: !0
  }), r ? S(i, a) : i.dispatchEvent(a);
}
var ne = `Portal`,
  re = o.forwardRef((e, t) => {
    let {
        container: n,
        ...r
      } = e,
      [i, a] = o.useState(!1);
    p(() => a(!0), []);
    let s = n || i && globalThis?.document?.body;
    return s ? c.createPortal(<x.div {...r} ref={t} />, s) : null;
  });
re.displayName = ne;
function I(e, t) {
  return o.useReducer((e, n) => t[e][n] ?? e, e);
}
var ie = e => {
  let {
      present: t,
      children: n
    } = e,
    r = ae(t),
    a = typeof n == `function` ? n({
      present: r.isPresent
    }) : o.Children.only(n),
    s = i(r.ref, oe(a));
  return typeof n == `function` || r.isPresent ? o.cloneElement(a, {
    ref: s
  }) : null;
};
ie.displayName = `Presence`;
function ae(e) {
  let [t, n] = o.useState(),
    r = o.useRef(null),
    i = o.useRef(e),
    a = o.useRef(`none`),
    [s, c] = I(e ? `mounted` : `unmounted`, {
      mounted: {
        UNMOUNT: `unmounted`,
        ANIMATION_OUT: `unmountSuspended`
      },
      unmountSuspended: {
        MOUNT: `mounted`,
        ANIMATION_END: `unmounted`
      },
      unmounted: {
        MOUNT: `mounted`
      }
    });
  return o.useEffect(() => {
    let e = L(r.current);
    a.current = s === `mounted` ? e : `none`;
  }, [s]), p(() => {
    let t = r.current,
      n = i.current;
    if (n !== e) {
      let r = a.current,
        o = L(t);
      e ? c(`MOUNT`) : o === `none` || t?.display === `none` ? c(`UNMOUNT`) : c(n && r !== o ? `ANIMATION_OUT` : `UNMOUNT`), i.current = e;
    }
  }, [e, c]), p(() => {
    if (t) {
      let e,
        n = t.ownerDocument.defaultView ?? window,
        o = a => {
          let o = L(r.current).includes(CSS.escape(a.animationName));
          if (a.target === t && o && (c(`ANIMATION_END`), !i.current)) {
            let r = t.style.animationFillMode;
            t.style.animationFillMode = `forwards`, e = n.setTimeout(() => {
              t.style.animationFillMode === `forwards` && (t.style.animationFillMode = r);
            });
          }
        },
        s = e => {
          e.target === t && (a.current = L(r.current));
        };
      return t.addEventListener(`animationstart`, s), t.addEventListener(`animationcancel`, o), t.addEventListener(`animationend`, o), () => {
        n.clearTimeout(e), t.removeEventListener(`animationstart`, s), t.removeEventListener(`animationcancel`, o), t.removeEventListener(`animationend`, o);
      };
    } else c(`ANIMATION_END`);
  }, [t, c]), {
    isPresent: [`mounted`, `unmountSuspended`].includes(s),
    ref: o.useCallback(e => {
      r.current = e ? getComputedStyle(e) : null, n(e);
    }, [])
  };
}
function L(e) {
  return e?.animationName || `none`;
}
function oe(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, `ref`)?.get,
    n = t && `isReactWarning` in t && t.isReactWarning;
  return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, `ref`)?.get, n = t && `isReactWarning` in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function se(e) {
  let [t, n] = o.useState(void 0);
  return p(() => {
    if (e) {
      n({
        width: e.offsetWidth,
        height: e.offsetHeight
      });
      let t = new ResizeObserver(t => {
        if (!Array.isArray(t) || !t.length) return;
        let r = t[0],
          i,
          a;
        if (`borderBoxSize` in r) {
          let e = r.borderBoxSize,
            t = Array.isArray(e) ? e[0] : e;
          i = t.inlineSize, a = t.blockSize;
        } else i = e.offsetWidth, a = e.offsetHeight;
        n({
          width: i,
          height: a
        });
      });
      return t.observe(e, {
        box: `border-box`
      }), () => t.unobserve(e);
    } else n(void 0);
  }, [e]), t;
}
var ce = [`top`, `right`, `bottom`, `left`],
  R = Math.min,
  z = Math.max,
  le = Math.round,
  ue = Math.floor,
  B = e => ({
    x: e,
    y: e
  }),
  de = {
    left: `right`,
    right: `left`,
    bottom: `top`,
    top: `bottom`
  };
function fe(e, t, n) {
  return z(e, R(t, n));
}
function V(e, t) {
  return typeof e == `function` ? e(t) : e;
}
function H(e) {
  return e.split(`-`)[0];
}
function U(e) {
  return e.split(`-`)[1];
}
function pe(e) {
  return e === `x` ? `y` : `x`;
}
function me(e) {
  return e === `y` ? `height` : `width`;
}
function W(e) {
  let t = e[0];
  return t === `t` || t === `b` ? `y` : `x`;
}
function he(e) {
  return pe(W(e));
}
function ge(e, t, n) {
  n === void 0 && (n = !1);
  let r = U(e),
    i = he(e),
    a = me(i),
    o = i === `x` ? r === (n ? `end` : `start`) ? `right` : `left` : r === `start` ? `bottom` : `top`;
  return t.reference[a] > t.floating[a] && (o = Te(o)), [o, Te(o)];
}
function _e(e) {
  let t = Te(e);
  return [ve(e), t, ve(t)];
}
function ve(e) {
  return e.includes(`start`) ? e.replace(`start`, `end`) : e.replace(`end`, `start`);
}
var ye = [`left`, `right`],
  be = [`right`, `left`],
  xe = [`top`, `bottom`],
  Se = [`bottom`, `top`];
function Ce(e, t, n) {
  switch (e) {
    case `top`:
    case `bottom`:
      return n ? t ? be : ye : t ? ye : be;
    case `left`:
    case `right`:
      return t ? xe : Se;
    default:
      return [];
  }
}
function we(e, t, n, r) {
  let i = U(e),
    a = Ce(H(e), n === `start`, r);
  return i && (a = a.map(e => e + `-` + i), t && (a = a.concat(a.map(ve)))), a;
}
function Te(e) {
  let t = H(e);
  return de[t] + e.slice(t.length);
}
function Ee(e) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...e
  };
}
function De(e) {
  return typeof e == `number` ? {
    top: e,
    right: e,
    bottom: e,
    left: e
  } : Ee(e);
}
function Oe(e) {
  let {
    x: t,
    y: n,
    width: r,
    height: i
  } = e;
  return {
    width: r,
    height: i,
    top: n,
    left: t,
    right: t + r,
    bottom: n + i,
    x: t,
    y: n
  };
}
function ke(e, t, n) {
  let {
      reference: r,
      floating: i
    } = e,
    a = W(t),
    o = he(t),
    s = me(o),
    c = H(t),
    l = a === `y`,
    u = r.x + r.width / 2 - i.width / 2,
    d = r.y + r.height / 2 - i.height / 2,
    f = r[s] / 2 - i[s] / 2,
    p;
  switch (c) {
    case `top`:
      p = {
        x: u,
        y: r.y - i.height
      };
      break;
    case `bottom`:
      p = {
        x: u,
        y: r.y + r.height
      };
      break;
    case `right`:
      p = {
        x: r.x + r.width,
        y: d
      };
      break;
    case `left`:
      p = {
        x: r.x - i.width,
        y: d
      };
      break;
    default:
      p = {
        x: r.x,
        y: r.y
      };
  }
  switch (U(t)) {
    case `start`:
      p[o] -= f * (n && l ? -1 : 1);
      break;
    case `end`:
      p[o] += f * (n && l ? -1 : 1);
      break;
  }
  return p;
}
async function Ae(e, t) {
  t === void 0 && (t = {});
  let {
      x: n,
      y: r,
      platform: i,
      rects: a,
      elements: o,
      strategy: s
    } = e,
    {
      boundary: c = `clippingAncestors`,
      rootBoundary: l = `viewport`,
      elementContext: u = `floating`,
      altBoundary: d = !1,
      padding: f = 0
    } = V(t, e),
    p = De(f),
    m = o[d ? u === `floating` ? `reference` : `floating` : u],
    h = Oe(await i.getClippingRect({
      element: (await (i.isElement == null ? void 0 : i.isElement(m))) ?? !0 ? m : m.contextElement || (await (i.getDocumentElement == null ? void 0 : i.getDocumentElement(o.floating))),
      boundary: c,
      rootBoundary: l,
      strategy: s
    })),
    g = u === `floating` ? {
      x: n,
      y: r,
      width: a.floating.width,
      height: a.floating.height
    } : a.reference,
    _ = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(o.floating)),
    v = (await (i.isElement == null ? void 0 : i.isElement(_))) && (await (i.getScale == null ? void 0 : i.getScale(_))) || {
      x: 1,
      y: 1
    },
    y = Oe(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
      elements: o,
      rect: g,
      offsetParent: _,
      strategy: s
    }) : g);
  return {
    top: (h.top - y.top + p.top) / v.y,
    bottom: (y.bottom - h.bottom + p.bottom) / v.y,
    left: (h.left - y.left + p.left) / v.x,
    right: (y.right - h.right + p.right) / v.x
  };
}
var je = 50,
  Me = async (e, t, n) => {
    let {
        placement: r = `bottom`,
        strategy: i = `absolute`,
        middleware: a = [],
        platform: o
      } = n,
      s = o.detectOverflow ? o : {
        ...o,
        detectOverflow: Ae
      },
      c = await (o.isRTL == null ? void 0 : o.isRTL(t)),
      l = await o.getElementRects({
        reference: e,
        floating: t,
        strategy: i
      }),
      {
        x: u,
        y: d
      } = ke(l, r, c),
      f = r,
      p = 0,
      m = {};
    for (let n = 0; n < a.length; n++) {
      let h = a[n];
      if (!h) continue;
      let {
          name: g,
          fn: _
        } = h,
        {
          x: v,
          y,
          data: b,
          reset: x
        } = await _({
          x: u,
          y: d,
          initialPlacement: r,
          placement: f,
          strategy: i,
          middlewareData: m,
          rects: l,
          platform: s,
          elements: {
            reference: e,
            floating: t
          }
        });
      u = v ?? u, d = y ?? d, m[g] = {
        ...m[g],
        ...b
      }, x && p < je && (p++, typeof x == `object` && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
        reference: e,
        floating: t,
        strategy: i
      }) : x.rects), {
        x: u,
        y: d
      } = ke(l, f, c)), n = -1);
    }
    return {
      x: u,
      y: d,
      placement: f,
      strategy: i,
      middlewareData: m
    };
  },
  Ne = e => ({
    name: `arrow`,
    options: e,
    async fn(t) {
      let {
          x: n,
          y: r,
          placement: i,
          rects: a,
          platform: o,
          elements: s,
          middlewareData: c
        } = t,
        {
          element: l,
          padding: u = 0
        } = V(e, t) || {};
      if (l == null) return {};
      let d = De(u),
        f = {
          x: n,
          y: r
        },
        p = he(i),
        m = me(p),
        h = await o.getDimensions(l),
        g = p === `y`,
        _ = g ? `top` : `left`,
        v = g ? `bottom` : `right`,
        y = g ? `clientHeight` : `clientWidth`,
        b = a.reference[m] + a.reference[p] - f[p] - a.floating[m],
        x = f[p] - a.reference[p],
        S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)),
        C = S ? S[y] : 0;
      (!C || !(await (o.isElement == null ? void 0 : o.isElement(S)))) && (C = s.floating[y] || a.floating[m]);
      let w = b / 2 - x / 2,
        T = C / 2 - h[m] / 2 - 1,
        E = R(d[_], T),
        D = R(d[v], T),
        O = E,
        k = C - h[m] - D,
        A = C / 2 - h[m] / 2 + w,
        j = fe(O, A, k),
        M = !c.arrow && U(i) != null && A !== j && a.reference[m] / 2 - (A < O ? E : D) - h[m] / 2 < 0,
        N = M ? A < O ? A - O : A - k : 0;
      return {
        [p]: f[p] + N,
        data: {
          [p]: j,
          centerOffset: A - j - N,
          ...(M && {
            alignmentOffset: N
          })
        },
        reset: M
      };
    }
  }),
  Pe = function (e) {
    return e === void 0 && (e = {}), {
      name: `flip`,
      options: e,
      async fn(t) {
        var n;
        let {
            placement: r,
            middlewareData: i,
            rects: a,
            initialPlacement: o,
            platform: s,
            elements: c
          } = t,
          {
            mainAxis: l = !0,
            crossAxis: u = !0,
            fallbackPlacements: d,
            fallbackStrategy: f = `bestFit`,
            fallbackAxisSideDirection: p = `none`,
            flipAlignment: m = !0,
            ...h
          } = V(e, t);
        if ((n = i.arrow) != null && n.alignmentOffset) return {};
        let g = H(r),
          _ = W(o),
          v = H(o) === o,
          y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)),
          b = d || (v || !m ? [Te(o)] : _e(o)),
          x = p !== `none`;
        !d && x && b.push(...we(o, m, p, y));
        let S = [o, ...b],
          C = await s.detectOverflow(t, h),
          w = [],
          T = i.flip?.overflows || [];
        if (l && w.push(C[g]), u) {
          let e = ge(r, a, y);
          w.push(C[e[0]], C[e[1]]);
        }
        if (T = [...T, {
          placement: r,
          overflows: w
        }], !w.every(e => e <= 0)) {
          let e = (i.flip?.index || 0) + 1,
            t = S[e];
          if (t && (!(u === `alignment` && _ !== W(t)) || T.every(e => W(e.placement) === _ ? e.overflows[0] > 0 : !0))) return {
            data: {
              index: e,
              overflows: T
            },
            reset: {
              placement: t
            }
          };
          let n = T.filter(e => e.overflows[0] <= 0).sort((e, t) => e.overflows[1] - t.overflows[1])[0]?.placement;
          if (!n) switch (f) {
            case `bestFit`:
              {
                let e = T.filter(e => {
                  if (x) {
                    let t = W(e.placement);
                    return t === _ || t === `y`;
                  }
                  return !0;
                }).map(e => [e.placement, e.overflows.filter(e => e > 0).reduce((e, t) => e + t, 0)]).sort((e, t) => e[1] - t[1])[0]?.[0];
                e && (n = e);
                break;
              }
            case `initialPlacement`:
              n = o;
              break;
          }
          if (r !== n) return {
            reset: {
              placement: n
            }
          };
        }
        return {};
      }
    };
  };
function Fe(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function Ie(e) {
  return ce.some(t => e[t] >= 0);
}
var Le = function (e) {
    return e === void 0 && (e = {}), {
      name: `hide`,
      options: e,
      async fn(t) {
        let {
            rects: n,
            platform: r
          } = t,
          {
            strategy: i = `referenceHidden`,
            ...a
          } = V(e, t);
        switch (i) {
          case `referenceHidden`:
            {
              let e = Fe(await r.detectOverflow(t, {
                ...a,
                elementContext: `reference`
              }), n.reference);
              return {
                data: {
                  referenceHiddenOffsets: e,
                  referenceHidden: Ie(e)
                }
              };
            }
          case `escaped`:
            {
              let e = Fe(await r.detectOverflow(t, {
                ...a,
                altBoundary: !0
              }), n.floating);
              return {
                data: {
                  escapedOffsets: e,
                  escaped: Ie(e)
                }
              };
            }
          default:
            return {};
        }
      }
    };
  },
  Re = new Set([`left`, `top`]);
async function ze(e, t) {
  let {
      placement: n,
      platform: r,
      elements: i
    } = e,
    a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)),
    o = H(n),
    s = U(n),
    c = W(n) === `y`,
    l = Re.has(o) ? -1 : 1,
    u = a && c ? -1 : 1,
    d = V(t, e),
    {
      mainAxis: f,
      crossAxis: p,
      alignmentAxis: m
    } = typeof d == `number` ? {
      mainAxis: d,
      crossAxis: 0,
      alignmentAxis: null
    } : {
      mainAxis: d.mainAxis || 0,
      crossAxis: d.crossAxis || 0,
      alignmentAxis: d.alignmentAxis
    };
  return s && typeof m == `number` && (p = s === `end` ? m * -1 : m), c ? {
    x: p * u,
    y: f * l
  } : {
    x: f * l,
    y: p * u
  };
}
var Be = function (e) {
    return e === void 0 && (e = 0), {
      name: `offset`,
      options: e,
      async fn(t) {
        var n;
        let {
            x: r,
            y: i,
            placement: a,
            middlewareData: o
          } = t,
          s = await ze(t, e);
        return a === o.offset?.placement && (n = o.arrow) != null && n.alignmentOffset ? {} : {
          x: r + s.x,
          y: i + s.y,
          data: {
            ...s,
            placement: a
          }
        };
      }
    };
  },
  Ve = function (e) {
    return e === void 0 && (e = {}), {
      name: `shift`,
      options: e,
      async fn(t) {
        let {
            x: n,
            y: r,
            placement: i,
            platform: a
          } = t,
          {
            mainAxis: o = !0,
            crossAxis: s = !1,
            limiter: c = {
              fn: e => {
                let {
                  x: t,
                  y: n
                } = e;
                return {
                  x: t,
                  y: n
                };
              }
            },
            ...l
          } = V(e, t),
          u = {
            x: n,
            y: r
          },
          d = await a.detectOverflow(t, l),
          f = W(H(i)),
          p = pe(f),
          m = u[p],
          h = u[f];
        if (o) {
          let e = p === `y` ? `top` : `left`,
            t = p === `y` ? `bottom` : `right`,
            n = m + d[e],
            r = m - d[t];
          m = fe(n, m, r);
        }
        if (s) {
          let e = f === `y` ? `top` : `left`,
            t = f === `y` ? `bottom` : `right`,
            n = h + d[e],
            r = h - d[t];
          h = fe(n, h, r);
        }
        let g = c.fn({
          ...t,
          [p]: m,
          [f]: h
        });
        return {
          ...g,
          data: {
            x: g.x - n,
            y: g.y - r,
            enabled: {
              [p]: o,
              [f]: s
            }
          }
        };
      }
    };
  },
  He = function (e) {
    return e === void 0 && (e = {}), {
      options: e,
      fn(t) {
        let {
            x: n,
            y: r,
            placement: i,
            rects: a,
            middlewareData: o
          } = t,
          {
            offset: s = 0,
            mainAxis: c = !0,
            crossAxis: l = !0
          } = V(e, t),
          u = {
            x: n,
            y: r
          },
          d = W(i),
          f = pe(d),
          p = u[f],
          m = u[d],
          h = V(s, t),
          g = typeof h == `number` ? {
            mainAxis: h,
            crossAxis: 0
          } : {
            mainAxis: 0,
            crossAxis: 0,
            ...h
          };
        if (c) {
          let e = f === `y` ? `height` : `width`,
            t = a.reference[f] - a.floating[e] + g.mainAxis,
            n = a.reference[f] + a.reference[e] - g.mainAxis;
          p < t ? p = t : p > n && (p = n);
        }
        if (l) {
          let e = f === `y` ? `width` : `height`,
            t = Re.has(H(i)),
            n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis),
            r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
          m < n ? m = n : m > r && (m = r);
        }
        return {
          [f]: p,
          [d]: m
        };
      }
    };
  },
  Ue = function (e) {
    return e === void 0 && (e = {}), {
      name: `size`,
      options: e,
      async fn(t) {
        var n, r;
        let {
            placement: i,
            rects: a,
            platform: o,
            elements: s
          } = t,
          {
            apply: c = () => {},
            ...l
          } = V(e, t),
          u = await o.detectOverflow(t, l),
          d = H(i),
          f = U(i),
          p = W(i) === `y`,
          {
            width: m,
            height: h
          } = a.floating,
          g,
          _;
        d === `top` || d === `bottom` ? (g = d, _ = f === ((await (o.isRTL == null ? void 0 : o.isRTL(s.floating))) ? `start` : `end`) ? `left` : `right`) : (_ = d, g = f === `end` ? `top` : `bottom`);
        let v = h - u.top - u.bottom,
          y = m - u.left - u.right,
          b = R(h - u[g], v),
          x = R(m - u[_], y),
          S = !t.middlewareData.shift,
          C = b,
          w = x;
        if ((n = t.middlewareData.shift) != null && n.enabled.x && (w = y), (r = t.middlewareData.shift) != null && r.enabled.y && (C = v), S && !f) {
          let e = z(u.left, 0),
            t = z(u.right, 0),
            n = z(u.top, 0),
            r = z(u.bottom, 0);
          p ? w = m - 2 * (e !== 0 || t !== 0 ? e + t : z(u.left, u.right)) : C = h - 2 * (n !== 0 || r !== 0 ? n + r : z(u.top, u.bottom));
        }
        await c({
          ...t,
          availableWidth: w,
          availableHeight: C
        });
        let T = await o.getDimensions(s.floating);
        return m !== T.width || h !== T.height ? {
          reset: {
            rects: !0
          }
        } : {};
      }
    };
  };
function We() {
  return typeof window < `u`;
}
function Ge(e) {
  return Ke(e) ? (e.nodeName || ``).toLowerCase() : `#document`;
}
function G(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function K(e) {
  return ((Ke(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function Ke(e) {
  return We() ? e instanceof Node || e instanceof G(e).Node : !1;
}
function q(e) {
  return We() ? e instanceof Element || e instanceof G(e).Element : !1;
}
function J(e) {
  return We() ? e instanceof HTMLElement || e instanceof G(e).HTMLElement : !1;
}
function qe(e) {
  return !We() || typeof ShadowRoot > `u` ? !1 : e instanceof ShadowRoot || e instanceof G(e).ShadowRoot;
}
function Je(e) {
  let {
    overflow: t,
    overflowX: n,
    overflowY: r,
    display: i
  } = X(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== `inline` && i !== `contents`;
}
function Ye(e) {
  return /^(table|td|th)$/.test(Ge(e));
}
function Xe(e) {
  try {
    if (e.matches(`:popover-open`)) return !0;
  } catch {}
  try {
    return e.matches(`:modal`);
  } catch {
    return !1;
  }
}
var Ze = /transform|translate|scale|rotate|perspective|filter/,
  Qe = /paint|layout|strict|content/,
  Y = e => !!e && e !== `none`,
  $e;
function et(e) {
  let t = q(e) ? X(e) : e;
  return Y(t.transform) || Y(t.translate) || Y(t.scale) || Y(t.rotate) || Y(t.perspective) || !nt() && (Y(t.backdropFilter) || Y(t.filter)) || Ze.test(t.willChange || ``) || Qe.test(t.contain || ``);
}
function tt(e) {
  let t = Z(e);
  for (; J(t) && !rt(t);) {
    if (et(t)) return t;
    if (Xe(t)) return null;
    t = Z(t);
  }
  return null;
}
function nt() {
  return $e ??= typeof CSS < `u` && CSS.supports && CSS.supports(`-webkit-backdrop-filter`, `none`), $e;
}
function rt(e) {
  return /^(html|body|#document)$/.test(Ge(e));
}
function X(e) {
  return G(e).getComputedStyle(e);
}
function it(e) {
  return q(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function Z(e) {
  if (Ge(e) === `html`) return e;
  let t = e.assignedSlot || e.parentNode || qe(e) && e.host || K(e);
  return qe(t) ? t.host : t;
}
function at(e) {
  let t = Z(e);
  return rt(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : J(t) && Je(t) ? t : at(t);
}
function ot(e, t, n) {
  t === void 0 && (t = []), n === void 0 && (n = !0);
  let r = at(e),
    i = r === e.ownerDocument?.body,
    a = G(r);
  if (i) {
    let e = st(a);
    return t.concat(a, a.visualViewport || [], Je(r) ? r : [], e && n ? ot(e) : []);
  } else return t.concat(r, ot(r, [], n));
}
function st(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function ct(e) {
  let t = X(e),
    n = parseFloat(t.width) || 0,
    r = parseFloat(t.height) || 0,
    i = J(e),
    a = i ? e.offsetWidth : n,
    o = i ? e.offsetHeight : r,
    s = le(n) !== a || le(r) !== o;
  return s && (n = a, r = o), {
    width: n,
    height: r,
    $: s
  };
}
function lt(e) {
  return q(e) ? e : e.contextElement;
}
function Q(e) {
  let t = lt(e);
  if (!J(t)) return B(1);
  let n = t.getBoundingClientRect(),
    {
      width: r,
      height: i,
      $: a
    } = ct(t),
    o = (a ? le(n.width) : n.width) / r,
    s = (a ? le(n.height) : n.height) / i;
  return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
    x: o,
    y: s
  };
}
var ut = B(0);
function dt(e) {
  let t = G(e);
  return !nt() || !t.visualViewport ? ut : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function ft(e, t, n) {
  return t === void 0 && (t = !1), !n || t && n !== G(e) ? !1 : t;
}
function $(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  let i = e.getBoundingClientRect(),
    a = lt(e),
    o = B(1);
  t && (r ? q(r) && (o = Q(r)) : o = Q(e));
  let s = ft(a, n, r) ? dt(a) : B(0),
    c = (i.left + s.x) / o.x,
    l = (i.top + s.y) / o.y,
    u = i.width / o.x,
    d = i.height / o.y;
  if (a) {
    let e = G(a),
      t = r && q(r) ? G(r) : r,
      n = e,
      i = st(n);
    for (; i && r && t !== n;) {
      let e = Q(i),
        t = i.getBoundingClientRect(),
        r = X(i),
        a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x,
        o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
      c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = G(i), i = st(n);
    }
  }
  return Oe({
    width: u,
    height: d,
    x: c,
    y: l
  });
}
function pt(e, t) {
  let n = it(e).scrollLeft;
  return t ? t.left + n : $(K(e)).left + n;
}
function mt(e, t) {
  let n = e.getBoundingClientRect();
  return {
    x: n.left + t.scrollLeft - pt(e, n),
    y: n.top + t.scrollTop
  };
}
function ht(e) {
  let {
      elements: t,
      rect: n,
      offsetParent: r,
      strategy: i
    } = e,
    a = i === `fixed`,
    o = K(r),
    s = t ? Xe(t.floating) : !1;
  if (r === o || s && a) return n;
  let c = {
      scrollLeft: 0,
      scrollTop: 0
    },
    l = B(1),
    u = B(0),
    d = J(r);
  if ((d || !d && !a) && ((Ge(r) !== `body` || Je(o)) && (c = it(r)), d)) {
    let e = $(r);
    l = Q(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
  }
  let f = o && !d && !a ? mt(o, c) : B(0);
  return {
    width: n.width * l.x,
    height: n.height * l.y,
    x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
    y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
  };
}
function gt(e) {
  return Array.from(e.getClientRects());
}
function _t(e) {
  let t = K(e),
    n = it(e),
    r = e.ownerDocument.body,
    i = z(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth),
    a = z(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight),
    o = -n.scrollLeft + pt(e),
    s = -n.scrollTop;
  return X(r).direction === `rtl` && (o += z(t.clientWidth, r.clientWidth) - i), {
    width: i,
    height: a,
    x: o,
    y: s
  };
}
var vt = 25;
function yt(e, t) {
  let n = G(e),
    r = K(e),
    i = n.visualViewport,
    a = r.clientWidth,
    o = r.clientHeight,
    s = 0,
    c = 0;
  if (i) {
    a = i.width, o = i.height;
    let e = nt();
    (!e || e && t === `fixed`) && (s = i.offsetLeft, c = i.offsetTop);
  }
  let l = pt(r);
  if (l <= 0) {
    let e = r.ownerDocument,
      t = e.body,
      n = getComputedStyle(t),
      i = e.compatMode === `CSS1Compat` && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0,
      o = Math.abs(r.clientWidth - t.clientWidth - i);
    o <= vt && (a -= o);
  } else l <= vt && (a += l);
  return {
    width: a,
    height: o,
    x: s,
    y: c
  };
}
function bt(e, t) {
  let n = $(e, !0, t === `fixed`),
    r = n.top + e.clientTop,
    i = n.left + e.clientLeft,
    a = J(e) ? Q(e) : B(1);
  return {
    width: e.clientWidth * a.x,
    height: e.clientHeight * a.y,
    x: i * a.x,
    y: r * a.y
  };
}
function xt(e, t, n) {
  let r;
  if (t === `viewport`) r = yt(e, n);else if (t === `document`) r = _t(K(e));else if (q(t)) r = bt(t, n);else {
    let n = dt(e);
    r = {
      x: t.x - n.x,
      y: t.y - n.y,
      width: t.width,
      height: t.height
    };
  }
  return Oe(r);
}
function St(e, t) {
  let n = Z(e);
  return n === t || !q(n) || rt(n) ? !1 : X(n).position === `fixed` || St(n, t);
}
function Ct(e, t) {
  let n = t.get(e);
  if (n) return n;
  let r = ot(e, [], !1).filter(e => q(e) && Ge(e) !== `body`),
    i = null,
    a = X(e).position === `fixed`,
    o = a ? Z(e) : e;
  for (; q(o) && !rt(o);) {
    let t = X(o),
      n = et(o);
    !n && t.position === `fixed` && (i = null), (a ? !n && !i : !n && t.position === `static` && i && (i.position === `absolute` || i.position === `fixed`) || Je(o) && !n && St(e, o)) ? r = r.filter(e => e !== o) : i = t, o = Z(o);
  }
  return t.set(e, r), r;
}
function wt(e) {
  let {
      element: t,
      boundary: n,
      rootBoundary: r,
      strategy: i
    } = e,
    a = [...(n === `clippingAncestors` ? Xe(t) ? [] : Ct(t, this._c) : [].concat(n)), r],
    o = xt(t, a[0], i),
    s = o.top,
    c = o.right,
    l = o.bottom,
    u = o.left;
  for (let e = 1; e < a.length; e++) {
    let n = xt(t, a[e], i);
    s = z(n.top, s), c = R(n.right, c), l = R(n.bottom, l), u = z(n.left, u);
  }
  return {
    width: c - u,
    height: l - s,
    x: u,
    y: s
  };
}
function Tt(e) {
  let {
    width: t,
    height: n
  } = ct(e);
  return {
    width: t,
    height: n
  };
}
function Et(e, t, n) {
  let r = J(t),
    i = K(t),
    a = n === `fixed`,
    o = $(e, !0, a, t),
    s = {
      scrollLeft: 0,
      scrollTop: 0
    },
    c = B(0);
  function l() {
    c.x = pt(i);
  }
  if (r || !r && !a) if ((Ge(t) !== `body` || Je(i)) && (s = it(t)), r) {
    let e = $(t, !0, a, t);
    c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
  } else i && l();
  a && !r && i && l();
  let u = i && !r && !a ? mt(i, s) : B(0);
  return {
    x: o.left + s.scrollLeft - c.x - u.x,
    y: o.top + s.scrollTop - c.y - u.y,
    width: o.width,
    height: o.height
  };
}
function Dt(e) {
  return X(e).position === `static`;
}
function Ot(e, t) {
  if (!J(e) || X(e).position === `fixed`) return null;
  if (t) return t(e);
  let n = e.offsetParent;
  return K(e) === n && (n = n.ownerDocument.body), n;
}
function kt(e, t) {
  let n = G(e);
  if (Xe(e)) return n;
  if (!J(e)) {
    let t = Z(e);
    for (; t && !rt(t);) {
      if (q(t) && !Dt(t)) return t;
      t = Z(t);
    }
    return n;
  }
  let r = Ot(e, t);
  for (; r && Ye(r) && Dt(r);) r = Ot(r, t);
  return r && rt(r) && Dt(r) && !et(r) ? n : r || tt(e) || n;
}
var At = async function (e) {
  let t = this.getOffsetParent || kt,
    n = this.getDimensions,
    r = await n(e.floating);
  return {
    reference: Et(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: r.width,
      height: r.height
    }
  };
};
function jt(e) {
  return X(e).direction === `rtl`;
}
var Mt = {
  convertOffsetParentRelativeRectToViewportRelativeRect: ht,
  getDocumentElement: K,
  getClippingRect: wt,
  getOffsetParent: kt,
  getElementRects: At,
  getClientRects: gt,
  getDimensions: Tt,
  getScale: Q,
  isElement: q,
  isRTL: jt
};
function Nt(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function Pt(e, t) {
  let n = null,
    r,
    i = K(e);
  function a() {
    var e;
    clearTimeout(r), (e = n) == null || e.disconnect(), n = null;
  }
  function o(s, c) {
    s === void 0 && (s = !1), c === void 0 && (c = 1), a();
    let l = e.getBoundingClientRect(),
      {
        left: u,
        top: d,
        width: f,
        height: p
      } = l;
    if (s || t(), !f || !p) return;
    let m = ue(d),
      h = ue(i.clientWidth - (u + f)),
      g = ue(i.clientHeight - (d + p)),
      _ = ue(u),
      v = {
        rootMargin: -m + `px ` + -h + `px ` + -g + `px ` + -_ + `px`,
        threshold: z(0, R(1, c)) || 1
      },
      y = !0;
    function b(t) {
      let n = t[0].intersectionRatio;
      if (n !== c) {
        if (!y) return o();
        n ? o(!1, n) : r = setTimeout(() => {
          o(!1, 1e-7);
        }, 1e3);
      }
      n === 1 && !Nt(l, e.getBoundingClientRect()) && o(), y = !1;
    }
    try {
      n = new IntersectionObserver(b, {
        ...v,
        root: i.ownerDocument
      });
    } catch {
      n = new IntersectionObserver(b, v);
    }
    n.observe(e);
  }
  return o(!0), a;
}
function Ft(e, t, n, r) {
  r === void 0 && (r = {});
  let {
      ancestorScroll: i = !0,
      ancestorResize: a = !0,
      elementResize: o = typeof ResizeObserver == `function`,
      layoutShift: s = typeof IntersectionObserver == `function`,
      animationFrame: c = !1
    } = r,
    l = lt(e),
    u = i || a ? [...(l ? ot(l) : []), ...(t ? ot(t) : [])] : [];
  u.forEach(e => {
    i && e.addEventListener(`scroll`, n, {
      passive: !0
    }), a && e.addEventListener(`resize`, n);
  });
  let d = l && s ? Pt(l, n) : null,
    f = -1,
    p = null;
  o && (p = new ResizeObserver(e => {
    let [r] = e;
    r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
      var e;
      (e = p) == null || e.observe(t);
    })), n();
  }), l && !c && p.observe(l), t && p.observe(t));
  let m,
    h = c ? $(e) : null;
  c && g();
  function g() {
    let t = $(e);
    h && !Nt(h, t) && n(), h = t, m = requestAnimationFrame(g);
  }
  return n(), () => {
    var e;
    u.forEach(e => {
      i && e.removeEventListener(`scroll`, n), a && e.removeEventListener(`resize`, n);
    }), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
  };
}
var It = Be,
  Lt = Ve,
  Rt = Pe,
  zt = Ue,
  Bt = Le,
  Vt = Ne,
  Ht = He,
  Ut = (e, t, n) => {
    let r = new Map(),
      i = {
        platform: Mt,
        ...n
      },
      a = {
        ...i.platform,
        _c: r
      };
    return Me(e, t, {
      ...i,
      platform: a
    });
  },
  Wt = typeof document < `u` ? o.useLayoutEffect : function () {};
function Gt(e, t) {
  if (e === t) return !0;
  if (typeof e != typeof t) return !1;
  if (typeof e == `function` && e.toString() === t.toString()) return !0;
  let n, r, i;
  if (e && t && typeof e == `object`) {
    if (Array.isArray(e)) {
      if (n = e.length, n !== t.length) return !1;
      for (r = n; r-- !== 0;) if (!Gt(e[r], t[r])) return !1;
      return !0;
    }
    if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length) return !1;
    for (r = n; r-- !== 0;) if (!{}.hasOwnProperty.call(t, i[r])) return !1;
    for (r = n; r-- !== 0;) {
      let n = i[r];
      if (!(n === `_owner` && e.$$typeof) && !Gt(e[n], t[n])) return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function Kt(e) {
  return typeof window > `u` ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function qt(e, t) {
  let n = Kt(e);
  return Math.round(t * n) / n;
}
function Jt(e) {
  let t = o.useRef(e);
  return Wt(() => {
    t.current = e;
  }), t;
}
function Yt(e) {
  e === void 0 && (e = {});
  let {
      placement: t = `bottom`,
      strategy: n = `absolute`,
      middleware: r = [],
      platform: i,
      elements: {
        reference: a,
        floating: s
      } = {},
      transform: l = !0,
      whileElementsMounted: u,
      open: d
    } = e,
    [f, p] = o.useState({
      x: 0,
      y: 0,
      strategy: n,
      placement: t,
      middlewareData: {},
      isPositioned: !1
    }),
    [m, h] = o.useState(r);
  Gt(m, r) || h(r);
  let [g, _] = o.useState(null),
    [v, y] = o.useState(null),
    b = o.useCallback(e => {
      e !== w.current && (w.current = e, _(e));
    }, []),
    x = o.useCallback(e => {
      e !== T.current && (T.current = e, y(e));
    }, []),
    S = a || g,
    C = s || v,
    w = o.useRef(null),
    T = o.useRef(null),
    E = o.useRef(f),
    D = u != null,
    O = Jt(u),
    k = Jt(i),
    A = Jt(d),
    j = o.useCallback(() => {
      if (!w.current || !T.current) return;
      let e = {
        placement: t,
        strategy: n,
        middleware: m
      };
      k.current && (e.platform = k.current), Ut(w.current, T.current, e).then(e => {
        let t = {
          ...e,
          isPositioned: A.current !== !1
        };
        M.current && !Gt(E.current, t) && (E.current = t, c.flushSync(() => {
          p(t);
        }));
      });
    }, [m, t, n, k, A]);
  Wt(() => {
    d === !1 && E.current.isPositioned && (E.current.isPositioned = !1, p(e => ({
      ...e,
      isPositioned: !1
    })));
  }, [d]);
  let M = o.useRef(!1);
  Wt(() => (M.current = !0, () => {
    M.current = !1;
  }), []), Wt(() => {
    if (S && (w.current = S), C && (T.current = C), S && C) {
      if (O.current) return O.current(S, C, j);
      j();
    }
  }, [S, C, j, O, D]);
  let N = o.useMemo(() => ({
      reference: w,
      floating: T,
      setReference: b,
      setFloating: x
    }), [b, x]),
    P = o.useMemo(() => ({
      reference: S,
      floating: C
    }), [S, C]),
    F = o.useMemo(() => {
      let e = {
        position: n,
        left: 0,
        top: 0
      };
      if (!P.floating) return e;
      let t = qt(P.floating, f.x),
        r = qt(P.floating, f.y);
      return l ? {
        ...e,
        transform: `translate(` + t + `px, ` + r + `px)`,
        ...(Kt(P.floating) >= 1.5 && {
          willChange: `transform`
        })
      } : {
        position: n,
        left: t,
        top: r
      };
    }, [n, l, P.floating, f.x, f.y]);
  return o.useMemo(() => ({
    ...f,
    update: j,
    refs: N,
    elements: P,
    floatingStyles: F
  }), [f, j, N, P, F]);
}
var Xt = e => {
    function t(e) {
      return {}.hasOwnProperty.call(e, `current`);
    }
    return {
      name: `arrow`,
      options: e,
      fn(n) {
        let {
          element: r,
          padding: i
        } = typeof e == `function` ? e(n) : e;
        return r && t(r) ? r.current == null ? {} : Vt({
          element: r.current,
          padding: i
        }).fn(n) : r ? Vt({
          element: r,
          padding: i
        }).fn(n) : {};
      }
    };
  },
  Zt = (e, t) => {
    let n = It(e);
    return {
      name: n.name,
      fn: n.fn,
      options: [e, t]
    };
  },
  Qt = (e, t) => {
    let n = Lt(e);
    return {
      name: n.name,
      fn: n.fn,
      options: [e, t]
    };
  },
  $t = (e, t) => ({
    fn: Ht(e).fn,
    options: [e, t]
  }),
  en = (e, t) => {
    let n = Rt(e);
    return {
      name: n.name,
      fn: n.fn,
      options: [e, t]
    };
  },
  tn = (e, t) => {
    let n = zt(e);
    return {
      name: n.name,
      fn: n.fn,
      options: [e, t]
    };
  },
  nn = (e, t) => {
    let n = Bt(e);
    return {
      name: n.name,
      fn: n.fn,
      options: [e, t]
    };
  },
  rn = (e, t) => {
    let n = Xt(e);
    return {
      name: n.name,
      fn: n.fn,
      options: [e, t]
    };
  },
  an = `Arrow`,
  on = o.forwardRef((e, t) => {
    let {
      children: n,
      width: r = 10,
      height: i = 5,
      ...a
    } = e;
    return <x.svg {...a} ref={t} width={r} height={i} viewBox="0 0 30 10" preserveAspectRatio="none">{e.asChild ? n : <polygon points="0,0 30,0 15,10" />}</x.svg>;
  });
on.displayName = an;
var sn = on,
  cn = `Popper`,
  [ln, un] = d(cn),
  [dn, fn] = ln(cn),
  pn = e => {
    let {
        __scopePopper: t,
        children: n
      } = e,
      [r, i] = o.useState(null);
    return (0, l.jsx)(dn, {
      scope: t,
      anchor: r,
      onAnchorChange: i,
      children: n
    });
  };
pn.displayName = cn;
var mn = `PopperAnchor`,
  hn = o.forwardRef((e, t) => {
    let {
        __scopePopper: n,
        virtualRef: r,
        ...a
      } = e,
      s = fn(mn, n),
      c = o.useRef(null),
      u = i(t, c),
      d = o.useRef(null);
    return o.useEffect(() => {
      let e = d.current;
      d.current = r?.current || c.current, e !== d.current && s.onAnchorChange(d.current);
    }), r ? null : <x.div {...a} ref={u} />;
  });
hn.displayName = mn;
var gn = `PopperContent`,
  [_n, vn] = ln(gn),
  yn = o.forwardRef((e, t) => {
    let {
        __scopePopper: n,
        side: r = `bottom`,
        sideOffset: a = 0,
        align: s = `center`,
        alignOffset: c = 0,
        arrowPadding: u = 0,
        avoidCollisions: d = !0,
        collisionBoundary: f = [],
        collisionPadding: m = 0,
        sticky: h = `partial`,
        hideWhenDetached: g = !1,
        updatePositionStrategy: _ = `optimized`,
        onPlaced: v,
        ...y
      } = e,
      b = fn(gn, n),
      [S, w] = o.useState(null),
      T = i(t, e => w(e)),
      [E, D] = o.useState(null),
      O = se(E),
      k = O?.width ?? 0,
      A = O?.height ?? 0,
      j = r + (s === `center` ? `` : `-` + s),
      M = typeof m == `number` ? m : {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        ...m
      },
      N = Array.isArray(f) ? f : [f],
      P = N.length > 0,
      F = {
        padding: M,
        boundary: N.filter(Cn),
        altBoundary: P
      },
      {
        refs: ee,
        floatingStyles: te,
        placement: ne,
        isPositioned: re,
        middlewareData: I
      } = Yt({
        strategy: `fixed`,
        placement: j,
        whileElementsMounted: (...e) => Ft(...e, {
          animationFrame: _ === `always`
        }),
        elements: {
          reference: b.anchor
        },
        middleware: [Zt({
          mainAxis: a + A,
          alignmentAxis: c
        }), d && Qt({
          mainAxis: !0,
          crossAxis: !1,
          limiter: h === `partial` ? $t() : void 0,
          ...F
        }), d && en({
          ...F
        }), tn({
          ...F,
          apply: ({
            elements: e,
            rects: t,
            availableWidth: n,
            availableHeight: r
          }) => {
            let {
                width: i,
                height: a
              } = t.reference,
              o = e.floating.style;
            o.setProperty(`--radix-popper-available-width`, `${n}px`), o.setProperty(`--radix-popper-available-height`, `${r}px`), o.setProperty(`--radix-popper-anchor-width`, `${i}px`), o.setProperty(`--radix-popper-anchor-height`, `${a}px`);
          }
        }), E && rn({
          element: E,
          padding: u
        }), wn({
          arrowWidth: k,
          arrowHeight: A
        }), g && nn({
          strategy: `referenceHidden`,
          ...F
        })]
      }),
      [ie, ae] = Tn(ne),
      L = C(v);
    p(() => {
      re && L?.();
    }, [re, L]);
    let oe = I.arrow?.x,
      ce = I.arrow?.y,
      R = I.arrow?.centerOffset !== 0,
      [z, le] = o.useState();
    return p(() => {
      S && le(window.getComputedStyle(S).zIndex);
    }, [S]), <div ref={ee.setFloating} data-radix-popper-content-wrapper="" style={{
      ...te,
      transform: re ? te.transform : `translate(0, -200%)`,
      minWidth: `max-content`,
      zIndex: z,
      "--radix-popper-transform-origin": [I.transformOrigin?.x, I.transformOrigin?.y].join(` `),
      ...(I.hide?.referenceHidden && {
        visibility: `hidden`,
        pointerEvents: `none`
      })
    }} dir={e.dir}><_n scope={n} placedSide={ie} onArrowChange={D} arrowX={oe} arrowY={ce} shouldHideArrow={R}><x.div data-side={ie} data-align={ae} {...y} ref={T} style={{
          ...y.style,
          animation: re ? void 0 : `none`
        }} /></_n></div>;
  });
yn.displayName = gn;
var bn = `PopperArrow`,
  xn = {
    top: `bottom`,
    right: `left`,
    bottom: `top`,
    left: `right`
  },
  Sn = o.forwardRef(function (e, t) {
    let {
        __scopePopper: n,
        ...r
      } = e,
      i = vn(bn, n),
      a = xn[i.placedSide];
    return <span ref={i.onArrowChange} style={{
      position: `absolute`,
      left: i.arrowX,
      top: i.arrowY,
      [a]: 0,
      transformOrigin: {
        top: ``,
        right: `0 0`,
        bottom: `center 0`,
        left: `100% 0`
      }[i.placedSide],
      transform: {
        top: `translateY(100%)`,
        right: `translateY(50%) rotate(90deg) translateX(-50%)`,
        bottom: `rotate(180deg)`,
        left: `translateY(50%) rotate(-90deg) translateX(50%)`
      }[i.placedSide],
      visibility: i.shouldHideArrow ? `hidden` : void 0
    }}>{(0, l.jsx)(sn, {
        ...r,
        ref: t,
        style: {
          ...r.style,
          display: `block`
        }
      })}</span>;
  });
Sn.displayName = bn;
function Cn(e) {
  return e !== null;
}
var wn = e => ({
  name: `transformOrigin`,
  options: e,
  fn(t) {
    let {
        placement: n,
        rects: r,
        middlewareData: i
      } = t,
      a = i.arrow?.centerOffset !== 0,
      o = a ? 0 : e.arrowWidth,
      s = a ? 0 : e.arrowHeight,
      [c, l] = Tn(n),
      u = {
        start: `0%`,
        center: `50%`,
        end: `100%`
      }[l],
      d = (i.arrow?.x ?? 0) + o / 2,
      f = (i.arrow?.y ?? 0) + s / 2,
      p = ``,
      m = ``;
    return c === `bottom` ? (p = a ? u : `${d}px`, m = `${-s}px`) : c === `top` ? (p = a ? u : `${d}px`, m = `${r.floating.height + s}px`) : c === `right` ? (p = `${-s}px`, m = a ? u : `${f}px`) : c === `left` && (p = `${r.floating.width + s}px`, m = a ? u : `${f}px`), {
      data: {
        x: p,
        y: m
      }
    };
  }
});
function Tn(e) {
  let [t, n = `center`] = e.split(`-`);
  return [t, n];
}
var En = pn,
  Dn = hn,
  On = yn,
  kn = Sn;
export { d as _, un as a, re as c, x as d, S as f, u as g, p as h, En as i, j as l, g as m, kn as n, se as o, v as p, On as r, ie as s, Dn as t, C as u, s as v };
