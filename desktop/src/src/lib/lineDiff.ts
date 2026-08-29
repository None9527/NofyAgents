// A0-S4-1: 自 modules/SrcSharedB.tsx §34 原样迁入（B5-10b · src-HCld2afU jsx 9128–9172；原文件现为薄 re-export shim）。

/** 原 vS（jsx 9128 / js 9010）：行差异 LCS 单元预算 */
export var LINE_DIFF_LCS_CELL_BUDGET = 4e5;

/** 原 yS（jsx 9129 / js 9011）：文本按行拆分（模板串内含字面换行，零改动） */
export function splitTextIntoLines(e: any) {
  if (!e) return [];
  let t = e.split(`
`);
  return t[t.length - 1] === `` && t.pop(), t;
}

/** 原 bS（jsx 9135 / js 9017）：行差异变更统计（LCS，导出别名 b） */
export function countLineDiffChanges(e: any, t: any) {
  let n = splitTextIntoLines(e),
    r = splitTextIntoLines(t),
    i = 0;
  for (; i < n.length && i < r.length && n[i] === r[i];) i += 1;
  let a = n.length - 1,
    o = r.length - 1;
  for (; a >= i && o >= i && n[a] === r[o];) --a, --o;
  let s = n.slice(i, a + 1),
    c = r.slice(i, o + 1);
  if (s.length === 0) return {
    added: c.length,
    removed: 0
  };
  if (c.length === 0) return {
    added: 0,
    removed: s.length
  };
  if (s.length * c.length > LINE_DIFF_LCS_CELL_BUDGET) return {
    added: c.length,
    removed: s.length
  };
  let l = Array.from({
    length: c.length + 1
  }, () => 0);
  for (let e = 1; e <= s.length; e += 1) {
    let t = 0;
    for (let n = 1; n <= c.length; n += 1) {
      let r = l[n];
      s[e - 1] === c[n - 1] ? l[n] = t + 1 : l[n] = Math.max(l[n], l[n - 1]), t = r;
    }
  }
  let u = l[c.length] ?? 0;
  return {
    added: c.length - u,
    removed: s.length - u
  };
}
