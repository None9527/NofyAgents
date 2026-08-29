// A0-S4-1: 自 modules/logger.tsx 原样迁入（logger-PFDwl5Yq.js 重建；formatLogLinePrefix 依赖改指同层 lib/logFormat.ts——A0-S4-1 已自 SrcSharedB 迁出，绑定同一；原文件现为薄 re-export shim）。

// ─── 依赖：./src-HCld2afU.js 的 K 导出（内部名 Lx）→ SrcSharedB formatLogLinePrefix ───
// Lx(tag, pid?) => `[${formatTimestamp(new Date())}]${pid == null ? '' : ` [pid:${pid}]`} [${tag}]`
import { formatLogLinePrefix } from './logFormat'; // 原 src-HCld2afU K（内部名 Lx）

/* ─────────────────────────── 类型声明（推断） ─────────────────────────── */

/** 日志级别。把握度高：与 consoleMethods 的键、trace 的 level 参数完全对应。 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** 构建期注入的 Vite 环境变量（原码内联的 import.meta.env 产物快照）。 */
interface ZCodeRendererEnv {
  BASE_URL: string;
  DEV: boolean;
  MODE: string;
  PROD: boolean;
  SSR: boolean;
  VITE_ZCODE_BASE_URL: string;
  VITE_ZCODE_E2E_STORE_BRIDGE: string;
  VITE_ZCODE_ENDPOINT_ORIGIN: string;
}

/**
 * 测试/调试用全局开关：true 时禁用渲染进程日志。
 * 以 `var` 声明使其落在 typeof globalThis 上（原码经 globalThis 读取）。
 * 注：window.zcode 的 Window 声明由 Sidebar.tsx 统一给出（合并类型），
 * 本模块不再重复声明，仅在调用处按 `log` 方法契约 cast。
 */
declare global {
  var __ZCODE_RENDERER_DISABLE_LOGGING__: boolean | undefined;
}

/* ──────── src chunk 符号的类型化绑定（minified 别名 -> 语义名） ──────── */

/** 日志前缀格式化器：`[时间戳] [pid:N] [tag]`（本模块以 tag='ui'、无 pid 调用）。 */
const formatLogPrefix = formatLogLinePrefix as (tag: string, pid?: number) => string;

/* ─────────────────────────── 1. 禁用判定 ─────────────────────────── */

/**
 * 原码内联的 import.meta.env 构建期快照（生产构建常量）。
 * 把握度高：与入口/门控等 chunk 中出现的同一对象逐字一致。
 */
const RENDERER_ENV: ZCodeRendererEnv = {
  BASE_URL: `./`,
  DEV: !1,
  MODE: `production`,
  PROD: !0,
  SSR: !1,
  VITE_ZCODE_BASE_URL: `https://zcode.z.ai`,
  VITE_ZCODE_E2E_STORE_BRIDGE: ``,
  VITE_ZCODE_ENDPOINT_ORIGIN: `https://zcode.z.ai`,
};

/**
 * 日志是否被禁用。
 * 两个条件任一成立即禁用：显式全局开关，或生产构建（PROD 恒真时
 * 渲染进程默认静默，只保留主进程旁路也不可用——见 logAtLevel）。
 */
function isLoggingDisabled(): boolean {
  return globalThis.__ZCODE_RENDERER_DISABLE_LOGGING__ === true || RENDERER_ENV.PROD === true;
}

/* ─────────────────────────── 2. console 方法表 ─────────────────────────── */

/**
 * 级别 -> console 方法映射。
 * 注意 `info` 映射到 `console.log`（原码即如此，非 console.info）。
 */
const CONSOLE_METHODS: Record<LogLevel, (...args: unknown[]) => void> = {
  debug: console.debug,
  info: console.log,
  warn: console.warn,
  error: console.error,
};

/* ─────────────────────────── 3. shouldLog / logAtLevel ─────────────────────────── */

/**
 * 是否输出某级别日志。
 * 怪癖保留：原码形参 `e`（级别）从未被使用——当前无按级别过滤，
 * 仅全局开关生效。// TODO(infer): 未来可能扩展为级别阈值过滤。
 */
function shouldLog(_level: LogLevel): boolean {
  return !isLoggingDisabled();
}

/**
 * 核心输出函数：先过 shouldLog，再
 *   1) 经 console 输出（前缀 `[时间戳] [ui]`）；
 *   2) 非 debug 级别且存在 window 时，转发给主进程旁路
 *      `window.zcode?.log?.(level, argsArray)`。
 */
function logAtLevel(level: LogLevel, ...args: unknown[]): void {
  if (!shouldLog(level)) return;
  CONSOLE_METHODS[level](formatLogPrefix(`ui`), ...args);
  if (level !== `debug` && typeof window !== `undefined`) {
    // 主进程日志旁路（window.zcode 合并类型见 Sidebar.tsx；此处按 log 方法契约 cast）。
    (window.zcode?.log as ((level: LogLevel, args: unknown[]) => void) | undefined)?.(level, args);
  }
}

/* ─────────────────────────── 4. 对外 logger ─────────────────────────── */

/**
 * 渲染进程日志器（本 chunk 唯一导出，原导出别名 `t`）。
 * `trace(scope, level, ...args)` 会在消息前插入 `[trace:<scope>]` 标记，
 * 实际输出级别由第二参数决定。
 */
const logger = {
  debug: (...args: unknown[]) => logAtLevel(`debug`, ...args),
  info: (...args: unknown[]) => logAtLevel(`info`, ...args),
  warn: (...args: unknown[]) => logAtLevel(`warn`, ...args),
  error: (...args: unknown[]) => logAtLevel(`error`, ...args),
  trace: (scope: string, level: LogLevel, ...args: unknown[]) => {
    logAtLevel(level, `[trace:${scope}]`, ...args);
  },
};

export { logger as t };
