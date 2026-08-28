const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = ["./pptxRendererPreviewEngine-BIIRLBue.js", "./presentationElementModel-r6vQ-JZl.js"]),
) => i.map((i) => d[i]);
import { s as e } from "./chunk-Cq_f4orQ.js";
import {
  C as t,
  S as n,
  _ as r,
  h as i,
  i as a,
  j as o,
  l as s,
  n as c,
  r as l,
  t as u,
  u as d,
  v as f,
  w as p,
  y as m,
} from "./imeComposition-DEYFkwWm.js";
import { t as h } from "./react-BQLj9xdT.js";
import { t as g } from "./jsx-runtime-B5yMD3-t.js";
import { t as _ } from "./logger-PFDwl5Yq.js";
import { t as v } from "./preload-helper-BHSF1fZ9.js";
import { a as y, c as b, i as ee, o as te, s as ne, t as x } from "./button-laUijeDG.js";
import { t as S } from "./utils-CEEH0K_K.js";
import { n as C } from "./presentationElementModel-r6vQ-JZl.js";
var re = b(`file-down`, [
    [
      `path`,
      {
        d: `M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`,
        key: `1oefj6`,
      },
    ],
    [`path`, { d: `M14 2v5a1 1 0 0 0 1 1h5`, key: `wfsgrz` }],
    [`path`, { d: `M12 18v-6`, key: `17g6i2` }],
    [`path`, { d: `m9 15 3 3 3-3`, key: `1npd3o` }],
  ]),
  w = e(h(), 1),
  T = g();
function ie({
  children: e,
  open: t,
  boundary: r,
  label: i,
  commentPlaceholder: o,
  cancelLabel: s,
  addToConversationLabel: l,
  editing: d,
  disabled: p,
  onAiEdit: m,
  onCancelAiEdit: h,
  onAddToConversation: g,
  onExitSelection: _,
}) {
  let [v, y] = (0, w.useState)(``),
    b = (0, w.useRef)(!1);
  return (
    (0, w.useEffect)(() => {
      d || (y(``), (b.current = !1));
    }, [d]),
    (0, T.jsxs)(c, {
      open: t,
      modal: !1,
      children: [
        e,
        (0, T.jsx)(a, {
          role: `toolbar`,
          "aria-label": i,
          side: `top`,
          align: `center`,
          sideOffset: 8,
          collisionBoundary: r,
          collisionPadding: 8,
          sticky: `partial`,
          hideWhenDetached: !0,
          updatePositionStrategy: `always`,
          className: d
            ? `w-80 max-w-[calc(100vw-1rem)] gap-0 border-popover-border p-1`
            : `w-auto max-w-[calc(100vw-1rem)] gap-0 border-popover-border p-1`,
          onEscapeKeyDown: (e) => {
            if ((e.preventDefault(), d)) {
              if (u({ compositionActive: b.current, isComposing: e.isComposing })) return;
              h();
              return;
            }
            _();
          },
          onCloseAutoFocus: (e) => e.preventDefault(),
          children: d
            ? (0, T.jsxs)(`div`, {
                className: `flex flex-col gap-2 p-1`,
                children: [
                  (0, T.jsx)(f, {
                    autoFocus: !0,
                    "aria-label": o,
                    placeholder: o,
                    value: v,
                    disabled: p,
                    rows: 3,
                    className: `min-h-16 resize-none border-input-border bg-input text-mobile-input-safe placeholder:text-foreground-subtlest hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused focus-visible:ring-0 md:text-ui-base`,
                    onChange: (e) => y(e.target.value),
                    onCompositionStart: () => {
                      b.current = !0;
                    },
                    onCompositionEnd: () => {
                      b.current = !1;
                    },
                  }),
                  (0, T.jsxs)(`div`, {
                    className: `flex items-center justify-end gap-1`,
                    children: [
                      (0, T.jsx)(x, {
                        type: `button`,
                        size: `sm`,
                        variant: `ghost`,
                        disabled: p,
                        onClick: h,
                        children: s,
                      }),
                      (0, T.jsx)(x, {
                        type: `button`,
                        size: `sm`,
                        disabled: p,
                        onClick: () => g(v),
                        children: l,
                      }),
                    ],
                  }),
                ],
              })
            : (0, T.jsxs)(x, {
                type: `button`,
                size: `lg`,
                variant: `ghost`,
                "aria-label": i,
                disabled: p,
                className: `w-full justify-start rounded-lg px-2`,
                onMouseDown: (e) => {
                  e.preventDefault();
                },
                onClick: m,
                children: [(0, T.jsx)(n, { className: `size-4` }), i],
              }),
        }),
      ],
    })
  );
}
function ae(e, t) {
  let n = Math.max(1, Math.floor(t));
  return Number.isFinite(e) ? Math.min(Math.max(1, Math.round(e)), n) : 1;
}
function E(e) {
  return Number.isFinite(e) ? Math.min(Math.max(25, Math.round(e)), 300) : 100;
}
function D(e, t, n) {
  let r = e.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0 || t.width <= 0 || t.height <= 0) return null;
  let i = r.width / t.width,
    a = r.height / t.height,
    o = r.left + n.x * i,
    s = r.top + n.y * a;
  return { left: o, top: s, right: o + n.width * i, bottom: s + n.height * a };
}
function O(e, t) {
  let n = (e.left + e.right) / 2,
    r = (e.top + e.bottom) / 2;
  return n >= t.left && n <= t.right && r >= t.top && r <= t.bottom;
}
function k(e, t) {
  try {
    if (!e.intersectsNode(t)) return null;
  } catch {
    return null;
  }
  let n = e.startContainer === t ? Math.min(e.startOffset, t.data.length) : 0,
    r = e.endContainer === t ? Math.min(e.endOffset, t.data.length) : t.data.length;
  return r <= n ? null : { startOffset: n, endOffset: r };
}
function oe({ selection: e, renderSurface: t, pageSize: n, elementBounds: r, elementText: i }) {
  if (!e || e.isCollapsed || e.rangeCount === 0 || !t) return null;
  let a = D(t, n, r);
  if (!a) return null;
  let o = t.ownerDocument,
    s = o.defaultView?.NodeFilter.SHOW_TEXT ?? 4,
    c = [];
  for (let n = 0; n < e.rangeCount; n += 1) {
    let r = e.getRangeAt(n);
    if (r.collapsed) continue;
    let l = o.createTreeWalker(t, s);
    for (let e = l.nextNode(); e; e = l.nextNode()) {
      let t = e,
        n = k(r, t);
      if (!n) continue;
      let s = o.createRange();
      (s.setStart(t, n.startOffset), s.setEnd(t, n.endOffset));
      let l = Array.from(s.getClientRects()).some((e) => O(e, a)),
        u = t.data.slice(n.startOffset, n.endOffset),
        d = u.trim();
      l && (!d || !i || i.includes(d)) && c.push(u);
    }
  }
  return c.join(``).trim() || null;
}
function A(e, t) {
  return !e || !t
    ? !1
    : e.nodeId === t.nodeId &&
        e.nodeType === t.nodeType &&
        e.rowIndex === t.rowIndex &&
        e.cellIndex === t.cellIndex;
}
function j(e, t, n, r) {
  let i = e.getBoundingClientRect();
  return i.width <= 0 || i.height <= 0
    ? null
    : { x: ((n - i.left) / i.width) * t.width, y: ((r - i.top) / i.height) * t.height };
}
function M({
  document: e,
  pageIndex: t,
  scale: n,
  generation: r,
  interactive: i = !1,
  onNavigate: a,
  onRenderError: o,
  selectionMode: s = !1,
  elements: c = [],
  selectedElement: u = null,
  onSelectElement: d,
  renderSurfaceRef: f,
}) {
  let p = (0, w.useRef)(null),
    m = (0, w.useRef)(null),
    h = f ?? m,
    g = s && !!u?.text?.trim();
  return (
    (0, w.useEffect)(() => {
      let e = p.current;
      if (!e) return;
      let t = (e) => {
        let t = e.target;
        t instanceof HTMLElement &&
          (t.scrollTop !== 0 || t.scrollLeft !== 0) &&
          ((t.scrollTop = 0), (t.scrollLeft = 0));
      };
      return (e.addEventListener(`scroll`, t, !0), () => e.removeEventListener(`scroll`, t, !0));
    }, []),
    (0, w.useEffect)(() => {
      let n = h.current;
      if (!n) return;
      let i = null,
        s = !1,
        c = (e) => {
          s || o?.(r, e instanceof Error ? e : Error(String(e)));
        };
      try {
        ((i = e.renderPage(t, n, {
          onNavigate: (e) => {
            e.pageIndex !== void 0 && a?.(e.pageIndex);
          },
        })),
          i.ready.catch(c));
      } catch (e) {
        c(e);
      }
      return () => {
        ((s = !0), i?.dispose(), n.replaceChildren());
      };
    }, [e, r, a, o, t]),
    (0, T.jsx)(`div`, {
      ref: p,
      className: `relative shrink-0 overflow-hidden bg-background shadow-md`,
      style: { width: e.pageSize.width * n, height: e.pageSize.height * n },
      children: (0, T.jsxs)(`div`, {
        "data-zcode-pptx-render-surface": ``,
        className: `absolute left-0 top-0 origin-top-left`,
        style: { width: e.pageSize.width, height: e.pageSize.height, transform: `scale(${n})` },
        children: [
          (0, T.jsx)(`div`, {
            ref: h,
            "data-zcode-pptx-render-surface": `true`,
            className: S(
              `absolute inset-0`,
              i && (!s || g) ? `pointer-events-auto` : `pointer-events-none`,
              g && `select-text`,
            ),
            onPointerDownCapture: (t) => {
              if (!g) return;
              let n = j(t.currentTarget, e.pageSize, t.clientX, t.clientY),
                r = n ? C(c, n) : null;
              A(r, u) || (t.preventDefault(), t.stopPropagation(), r && d?.(r));
            },
            onClickCapture: (e) => {
              s && (e.preventDefault(), e.stopPropagation());
            },
          }),
          s
            ? (0, T.jsx)(`div`, {
                className: `pointer-events-none absolute inset-0`,
                "data-pptx-element-selection-overlay": `true`,
                children: c.map((e) => {
                  let t = [e.nodeId, e.nodeType, e.rowIndex ?? ``, e.cellIndex ?? ``].join(`:`),
                    n = A(u, e),
                    r = (0, T.jsx)(
                      `button`,
                      {
                        type: `button`,
                        "aria-pressed": n,
                        "aria-label": e.text || e.nodeName || e.nodeType,
                        className: S(
                          `absolute border outline-none transition-colors`,
                          g ? `pointer-events-none` : `pointer-events-auto`,
                          n
                            ? `border-primary bg-accent/30`
                            : `border-transparent bg-transparent hover:border-primary hover:bg-accent/20`,
                        ),
                        style: {
                          left: e.bounds.x,
                          top: e.bounds.y,
                          width: e.bounds.width,
                          height: e.bounds.height,
                          zIndex: e.zIndex * 2 + +(e.nodeType === `table-cell`),
                        },
                        onClick: () => d?.(e),
                      },
                      t,
                    );
                  return n ? (0, T.jsx)(l, { asChild: !0, children: r }, `anchor:${t}`) : r;
                }),
              })
            : null,
        ],
      }),
    })
  );
}
function se({
  document: e,
  pageIndex: t,
  generation: n,
  selected: r,
  scrollRoot: i,
  labels: a,
  onSelect: o,
}) {
  let s = (0, w.useRef)(null),
    [c, l] = (0, w.useState)(!1),
    [u, d] = (0, w.useState)(0);
  ((0, w.useEffect)(() => {
    let e = s.current;
    if (!e || typeof IntersectionObserver > `u`) {
      l(!0);
      return;
    }
    let t = new IntersectionObserver(([e]) => l(e?.isIntersecting ?? !1), {
      root: i,
      rootMargin: `200px 0px`,
    });
    return (t.observe(e), () => t.disconnect());
  }, [i]),
    (0, w.useEffect)(() => {
      let e = s.current;
      if (!e) return;
      let t = () => d(Math.max(0, e.clientWidth - 16));
      if ((t(), typeof ResizeObserver > `u`))
        return (
          window.addEventListener(`resize`, t),
          () => window.removeEventListener(`resize`, t)
        );
      let n = new ResizeObserver(t);
      return (n.observe(e), () => n.disconnect());
    }, []),
    (0, w.useEffect)(() => {
      r && s.current?.scrollIntoView({ block: `nearest` });
    }, [r]));
  let f = u > 0 ? u / e.pageSize.width : 0;
  return (0, T.jsxs)(`button`, {
    ref: s,
    type: `button`,
    "aria-current": r ? `page` : void 0,
    "aria-label": a.thumbnail(t + 1),
    className: S(
      `flex w-full flex-col items-center gap-1 rounded-lg border p-2 text-ui-xs text-foreground-subtle outline-none transition-colors`,
      r
        ? `border-border-hover bg-selected text-foreground`
        : `border-transparent hover:border-border hover:bg-surface-hover`,
    ),
    onClick: o,
    children: [
      (0, T.jsx)(`div`, {
        className: `flex w-full items-center justify-center overflow-hidden bg-surface`,
        style: { aspectRatio: `${e.pageSize.width} / ${e.pageSize.height}` },
        children:
          c && f > 0 ? (0, T.jsx)(M, { document: e, generation: n, pageIndex: t, scale: f }) : null,
      }),
      (0, T.jsx)(`span`, { className: `tabular-nums`, children: t + 1 }),
    ],
  });
}
function ce(e) {
  let [t, n] = (0, w.useState)({ width: 0, height: 0 });
  return (
    (0, w.useEffect)(() => {
      if (!e) return;
      let t = () => n({ width: e.clientWidth, height: e.clientHeight });
      if ((t(), typeof ResizeObserver > `u`))
        return (
          window.addEventListener(`resize`, t),
          () => window.removeEventListener(`resize`, t)
        );
      let r = new ResizeObserver(t);
      return (r.observe(e), () => r.disconnect());
    }, [e]),
    t
  );
}
function N({
  data: e,
  labels: n,
  className: a,
  fileName: c,
  referenceSource: l,
  referenceNavigation: u,
  referenceNavigationReady: f = !0,
}) {
  let [h, g] = (0, w.useState)(null),
    [b, C] = (0, w.useState)(!1),
    [D, O] = (0, w.useState)(1),
    [k, A] = (0, w.useState)(`1`),
    [j, N] = (0, w.useState)(100),
    [P, F] = (0, w.useState)(!1),
    [le, ue] = (0, w.useState)(null),
    [I, de] = (0, w.useState)(null),
    [L, R] = (0, w.useState)(!1),
    [z, B] = (0, w.useState)(null),
    [V, H] = (0, w.useState)(null),
    [U, W] = (0, w.useState)(!1),
    G = ce(I),
    K = (0, w.useRef)(0),
    q = o(),
    fe = !!(q?.printPageToPdf && q?.saveFile),
    J = (0, w.useRef)(null),
    Y = (0, w.useRef)(null),
    X = h?.document ?? null,
    Z = h?.generation ?? 0;
  (0, w.useEffect)(() => {
    let t = K.current + 1;
    K.current = t;
    let n = !1,
      r = null;
    return (
      g(null),
      C(!1),
      O(1),
      A(`1`),
      N(100),
      B(null),
      H(null),
      W(!1),
      i(e)
        .then((t) =>
          v(
            async () => {
              let { pptxRendererPreviewEngine: e } = await import(
                `./pptxRendererPreviewEngine-BIIRLBue.js`
              );
              return { pptxRendererPreviewEngine: e };
            },
            __vite__mapDeps([0, 1]),
            import.meta.url,
          )
            .then(({ pptxRendererPreviewEngine: t }) => t.open(e))
            .then((e) => ({ nextDocument: e, sourceFingerprint: t })),
        )
        .then(({ nextDocument: e, sourceFingerprint: i }) => {
          if (((r = e), n || t !== K.current)) {
            e.dispose();
            return;
          }
          g({ generation: t, document: e, sourceFingerprint: i });
        })
        .catch((e) => {
          n || t !== K.current || (_.error(`[PptxPreviewViewer] PPTX 解析失败`, e), C(!0));
        }),
      () => {
        ((n = !0), t === K.current && (K.current += 1), r?.dispose());
      }
    );
  }, [e]);
  let Q = (0, w.useCallback)(
      (e) => {
        if (!X || X.pageCount === 0) return;
        let t = ae(e, X.pageCount);
        (O(t), A(String(t)));
      },
      [X],
    ),
    $ = (0, w.useCallback)(() => {
      let e = Number.parseInt(k.trim(), 10);
      if (Number.isNaN(e)) {
        A(String(D));
        return;
      }
      Q(e);
    }, [Q, k, D]),
    pe = (0, w.useCallback)(
      (e) => {
        let t = e.target;
        if (!(t.tagName === `INPUT` || t.tagName === `TEXTAREA` || t.isContentEditable))
          if (e.key === `Escape` && L) {
            if ((e.preventDefault(), V)) {
              H(null);
              return;
            }
            (R(!1), B(null));
          } else
            e.key === `ArrowLeft`
              ? (e.preventDefault(), Q(D - 1))
              : e.key === `ArrowRight` && (e.preventDefault(), Q(D + 1));
      },
      [V, Q, D, L],
    ),
    me = (0, w.useCallback)(() => {
      (R(!1), B(null), H(null));
    }, []),
    he = (0, w.useMemo)(
      () =>
        !X || G.width === 0 || G.height === 0
          ? 1
          : Math.min(
              Math.max(1, G.width - 32) / X.pageSize.width,
              Math.max(1, G.height - 32) / X.pageSize.height,
            ) *
            (j / 100),
      [X, G.height, G.width, j],
    ),
    ge = (0, w.useCallback)((e, t) => {
      e === K.current && (_.error(`[PptxPreviewViewer] PPTX 页面渲染失败`, t), C(!0));
    }, []),
    _e = (0, w.useCallback)((e) => Q(e + 1), [Q]);
  ((0, w.useEffect)(() => {
    if (!u || (R(!1), B(null), H(null), !f || !X || J.current === u.requestId)) return;
    J.current = u.requestId;
    let e = u.pageIndex + 1;
    if (!Number.isInteger(u.pageIndex) || u.pageIndex < 0 || u.pageIndex >= X.pageCount) {
      r(n.referencedPageMissing(e));
      return;
    }
    (Q(e), h?.sourceFingerprint !== u.expectedSourceFingerprint && r(n.referencedSourceChanged(e)));
  }, [X, Q, n, h?.sourceFingerprint, u, f]),
    (0, w.useEffect)(() => {
      (B(null), H(null));
    }, [Z, D]));
  let ve = (0, w.useMemo)(() => (X && L ? X.getPageElements(D - 1) : []), [X, D, L]),
    ye = (0, w.useCallback)(() => {
      if (!z || !h || !l || U) return;
      let e = Y.current,
        t = oe({
          selection: e?.ownerDocument.defaultView?.getSelection() ?? null,
          renderSurface: e,
          pageSize: h.document.pageSize,
          elementBounds: z.bounds,
          elementText: z.text,
        });
      H(t ? { selectedText: t } : {});
    }, [U, h, l, z]),
    be = (0, w.useCallback)((e) => {
      (H(null), B(e));
    }, []),
    xe = (0, w.useCallback)(
      (e) => {
        if (!z || !h || !l || !V || U) return;
        let t = e.trim();
        (W(!0),
          s({
            element: z,
            ...V,
            ...(t ? { comment: t } : {}),
            ...l,
            sourceFingerprint: h.sourceFingerprint,
          })
            .then((e) => {
              (d(e), H(null));
            })
            .catch((e) => {
              _.error(`[PptxPreviewViewer] 创建 PPTX 元素引用失败`, e);
            })
            .finally(() => W(!1)));
      },
      [U, V, h, l, z],
    ),
    Se = (0, w.useMemo)(() => {
      let e = c?.split(/[\\/]/).pop()?.trim();
      if (!e) return `presentation.pdf`;
      let t = /\.(pptx?|ppsx?)$/i;
      return t.test(e) ? e.replace(t, `.pdf`) : `${e}.pdf`;
    }, [c]),
    Ce = (0, w.useCallback)(async () => {
      let e = q?.printPageToPdf,
        t = q?.saveFile;
      if (!X || P || !e || !t) return;
      F(!0);
      let i = null;
      try {
        let { renderPresentationToPrintHost: a } = await v(
          async () => {
            let { renderPresentationToPrintHost: e } = await import(
              `./presentationPdfPrintExport-CsVZM-dn.js`
            );
            return { renderPresentationToPrintHost: e };
          },
          [],
          import.meta.url,
        );
        i = await a(X, window.document);
        let o = await e();
        if ((i.dispose(), (i = null), !o.success || !o.data))
          throw Error(o.error ?? `print_failed`);
        let s = await t({ data: o.data, suggestedName: Se });
        if (s.canceled) return;
        if (!s.success || !s.path) throw Error(s.error ?? `save_failed`);
        r(n.exportPdfSuccess(s.path));
      } catch (e) {
        (_.error(`[PptxPreviewViewer] PPTX 导出 PDF 失败`, e), r(n.exportPdfFailed));
      } finally {
        (i?.dispose(), F(!1));
      }
    }, [X, P, n, q, Se]);
  if (b)
    return (0, T.jsx)(`div`, {
      className: `p-3 text-ui-base text-destructive`,
      children: n.loadError,
    });
  if (!X)
    return (0, T.jsx)(`div`, {
      className: `p-3 text-ui-base text-foreground-subtle`,
      children: n.loading,
    });
  if (X.pageCount === 0)
    return (0, T.jsx)(`div`, {
      className: `p-3 text-ui-base text-foreground-subtle`,
      children: n.noSlides,
    });
  let we = D - 1;
  return (0, T.jsxs)(`div`, {
    tabIndex: 0,
    onKeyDown: pe,
    className: S(`flex h-full min-h-0 outline-none`, a),
    children: [
      (0, T.jsx)(`aside`, {
        ref: ue,
        "aria-label": n.thumbnails,
        className: `w-24 shrink-0 overflow-y-auto border-r border-border bg-surface/30 p-2 sm:w-32`,
        children: (0, T.jsx)(`div`, {
          className: `flex flex-col gap-2`,
          children: Array.from({ length: X.pageCount }, (e, t) =>
            (0, T.jsx)(
              se,
              {
                document: X,
                generation: Z,
                pageIndex: t,
                selected: t === we,
                scrollRoot: le,
                labels: n,
                onSelect: () => Q(t + 1),
              },
              t,
            ),
          ),
        }),
      }),
      (0, T.jsxs)(`div`, {
        className: `flex min-w-0 flex-1 flex-col bg-background`,
        children: [
          (0, T.jsx)(`div`, {
            ref: de,
            className: `min-h-0 flex-1 overflow-auto`,
            children: (0, T.jsx)(`div`, {
              className: `grid min-h-full min-w-full place-items-center p-4`,
              children: (0, T.jsx)(ie, {
                open: L && z !== null,
                boundary: I,
                label: n.aiEdit,
                commentPlaceholder: n.commentPlaceholder,
                cancelLabel: n.cancelAiEdit,
                addToConversationLabel: n.addToConversation,
                editing: V !== null,
                disabled: U,
                onAiEdit: ye,
                onCancelAiEdit: () => H(null),
                onAddToConversation: xe,
                onExitSelection: me,
                children: (0, T.jsx)(M, {
                  document: X,
                  generation: Z,
                  pageIndex: we,
                  scale: he,
                  interactive: !0,
                  selectionMode: L,
                  elements: ve,
                  selectedElement: z,
                  onSelectElement: be,
                  renderSurfaceRef: Y,
                  onNavigate: _e,
                  onRenderError: ge,
                }),
              }),
            }),
          }),
          (0, T.jsxs)(`div`, {
            className: `flex min-h-10 shrink-0 flex-wrap items-center justify-center gap-1 border-t border-border bg-surface/30 px-2 py-1.5 text-ui-base`,
            children: [
              l
                ? (0, T.jsxs)(x, {
                    type: `button`,
                    size: `sm`,
                    variant: L ? `secondary` : `ghost`,
                    "aria-pressed": L,
                    "aria-label": L ? n.exitElementSelection : n.selectElement,
                    title: L ? n.exitElementSelection : n.selectElement,
                    onClick: () => {
                      (R((e) => !e), B(null), H(null));
                    },
                    children: [
                      (0, T.jsx)(t, { className: `size-4` }),
                      L ? n.exitElementSelection : n.selectElement,
                    ],
                  })
                : null,
              (0, T.jsx)(x, {
                type: `button`,
                size: `icon-md`,
                variant: `ghost`,
                "aria-label": n.previousPage,
                title: n.previousPage,
                disabled: D <= 1,
                onClick: () => Q(D - 1),
                children: (0, T.jsx)(ne, {}),
              }),
              (0, T.jsx)(m, {
                type: `text`,
                inputMode: `numeric`,
                "aria-label": n.pageInput,
                value: k,
                onChange: (e) => A(e.target.value),
                onBlur: $,
                onKeyDown: (e) => {
                  e.key === `Enter` && ($(), e.currentTarget.blur());
                },
                className: `w-12 text-center text-mobile-input-safe tabular-nums md:text-ui-base`,
              }),
              (0, T.jsxs)(`span`, {
                className: `min-w-10 text-center tabular-nums text-foreground-subtle`,
                children: [`/ `, X.pageCount],
              }),
              (0, T.jsx)(x, {
                type: `button`,
                size: `icon-md`,
                variant: `ghost`,
                "aria-label": n.nextPage,
                title: n.nextPage,
                disabled: D >= X.pageCount,
                onClick: () => Q(D + 1),
                children: (0, T.jsx)(te, {}),
              }),
              (0, T.jsx)(`div`, { className: `mx-1 h-5 w-px bg-border`, "aria-hidden": `true` }),
              (0, T.jsx)(x, {
                type: `button`,
                size: `icon-md`,
                variant: `ghost`,
                "aria-label": n.zoomOut,
                title: n.zoomOut,
                disabled: j <= 25,
                onClick: () => N((e) => E(e - 25)),
                children: (0, T.jsx)(ee, {}),
              }),
              (0, T.jsxs)(`span`, {
                className: `w-12 text-center tabular-nums text-foreground-subtle`,
                children: [j, `%`],
              }),
              (0, T.jsx)(x, {
                type: `button`,
                size: `icon-md`,
                variant: `ghost`,
                "aria-label": n.zoomIn,
                title: n.zoomIn,
                disabled: j >= 300,
                onClick: () => N((e) => E(e + 25)),
                children: (0, T.jsx)(y, {}),
              }),
              fe
                ? (0, T.jsxs)(T.Fragment, {
                    children: [
                      (0, T.jsx)(`div`, {
                        className: `mx-1 h-5 w-px bg-border`,
                        "aria-hidden": `true`,
                      }),
                      (0, T.jsx)(x, {
                        type: `button`,
                        size: `icon-md`,
                        variant: `ghost`,
                        "aria-label": P ? n.exportingPdf : n.exportPdf,
                        title: P ? n.exportingPdf : n.exportPdf,
                        disabled: P,
                        onClick: () => void Ce(),
                        children: P
                          ? (0, T.jsx)(p, { className: `animate-spin` })
                          : (0, T.jsx)(re, {}),
                      }),
                    ],
                  })
                : null,
            ],
          }),
        ],
      }),
    ],
  });
}
export { N as PptxPreviewViewer };
