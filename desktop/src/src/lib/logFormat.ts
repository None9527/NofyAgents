// A0-S4-1: 自 modules/SrcSharedB.tsx §28 原样迁入（B5-10b · src-HCld2afU jsx 8972–8977；原文件现为薄 re-export shim）。

/** 原 Ix（jsx 8972 / js 8862）：本地时间戳格式化 */
export function formatLocalTimestamp(e: any = new Date()) {
  return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, `0`)}-${String(e.getDate()).padStart(2, `0`)} ${String(e.getHours()).padStart(2, `0`)}:${String(e.getMinutes()).padStart(2, `0`)}:${String(e.getSeconds()).padStart(2, `0`)}.${String(e.getMilliseconds()).padStart(3, `0`)}`;
}

/** 原 Lx（jsx 8975 / js 8865）：日志行前缀格式化 */
export function formatLogLinePrefix(e: any, t: any) {
  return `[${formatLocalTimestamp()}]${t == null ? `` : ` [pid:${t}]`} [${e}]`;
}
