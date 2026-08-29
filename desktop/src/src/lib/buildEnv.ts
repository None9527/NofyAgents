// A0-S4-1: 自 modules/SrcSharedA.tsx §1 原样迁入（B5-10a · src-HCld2afU jsx 89–93，含 jsx 93 调试探针语句；原文件现为薄 re-export shim）。

/** jsx 89 —— 环境归一：仅 'production'（大小写空白宽容）为生产，其余一律 test */
function normalizeBuildEnv(value?: string | null): `production` | `test` {
  return value?.trim().toLowerCase() === `production` ? `production` : `test`;
}

/** jsx 92 ★js */
export const RESOLVED_BUILD_ENV = normalizeBuildEnv(`production`);
// jsx 93 —— 原样保留的调试探针（死代码）：`typeof process < 'u'` 即 process 存在时读 `{}.ZCODE_DEBUG`（恒 undefined）
typeof process < `u` && ({} as { ZCODE_DEBUG?: unknown }).ZCODE_DEBUG;
