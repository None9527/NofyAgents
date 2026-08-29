// A0-S4-1: 自 modules/SrcSharedB.tsx §25 原样迁入（B5-10b · src-HCld2afU jsx 8823–8843；原文件现为薄 re-export shim）。

/** 原 ox（jsx 8823 / js 8697）：字节转十六进制 */
export function toHexByte(e: any) {
  return e.toString(16).padStart(2, `0`);
}

/** 原 sx（jsx 8826 / js 8700）：从字节格式化 UUID */
export function formatUuidFromBytes(e: any) {
  let t = new Uint8Array(e);
  return t[6] = t[6] & 15 | 64, t[8] = t[8] & 63 | 128, [t.slice(0, 4), t.slice(4, 6), t.slice(6, 8), t.slice(8, 10), t.slice(10, 16)].map((e: any) => Array.from(e, toHexByte).join(``)).join(`-`);
}

/** 原 cx（jsx 8830 / js 8710）：生成 UUID */
export function generateUuid() {
  let e = globalThis.crypto;
  if (e?.randomUUID) return e.randomUUID();
  if (e?.getRandomValues) {
    let t = new Uint8Array(16);
    return e.getRandomValues(t), formatUuidFromBytes(t);
  }
  let t = new Uint8Array(16);
  for (let e = 0; e < t.length; e += 1) t[e] = Math.floor(Math.random() * 256);
  return formatUuidFromBytes(t);
}

/** 原 lx（jsx 8841 / js 8721）：新建唯一 id */
export function newUniqueId(e: any) {
  return generateUuid();
}
