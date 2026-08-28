import { s as e } from "./chunk-Cq_f4orQ.js";
import { t } from "./react-BQLj9xdT.js";
import { n } from "./IntlProvider-C321H7m8.js";
import { t as r } from "./jsx-runtime-B5yMD3-t.js";
import { r as i } from "./bundle-mjs-D8tLE0rB.js";
import { a, c as o, o as s, t as c } from "./usageStatsUiParts-CiR7YEhh.js";
import { $t as l, A as u, An as d, Bt as f, Cn as p, D as m, Dn as h, En as g, F as _, Fn as v, G as y, Hn as b, I as ee, In as x, J as S, Jt as C, K as w, Lt as T, M as E, Mn as te, Mt as D, Nn as O, Nt as k, O as A, Pn as j, Qt as M, Rn as N, Rt as ne, St as re, T as ie, Vn as ae, Vt as oe, W as se, Wt as ce, Yt as le, a as ue, cn as de, dn as fe, fn as pe, ft as P, gn as me, i as he, j as ge, jn as F, kn as _e, mt as ve, nn as ye, on as be, pn as xe, sn as Se, t as Ce, vn as we, wn as I, xn as Te, xt as L, yn as Ee, yt as De, zt as Oe } from "./chart-iT2j9K3u.js";
import { t as ke } from "./tiny-invariant-Dm49c6Qj.js";
import { a as Ae, i as je, n as Me, r as R, t as z } from "./appUsageChartPalette-BeN2wLzW.js";
import { a as Ne, i as Pe, n as Fe, o as Ie, r as Le, s as Re, t as ze } from "./CartesianChart-nORn-0bc.js";
var B = (e, t, n) => {
    var r = n ?? e;
    if (!O(r)) return d(r, t, 0);
  },
  Be = (e, t, n) => {
    var r = {},
      i = e.filter(D),
      a = e.filter(e => e.stackId == null),
      o = i.reduce((e, t) => {
        var n = e[t.stackId];
        return n ??= [], n.push(t), e[t.stackId] = n, e;
      }, r),
      s = Object.entries(o).map(e => {
        var [r, i] = e;
        return {
          stackId: r,
          dataKeys: i.map(e => e.dataKey),
          barSize: B(t, n, i[0]?.barSize)
        };
      }),
      c = a.map(e => ({
        stackId: void 0,
        dataKeys: [e.dataKey].filter(e => e != null),
        barSize: B(t, n, e.barSize)
      }));
    return [...s, ...c];
  };
function Ve(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function (t) {
      return Object.getOwnPropertyDescriptor(e, t).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function V(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] == null ? {} : arguments[t];
    t % 2 ? Ve(Object(n), !0).forEach(function (t) {
      He(e, t, n[t]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ve(Object(n)).forEach(function (t) {
      Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
    });
  }
  return e;
}
function He(e, t, n) {
  return (t = Ue(t)) in e ? Object.defineProperty(e, t, {
    value: n,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[t] = n, e;
}
function Ue(e) {
  var t = We(e, `string`);
  return typeof t == `symbol` ? t : t + ``;
}
function We(e, t) {
  if (typeof e != `object` || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t || `default`);
    if (typeof r != `object`) return r;
    throw TypeError(`@@toPrimitive must return a primitive value.`);
  }
  return (t === `string` ? String : Number)(e);
}
function Ge(e, t, n, r, i) {
  var a = r.length;
  if (!(a < 1)) {
    var o = d(e, n, 0, !0),
      s,
      c = [];
    if (p(r[0]?.barSize)) {
      var l = !1,
        u = n / a,
        f = r.reduce((e, t) => e + (t.barSize || 0), 0);
      f += (a - 1) * o, f >= n && (f -= (a - 1) * o, o = 0), f >= n && u > 0 && (l = !0, u *= 0.9, f = a * u);
      var m = {
        offset: ((n - f) / 2 >> 0) - o,
        size: 0
      };
      s = r.reduce((e, t) => {
        var n = {
            stackId: t.stackId,
            dataKeys: t.dataKeys,
            position: {
              offset: m.offset + m.size + o,
              size: l ? u : t.barSize ?? 0
            }
          },
          r = [...e, n];
        return m = n.position, r;
      }, c);
    } else {
      var h = d(t, n, 0, !0);
      n - 2 * h - (a - 1) * o <= 0 && (o = 0);
      var g = (n - 2 * h - (a - 1) * o) / a;
      g > 1 && (g >>= 0);
      var _ = p(i) ? Math.min(g, i) : g;
      s = r.reduce((e, t, n) => [...e, {
        stackId: t.stackId,
        dataKeys: t.dataKeys,
        position: {
          offset: h + (g + o) * n + (g - _) / 2,
          size: _
        }
      }], c);
    }
    return s;
  }
}
var Ke = (e, t, n, r, i, a, o) => {
    var s = O(o) ? t : o,
      c = Ge(n, r, i === a ? a : i, e, s);
    return i !== a && c != null && (c = c.map(e => V(V({}, e), {}, {
      position: V(V({}, e.position), {}, {
        offset: e.position.offset - i / 2
      })
    }))), c;
  },
  qe = (e, t) => {
    var n = k(t);
    if (!(!e || n == null || t == null)) {
      var {
        stackId: r
      } = t;
      if (r != null) {
        var i = e[r];
        if (i) {
          var {
            stackedData: a
          } = i;
          if (a) return a.find(e => e.key === n);
        }
      }
    }
  },
  Je = (e, t) => {
    if (!(e == null || t == null)) {
      var n = e.find(e => e.stackId === t.stackId && t.dataKey != null && e.dataKeys.includes(t.dataKey));
      if (n != null) return n.position;
    }
  };
function Ye(e, t) {
  return e && typeof e == `object` && `zIndex` in e && typeof e.zIndex == `number` && p(e.zIndex) ? e.zIndex : t;
}
function H(e, t) {
  return e.graphicalItems.cartesianItems.find(e => e.id === t)?.xAxisId ?? 0;
}
function U(e, t) {
  return e.graphicalItems.cartesianItems.find(e => e.id === t)?.yAxisId ?? 0;
}
var W = e(t());
function G() {
  return G = Object.assign ? Object.assign.bind() : function (e) {
    for (var t = 1; t < arguments.length; t++) {
      var n = arguments[t];
      for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
    }
    return e;
  }, G.apply(null, arguments);
}
function K(e) {
  return W.createElement(ge, G({
    shapeType: `rectangle`,
    activeClassName: `recharts-active-bar`,
    inActiveClassName: `recharts-inactive-bar`
  }, e));
}
var Xe = function (e) {
    var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
    return (n, r) => {
      if (j(e)) return e;
      var i = j(n) || O(n);
      return i ? e(n, r) : (!i && ke(!1, `minPointSize callback function received a value with type of ${typeof n}. Currently only numbers or null/undefined are supported.`), t);
    };
  },
  Ze = (e, t, n) => n,
  q = I([re, (e, t) => t], (e, t) => e.filter(e => e.type === `bar`).find(e => e.id === t)),
  Qe = I([q], e => e?.maxBarSize),
  $e = (e, t, n, r) => r,
  et = I([l, re, H, U, Ze], (e, t, n, r, i) => t.filter(t => e === `horizontal` ? t.xAxisId === n : t.yAxisId === r).filter(e => e.isPanorama === i).filter(e => e.hide === !1).filter(e => e.type === `bar`)),
  tt = (e, t, n) => {
    var r = l(e),
      i = H(e, t),
      a = U(e, t);
    if (!(i == null || a == null)) return r === `horizontal` ? De(e, `yAxis`, a, n) : De(e, `xAxis`, i, n);
  },
  nt = I([et, f, (e, t) => {
    var n = l(e),
      r = H(e, t),
      i = U(e, t);
    if (!(r == null || i == null)) return n === `horizontal` ? ve(e, `xAxis`, r) : ve(e, `yAxis`, i);
  }], Be),
  rt = (e, t, n) => {
    var r = q(e, t);
    if (r == null) return 0;
    var i = H(e, t),
      a = U(e, t);
    if (i == null || a == null) return 0;
    var o = l(e),
      s = oe(e),
      {
        maxBarSize: c
      } = r,
      u = O(c) ? s : c,
      d,
      f;
    return o === `horizontal` ? (d = P(e, `xAxis`, i, n), f = L(e, `xAxis`, i, n)) : (d = P(e, `yAxis`, a, n), f = L(e, `yAxis`, a, n)), fe(d, f, !0) ?? u ?? 0;
  },
  it = (e, t, n) => {
    var r = l(e),
      i = H(e, t),
      a = U(e, t);
    if (!(i == null || a == null)) {
      var o, s;
      return r === `horizontal` ? (o = P(e, `xAxis`, i, n), s = L(e, `xAxis`, i, n)) : (o = P(e, `yAxis`, a, n), s = L(e, `yAxis`, a, n)), fe(o, s);
    }
  },
  at = I([de, Se, (e, t, n) => {
    var r = H(e, t);
    if (r != null) return P(e, `xAxis`, r, n);
  }, (e, t, n) => {
    var r = U(e, t);
    if (r != null) return P(e, `yAxis`, r, n);
  }, (e, t, n) => {
    var r = H(e, t);
    if (r != null) return L(e, `xAxis`, r, n);
  }, (e, t, n) => {
    var r = U(e, t);
    if (r != null) return L(e, `yAxis`, r, n);
  }, I([I([nt, oe, Oe, ne, rt, it, Qe], Ke), q], Je), l, ce, it, I([tt, q], qe), q, $e], (e, t, n, r, i, a, o, s, c, l, u, d, f) => {
    var {
      chartData: p,
      dataStartIndex: m,
      dataEndIndex: h
    } = c;
    if (!(d == null || o == null || t == null || s !== `horizontal` && s !== `vertical` || n == null || r == null || i == null || a == null || l == null)) {
      var {
          data: g
        } = d,
        _ = g != null && g.length > 0 ? g : p?.slice(m, h + 1);
      if (_ != null) return It({
        layout: s,
        barSettings: d,
        pos: o,
        parentViewBox: t,
        bandSize: l,
        xAxis: n,
        yAxis: r,
        xAxisTicks: i,
        yAxisTicks: a,
        stackedData: u,
        displayedData: _,
        offset: e,
        cells: f,
        dataStartIndex: m
      });
    }
  }),
  ot = [`index`];
function J() {
  return J = Object.assign ? Object.assign.bind() : function (e) {
    for (var t = 1; t < arguments.length; t++) {
      var n = arguments[t];
      for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
    }
    return e;
  }, J.apply(null, arguments);
}
function st(e, t) {
  if (e == null) return {};
  var n,
    r,
    i = ct(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
  }
  return i;
}
function ct(e, t) {
  if (e == null) return {};
  var n = {};
  for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
    if (t.indexOf(r) !== -1) continue;
    n[r] = e[r];
  }
  return n;
}
var lt = (0, W.createContext)(void 0),
  ut = e => {
    var t = (0, W.useContext)(lt);
    if (t != null) return t.stackId;
    if (e != null) return me(e);
  },
  dt = (e, t) => `recharts-bar-stack-clip-path-${e}-${t}`,
  ft = e => {
    var t = (0, W.useContext)(lt);
    if (t != null) {
      var {
        stackId: n
      } = t;
      return `url(#${dt(n, e)})`;
    }
  },
  pt = e => {
    var {
        index: t
      } = e,
      n = st(e, ot),
      r = ft(t);
    return W.createElement(N, J({
      className: `recharts-bar-stack-layer`,
      clipPath: r
    }, n));
  },
  mt = [`onMouseEnter`, `onMouseLeave`, `onClick`],
  ht = [`value`, `background`, `tooltipPosition`],
  gt = [`id`],
  _t = [`onMouseEnter`, `onClick`, `onMouseLeave`];
function Y() {
  return Y = Object.assign ? Object.assign.bind() : function (e) {
    for (var t = 1; t < arguments.length; t++) {
      var n = arguments[t];
      for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
    }
    return e;
  }, Y.apply(null, arguments);
}
function vt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function (t) {
      return Object.getOwnPropertyDescriptor(e, t).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function X(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] == null ? {} : arguments[t];
    t % 2 ? vt(Object(n), !0).forEach(function (t) {
      yt(e, t, n[t]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : vt(Object(n)).forEach(function (t) {
      Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
    });
  }
  return e;
}
function yt(e, t, n) {
  return (t = bt(t)) in e ? Object.defineProperty(e, t, {
    value: n,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[t] = n, e;
}
function bt(e) {
  var t = xt(e, `string`);
  return typeof t == `symbol` ? t : t + ``;
}
function xt(e, t) {
  if (typeof e != `object` || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t || `default`);
    if (typeof r != `object`) return r;
    throw TypeError(`@@toPrimitive must return a primitive value.`);
  }
  return (t === `string` ? String : Number)(e);
}
function Z(e, t) {
  if (e == null) return {};
  var n,
    r,
    i = St(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (r = 0; r < a.length; r++) n = a[r], t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
  }
  return i;
}
function St(e, t) {
  if (e == null) return {};
  var n = {};
  for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
    if (t.indexOf(r) !== -1) continue;
    n[r] = e[r];
  }
  return n;
}
var Ct = e => {
    var {
      dataKey: t,
      name: n,
      fill: r,
      legendType: i,
      hide: a
    } = e;
    return [{
      inactive: a,
      dataKey: t,
      type: i,
      color: r,
      value: we(n, t),
      payload: e
    }];
  },
  wt = W.memo(e => {
    var {
        dataKey: t,
        stroke: n,
        strokeWidth: r,
        fill: i,
        name: a,
        hide: o,
        unit: s,
        tooltipType: c,
        id: l
      } = e,
      d = {
        dataDefinedOnItem: void 0,
        getPosition: x,
        settings: {
          stroke: n,
          strokeWidth: r,
          fill: i,
          dataKey: t,
          nameKey: void 0,
          name: we(a, t),
          hide: o,
          type: c,
          color: i,
          unit: s,
          graphicalItemId: l
        }
      };
    return W.createElement(u, {
      tooltipEntrySettings: d
    });
  });
function Tt(e) {
  var t = g(S),
    {
      data: n,
      dataKey: r,
      background: i,
      allOtherBarProps: a
    } = e,
    {
      onMouseEnter: o,
      onMouseLeave: s,
      onClick: c
    } = a,
    l = Z(a, mt),
    u = R(o, r, a.id),
    d = je(s),
    f = Me(c, r, a.id);
  if (!i || n == null) return null;
  var p = b(i);
  return W.createElement(y, {
    zIndex: Ye(i, T.barBackground)
  }, n.map((e, n) => {
    var {
        value: a,
        background: o,
        tooltipPosition: s
      } = e,
      c = Z(e, ht);
    if (!o) return null;
    var m = u(e, n),
      h = d(e, n),
      g = f(e, n),
      _ = X(X(X(X(X({
        option: i,
        isActive: String(n) === t
      }, c), {}, {
        fill: `#eee`
      }, o), p), _e(l, e, n)), {}, {
        onMouseEnter: m,
        onMouseLeave: h,
        onClick: g,
        dataKey: r,
        index: n,
        className: `recharts-bar-background-rectangle`
      });
    return W.createElement(K, Y({
      key: `background-bar-${n}`
    }, _));
  }));
}
function Et(e) {
  var {
      showLabels: t,
      children: n,
      rects: r
    } = e,
    i = r?.map(e => {
      var t = {
        x: e.x,
        y: e.y,
        width: e.width,
        lowerWidth: e.width,
        upperWidth: e.width,
        height: e.height
      };
      return X(X({}, t), {}, {
        value: e.value,
        payload: e.payload,
        parentViewBox: e.parentViewBox,
        viewBox: t,
        fill: e.fill
      });
    });
  return W.createElement(_, {
    value: t ? i : void 0
  }, n);
}
function Dt(e) {
  var {
      shape: t,
      activeBar: n,
      baseProps: r,
      entry: i,
      index: a,
      dataKey: o
    } = e,
    s = g(S),
    c = g(w),
    l = n && String(i.originalDataIndex) === s && (c == null || o === c),
    [u, d] = (0, W.useState)(!1),
    [f, p] = (0, W.useState)(!1);
  (0, W.useEffect)(() => {
    var e;
    return l ? (d(!0), e = requestAnimationFrame(() => {
      p(!0);
    })) : p(!1), () => {
      cancelAnimationFrame(e);
    };
  }, [l]);
  var m = (0, W.useCallback)(() => {
      l || d(!1);
    }, [l]),
    h = l && f,
    _ = l || u,
    v = l ? n === !0 ? t : n : t,
    b = W.createElement(K, Y({}, r, {
      name: String(r.name)
    }, i, {
      isActive: h,
      option: v,
      index: a,
      dataKey: o,
      onTransitionEnd: m
    }));
  return _ ? W.createElement(y, {
    zIndex: T.activeBar
  }, W.createElement(pt, {
    index: i.originalDataIndex
  }, b)) : b;
}
function Ot(e) {
  var {
    shape: t,
    baseProps: n,
    entry: r,
    index: i,
    dataKey: a
  } = e;
  return W.createElement(K, Y({}, n, {
    name: String(n.name)
  }, r, {
    isActive: !1,
    option: t,
    index: i,
    dataKey: a
  }));
}
function kt(e) {
  var {
      data: t,
      props: n
    } = e,
    r = ae(n) ?? {},
    {
      id: i
    } = r,
    a = Z(r, gt),
    {
      shape: o,
      dataKey: s,
      activeBar: c
    } = n,
    {
      onMouseEnter: l,
      onClick: u,
      onMouseLeave: d
    } = n,
    f = Z(n, _t),
    p = R(l, s, i),
    m = je(d),
    h = Me(u, s, i);
  return t ? W.createElement(W.Fragment, null, t.map((e, t) => W.createElement(pt, Y({
    index: e.originalDataIndex,
    key: `rectangle-${e?.x}-${e?.y}-${e?.value}-${t}`,
    className: `recharts-bar-rectangle`
  }, _e(f, e, t), {
    onMouseEnter: p(e, t),
    onMouseLeave: m(e, t),
    onClick: h(e, t)
  }), c ? W.createElement(Dt, {
    shape: o,
    activeBar: c,
    baseProps: a,
    entry: e,
    index: t,
    dataKey: s
  }) : W.createElement(Ot, {
    shape: o,
    baseProps: a,
    entry: e,
    index: t,
    dataKey: s
  })))) : null;
}
function At(e) {
  var {
      props: t,
      previousRectanglesRef: n
    } = e,
    {
      data: r,
      layout: i,
      isAnimationActive: a,
      animationBegin: o,
      animationDuration: s,
      animationEasing: c,
      onAnimationEnd: l,
      onAnimationStart: u
    } = t,
    d = n.current,
    f = C(t, `recharts-bar-`),
    [p, m] = (0, W.useState)(!1),
    h = !p,
    g = (0, W.useCallback)(() => {
      typeof l == `function` && l(), m(!1);
    }, [l]),
    _ = (0, W.useCallback)(() => {
      typeof u == `function` && u(), m(!0);
    }, [u]);
  return W.createElement(Et, {
    showLabels: h,
    rects: r
  }, W.createElement(le, {
    animationId: f,
    begin: o,
    duration: s,
    isActive: a,
    easing: c,
    onAnimationEnd: g,
    onAnimationStart: _,
    key: f
  }, e => {
    var a = e === 1 ? r : r?.map((t, n) => {
      var r = d && d[n];
      if (r) return X(X({}, t), {}, {
        x: F(r.x, t.x, e),
        y: F(r.y, t.y, e),
        width: F(r.width, t.width, e),
        height: F(r.height, t.height, e)
      });
      if (i === `horizontal`) {
        var a = F(0, t.height, e),
          o = F(t.stackedBarStart, t.y, e);
        return X(X({}, t), {}, {
          y: o,
          height: a
        });
      }
      var s = F(0, t.width, e),
        c = F(t.stackedBarStart, t.x, e);
      return X(X({}, t), {}, {
        width: s,
        x: c
      });
    });
    return e > 0 && (n.current = a ?? null), a == null ? null : W.createElement(N, null, W.createElement(kt, {
      props: t,
      data: a
    }));
  }), W.createElement(ee, {
    label: t.label
  }), t.children);
}
function jt(e) {
  var t = (0, W.useRef)(null);
  return W.createElement(At, {
    previousRectanglesRef: t,
    props: e
  });
}
var Q = 0,
  Mt = (e, t) => {
    var n = Array.isArray(e.value) ? e.value[1] : e.value;
    return {
      x: e.x,
      y: e.y,
      value: n,
      errorVal: Ee(e, t)
    };
  },
  Nt = class extends W.PureComponent {
    render() {
      var {
        hide: e,
        data: t,
        dataKey: n,
        className: r,
        xAxisId: a,
        yAxisId: o,
        needClip: s,
        background: c,
        id: l
      } = this.props;
      if (e || t == null) return null;
      var u = i(`recharts-bar`, r),
        d = l;
      return W.createElement(N, {
        className: u,
        id: l
      }, s && W.createElement(`defs`, null, W.createElement(Pe, {
        clipPathId: d,
        xAxisId: a,
        yAxisId: o
      })), W.createElement(N, {
        className: `recharts-bar-rectangles`,
        clipPath: s ? `url(#clipPath-${d})` : void 0
      }, W.createElement(Tt, {
        data: t,
        dataKey: n,
        background: c,
        allOtherBarProps: this.props
      }), W.createElement(jt, this.props)));
    }
  },
  Pt = {
    activeBar: !1,
    animationBegin: 0,
    animationDuration: 400,
    animationEasing: `ease`,
    background: !1,
    hide: !1,
    isAnimationActive: `auto`,
    label: !1,
    legendType: `rect`,
    minPointSize: Q,
    xAxisId: 0,
    yAxisId: 0,
    zIndex: T.bar
  };
function Ft(e) {
  var {
      xAxisId: t,
      yAxisId: n,
      hide: r,
      legendType: i,
      minPointSize: a,
      activeBar: o,
      animationBegin: s,
      animationDuration: c,
      animationEasing: l,
      isAnimationActive: u
    } = e,
    {
      needClip: d
    } = Ne(t, n),
    f = ye(),
    p = be(),
    m = E(e.children, Ae),
    h = g(t => at(t, e.id, p, m));
  if (f !== `vertical` && f !== `horizontal`) return null;
  var _,
    v = h?.[0];
  return _ = v == null || v.height == null || v.width == null ? 0 : f === `vertical` ? v.height / 2 : v.width / 2, W.createElement(Ie, {
    xAxisId: t,
    yAxisId: n,
    data: h,
    dataPointFormatter: Mt,
    errorBarOffset: _
  }, W.createElement(Nt, Y({}, e, {
    layout: f,
    needClip: d,
    data: h,
    xAxisId: t,
    yAxisId: n,
    hide: r,
    legendType: i,
    minPointSize: a,
    activeBar: o,
    animationBegin: s,
    animationDuration: c,
    animationEasing: l,
    isAnimationActive: u
  })));
}
function It(e) {
  var {
      layout: t,
      barSettings: {
        dataKey: n,
        minPointSize: r,
        hasCustomShape: i
      },
      pos: a,
      bandSize: o,
      xAxis: s,
      yAxis: c,
      xAxisTicks: l,
      yAxisTicks: u,
      stackedData: d,
      displayedData: f,
      offset: p,
      cells: m,
      parentViewBox: h,
      dataStartIndex: g
    } = e,
    _ = t === `horizontal` ? c : s,
    y = d ? _.scale.domain() : null,
    b = pe({
      numericAxis: _
    }),
    ee = _.scale.map(b);
  return f.map((e, f) => {
    var _, x, S, C, w, T;
    if (d) {
      var E = d[f + g];
      if (E == null) return null;
      _ = Te(E, y);
    } else _ = Ee(e, n), Array.isArray(_) || (_ = [b, _]);
    var D = Xe(r, Q)(_[1], f);
    if (t === `horizontal`) {
      var O = c.scale.map(_[0]),
        k = c.scale.map(_[1]);
      if (O == null || k == null) return null;
      x = xe({
        axis: s,
        ticks: l,
        bandSize: o,
        offset: a.offset,
        entry: e,
        index: f
      }), S = k ?? O ?? void 0, C = a.size;
      var A = O - k;
      if (w = te(A) ? 0 : A, T = {
        x,
        y: p.top,
        width: C,
        height: p.height
      }, Math.abs(D) > 0 && Math.abs(w) < Math.abs(D)) {
        var j = v(w || D) * (Math.abs(D) - Math.abs(w));
        S -= j, w += j;
      }
    } else {
      var M = s.scale.map(_[0]),
        N = s.scale.map(_[1]);
      if (M == null || N == null) return null;
      if (x = M, S = xe({
        axis: c,
        ticks: u,
        bandSize: o,
        offset: a.offset,
        entry: e,
        index: f
      }), C = N - M, w = a.size, T = {
        x: p.left,
        y: S,
        width: p.width,
        height: w
      }, Math.abs(D) > 0 && Math.abs(C) < Math.abs(D)) {
        var ne = v(C || D) * (Math.abs(D) - Math.abs(C));
        C += ne;
      }
    }
    return x == null || S == null || C == null || w == null || !i && (C === 0 || w === 0) ? null : X(X({}, e), {}, {
      stackedBarStart: ee,
      x,
      y: S,
      width: C,
      height: w,
      value: d ? _ : _[1],
      payload: e,
      background: T,
      tooltipPosition: {
        x: x + C / 2,
        y: S + w / 2
      },
      parentViewBox: h,
      originalDataIndex: f
    }, m && m[f] && m[f].props);
  }).filter(Boolean);
}
function Lt(e) {
  var t = h(e, Pt),
    n = ut(t.stackId),
    r = be();
  return W.createElement(m, {
    id: t.id,
    type: `bar`
  }, e => W.createElement(W.Fragment, null, W.createElement(A, {
    legendPayload: Ct(t)
  }), W.createElement(wt, {
    dataKey: t.dataKey,
    stroke: t.stroke,
    strokeWidth: t.strokeWidth,
    fill: t.fill,
    name: t.name,
    hide: t.hide,
    unit: t.unit,
    tooltipType: t.tooltipType,
    id: e
  }), W.createElement(ie, {
    type: `bar`,
    id: e,
    data: void 0,
    xAxisId: t.xAxisId,
    yAxisId: t.yAxisId,
    zAxisId: 0,
    dataKey: t.dataKey,
    stackId: n,
    hide: t.hide,
    barSize: t.barSize,
    minPointSize: t.minPointSize,
    maxBarSize: t.maxBarSize,
    isPanorama: r,
    hasCustomShape: t.shape != null
  }), W.createElement(y, {
    zIndex: t.zIndex
  }, W.createElement(Ft, Y({}, t, {
    id: e
  })))));
}
var Rt = W.memo(Lt, M);
Rt.displayName = `Bar`;
var zt = [`axis`, `item`],
  Bt = (0, W.forwardRef)((e, t) => W.createElement(ze, {
    chartName: `BarChart`,
    defaultTooltipEventType: `axis`,
    validateTooltipEventTypes: zt,
    tooltipPayloadSearcher: se,
    categoricalChartProps: e,
    ref: t
  })),
  $ = r(),
  Vt = {
    top: 8,
    right: 24,
    left: 24
  };
function Ht(e) {
  return (e ?? []).filter(e => {
    let t = typeof e.value == `number` ? e.value : Number(e.value);
    return Number.isFinite(t) && t > 0;
  });
}
function Ut(e, t) {
  if (t <= 14) return !0;
  let n = t > 45 ? 7 : 5;
  return e === 0 || e === t - 1 || e % n === 0;
}
function Wt(e, t, n) {
  let r = {
    label: e,
    tooltipLabel: t,
    total: 0
  };
  for (let e of n) r[e.key] = 0;
  return r;
}
function Gt({
  snapshot: e,
  locale: t,
  modelKeys: n,
  modelKeyById: r
}) {
  let i = new Map();
  for (let a of e.dailyModelUsage) {
    let e = s(t, a.date),
      o = i.get(a.date) ?? Wt(e, e, n);
    for (let e of a.models) {
      let t = r.get(e.modelId ?? `__unknown__`);
      t && (o[t] = Number(o[t] ?? 0) + e.totalTokens), o.total += e.totalTokens;
    }
    i.set(a.date, o);
  }
  return [...i.entries()].sort(([e], [t]) => e.localeCompare(t)).map(([, e]) => e);
}
function Kt({
  intl: e,
  locale: t,
  snapshot: n
}) {
  let r = n.models.slice(0, 6),
    i = r.map((t, n) => ({
      modelId: t.modelId,
      key: `model${n}`,
      color: z(n),
      label: o(e, t.modelId)
    })),
    a = new Map(i.map(e => [e.modelId ?? `__unknown__`, e.key])),
    s = i.reduce((e, t) => (e[t.key] = {
      label: t.label,
      color: t.color
    }, e), {}),
    c = Gt({
      snapshot: n,
      locale: t,
      modelKeys: i,
      modelKeyById: a
    });
  return {
    topModels: r,
    modelKeys: i,
    chartConfig: s,
    chartData: c,
    maxTokens: Math.max(0, ...c.map(e => e.total))
  };
}
function qt(e) {
  let t = (0, W.useMemo)(() => Ht(e.payload), [e.payload]);
  return !e.active || t.length === 0 ? null : (0, $.jsx)(ue, {
    ...e,
    payload: t
  });
}
function Jt({
  snapshot: e
}) {
  let {
      intl: t,
      locale: r
    } = n(),
    {
      topModels: i,
      modelKeys: s,
      chartConfig: l,
      chartData: u,
      maxTokens: d
    } = (0, W.useMemo)(() => Kt({
      intl: t,
      locale: r,
      snapshot: e
    }), [t, r, e]),
    f = (0, W.useCallback)((e, t) => Ut(t, u.length) ? e : ``, [u.length]),
    p = (0, W.useCallback)((e, n) => {
      let i = n[0]?.payload,
        o = typeof i?.total == `number` ? i.total : 0;
      return `${i?.tooltipLabel ?? ``} - ${a(r, o)} ${t.formatMessage({
        id: `settings.usage.tokenUnit`
      })}`;
    }, [t, r]),
    m = (0, W.useMemo)(() => (0, $.jsx)(qt, {
      indicator: `line`,
      labelFormatter: p
    }), [p]);
  return <section className="space-y-3 rounded-lg bg-surface p-4"><h3 className="text-ui-base font-medium text-foreground">{t.formatMessage({
        id: `settings.usage.dailyChartTitle`
      })}</h3>{d <= 0 ? (0, $.jsx)(c, {
      title: t.formatMessage({
        id: `settings.usage.emptyTitle`
      }),
      description: t.formatMessage({
        id: `settings.usage.emptyDescription`
      })
    }) : <div className="rounded-md bg-surface/60 px-3 py-3"><Ce config={l} className="h-60 w-full"><Bt accessibilityLayer={!0} data={u} margin={Vt}><Re vertical={!1} strokeDasharray="3 3" /><Le dataKey="label" tickLine={!1} axisLine={!1} interval={0} minTickGap={0} tickMargin={8} tickFormatter={f} /><Fe hide={!0} domain={[0, d]} />{(0, $.jsx)(he, {
            cursor: !1,
            content: m
          })}{s.map(e => <Rt key={e.key} dataKey={e.key} stackId="tokens" fill={`var(--color-${e.key})`} radius={0} />)}</Bt></Ce></div>}<div className="grid grid-cols-3 gap-2">{i.map((e, n) => <div key={e.modelId ?? `__unknown__`} className="flex min-w-0 items-center gap-2 text-ui-base"><span className="size-2.5 shrink-0 rounded-sm" style={{
          backgroundColor: z(n)
        }} /><span className="truncate text-foreground-subtle">{o(t, e.modelId)}</span></div>)}</div></section>;
}
export { Jt as AppUsageDailyModelBarChart };
