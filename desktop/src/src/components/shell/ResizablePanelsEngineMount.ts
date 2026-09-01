/* eslint-disable */
/**
 * ============================================================================
 * ResizablePanelsEngineMount.ts —— A1-P2-B5 收官新叶（B5 语义顶层名 + 头注映射表）
 * ----------------------------------------------------------------------------
 * 真身区段：styles-CdEGpc2x.js 131244–131388（单一连续原子区，145 行，四件）
 *   nAt → rescaleLayoutOnGroupResize   组缩放布局重算 (131244-131280)
 *   rAt → doPanelIdsMatchLayout        面板 id 与布局键匹配判定 (131281-131287)
 *   H4  → documentListenerRefCount     文档级监听引用计数 (131288)
 *   iAt → registerMountedGroup         组挂载注册（ResizeObserver + 文档级监听
 *                                      + 初始/默认布局 + 清理返回） (131289-131388)
 *
 * 〔边界裁定〕本区为 vendored 可缩放面板引擎域（130051–131388，86 件）收官尾段。
 *   批 4 切探已证（/tmp/a1r0-p2/deep/rest-cut.js）：131244–131388 自成闭合尾段，
 *   任意前缀零前向依赖；对批 3 前缀（47 名）与批 4 前缀（35 名）单向消费，
 *   全部导出面已就绪，零二次留守。145 行 ＜ 600 单批预算，单叶收官。
 *   叶名裁定：内容 = 组挂载注册/文档监听引用计数/组缩放重算/面板 id 匹配，
 *   属引擎挂载-生命周期层，故取 ResizablePanelsEngineMount（优于占位序数 Final）。
 *
 * 一、混淆名 → 语义名 映射表（自由符裁定；函数体内局部保留混淆名）
 *   四件真身映射见上表。本区无 Q/$（不消费 React/jsx-runtime）。
 *
 * 二、与前两叶的消费关系（依赖面逐名实测，批 4 §七 复核吻合）
 *   消费批 3 前缀（./ResizablePanelsEngine）9 名：
 *     nAt→{h4}；iAt→{v4,g4,S4,_4,j4,T4,pkt,gkt}
 *   消费批 4 前缀（./ResizablePanelsEngineInteraction）11 名：
 *     iAt→{$kt,M4,tAt,eAt,Pkt,Mkt,Lkt,Ykt,Xkt,Zkt,Qkt}
 *   均以语义名别名导入保留混淆调用名（R1 判例），调用面与 bundle 逐字一致。
 *
 * 三、与 ResizablePanelsCore.tsx 的消费关系（域收口）
 *   Core 叶最后 1 枚 declare const : any 留守件 iAt 本批替换真身（别名导入，
 *   调用面 `let a = iAt(r),` 保留混淆名）；至此 Core 叶深区留守件清零，
 *   引擎域 130051–131388 八十六件真身化完毕。
 *
 * 四、型缝（〔A1-P2-B5〕标注，13 处，逐行登记 /tmp/a1r0-p2/deep/final-seam-log.txt）
 *   S1 函数/箭头参数 : any ×13（bundle 无型面；纯型层）——本区无 cast 缝
 *   （nAt/rAt/H4/iAt 全部经 any 参数与既有导出面消费，无缺型/塌缩面）
 *
 * 五、逐字证明
 *   ROUNDTRIP EXACT（145 行）：缝后体逆归一（S1 逐行）+ 逆改名（语义→混淆）
 *   与 bundle 131244–131388 逐字一致；SHORTHAND_RENAMED_SITES 0；12 改名位点
 *   全归因（4/4 名命中）。
 * ============================================================================
 */

/* 批 3 前缀真身（./ResizablePanelsEngine，styles js 130051–130650）；
   别名导入保留混淆调用名（R1 判例），调用面与 bundle 逐字一致 */
import {
  assertInvariant as v4, getGroupPixelSize as g4, getGroupData as S4,
  derivePanelConstraints as _4, compareLayouts as j4, setGroupData as T4,
  buildResizeHitRegions as pkt, unregisterGroupData as gkt,
  roundToThreeDecimals as h4,
} from "./ResizablePanelsEngine";

/* 批 4 前缀真身（./ResizablePanelsEngineInteraction，styles js 130651–131243）；
   别名导入保留混淆调用名（R1 判例），调用面与 bundle 逐字一致 */
import {
  computeDefaultLayout as $kt, normalizeLayout as M4,
  areLayoutsStrictlyEqual as tAt, notifyPanelResize as eAt,
  handleSeparatorKeyDown as Pkt, handleSeparatorDoubleClick as Mkt,
  handleGlobalPointerDown as Lkt, handleTouchMove as Ykt,
  handlePointerMove as Xkt, handleIframeMouseLeave as Zkt,
  handlePointerUp as Qkt,
} from "./ResizablePanelsEngineInteraction";

function rescaleLayoutOnGroupResize({ group: e, nextGroupSize: t, prevGroupSize: n, prevLayout: r }: any) {
  if (n <= 0 || t <= 0 || n === t) return r;
  let i = 0,
    a = 0,
    o = !1,
    s = new Map(),
    c = [];
  for (let l of e.panels) {
    let e = r[l.id] ?? 0;
    switch (l.panelConstraints.groupResizeBehavior) {
      case `preserve-pixel-size`: {
        o = !0;
        let r = h4((((e / 100) * n) / t) * 100);
        (s.set(l.id, r), (i += r));
        break;
      }
      default:
        (c.push(l.id), (a += e));
        break;
    }
  }
  if (!o || c.length === 0) return r;
  let l = 100 - i,
    u = { ...r };
  if (
    (s.forEach((e: any, t: any) => {
      u[t] = e;
    }),
    a > 0)
  )
    for (let e of c) u[e] = h4(((r[e] ?? 0) / a) * l);
  else {
    let e = h4(l / c.length);
    for (let t of c) u[t] = e;
  }
  return u;
}
function doPanelIdsMatchLayout(e: any, t: any) {
  let n = e.map((e: any) => e.id),
    r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (let e of n) if (!r.includes(e)) return !1;
  return !0;
}
var documentListenerRefCount = new Map();
function registerMountedGroup(e: any) {
  let t = !0;
  v4(e.element.ownerDocument.defaultView, `Cannot register an unmounted Group`);
  let n = e.element.ownerDocument.defaultView.ResizeObserver,
    r = new Set(),
    i = new Set(),
    a = new n((n: any) => {
      for (let r of n) {
        let { borderBoxSize: n, target: i } = r;
        if (i === e.element) {
          if (t) {
            let t = g4({ group: e });
            if (t === 0) return;
            let n = S4(e.id);
            if (!n) return;
            let r = _4(e),
              i = n.defaultLayoutDeferred ? $kt(r) : n.layout,
              a = M4({
                layout: rescaleLayoutOnGroupResize({
                  group: e,
                  nextGroupSize: t,
                  prevGroupSize: n.groupSize,
                  prevLayout: i,
                }),
                panelConstraints: r,
              });
            if (
              !n.defaultLayoutDeferred &&
              j4(n.layout, a) &&
              tAt(n.derivedPanelConstraints, r) &&
              n.groupSize === t
            )
              return;
            T4(e, {
              defaultLayoutDeferred: !1,
              derivedPanelConstraints: r,
              groupSize: t,
              layout: a,
              separatorToPanels: n.separatorToPanels,
            });
          }
        } else eAt(e, i, n);
      }
    });
  (a.observe(e.element),
    e.panels.forEach((e: any) => {
      (v4(!r.has(e.id), `Panel ids must be unique; id "${e.id}" was used more than once`),
        r.add(e.id),
        e.onResize && a.observe(e.element));
    }));
  let o = g4({ group: e }),
    s = _4(e),
    c = e.panels.map(({ id: e }: any) => e).join(`,`),
    l = e.mutableState.defaultLayout;
  l && (doPanelIdsMatchLayout(e.panels, l) || (l = void 0));
  let u = M4({ layout: e.mutableState.layouts[c] ?? l ?? $kt(s), panelConstraints: s }),
    d = e.element.ownerDocument;
  documentListenerRefCount.set(d, (documentListenerRefCount.get(d) ?? 0) + 1);
  let f = new Map();
  return (
    pkt(e).forEach((e: any) => {
      e.separator && f.set(e.separator, e.panels);
    }),
    T4(e, {
      defaultLayoutDeferred: o === 0,
      derivedPanelConstraints: s,
      groupSize: o,
      layout: u,
      separatorToPanels: f,
    }),
    e.separators.forEach((e: any) => {
      (v4(!i.has(e.id), `Separator ids must be unique; id "${e.id}" was used more than once`),
        i.add(e.id),
        e.element.addEventListener(`keydown`, Pkt));
    }),
    documentListenerRefCount.get(d) === 1 &&
      (d.addEventListener(`dblclick`, Mkt, !0),
      d.addEventListener(`pointerdown`, Lkt, !0),
      d.addEventListener(`pointerleave`, Ykt),
      d.addEventListener(`pointermove`, Xkt),
      d.addEventListener(`pointerout`, Zkt),
      d.addEventListener(`pointerup`, Qkt, !0)),
    function () {
      ((t = !1),
        documentListenerRefCount.set(d, Math.max(0, (documentListenerRefCount.get(d) ?? 0) - 1)),
        gkt(e),
        e.separators.forEach((e: any) => {
          e.element.removeEventListener(`keydown`, Pkt);
        }),
        documentListenerRefCount.get(d) ||
          (d.removeEventListener(`dblclick`, Mkt, !0),
          d.removeEventListener(`pointerdown`, Lkt, !0),
          d.removeEventListener(`pointerleave`, Ykt),
          d.removeEventListener(`pointermove`, Xkt),
          d.removeEventListener(`pointerout`, Zkt),
          d.removeEventListener(`pointerup`, Qkt, !0)),
        a.disconnect());
    }
  );
}

export {
  rescaleLayoutOnGroupResize, doPanelIdsMatchLayout, documentListenerRefCount,
  registerMountedGroup,
};
