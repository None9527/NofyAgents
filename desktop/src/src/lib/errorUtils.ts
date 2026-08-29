// A0-S4-1: 自 modules/SrcSharedA.tsx §1 原样迁入（B5-10a · src-HCld2afU jsx 94–141，含 jsx 139–141 冻结语句；原文件现为薄 re-export shim）。

/** jsx 94 */
function isNonNullObject(value: unknown): value is object {
  return typeof value == `object` && !!value;
}

/** jsx 97 */
function toPrimitiveString(value: unknown): string | undefined {
  if (typeof value == `string` || typeof value == `number` || typeof value == `bigint`) return String(value);
}

/** jsx 100 —— 载荷带 error 子对象（含 message 或 code）时解包，否则原样返回 */
function unwrapErrorPayload(value: any): any {
  return !isNonNullObject(value) || !(`error` in value) || !isNonNullObject(value.error) ? value : `message` in value.error || `code` in value.error ? value.error : value;
}

/** jsx 103 */
const FILE_LOCK_TIMEOUT_CODE = `ZCODE_FILE_LOCK_TIMEOUT`;

/** jsx 104 —— 任意值 → 错误文案字符串（JSON.stringify 兜底 String） */
function stringifyErrorValue(value: any): string {
  if (typeof value == `string`) return value;
  if (value === null) return `null`;
  if (value === void 0) return `undefined`;
  if (typeof value == `number` || typeof value == `boolean` || typeof value == `bigint`) return String(value);
  try {
    let json = JSON.stringify(value);
    if (json !== void 0) return json;
  } catch {}
  return String(value);
}

/** jsx 115 ★As —— Error/对象/任意值 → {message, code} 归一 */
export function extractErrorInfo(value: any): { message: string; code?: string } {
  let unwrapped = unwrapErrorPayload(value);
  if (unwrapped instanceof Error) {
    let error = unwrapped as Error & { code?: unknown };
    return {
      message: unwrapped.message || unwrapped.name || String(unwrapped),
      code: toPrimitiveString(error.code)
    };
  }
  if (isNonNullObject(unwrapped)) {
    let code = `code` in unwrapped ? toPrimitiveString((unwrapped as any).code) : void 0,
      message = `message` in unwrapped ? stringifyErrorValue((unwrapped as any).message) : stringifyErrorValue(unwrapped);
    return {
      message: message !== `undefined` && message.length > 0 ? message : stringifyErrorValue(unwrapped),
      code: code
    };
  }
  return {
    message: stringifyErrorValue(unwrapped)
  };
}

/** jsx 136 ★ks */
export function isFileLockTimeoutError(value: any): boolean {
  return extractErrorInfo(value).code === FILE_LOCK_TIMEOUT_CODE;
}

// jsx 139–141 —— 匿名冻结对象（模块级副作用语句，原样保留）
Object.freeze({
  status: `aborted`
});
