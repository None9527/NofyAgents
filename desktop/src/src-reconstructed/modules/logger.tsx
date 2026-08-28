/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ZCode 恢复版 · first-party renderer chunk 完整解混淆
 * ════════════════════════════════════════════════════════════════════════════
 *  原始 chunk   : out/renderer/assets/logger-PFDwl5Yq.js（31 行）
 *  恢复日期     : 2026-08-26
 *  恢复方法     : LLM 语义重命名（无 JSX，JSX 还原不适用）
 *    · 依据：console.debug/log/warn/error 映射表、`window.zcode?.log?.(...)`
 *      旁路、`[trace:<scope>]` 前缀、以及内联的 import.meta.env 快照；
 *    · 唯一导入 `K`（src-HCld2afU.js 导出，内部名 `Lx`）经逐行比对确认为
 *      日志前缀格式化器：`[<本地时间戳>] [pid:<pid>] [<tag>]`
 *      （src-HCld2afU.jsx 行 8975，时间戳由相邻的 `Ix` 生成，
 *      形如 `2026-08-26 12:34:56.789`）；本 chunk 以 tag='ui'、无 pid 调用。
 *
 *  行为等价声明：本文件与原始 chunk 运行时行为逐字等价——
 *    1) 禁用条件 `__ZCODE_RENDERER_DISABLE_LOGGING__ === true || env.PROD === true`
 *       逐字保留（原码内联了 import.meta.env 的构建期常量对象，恢复版同样
 *       以常量对象内联，保证 PROD 构建下恒为禁用的语义不变）；
 *    2) `shouldLog(level)` 忽略 level 参数、恒返回 `!isLoggingDisabled()` 的
 *       怪癖逐字保留（原码即 `function r(e) { return !t(); }`）；
 *    3) debug 级别不写 `window.zcode.log` 旁路、其余级别写的语义保留；
 *       旁路传参为 `(level, argsArray)`（整个 rest 数组作为第二实参），
 *       与逐条展开不同，逐字保留；
 *    4) `trace(scope, level, ...args)` 的柯里化参数顺序与 `[trace:scope]`
 *       前缀位置逐字保留。
 * ════════════════════════════════════════════════════════════════════════════
 */

// ─── 依赖：./src-HCld2afU.js 的 K 导出（内部名 Lx） ───
// Lx(tag, pid?) => `[${formatTimestamp(new Date())}]${pid == null ? '' : ` [pid:${pid}]`} [${tag}]`
// @ts-expect-error 原始构建产物为 minified JS、无类型声明；类型契约由下方 cast 约束
import { K } from '../../out/renderer/assets/src-HCld2afU.js';

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

/** preload 注入的桌面桥（可选）。此处只建模本模块用到的 `log` 方法。 */
declare global {
  interface Window {
    zcode?: {
      /** 主进程日志旁路：非 debug 级别的渲染进程日志会转发到这里。 */
      log?: (level: LogLevel, args: unknown[]) => void;
    };
    /** 测试/调试用全局开关：true 时禁用渲染进程日志。 */
    __ZCODE_RENDERER_DISABLE_LOGGING__?: boolean;
  }
}

/* ──────── src chunk 符号的类型化绑定（minified 别名 -> 语义名） ──────── */

/** 日志前缀格式化器：`[时间戳] [pid:N] [tag]`（本模块以 tag='ui'、无 pid 调用）。 */
const formatLogPrefix = K as (tag: string, pid?: number) => string;

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
    window.zcode?.log?.(level, args);
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

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: exportName -> 原名(minified) -> 语义名
 * ════════════════════════════════════════════════════════════════════════
 * 导出符号（1 个）：
 *   t -> a -> logger                     渲染进程日志器对象
 * 模块内局部符号（5 个，未导出）：
 *   - -> t -> isLoggingDisabled          禁用判定（全局开关 || PROD）
 *   - -> n -> CONSOLE_METHODS            级别 -> console 方法映射（info->console.log）
 *   - -> r -> shouldLog                  级别过滤（当前忽略级别参数）
 *   - -> i -> logAtLevel                 核心输出（console + 主进程旁路）
 *   - -> (无) -> RENDERER_ENV            import.meta.env 构建期快照（原码内联字面量）
 * 导入符号（1 个，来自 ./src-HCld2afU.js，格式：导出别名 -> 内部名 -> 语义名）：
 *   K -> Lx -> formatLogPrefix           `[时间戳] [pid:N] [tag]` 前缀格式化器
 * ════════════════════════════════════════════════════════════════════════ */
