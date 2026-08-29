// A0-S4-1: 自 modules/SrcSharedB.tsx §28 原样迁入（B5-10b · src-HCld2afU jsx 8954–8970；原文件现为薄 re-export shim）。

/** 原 Mx（jsx 8954 / js 8838）：供应商名 slug 化 */
export function slugifyProviderName(e: any) {
  return e.trim().toLowerCase().replace(/[^a-z0-9]+/g, `-`).replace(/^-+|-+$/g, ``) || `provider`;
}

/** 原 Nx（jsx 8957 / js 8847）：FNV-1a 32 位哈希十六进制 */
export function fnv1aHash32Hex(e: any) {
  let t = 2166136261;
  for (let n of e) t ^= n.codePointAt(0) ?? 0, t = Math.imul(t, 16777619);
  return (t >>> 0).toString(16).padStart(8, `0`);
}

/** 原 Px（jsx 8962 / js 8852）：构建稳定供应商 id */
export function buildStableProviderId(e: any) {
  let t = e.trim();
  if (!t) throw Error(`providerId 不能为空`);
  return `${slugifyProviderName(t)}-${fnv1aHash32Hex(t)}`;
}

/** 原 Fx（jsx 8967 / js 8857）：构建稳定模型 id */
export function buildStableModelId(e: any, t: any) {
  let n = t.trim();
  if (!n) throw Error(`modelName 不能为空`);
  return `${buildStableProviderId(e)}/${n}`;
}
