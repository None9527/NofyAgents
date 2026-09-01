/* eslint-disable */
/**
 * ============================================================================
 * ResizablePanelsEngineInteraction.ts —— A1-P2-B4 新叶（B5 语义顶层名 + 头注映射表）
 * ----------------------------------------------------------------------------
 * 真身区段：styles-CdEGpc2x.js 130651–131243（单一连续原子区，593 行，三十五件）
 *   M4  → normalizeLayout              布局归一+约束再分配 (130651-130681)
 *   jkt → createPanelApi               Panel 命令面工厂 (130682-130791)
 *   Mkt → handleSeparatorDoubleClick   分隔条双击复位 (130792-130804)
 *   N4  → findGroupBySeparatorElement  按分隔条元素查组 (130805-130809)
 *   Nkt → createGroupApi               Group 命令面工厂 (130810-130844)
 *   P4  → resizeAtSeparator            分隔条键盘增量缩放 (130845-130873)
 *   Pkt → handleSeparatorKeyDown       分隔条键盘处理 (130874-130930)
 *   F4  → resizeDragState              拖拽状态对象 (130931)
 *   I4  → resizeDragStateEmitter       拖拽状态发射器 (130931)
 *   L4  → getDragState                 拖拽状态读取 (130933-130935)
 *   Fkt → subscribeDragStateChange     拖拽状态订阅 (130936-130938)
 *   Ikt → setDragCursorFlags           光标标志位写入 (130939-130943)
 *   R4  → setDragState                 拖拽状态整体写入 (130944-130947)
 *   Lkt → handleGlobalPointerDown      全局指针按下 (130948-130967)
 *   Rkt → identityFn                   恒等函数 (130968)
 *   z4  → noopFn                       空操作函数 (130968)
 *   zkt → CURSOR_FLAG_RIGHT            光标位：可向右 (130968)
 *   Bkt → CURSOR_FLAG_LEFT             光标位：可向左 (130968)
 *   Vkt → CURSOR_FLAG_DOWN             光标位：可向下 (130968)
 *   Hkt → CURSOR_FLAG_UP               光标位：可向上 (130968)
 *   Ukt → CURSOR_FLAG_HORIZONTAL       光标位：水平向 (130968)
 *   Wkt → CURSOR_FLAG_VERTICAL         光标位：垂直向 (130968)
 *   B4  → chromeOrFirefoxCache         浏览器判定缓存 (130968)
 *   Gkt → isChromeOrFirefox            Chrome/Firefox 判定 (130977-130987)
 *   Kkt → resolveCursorStyle           光标样式解析 (130988-131033)
 *   qkt → cursorStyleSheetCache        光标样式表缓存 (131034)
 *   V4  → applyCursorStyle             光标样式应用 (131035-131064)
 *   Jkt → processDragMove              拖拽移动求解 (131065-131135)
 *   Ykt → handleTouchMove              触摸移动处理 (131136-131150)
 *   Xkt → handlePointerMove            指针移动处理 (131151-131189)
 *   Zkt → handleIframeMouseLeave       iframe 悬停流失 (131190-131196)
 *   Qkt → handlePointerUp              指针抬起处理 (131197-131211)
 *   $kt → computeDefaultLayout         默认布局计算 (131212-131228)
 *   eAt → notifyPanelResize            Panel onResize 通知 (131229-131238)
 *   tAt → areLayoutsStrictlyEqual      布局严格相等判定 (131239-131243)
 *
 * 〔边界裁定（批 3 机制续用：自带切探）〕余量区 130651–131388（738 行 39 件）
 *   仍超 600 行单批预算。切探（/tmp/a1r0-p2/deep/rest-cut.js）：区段严格自底
 *   向上分层，任意前缀依赖闭合零前向依赖；对批 3 前缀（130051–130650，47 名）
 *   单向消费（RESOLVED 白名单）。预算内最大闭合前缀 CUT@131243 span=593
 *   prefix=35 (CLOSED) → 本批收 130651–131243；余量 131244–131388（145 行
 *   4 件：nAt/rAt/H4/iAt）留批（边界证据见 A1-P2-B4.report.md §七）。
 *
 * 一、混淆名 → 语义名 映射表（自由符裁定；函数体内局部保留混淆名）
 *   三十五件真身映射见上表。本区无 Q/$（不消费 React/jsx-runtime）。
 *
 * 二、与批 3 前缀叶（./ResizablePanelsEngine）的消费关系
 *   本区消费前缀 13 名（v4 D4 k4 C4 A4 j4 T4 g4 h4 m4 E4 S4 mkt），以语义名
 *   别名导入保留混淆调用名（R1 判例），调用面与 bundle 逐字一致。
 *
 * 三、与 ResizablePanelsCore.tsx 的消费关系
 *   Core 叶余留 8 枚 declare const : any 留守件，本批替换其落于本前缀的 7 枚
 *   （M4 jkt Nkt L4 Fkt Rkt z4 → 语义名别名导入）；余 1 枚 iAt(131289) 落于
 *   余量区 131244–131388，随余量批替换。
 *
 * 四、型缝（〔A1-P2-B4〕标注，59 处，逐行登记 /tmp/a1r0-p2/deep/rest-seam-log.txt）
 *   S1 函数/箭头参数 : any ×55（bundle 无型面；纯型层）
 *   S4 推断塌缩 cast ×2（normalizeLayout 内 Object.values(any) → unknown[]，
 *      TS 5.9.3 探针实测；computeDefaultLayout 空对象字面索引写面 {} 塌缩）
 *   S7 窄推断/裸 var 注型 ×2（resizeDragState 字面推断 {cursorFlags;state}
 *      无 active 态扩展属性读面 → any；chromeOrFirefoxCache 裸 var 跨函数
 *      读写面，同批 3 coarsePointerCache 判例）
 *
 * 五、逐字证明
 *   ROUNDTRIP EXACT（593 行）：缝后体逆归一（S1/S4/S7 逐行）+ 逆改名（语义→混淆）
 *   与 bundle 130651–131243 逐字一致；SHORTHAND_RENAMED_SITES 0；98 改名位点
 *   全归因（35/35 名命中）。
 * ============================================================================
 */

/* 批 3 前缀真身（./ResizablePanelsEngine，styles js 130051–130650）；
   别名导入保留混淆调用名（R1 判例），调用面与 bundle 逐字一致 */
import {
  assertInvariant as v4, areSizesEqual as D4, constrainPanelSize as k4,
  getAllGroupData as C4, resizeLayoutByDelta as A4, compareLayouts as j4,
  setGroupData as T4, getGroupPixelSize as g4, roundToThreeDecimals as h4,
  getPxSize as m4, collectHitRegionsAtPointer as E4, getGroupData as S4,
  ListenerRegistry as mkt,
} from "./ResizablePanelsEngine";

function normalizeLayout({ layout: e, panelConstraints: t }: any) {
  let n = Object.values(e) as any[],
    r = [...n],
    i = r.reduce((e: any, t: any) => e + t, 0);
  if (r.length !== t.length)
    throw Error(`Invalid ${t.length} panel layout: ${r.map((e: any) => `${e}%`).join(`, `)}`);
  if (!D4(i, 100) && r.length > 0)
    for (let e = 0; e < t.length; e++) {
      let t = r[e];
      (v4(t != null, `No layout data found for index ${e}`), (r[e] = (100 / i) * t));
    }
  let a = 0;
  for (let e = 0; e < t.length; e++) {
    let i = n[e];
    v4(i != null, `No layout data found for index ${e}`);
    let o = r[e];
    v4(o != null, `No layout data found for index ${e}`);
    let s = k4({ overrideDisabledPanels: !0, panelConstraints: t[e], prevSize: i, size: o });
    o != s && ((a += o - s), (r[e] = s));
  }
  if (!D4(a, 0))
    for (let e = 0; e < t.length; e++) {
      let n = r[e];
      v4(n != null, `No layout data found for index ${e}`);
      let i = n + a,
        o = k4({ overrideDisabledPanels: !0, panelConstraints: t[e], prevSize: n, size: i });
      if (n !== o && ((a -= o - n), (r[e] = o), D4(a, 0))) break;
    }
  let o = Object.keys(e);
  return r.reduce((e: any, t: any, n: any) => ((e[o[n]] = t), e), {});
}
function createPanelApi({ groupId: e, panelId: t }: any) {
  let n = () => {
      let t = C4();
      for (let [
        n,
        {
          defaultLayoutDeferred: r,
          derivedPanelConstraints: i,
          layout: a,
          groupSize: o,
          separatorToPanels: s,
        },
      ] of t)
        if (n.id === e)
          return {
            defaultLayoutDeferred: r,
            derivedPanelConstraints: i,
            group: n,
            groupSize: o,
            layout: a,
            separatorToPanels: s,
          };
      throw Error(`Group ${e} not found`);
    },
    r = () => {
      let e = n().derivedPanelConstraints.find((e: any) => e.panelId === t);
      if (e !== void 0) return e;
      throw Error(`Panel constraints not found for Panel ${t}`);
    },
    i = () => {
      let e = n().group.panels.find((e: any) => e.id === t);
      if (e !== void 0) return e;
      throw Error(`Layout not found for Panel ${t}`);
    },
    a = () => {
      let e = n().layout[t];
      if (e !== void 0) return e;
      throw Error(`Layout not found for Panel ${t}`);
    },
    o = (e: any) => {
      let r = a();
      if (e === r) return;
      let {
          defaultLayoutDeferred: i,
          derivedPanelConstraints: o,
          group: s,
          groupSize: c,
          layout: l,
          separatorToPanels: u,
        } = n(),
        d = s.panels.findIndex((e: any) => e.id === t),
        f = d === s.panels.length - 1,
        p = normalizeLayout({
          layout: A4({
            delta: f ? r - e : e - r,
            initialLayout: l,
            panelConstraints: o,
            pivotIndices: f ? [d - 1, d] : [d, d + 1],
            prevLayout: l,
            trigger: `imperative-api`,
          }),
          panelConstraints: o,
        });
      j4(l, p) ||
        T4(s, {
          defaultLayoutDeferred: i,
          derivedPanelConstraints: o,
          groupSize: c,
          layout: p,
          separatorToPanels: u,
        });
    };
  return {
    collapse: () => {
      let { collapsible: e, collapsedSize: t } = r(),
        { mutableValues: n } = i(),
        s = a();
      e && s !== t && ((n.expandToSize = s), o(t));
    },
    expand: () => {
      let { collapsible: e, collapsedSize: t, minSize: n } = r(),
        { mutableValues: s } = i(),
        c = a();
      if (e && c === t) {
        let e = s.expandToSize ?? n;
        (e === 0 && (e = 1), o(e));
      }
    },
    getSize: () => {
      let { group: e } = n(),
        t = a(),
        { element: r } = i();
      return {
        asPercentage: t,
        inPixels: e.orientation === `horizontal` ? r.offsetWidth : r.offsetHeight,
      };
    },
    isCollapsed: () => {
      let { collapsible: e, collapsedSize: t } = r(),
        n = a();
      return e && D4(t, n);
    },
    resize: (e: any) => {
      let { group: t } = n(),
        { element: r } = i(),
        a = g4({ group: t });
      o(h4((m4({ groupSize: a, panelElement: r, styleProp: e }) / a) * 100));
    },
  };
}
function handleSeparatorDoubleClick(e: any) {
  e.defaultPrevented ||
    E4(e, C4()).forEach((t: any) => {
      if (t.separator && !t.separator.disableDoubleClick) {
        let n = t.panels.find((e: any) => e.panelConstraints.defaultSize !== void 0);
        if (n) {
          let r = n.panelConstraints.defaultSize,
            i = createPanelApi({ groupId: t.group.id, panelId: n.id });
          i && r !== void 0 && (i.resize(r), e.preventDefault());
        }
      }
    });
}
function findGroupBySeparatorElement(e: any) {
  let t = C4();
  for (let [n] of t) if (n.separators.some((t: any) => t.element === e)) return n;
  throw Error(`Could not find parent Group for separator element`);
}
function createGroupApi({ groupId: e }: any) {
  let t = () => {
    let t = C4();
    for (let [n, r] of t) if (n.id === e) return { group: n, ...r };
    throw Error(`Could not find Group with id "${e}"`);
  };
  return {
    getLayout() {
      let { defaultLayoutDeferred: e, layout: n } = t();
      return e ? {} : n;
    },
    setLayout(e: any) {
      let {
          defaultLayoutDeferred: n,
          derivedPanelConstraints: r,
          group: i,
          groupSize: a,
          layout: o,
          separatorToPanels: s,
        } = t(),
        c = normalizeLayout({ layout: e, panelConstraints: r });
      return n
        ? o
        : (j4(o, c) ||
            T4(i, {
              defaultLayoutDeferred: n,
              derivedPanelConstraints: r,
              groupSize: a,
              layout: c,
              separatorToPanels: s,
            }),
          c);
    },
  };
}
function resizeAtSeparator(e: any, t: any) {
  let n = findGroupBySeparatorElement(e),
    r = S4(n.id, !0),
    i = n.separators.find((t: any) => t.element === e);
  v4(i, `Matching separator not found`);
  let a = r.separatorToPanels.get(i);
  v4(a, `Matching panels not found`);
  let o = a.map((e: any) => n.panels.indexOf(e)),
    s = createGroupApi({ groupId: n.id }).getLayout(),
    c = normalizeLayout({
      layout: A4({
        delta: t,
        initialLayout: s,
        panelConstraints: r.derivedPanelConstraints,
        pivotIndices: o,
        prevLayout: s,
        trigger: `keyboard`,
      }),
      panelConstraints: r.derivedPanelConstraints,
    });
  j4(s, c) ||
    T4(n, {
      defaultLayoutDeferred: r.defaultLayoutDeferred,
      derivedPanelConstraints: r.derivedPanelConstraints,
      groupSize: r.groupSize,
      layout: c,
      separatorToPanels: r.separatorToPanels,
    });
}
function handleSeparatorKeyDown(e: any) {
  if (e.defaultPrevented) return;
  let t = e.currentTarget,
    n = findGroupBySeparatorElement(t);
  if (!n.disabled)
    switch (e.key) {
      case `ArrowDown`:
        (e.preventDefault(), n.orientation === `vertical` && resizeAtSeparator(t, 5));
        break;
      case `ArrowLeft`:
        (e.preventDefault(), n.orientation === `horizontal` && resizeAtSeparator(t, -5));
        break;
      case `ArrowRight`:
        (e.preventDefault(), n.orientation === `horizontal` && resizeAtSeparator(t, 5));
        break;
      case `ArrowUp`:
        (e.preventDefault(), n.orientation === `vertical` && resizeAtSeparator(t, -5));
        break;
      case `End`:
        (e.preventDefault(), resizeAtSeparator(t, 100));
        break;
      case `Enter`: {
        e.preventDefault();
        let n = findGroupBySeparatorElement(t),
          { derivedPanelConstraints: r, layout: i, separatorToPanels: a } = S4(n.id, !0),
          o = n.separators.find((e: any) => e.element === t);
        v4(o, `Matching separator not found`);
        let s = a.get(o);
        v4(s, `Matching panels not found`);
        let c = s[0],
          l = r.find((e: any) => e.panelId === c.id);
        if ((v4(l, `Panel metadata not found`), l.collapsible)) {
          let e = i[c.id];
          resizeAtSeparator(
            t,
            (l.collapsedSize === e
              ? (n.mutableState.expandedPanelSizes[c.id] ?? l.minSize)
              : l.collapsedSize) - e,
          );
        }
        break;
      }
      case `F6`: {
        e.preventDefault();
        let n = findGroupBySeparatorElement(t).separators.map((e: any) => e.element),
          r = Array.from(n).findIndex((t: any) => t === e.currentTarget);
        (v4(r !== null, `Index not found`),
          n[e.shiftKey ? (r > 0 ? r - 1 : n.length - 1) : r + 1 < n.length ? r + 1 : 0].focus({
            preventScroll: !0,
          }));
        break;
      }
      case `Home`:
        (e.preventDefault(), resizeAtSeparator(t, -100));
        break;
    }
}
var resizeDragState: any = { cursorFlags: 0, state: `inactive` },
  resizeDragStateEmitter = new mkt();
function getDragState() {
  return resizeDragState;
}
function subscribeDragStateChange(e: any) {
  return resizeDragStateEmitter.addListener(`change`, e);
}
function setDragCursorFlags(e: any) {
  let t = resizeDragState,
    n = { ...resizeDragState };
  ((n.cursorFlags = e), (resizeDragState = n), resizeDragStateEmitter.emit(`change`, { prev: t, next: n }));
}
function setDragState(e: any) {
  let t = resizeDragState;
  ((resizeDragState = e), resizeDragStateEmitter.emit(`change`, { prev: t, next: e }));
}
function handleGlobalPointerDown(e: any) {
  if (e.defaultPrevented || (e.pointerType === `mouse` && e.button > 0)) return;
  let t = C4(),
    n = E4(e, t),
    r = new Map(),
    i = !1;
  (n.forEach((e: any) => {
    e.separator && (i || ((i = !0), e.separator.element.focus({ preventScroll: !0 })));
    let n = t.get(e.group);
    n && r.set(e.group, n.layout);
  }),
    setDragState({
      cursorFlags: 0,
      hitRegions: n,
      initialLayoutMap: r,
      pointerDownAtPoint: { x: e.clientX, y: e.clientY },
      state: `active`,
    }),
    n.length && e.preventDefault());
}
var identityFn = (e: any) => e,
  noopFn = () => {},
  CURSOR_FLAG_RIGHT = 1,
  CURSOR_FLAG_LEFT = 2,
  CURSOR_FLAG_DOWN = 4,
  CURSOR_FLAG_UP = 8,
  CURSOR_FLAG_HORIZONTAL = 3,
  CURSOR_FLAG_VERTICAL = 12,
  chromeOrFirefoxCache: any;
function isChromeOrFirefox() {
  return (
    chromeOrFirefoxCache === void 0 &&
      ((chromeOrFirefoxCache = !1),
      typeof window < `u` &&
        (window.navigator.userAgent.includes(`Chrome`) ||
          window.navigator.userAgent.includes(`Firefox`)) &&
        (chromeOrFirefoxCache = !0)),
    chromeOrFirefoxCache
  );
}
function resolveCursorStyle({ cursorFlags: e, groups: t, state: n }: any) {
  let r = 0,
    i = 0;
  switch (n) {
    case `active`:
    case `hover`:
      t.forEach((e: any) => {
        if (!e.mutableState.disableCursor)
          switch (e.orientation) {
            case `horizontal`:
              r++;
              break;
            case `vertical`:
              i++;
              break;
          }
      });
  }
  if (!(r === 0 && i === 0)) {
    switch (n) {
      case `active`:
        if (e && isChromeOrFirefox()) {
          let t = (e & CURSOR_FLAG_RIGHT) !== 0,
            n = (e & CURSOR_FLAG_LEFT) !== 0,
            r = (e & CURSOR_FLAG_DOWN) !== 0,
            i = (e & CURSOR_FLAG_UP) !== 0;
          if (t) return r ? `se-resize` : i ? `ne-resize` : `e-resize`;
          if (n) return r ? `sw-resize` : i ? `nw-resize` : `w-resize`;
          if (r) return `s-resize`;
          if (i) return `n-resize`;
        }
        break;
    }
    return isChromeOrFirefox()
      ? r > 0 && i > 0
        ? `move`
        : r > 0
          ? `ew-resize`
          : `ns-resize`
      : r > 0 && i > 0
        ? `grab`
        : r > 0
          ? `col-resize`
          : `row-resize`;
  }
}
var cursorStyleSheetCache = new WeakMap();
function applyCursorStyle(e: any) {
  if (e.defaultView === null || e.defaultView === void 0) return;
  let { prevStyle: t, styleSheet: n } = cursorStyleSheetCache.get(e) ?? {};
  n === void 0 &&
    ((n = new e.defaultView.CSSStyleSheet()), e.adoptedStyleSheets && e.adoptedStyleSheets.push(n));
  let r = getDragState();
  switch (r.state) {
    case `active`:
    case `hover`: {
      let e = resolveCursorStyle({
          cursorFlags: r.cursorFlags,
          groups: r.hitRegions.map((e: any) => e.group),
          state: r.state,
        }),
        i = `*, *:hover {cursor: ${e} !important; }`;
      if (t === i) return;
      ((t = i),
        e
          ? n.cssRules.length === 0
            ? n.insertRule(i)
            : n.replaceSync(i)
          : n.cssRules.length === 1 && n.deleteRule(0));
      break;
    }
    case `inactive`:
      ((t = void 0), n.cssRules.length === 1 && n.deleteRule(0));
      break;
  }
  cursorStyleSheetCache.set(e, { prevStyle: t, styleSheet: n });
}
function processDragMove({
  document: e,
  event: t,
  hitRegions: n,
  initialLayoutMap: r,
  mountedGroups: i,
  pointerDownAtPoint: a,
  prevCursorFlags: o,
}: any) {
  let s = 0;
  n.forEach((e: any) => {
    let { group: n, groupSize: o } = e,
      { orientation: c, panels: l } = n,
      { disableCursor: u } = n.mutableState,
      d = 0;
    d = a
      ? c === `horizontal`
        ? ((t.clientX - a.x) / o) * 100
        : ((t.clientY - a.y) / o) * 100
      : c === `horizontal`
        ? t.clientX < 0
          ? -100
          : 100
        : t.clientY < 0
          ? -100
          : 100;
    let f = r.get(n),
      p = i.get(n);
    if (!f || !p) return;
    let {
      defaultLayoutDeferred: m,
      derivedPanelConstraints: h,
      groupSize: g,
      layout: _,
      separatorToPanels: v,
    } = p;
    if (h && _ && v) {
      let t = A4({
        delta: d,
        initialLayout: f,
        panelConstraints: h,
        pivotIndices: e.panels.map((e: any) => l.indexOf(e)),
        prevLayout: _,
        trigger: `mouse-or-touch`,
      });
      if (j4(t, _)) {
        if (d !== 0 && !u)
          switch (c) {
            case `horizontal`:
              s |= d < 0 ? CURSOR_FLAG_RIGHT : CURSOR_FLAG_LEFT;
              break;
            case `vertical`:
              s |= d < 0 ? CURSOR_FLAG_DOWN : CURSOR_FLAG_UP;
              break;
          }
      } else
        T4(e.group, {
          defaultLayoutDeferred: m,
          derivedPanelConstraints: h,
          groupSize: g,
          layout: t,
          separatorToPanels: v,
        });
    }
  });
  let c = 0;
  (t.movementX === 0 ? (c |= o & CURSOR_FLAG_HORIZONTAL) : (c |= s & CURSOR_FLAG_HORIZONTAL),
    t.movementY === 0 ? (c |= o & CURSOR_FLAG_VERTICAL) : (c |= s & CURSOR_FLAG_VERTICAL),
    setDragCursorFlags(c),
    applyCursorStyle(e));
}
function handleTouchMove(e: any) {
  let t = C4(),
    n = getDragState();
  switch (n.state) {
    case `active`:
      processDragMove({
        document: e.currentTarget,
        event: e,
        hitRegions: n.hitRegions,
        initialLayoutMap: n.initialLayoutMap,
        mountedGroups: t,
        prevCursorFlags: n.cursorFlags,
      });
  }
}
function handlePointerMove(e: any) {
  if (e.defaultPrevented) return;
  let t = getDragState(),
    n = C4();
  switch (t.state) {
    case `active`:
      if (e.buttons === 0) {
        (setDragState({ cursorFlags: 0, state: `inactive` }),
          t.hitRegions.forEach((e: any) => {
            let t = S4(e.group.id, !0);
            T4(e.group, t);
          }));
        return;
      }
      for (let n of t.hitRegions)
        if (n.separator) {
          let { element: t } = n.separator;
          t.hasPointerCapture?.(e.pointerId) || t.setPointerCapture?.(e.pointerId);
        }
      processDragMove({
        document: e.currentTarget,
        event: e,
        hitRegions: t.hitRegions,
        initialLayoutMap: t.initialLayoutMap,
        mountedGroups: n,
        pointerDownAtPoint: t.pointerDownAtPoint,
        prevCursorFlags: t.cursorFlags,
      });
      break;
    default: {
      let r = E4(e, n);
      (r.length === 0
        ? t.state !== `inactive` && setDragState({ cursorFlags: 0, state: `inactive` })
        : setDragState({ cursorFlags: 0, hitRegions: r, state: `hover` }),
        applyCursorStyle(e.currentTarget));
      break;
    }
  }
}
function handleIframeMouseLeave(e: any) {
  if (e.relatedTarget instanceof HTMLIFrameElement)
    switch (getDragState().state) {
      case `hover`:
        setDragState({ cursorFlags: 0, state: `inactive` });
    }
}
function handlePointerUp(e: any) {
  if (e.defaultPrevented || (e.pointerType === `mouse` && e.button > 0)) return;
  let t = getDragState();
  switch (t.state) {
    case `active`:
      (setDragState({ cursorFlags: 0, state: `inactive` }),
        t.hitRegions.length > 0 &&
          (applyCursorStyle(e.currentTarget),
          t.hitRegions.forEach((e: any) => {
            let t = S4(e.group.id, !0);
            T4(e.group, t);
          }),
          e.preventDefault()));
  }
}
function computeDefaultLayout(e: any) {
  let t = 0,
    n = 0,
    r = {} as any;
  for (let i of e)
    if (i.defaultSize !== void 0) {
      t++;
      let e = h4(i.defaultSize);
      ((n += e), (r[i.panelId] = e));
    } else r[i.panelId] = void 0;
  let i = e.length - t;
  if (i !== 0) {
    let t = h4((100 - n) / i);
    for (let n of e) n.defaultSize === void 0 && (r[n.panelId] = t);
  }
  return r;
}
function notifyPanelResize(e: any, t: any, n: any) {
  if (!n[0]) return;
  let r = e.panels.find((e: any) => e.element === t);
  if (!r || !r.onResize) return;
  let i = g4({ group: e }),
    a = e.orientation === `horizontal` ? r.element.offsetWidth : r.element.offsetHeight,
    o = r.mutableValues.prevSize,
    s = { asPercentage: h4((a / i) * 100), inPixels: a };
  ((r.mutableValues.prevSize = s), r.onResize(s, r.id, o));
}
function areLayoutsStrictlyEqual(e: any, t: any) {
  if (Object.keys(e).length !== Object.keys(t).length) return !1;
  for (let n in e) if (e[n] !== t[n]) return !1;
  return !0;
}

export {
  normalizeLayout, createPanelApi, handleSeparatorDoubleClick,
  findGroupBySeparatorElement, createGroupApi, resizeAtSeparator,
  handleSeparatorKeyDown, resizeDragState, resizeDragStateEmitter,
  getDragState, subscribeDragStateChange, setDragCursorFlags, setDragState,
  handleGlobalPointerDown, identityFn, noopFn, CURSOR_FLAG_RIGHT,
  CURSOR_FLAG_LEFT, CURSOR_FLAG_DOWN, CURSOR_FLAG_UP, CURSOR_FLAG_HORIZONTAL,
  CURSOR_FLAG_VERTICAL, chromeOrFirefoxCache, isChromeOrFirefox,
  resolveCursorStyle, cursorStyleSheetCache, applyCursorStyle, processDragMove,
  handleTouchMove, handlePointerMove, handleIframeMouseLeave, handlePointerUp,
  computeDefaultLayout, notifyPanelResize, areLayoutsStrictlyEqual,
};
