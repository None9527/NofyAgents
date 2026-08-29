// A0-S4-1: 自 modules/SrcSharedB.tsx §31/§32 原样迁入（B5-10b · src-HCld2afU jsx 9066–9109；原文件现为薄 re-export shim）。

/** 原 tS（jsx 9066 / js 8954）：自定义模型引用前缀 */
export var CUSTOM_MODEL_REF_PREFIX = `custom:`;

/** 原 nS（jsx 9067 / js 8955）：安全解码 URI 组件 */
export function safeDecodeURIComponent(e: any) {
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}

/** 原 rS（jsx 9074 / js 8962）：构建自定义模型引用 */
export function buildCustomModelRef(e: any, t: any) {
  let n = encodeURIComponent(e);
  return t ? `${CUSTOM_MODEL_REF_PREFIX}${n}:${encodeURIComponent(t)}` : `${CUSTOM_MODEL_REF_PREFIX}${n}`;
}

/** 原 iS（jsx 9078 / js 8966）：解析自定义模型引用（导出别名 P） */
export function parseCustomModelRef(e: any) {
  if (!e.startsWith(`custom:`)) return null;
  let t = e.slice(7),
    n = t.indexOf(`:`);
  if (n < 0) return {
    providerId: safeDecodeURIComponent(t)
  };
  let r = t.split(`:`);
  if (r.length >= 3 && r[0] === `builtin`) return {
    providerId: `${r[0]}:${r[1]}`,
    modelName: safeDecodeURIComponent(r.slice(2).join(`:`))
  };
  let i = t.slice(0, n),
    a = t.slice(n + 1);
  return {
    providerId: safeDecodeURIComponent(i),
    modelName: safeDecodeURIComponent(a)
  };
}

/** 原 aS（jsx 9097 / js 8978）：原生供应商引用前缀 */
export var NATIVE_PROVIDER_REF_PREFIX = `native:`;

/** 原 oS（jsx 9098 / js 8979）：自定义供应商引用前缀 */
export var CUSTOM_PROVIDER_REF_PREFIX = `custom:`;

/** 原 sS（jsx 9099 / js 8980）：幽灵供应商引用前缀 */
export var GHOST_PROVIDER_REF_PREFIX = `ghost:`;

/** 原 cS（jsx 9100 / js 8981）：原生供应商引用 */
export function nativeProviderRef(e: any) {
  return `${NATIVE_PROVIDER_REF_PREFIX}${e}`;
}

/** 原 lS（jsx 9103 / js 8984）：自定义供应商引用 */
export function customProviderRef(e: any) {
  return `${CUSTOM_PROVIDER_REF_PREFIX}${e.trim()}`;
}

/** 原 uS（jsx 9106 / js 8987）：从自定义模型引用解析供应商引用 */
export function resolveProviderRefFromCustomModelRef(e: any, t: any) {
  let n = parseCustomModelRef(String(t ?? ``));
  return n?.providerId ? customProviderRef(n.providerId) : nativeProviderRef(e);
}
