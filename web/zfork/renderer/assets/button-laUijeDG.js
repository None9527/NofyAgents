import { s as e } from "./chunk-Cq_f4orQ.js";
import { t } from "./react-BQLj9xdT.js";
import { t as n } from "./jsx-runtime-B5yMD3-t.js";
import { t as r } from "./dist-vnZIbudW.js";
import { r as i } from "./bundle-mjs-D8tLE0rB.js";
import { t as a } from "./utils-CEEH0K_K.js";
var o = e(t(), 1),
  s = (...e) =>
    e
      .filter((e, t, n) => !!e && e.trim() !== `` && n.indexOf(e) === t)
      .join(` `)
      .trim(),
  c = (e) => e.replace(/([a-z0-9])([A-Z])/g, `$1-$2`).toLowerCase(),
  l = (e) =>
    e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => (n ? n.toUpperCase() : t.toLowerCase())),
  u = (e) => {
    let t = l(e);
    return t.charAt(0).toUpperCase() + t.slice(1);
  },
  d = {
    xmlns: `http://www.w3.org/2000/svg`,
    width: 24,
    height: 24,
    viewBox: `0 0 24 24`,
    fill: `none`,
    stroke: `currentColor`,
    strokeWidth: 2,
    strokeLinecap: `round`,
    strokeLinejoin: `round`,
  },
  f = (e) => {
    for (let t in e) if (t.startsWith(`aria-`) || t === `role` || t === `title`) return !0;
    return !1;
  },
  p = (0, o.createContext)({});
function m({
  children: e,
  size: t,
  color: n,
  strokeWidth: r,
  absoluteStrokeWidth: i,
  className: a,
}) {
  let s = (0, o.useMemo)(
    () => ({ size: t, color: n, strokeWidth: r, absoluteStrokeWidth: i, className: a }),
    [t, n, r, i, a],
  );
  return (0, o.createElement)(p.Provider, { value: s }, e);
}
var h = () => (0, o.useContext)(p),
  g = (0, o.forwardRef)(
    (
      {
        color: e,
        size: t,
        strokeWidth: n,
        absoluteStrokeWidth: r,
        className: i = ``,
        children: a,
        iconNode: c,
        ...l
      },
      u,
    ) => {
      let {
          size: p = 24,
          strokeWidth: m = 2,
          absoluteStrokeWidth: g = !1,
          color: _ = `currentColor`,
          className: v = ``,
        } = h() ?? {},
        y = (r ?? g) ? (Number(n ?? m) * 24) / Number(t ?? p) : (n ?? m);
      return (0, o.createElement)(
        `svg`,
        {
          ref: u,
          ...d,
          width: t ?? p ?? d.width,
          height: t ?? p ?? d.height,
          stroke: e ?? _,
          strokeWidth: y,
          className: s(`lucide`, v, i),
          ...(!a && !f(l) && { "aria-hidden": `true` }),
          ...l,
        },
        [...c.map(([e, t]) => (0, o.createElement)(e, t)), ...(Array.isArray(a) ? a : [a])],
      );
    },
  ),
  _ = (e, t) => {
    let n = (0, o.forwardRef)(({ className: n, ...r }, i) =>
      (0, o.createElement)(g, {
        ref: i,
        iconNode: t,
        className: s(`lucide-${c(u(e))}`, `lucide-${e}`, n),
        ...r,
      }),
    );
    return ((n.displayName = u(e)), n);
  },
  v = _(`chevron-left`, [[`path`, { d: `m15 18-6-6 6-6`, key: `1wnfg3` }]]),
  y = _(`chevron-right`, [[`path`, { d: `m9 18 6-6-6-6`, key: `mthhwq` }]]),
  b = _(`zoom-in`, [
    [`circle`, { cx: `11`, cy: `11`, r: `8`, key: `4ej97u` }],
    [`line`, { x1: `21`, x2: `16.65`, y1: `21`, y2: `16.65`, key: `13gj7c` }],
    [`line`, { x1: `11`, x2: `11`, y1: `8`, y2: `14`, key: `1vmskp` }],
    [`line`, { x1: `8`, x2: `14`, y1: `11`, y2: `11`, key: `durymu` }],
  ]),
  x = _(`zoom-out`, [
    [`circle`, { cx: `11`, cy: `11`, r: `8`, key: `4ej97u` }],
    [`line`, { x1: `21`, x2: `16.65`, y1: `21`, y2: `16.65`, key: `13gj7c` }],
    [`line`, { x1: `8`, x2: `14`, y1: `11`, y2: `11`, key: `durymu` }],
  ]),
  S = (e) => (typeof e == `boolean` ? `${e}` : e === 0 ? `0` : e),
  C = i,
  w = (e, t) => (n) => {
    if (t?.variants == null) return C(e, n?.class, n?.className);
    let { variants: r, defaultVariants: i } = t,
      a = Object.keys(r).map((e) => {
        let t = n?.[e],
          a = i?.[e];
        if (t === null) return null;
        let o = S(t) || S(a);
        return r[e][o];
      }),
      o =
        n &&
        Object.entries(n).reduce((e, t) => {
          let [n, r] = t;
          return (r === void 0 || (e[n] = r), e);
        }, {});
    return C(
      e,
      a,
      t?.compoundVariants?.reduce((e, t) => {
        let { class: n, className: r, ...a } = t;
        return Object.entries(a).every((e) => {
          let [t, n] = e;
          return Array.isArray(n) ? n.includes({ ...i, ...o }[t]) : { ...i, ...o }[t] === n;
        })
          ? [...e, n, r]
          : e;
      }, []),
      n?.class,
      n?.className,
    );
  },
  T = n(),
  E = w(
    `group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-ui-base/relaxed whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
    {
      variants: {
        variant: {
          default: `bg-primary text-primary-foreground hover:bg-primary/80`,
          outline: `border-border text-foreground hover:border-border-hover hover:bg-input/50 hover:text-foreground aria-expanded:bg-input/50 aria-expanded:text-foreground`,
          secondary: `bg-secondary text-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-foreground`,
          ghost: `text-foreground hover:bg-hover hover:text-foreground aria-expanded:bg-hover aria-expanded:text-foreground`,
          destructive: `bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 aria-expanded:bg-destructive aria-expanded:text-destructive-foreground`,
          warning: `bg-warning text-warning-foreground hover:bg-warning/90 focus-visible:border-warning/40 focus-visible:ring-warning/20 aria-expanded:bg-warning aria-expanded:text-warning-foreground`,
          link: `text-primary underline-offset-4 hover:underline`,
        },
        size: {
          default: `h-7 gap-1 px-2 text-ui-base has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5`,
          xs: `h-5 gap-1 rounded-sm px-2 text-ui-base has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-2.5`,
          sm: `h-6 gap-1 px-2 text-ui-base/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3`,
          lg: `h-8 gap-1 rounded-lg px-2.5 text-ui-base has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4`,
          icon: `size-7 [&_svg:not([class*='size-'])]:size-4`,
          "icon-xs": `size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5`,
          "icon-sm": `size-6 [&_svg:not([class*='size-'])]:size-3`,
          "icon-md": `size-7 rounded-lg [&_svg:not([class*='size-'])]:size-4`,
          "icon-lg": `size-8 rounded-lg [&_svg:not([class*='size-'])]:size-4`,
        },
      },
      defaultVariants: { variant: `default`, size: `default` },
    },
  );
function D({ className: e, variant: t = `default`, size: n = `default`, asChild: i = !1, ...o }) {
  return (0, T.jsx)(i ? r : `button`, {
    "data-slot": `button`,
    "data-variant": t,
    "data-size": n,
    className: a(E({ variant: t, size: n, className: e })),
    ...o,
  });
}
export { b as a, _ as c, x as i, m as l, E as n, y as o, w as r, v as s, D as t };
