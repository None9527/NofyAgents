// 〔A1-R38〕co 迁公共叶裁定：§12 真身链（原 PaymentDeep 尾部 10618-10677，A1-R36 逐字转录）
// 原样迁入本公共叶（一符一家；SrcSharedB 具名转导出接引面同批补）。
// 来源：styles-CdEGpc2x.js 998-1039（bundle 唯一真身）。
// 混淆名 → 语义名 映射表（行号 = bundle 行）：
//   ao → isIterableValue (998) | oo → hasEntriesMember (999)
//   so → entriesMapsEqual (1000-1006) | Cie → iterableSequencesEqual (1007-1017)
//   wie → shallowObjectEqual (1018-1032) | co → useShallowSelector (1033-1039)
// 消费面：簇内互消费（ao/oo/so/Cie 1027-1031 区；wie 唯一消费 1037 co 内）；
//   co 消费全集 9 处——78246（PD §11 qq）/63494/63523/63684/63713（settings 域 pqe/WB）
//   /78441（相位刷新族 Jq）/132376/181126/186147（他域）；域外接引留批（settings 63494 区优先）。
import * as React from 'react';

/** 原 ao（998）：可迭代判定 */
const isIterableValue = (e: any) => Symbol.iterator in e;
/** 原 oo（999）：entries 成员判定 */
const hasEntriesMember = (e: any) => `entries` in e;
/** 原 so（1000-1006）：Map/entries 逐项相等 */
const entriesMapsEqual = (e: any, t: any) => {
  let n = e instanceof Map ? e : new Map(e.entries()),
    r = t instanceof Map ? t : new Map(t.entries());
  if (n.size !== r.size) return !1;
  for (let [e, t] of n) if (!r.has(e) || !Object.is(t, r.get(e))) return !1;
  return !0;
};
/** 原 Cie（1007-1017）：迭代器序列逐项相等 */
const iterableSequencesEqual = (e: any, t: any) => {
  let n = e[Symbol.iterator](),
    r = t[Symbol.iterator](),
    i = n.next(),
    a = r.next();
  for (; !i.done && !a.done;) {
    if (!Object.is(i.value, a.value)) return !1;
    ((i = n.next()), (a = r.next()));
  }
  return !!i.done && !!a.done;
};
/** 原 wie（1018-1032）：浅比较（Object.is → 原型同 → iterable/entries 分支） */
function shallowObjectEqual(e: any, t: any) {
  return Object.is(e, t)
    ? !0
    : typeof e != `object` ||
        !e ||
        typeof t != `object` ||
        !t ||
        Object.getPrototypeOf(e) !== Object.getPrototypeOf(t)
      ? !1
      : isIterableValue(e) && isIterableValue(t)
        ? hasEntriesMember(e) && hasEntriesMember(t)
          ? entriesMapsEqual(e, t)
          : iterableSequencesEqual(e, t)
        : entriesMapsEqual({ entries: () => Object.entries(e) }, { entries: () => Object.entries(t) });
}
/** 原 co（1033-1039）：useRef 浅比较选择器工厂（PD §11 qq + settings 域 pqe/WB 等 9 处消费） */
export function useShallowSelector(e: any) {
  let t = React.useRef(void 0);
  return (n: any) => {
    let r = e(n);
    return shallowObjectEqual(t.current, r) ? t.current : (t.current = r);
  };
}
