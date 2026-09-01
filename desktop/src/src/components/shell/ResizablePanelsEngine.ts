/* eslint-disable */
/**
 * ============================================================================
 * ResizablePanelsEngine.ts —— A1-P2-B3 新叶（B5 语义顶层名 + 头注映射表）
 * ----------------------------------------------------------------------------
 * 真身区段：styles-CdEGpc2x.js 130051–130650（单一连续原子区，600 行，四十七件）
 *   nkt → emToPixels                   em→px 换算 (130051-130054)
 *   rkt → remToPixels                  rem→px 换算 (130055-130058)
 *   ikt → vhToPixels                   vh→px 换算 (130059-130061)
 *   akt → vwToPixels                   vw→px 换算 (130062-130064)
 *   okt → parseSizeWithUnit            尺寸串单位解析 (130065-130086)
 *   m4  → getPxSize                    样式尺寸→组内 px (130087-130111)
 *   h4  → roundToThreeDecimals         三位小数舍入 (130112-130114)
 *   g4  → getGroupPixelSize            组 px 尺寸求和 (130115-130121)
 *   _4  → derivePanelConstraints       面板约束推导 (130122-130163)
 *   v4  → assertInvariant              断言 (130164-130166)
 *   y4  → sortByOrientation            按朝向排序 (130167-130169)
 *   skt → compareByOffsetLeft          水平序比较 (130170-130173)
 *   ckt → compareByOffsetTop           垂直序比较 (130174-130177)
 *   lkt → isDomElement                 Element 判定 (130178-130180)
 *   ukt → pointDistanceToRectEdges     点到矩形边距 (130181-130192)
 *   dkt → findNearestRect              最近矩形查找 (130193-130203)
 *   b4  → coarsePointerCache           粗指针缓存 (130204)
 *   fkt → isCoarsePointer              粗指针判定 (130205-130211)
 *   pkt → buildResizeHitRegions        拖拽命中区构建 (130212-130316)
 *   mkt → ListenerRegistry             监听器注册表 (130317-130357)
 *   x4  → groupDataRegistry            组数据注册表 (130358)
 *   hkt → groupChangeEmitter           组变更发射器 (130359)
 *   gkt → unregisterGroupData          组数据注销 (130360-130362)
 *   _kt → findGroupById                按 id 查组 (130363-130365)
 *   S4  → getGroupData                 组数据读取 (130366-130369)
 *   C4  → getAllGroupData              全组数据 (130370-130372)
 *   w4  → subscribeGroupChange         组变更订阅 (130373-130377)
 *   T4  → setGroupData                 组数据写入 (130378-130381)
 *   vkt → findNearestHitRegion         最近命中区查找 (130382-130397)
 *   ykt → isDocumentFragment           DocumentFragment 判定 (130398-130402)
 *   bkt → compareStackingOrder         层叠序比较 (130403-130421)
 *   xkt → STACKING_CONTEXT_STYLE_RE    层叠上下文样式正则 (130422-130423)
 *   Skt → isFlexDisplay                flex 显示判定 (130424-130427)
 *   Ckt → createsStackingContext       层叠上下文判定 (130428-130443)
 *   wkt → findStackingContextNode      层叠上下文节点查找 (130444-130451)
 *   Tkt → resolveZIndex                zIndex 解析 (130452-130454)
 *   Ekt → getAncestorChain             祖先链 (130455-130459)
 *   Dkt → resolveParentNode            父节点解析（穿 ShadowRoot） (130460-130463)
 *   Okt → rectsIntersect               矩形相交判定 (130464-130466)
 *   kkt → isPointerUnobstructed        指针遮挡判定 (130467-130478)
 *   E4  → collectHitRegionsAtPointer   指针下命中区收集 (130479-130498)
 *   Akt → areArraysEqual               数组相等判定 (130499-130503)
 *   D4  → areSizesEqual                尺寸相等判定 (130504-130506)
 *   O4  → compareSizes                 尺寸比较 (130507-130509)
 *   k4  → constrainPanelSize           面板尺寸约束 (130510-130519)
 *   A4  → resizeLayoutByDelta          布局增量求解器 (130520-130645)
 *   j4  → compareLayouts               布局对象相等判定 (130646-130650)
 *
 * 〔边界裁定（freevars 普查 + 前缀切探）〕任务面 130122–130968；普查定原子域
 *   130051–131388（86 件，1,338 行，外部依赖仅全局对象）＞600 行单批预算 →
 *   按编排方裁定拆两批。切探（/tmp/a1r0-p2/deep/deep-cut.js）：区段严格自底
 *   向上分层，任意前缀依赖闭合（CUT@130650 prefix=47 CLOSED，零前向依赖）→
 *   本批收闭合前缀 130051–130650（600 行 47 件）；余量 130651–131388（738 行
 *   39 件）留批，边界证据见 A1-P2-B3.report.md §七。左扩 130051（任务面
 *   130122 之前 8 件为区内深内部件 m4/h4/g4 所依赖的单位换算链，全树实测
 *   零区外消费）；tkt
 *   (130009-130050) 为 LinuxWindowControls，已在 WorkspaceShell @986 重建，
 *   不入本叶。
 *
 * 一、混淆名 → 语义名 映射表（自由符裁定；函数体内局部保留混淆名）
 *   四十七件真身映射见上表。本区无 Q/$（不消费 React/jsx-runtime）。
 *
 * 二、与 ResizablePanelsCore.tsx 的消费关系
 *   Core 叶 18 枚 declare const : any 留守件，本批替换其落于本前缀的 10 枚
 *   （_4 v4 y4 D4 A4 _kt S4 w4 T4 j4 → 语义名别名导入，调用面保留混淆名，
 *   R1 判例）；余 8 枚（M4 jkt Nkt L4 Fkt Rkt z4 iAt）落于余量区 130651–131388，
 *   随余量批替换。
 *
 * 三、型缝（〔A1-P2-B3〕标注，93 处，逐行登记 /tmp/a1r0-p2/deep/deep-seam-log.txt）
 *   S1 函数/方法/箭头参数 : any ×83（bundle 无型面；纯型层）
 *   S4 推断塌缩/缺型面 cast ×5（ListenerRegistry #e 私有域 {} 索引面；
 *      CSSStyleDeclaration 无 webkitOverflowScrolling 面——lib.dom 5.9.3 实测
 *      0 收；emit 内 Array.from(any) 与 resizeLayoutByDelta 内 Object.values
 *      (any) ×2 在 TS 5.9.3 推断 unknown[]——探针实测；束真运行期值不变，
 *      纯型层）
 *   S5 可选参缝 ×2（findGroupById/getGroupData 第二参 t?: any——Core 消费面
 *      存在 1 参调用 ×4：_kt(e)/_kt(_)/S4(e)/S4(_)；bundle JS 省参合法，
 *      TS 严参面需可选标记，纯型层）
 *   S6 返回型缝 ×1（parseSizeWithUnit switch 返回面 (string|number)[]|undefined
 *      → getPxSize 解构面 TS2488，: any 注回）
 *   S7 裸 var 注型 ×1（coarsePointerCache 跨函数读写面 TS7034/7005）
 *   S8 闭包捕获演化数组注型 ×1（collectHitRegionsAtPointer n 跨 forEach
 *      闭包 TS7034/7005）
 *
 * 四、逐字证明
 *   ROUNDTRIP EXACT（600 行）：缝后体逆归一（S1–S8 逐行）+ 逆改名（语义→混淆）
 *   与 bundle 130051–130650 逐字一致；SHORTHAND_RENAMED_SITES 0；145 改名位点
 *   全归因（47/47 名命中）。
 * ============================================================================
 */

function emToPixels(e: any, t: any) {
  let n = getComputedStyle(e);
  return t * parseFloat(n.fontSize);
}
function remToPixels(e: any, t: any) {
  let n = getComputedStyle(e.ownerDocument.body);
  return t * parseFloat(n.fontSize);
}
function vhToPixels(e: any) {
  return (e / 100) * window.innerHeight;
}
function vwToPixels(e: any) {
  return (e / 100) * window.innerWidth;
}
function parseSizeWithUnit(e: any): any {
  switch (typeof e) {
    case `number`:
      return [e, `px`];
    case `string`: {
      let t = parseFloat(e);
      return e.endsWith(`%`)
        ? [t, `%`]
        : e.endsWith(`px`)
          ? [t, `px`]
          : e.endsWith(`rem`)
            ? [t, `rem`]
            : e.endsWith(`em`)
              ? [t, `em`]
              : e.endsWith(`vh`)
                ? [t, `vh`]
                : e.endsWith(`vw`)
                  ? [t, `vw`]
                  : [t, `%`];
    }
  }
}
function getPxSize({ groupSize: e, panelElement: t, styleProp: n }: any) {
  let r,
    [i, a] = parseSizeWithUnit(n);
  switch (a) {
    case `%`:
      r = (i / 100) * e;
      break;
    case `px`:
      r = i;
      break;
    case `rem`:
      r = remToPixels(t, i);
      break;
    case `em`:
      r = emToPixels(t, i);
      break;
    case `vh`:
      r = vhToPixels(i);
      break;
    case `vw`:
      r = vwToPixels(i);
      break;
  }
  return r;
}
function roundToThreeDecimals(e: any) {
  return parseFloat(e.toFixed(3));
}
function getGroupPixelSize({ group: e }: any) {
  let { orientation: t, panels: n } = e;
  return n.reduce(
    (e: any, n: any) => ((e += t === `horizontal` ? n.element.offsetWidth : n.element.offsetHeight), e),
    0,
  );
}
function derivePanelConstraints(e: any) {
  let { panels: t } = e,
    n = getGroupPixelSize({ group: e });
  return n === 0
    ? t.map((e: any) => ({
        groupResizeBehavior: e.panelConstraints.groupResizeBehavior,
        collapsedSize: 0,
        collapsible: e.panelConstraints.collapsible === !0,
        defaultSize: void 0,
        disabled: e.panelConstraints.disabled,
        minSize: 0,
        maxSize: 100,
        panelId: e.id,
      }))
    : t.map((e: any) => {
        let { element: t, panelConstraints: r } = e,
          i = 0;
        r.collapsedSize !== void 0 &&
          (i = roundToThreeDecimals((getPxSize({ groupSize: n, panelElement: t, styleProp: r.collapsedSize }) / n) * 100));
        let a;
        r.defaultSize !== void 0 &&
          (a = roundToThreeDecimals((getPxSize({ groupSize: n, panelElement: t, styleProp: r.defaultSize }) / n) * 100));
        let o = 0;
        r.minSize !== void 0 &&
          (o = roundToThreeDecimals((getPxSize({ groupSize: n, panelElement: t, styleProp: r.minSize }) / n) * 100));
        let s = 100;
        return (
          r.maxSize !== void 0 &&
            (s = roundToThreeDecimals((getPxSize({ groupSize: n, panelElement: t, styleProp: r.maxSize }) / n) * 100)),
          {
            groupResizeBehavior: r.groupResizeBehavior,
            collapsedSize: i,
            collapsible: r.collapsible === !0,
            defaultSize: a,
            disabled: r.disabled,
            minSize: o,
            maxSize: s,
            panelId: e.id,
          }
        );
      });
}
function assertInvariant(e: any, t: any = `Assertion error`) {
  if (!e) throw Error(t);
}
function sortByOrientation(e: any, t: any) {
  return Array.from(t).sort(e === `horizontal` ? compareByOffsetLeft : compareByOffsetTop);
}
function compareByOffsetLeft(e: any, t: any) {
  let n = e.element.offsetLeft - t.element.offsetLeft;
  return n === 0 ? e.element.offsetWidth - t.element.offsetWidth : n;
}
function compareByOffsetTop(e: any, t: any) {
  let n = e.element.offsetTop - t.element.offsetTop;
  return n === 0 ? e.element.offsetHeight - t.element.offsetHeight : n;
}
function isDomElement(e: any) {
  return typeof e == `object` && !!e && `nodeType` in e && e.nodeType === Node.ELEMENT_NODE;
}
function pointDistanceToRectEdges(e: any, t: any) {
  return {
    x:
      e.x >= t.left && e.x <= t.right
        ? 0
        : Math.min(Math.abs(e.x - t.left), Math.abs(e.x - t.right)),
    y:
      e.y >= t.top && e.y <= t.bottom
        ? 0
        : Math.min(Math.abs(e.y - t.top), Math.abs(e.y - t.bottom)),
  };
}
function findNearestRect({ orientation: e, rects: t, targetRect: n }: any) {
  let r = { x: n.x + n.width / 2, y: n.y + n.height / 2 },
    i,
    a = Number.MAX_VALUE;
  for (let n of t) {
    let { x: t, y: o } = pointDistanceToRectEdges(r, n),
      s = e === `horizontal` ? t : o;
    s < a && ((a = s), (i = n));
  }
  return (assertInvariant(i, `No rect found`), i);
}
var coarsePointerCache: any;
function isCoarsePointer() {
  return (
    coarsePointerCache === void 0 &&
      (coarsePointerCache = typeof matchMedia == `function` ? !!matchMedia(`(pointer:coarse)`).matches : !1),
    coarsePointerCache
  );
}
function buildResizeHitRegions(e: any) {
  let { element: t, orientation: n, panels: r, separators: i } = e,
    a = sortByOrientation(
      n,
      Array.from(t.children)
        .filter(isDomElement)
        .map((e: any) => ({ element: e })),
    ).map(({ element: e }: any) => e),
    o = [],
    s = !1,
    c = !1,
    l = -1,
    u = -1,
    d = 0,
    f,
    p = [];
  {
    let e = -1;
    for (let t of a)
      t.hasAttribute(`data-panel`) &&
        (e++, t.hasAttribute(`data-disabled`) || (d++, l === -1 && (l = e), (u = e)));
  }
  if (d > 1) {
    let t = -1;
    for (let d of a)
      if (d.hasAttribute(`data-panel`)) {
        t++;
        let i = r.find((e: any) => e.element === d);
        if (i) {
          if (f) {
            let r = f.element.getBoundingClientRect(),
              a = d.getBoundingClientRect(),
              m;
            if (c) {
              let e =
                  n === `horizontal`
                    ? new DOMRect(r.right, r.top, 0, r.height)
                    : new DOMRect(r.left, r.bottom, r.width, 0),
                t =
                  n === `horizontal`
                    ? new DOMRect(a.left, a.top, 0, a.height)
                    : new DOMRect(a.left, a.top, a.width, 0);
              switch (p.length) {
                case 0:
                  m = [e, t];
                  break;
                case 1: {
                  let i = p[0];
                  m = [
                    i,
                    findNearestRect({
                      orientation: n,
                      rects: [r, a],
                      targetRect: i.element.getBoundingClientRect(),
                    }) === r
                      ? t
                      : e,
                  ];
                  break;
                }
                default:
                  m = p;
                  break;
              }
            } else
              m = p.length
                ? p
                : [
                    n === `horizontal`
                      ? new DOMRect(r.right, a.top, a.left - r.right, a.height)
                      : new DOMRect(a.left, r.bottom, a.width, a.top - r.bottom),
                  ];
            for (let n of m) {
              let r = `width` in n ? n : n.element.getBoundingClientRect(),
                a = isCoarsePointer() ? e.resizeTargetMinimumSize.coarse : e.resizeTargetMinimumSize.fine;
              if (r.width < a) {
                let e = a - r.width;
                r = new DOMRect(r.x - e / 2, r.y, r.width + e, r.height);
              }
              if (r.height < a) {
                let e = a - r.height;
                r = new DOMRect(r.x, r.y - e / 2, r.width, r.height + e);
              }
              (!s &&
                !(t <= l || t > u) &&
                o.push({
                  group: e,
                  groupSize: getGroupPixelSize({ group: e }),
                  panels: [f, i],
                  separator: `width` in n ? void 0 : n,
                  rect: r,
                }),
                (s = !1));
            }
          }
          ((c = !1), (f = i), (p = []));
        }
      } else if (d.hasAttribute(`data-separator`)) {
        d.ariaDisabled !== null && (s = !0);
        let e = i.find((e: any) => e.element === d);
        e ? p.push(e) : ((f = void 0), (p = []));
      } else c = !0;
  }
  return o;
}
var ListenerRegistry = class {
    #e = {} as any;
    addListener(e: any, t: any) {
      let n = this.#e[e];
      return (
        n === void 0 ? (this.#e[e] = [t]) : n.includes(t) || n.push(t),
        () => {
          this.removeListener(e, t);
        }
      );
    }
    emit(e: any, t: any) {
      let n = this.#e[e];
      if (n !== void 0)
        if (n.length === 1) n[0].call(null, t);
        else {
          let e = !1,
            r = null,
            i = Array.from(n) as any[];
          for (let n = 0; n < i.length; n++) {
            let a = i[n];
            try {
              a.call(null, t);
            } catch (t) {
              r === null && ((e = !0), (r = t));
            }
          }
          if (e) throw r;
        }
    }
    removeAllListeners() {
      this.#e = {};
    }
    removeListener(e: any, t: any) {
      let n = this.#e[e];
      if (n !== void 0) {
        let e = n.indexOf(t);
        e >= 0 && n.splice(e, 1);
      }
    }
  },
  groupDataRegistry = new Map(),
  groupChangeEmitter = new ListenerRegistry();
function unregisterGroupData(e: any) {
  ((groupDataRegistry = new Map(groupDataRegistry)), groupDataRegistry.delete(e));
}
function findGroupById(e: any, t?: any) {
  for (let [t] of groupDataRegistry) if (t.id === e) return t;
}
function getGroupData(e: any, t?: any) {
  for (let [t, n] of groupDataRegistry) if (t.id === e) return n;
  if (t) throw Error(`Could not find data for Group with id ${e}`);
}
function getAllGroupData() {
  return groupDataRegistry;
}
function subscribeGroupChange(e: any, t: any) {
  return groupChangeEmitter.addListener(`groupChange`, (n: any) => {
    n.group.id === e && t(n);
  });
}
function setGroupData(e: any, t: any) {
  let n = groupDataRegistry.get(e);
  ((groupDataRegistry = new Map(groupDataRegistry)), groupDataRegistry.set(e, t), groupChangeEmitter.emit(`groupChange`, { group: e, prev: n, next: t }));
}
function findNearestHitRegion(e: any, t: any, n: any) {
  let r,
    i = { x: 1 / 0, y: 1 / 0 };
  for (let a of t) {
    let t = pointDistanceToRectEdges(n, a.rect);
    switch (e) {
      case `horizontal`:
        t.x <= i.x && ((r = a), (i = t));
        break;
      case `vertical`:
        t.y <= i.y && ((r = a), (i = t));
        break;
    }
  }
  return r ? { distance: i, hitRegion: r } : void 0;
}
function isDocumentFragment(e: any) {
  return (
    typeof e == `object` && !!e && `nodeType` in e && e.nodeType === Node.DOCUMENT_FRAGMENT_NODE
  );
}
function compareStackingOrder(e: any, t: any) {
  if (e === t) throw Error(`Cannot compare node with itself`);
  let n = { a: getAncestorChain(e), b: getAncestorChain(t) },
    r;
  for (; n.a.at(-1) === n.b.at(-1);) ((r = n.a.pop()), n.b.pop());
  assertInvariant(r, `Stacking order can only be calculated for elements with a common ancestor`);
  let i = { a: resolveZIndex(findStackingContextNode(n.a)), b: resolveZIndex(findStackingContextNode(n.b)) };
  if (i.a === i.b) {
    let e = r.childNodes,
      t = { a: n.a.at(-1), b: n.b.at(-1) },
      i = e.length;
    for (; i--;) {
      let n = e[i];
      if (n === t.a) return 1;
      if (n === t.b) return -1;
    }
  }
  return Math.sign(i.a - i.b);
}
var STACKING_CONTEXT_STYLE_RE =
  /\b(?:position|zIndex|opacity|transform|webkitTransform|mixBlendMode|filter|webkitFilter|isolation)\b/;
function isFlexDisplay(e: any) {
  let t = getComputedStyle(resolveParentNode(e) ?? e).display;
  return t === `flex` || t === `inline-flex`;
}
function createsStackingContext(e: any) {
  let t = getComputedStyle(e);
  return !!(
    t.position === `fixed` ||
    (t.zIndex !== `auto` && (t.position !== `static` || isFlexDisplay(e))) ||
    +t.opacity < 1 ||
    (`transform` in t && t.transform !== `none`) ||
    (`webkitTransform` in t && t.webkitTransform !== `none`) ||
    (`mixBlendMode` in t && t.mixBlendMode !== `normal`) ||
    (`filter` in t && t.filter !== `none`) ||
    (`webkitFilter` in t && t.webkitFilter !== `none`) ||
    (`isolation` in t && t.isolation === `isolate`) ||
    STACKING_CONTEXT_STYLE_RE.test(t.willChange) ||
    (t as any).webkitOverflowScrolling === `touch`
  );
}
function findStackingContextNode(e: any) {
  let t = e.length;
  for (; t--;) {
    let n = e[t];
    if ((assertInvariant(n, `Missing node`), createsStackingContext(n))) return n;
  }
  return null;
}
function resolveZIndex(e: any) {
  return (e && Number(getComputedStyle(e).zIndex)) || 0;
}
function getAncestorChain(e: any) {
  let t = [];
  for (; e;) (t.push(e), (e = resolveParentNode(e)));
  return t;
}
function resolveParentNode(e: any) {
  let { parentNode: t } = e;
  return isDocumentFragment(t) ? t.host : t;
}
function rectsIntersect(e: any, t: any) {
  return e.x < t.x + t.width && e.x + e.width > t.x && e.y < t.y + t.height && e.y + e.height > t.y;
}
function isPointerUnobstructed({ groupElement: e, hitRegion: t, pointerEventTarget: n }: any) {
  if (!isDomElement(n) || n.contains(e) || e.contains(n)) return !0;
  if (compareStackingOrder(n, e) > 0) {
    let r = n;
    for (; r;) {
      if (r.contains(e)) return !0;
      if (rectsIntersect(r.getBoundingClientRect(), t)) return !1;
      r = r.parentElement;
    }
  }
  return !0;
}
function collectHitRegionsAtPointer(e: any, t: any) {
  let n: any[] = [];
  return (
    t.forEach((t: any, r: any) => {
      if (r.disabled) return;
      let i = buildResizeHitRegions(r),
        a = findNearestHitRegion(r.orientation, i, { x: e.clientX, y: e.clientY });
      a &&
        a.distance.x <= 0 &&
        a.distance.y <= 0 &&
        isPointerUnobstructed({
          groupElement: r.element,
          hitRegion: a.hitRegion.rect,
          pointerEventTarget: e.target,
        }) &&
        n.push(a.hitRegion);
    }),
    n
  );
}
function areArraysEqual(e: any, t: any) {
  if (e.length !== t.length) return !1;
  for (let n = 0; n < e.length; n++) if (e[n] != t[n]) return !1;
  return !0;
}
function areSizesEqual(e: any, t: any, n: any = 0) {
  return Math.abs(roundToThreeDecimals(e) - roundToThreeDecimals(t)) <= n;
}
function compareSizes(e: any, t: any) {
  return areSizesEqual(e, t) ? 0 : e > t ? 1 : -1;
}
function constrainPanelSize({ overrideDisabledPanels: e, panelConstraints: t, prevSize: n, size: r }: any) {
  let { collapsedSize: i = 0, collapsible: a, disabled: o, maxSize: s = 100, minSize: c = 0 } = t;
  if (o && !e) return n;
  if (compareSizes(r, c) < 0)
    if (a) {
      let e = (i + c) / 2;
      r = compareSizes(r, e) < 0 ? i : c;
    } else r = c;
  return ((r = Math.min(s, r)), (r = roundToThreeDecimals(r)), r);
}
function resizeLayoutByDelta({
  delta: e,
  initialLayout: t,
  panelConstraints: n,
  pivotIndices: r,
  prevLayout: i,
  trigger: a,
}: any) {
  if (areSizesEqual(e, 0)) return t;
  let o = a === `imperative-api`,
    s = Object.values(t) as any[],
    c = Object.values(i) as any[],
    l = [...s],
    [u, d] = r;
  (assertInvariant(u != null, `Invalid first pivot index`), assertInvariant(d != null, `Invalid second pivot index`));
  let f = 0;
  switch (a) {
    case `keyboard`:
      {
        let t = e < 0 ? d : u,
          r = n[t];
        assertInvariant(r, `Panel constraints not found for index ${t}`);
        let { collapsedSize: i = 0, collapsible: a, minSize: o = 0 } = r;
        if (a) {
          let n = s[t];
          if ((assertInvariant(n != null, `Previous layout not found for panel index ${t}`), areSizesEqual(n, i))) {
            let t = o - n;
            compareSizes(t, Math.abs(e)) > 0 && (e = e < 0 ? 0 - t : t);
          }
        }
      }
      {
        let t = e < 0 ? u : d,
          r = n[t];
        assertInvariant(r, `No panel constraints found for index ${t}`);
        let { collapsedSize: i = 0, collapsible: a, minSize: o = 0 } = r;
        if (a) {
          let n = s[t];
          if ((assertInvariant(n != null, `Previous layout not found for panel index ${t}`), areSizesEqual(n, o))) {
            let t = n - i;
            compareSizes(t, Math.abs(e)) > 0 && (e = e < 0 ? 0 - t : t);
          }
        }
      }
      break;
    default: {
      let t = e < 0 ? d : u,
        r = n[t];
      assertInvariant(r, `Panel constraints not found for index ${t}`);
      let i = s[t],
        { collapsible: a, collapsedSize: o, minSize: c } = r;
      if (a && compareSizes(i, c) < 0)
        if (e > 0) {
          let t = c - o,
            n = t / 2;
          compareSizes(i + e, c) < 0 && (e = compareSizes(e, n) <= 0 ? 0 : t);
        } else {
          let t = c - o,
            n = 100 - t / 2;
          compareSizes(i - e, c) < 0 && (e = compareSizes(100 + e, n) > 0 ? 0 : -t);
        }
      break;
    }
  }
  {
    let t = e < 0 ? 1 : -1,
      r = e < 0 ? d : u,
      i = 0;
    for (;;) {
      let e = s[r];
      assertInvariant(e != null, `Previous layout not found for panel index ${r}`);
      let a = constrainPanelSize({ overrideDisabledPanels: o, panelConstraints: n[r], prevSize: e, size: 100 }) - e;
      if (((i += a), (r += t), r < 0 || r >= n.length)) break;
    }
    let a = Math.min(Math.abs(e), Math.abs(i));
    e = e < 0 ? 0 - a : a;
  }
  {
    let t = e < 0 ? u : d;
    for (; t >= 0 && t < n.length;) {
      let r = Math.abs(e) - Math.abs(f),
        i = s[t];
      assertInvariant(i != null, `Previous layout not found for panel index ${t}`);
      let a = i - r,
        c = constrainPanelSize({ overrideDisabledPanels: o, panelConstraints: n[t], prevSize: i, size: a });
      if (
        !areSizesEqual(i, c) &&
        ((f += i - c),
        (l[t] = c),
        f.toFixed(3).localeCompare(Math.abs(e).toFixed(3), void 0, { numeric: !0 }) >= 0)
      )
        break;
      e < 0 ? t-- : t++;
    }
  }
  if (areArraysEqual(c, l)) return i;
  {
    let t = e < 0 ? d : u,
      r = s[t];
    assertInvariant(r != null, `Previous layout not found for panel index ${t}`);
    let i = r + f,
      a = constrainPanelSize({ overrideDisabledPanels: o, panelConstraints: n[t], prevSize: r, size: i });
    if (((l[t] = a), !areSizesEqual(a, i))) {
      let t = i - a,
        r = e < 0 ? d : u;
      for (; r >= 0 && r < n.length;) {
        let i = l[r];
        assertInvariant(i != null, `Previous layout not found for panel index ${r}`);
        let a = i + t,
          s = constrainPanelSize({ overrideDisabledPanels: o, panelConstraints: n[r], prevSize: i, size: a });
        if ((areSizesEqual(i, s) || ((t -= s - i), (l[r] = s)), areSizesEqual(t, 0))) break;
        e > 0 ? r-- : r++;
      }
    }
  }
  if (
    !areSizesEqual(
      Object.values(l).reduce((e: any, t: any) => t + e, 0),
      100,
      0.1,
    )
  )
    return i;
  let p = Object.keys(i);
  return l.reduce((e: any, t: any, n: any) => ((e[p[n]] = t), e), {});
}
function compareLayouts(e: any, t: any) {
  if (Object.keys(e).length !== Object.keys(t).length) return !1;
  for (let n in e) if (t[n] === void 0 || compareSizes(e[n], t[n]) !== 0) return !1;
  return !0;
}

export {
  emToPixels, remToPixels, vhToPixels, vwToPixels, parseSizeWithUnit,
  getPxSize, roundToThreeDecimals, getGroupPixelSize, derivePanelConstraints,
  assertInvariant, sortByOrientation, compareByOffsetLeft, compareByOffsetTop,
  isDomElement, pointDistanceToRectEdges, findNearestRect, coarsePointerCache,
  isCoarsePointer, buildResizeHitRegions, ListenerRegistry, groupDataRegistry,
  groupChangeEmitter, unregisterGroupData, findGroupById, getGroupData,
  getAllGroupData, subscribeGroupChange, setGroupData, findNearestHitRegion,
  isDocumentFragment, compareStackingOrder, STACKING_CONTEXT_STYLE_RE,
  isFlexDisplay, createsStackingContext, findStackingContextNode, resolveZIndex,
  getAncestorChain, resolveParentNode, rectsIntersect, isPointerUnobstructed,
  collectHitRegionsAtPointer, areArraysEqual, areSizesEqual, compareSizes,
  constrainPanelSize, resizeLayoutByDelta, compareLayouts,
};
