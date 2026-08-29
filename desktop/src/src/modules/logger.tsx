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

/* ─────────────────────────── A0-S4-1 shim ───────────────────────────
 * 实体代码已原样迁入 ../lib/logger.ts（原文件 29–147 行；其对
 * formatLogLinePrefix 的依赖随 A0-S4-1 改指同层 ../lib/logFormat.ts，
 * 绑定同一，语义零改动）。本文件保留 B5 头块与尾符号表；
 * 导出面不变（t = logger 对象、LogLevel 类型），全部导入方无需改动。
 */
export { t } from '../lib/logger';
export type { LogLevel } from '../lib/logger';
/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: exportName -> 原名(minified) -> 语义名
 * ════════════════════════════════════════════════════════════════════════
 * A0-S4-1：实体已迁 ../lib/logger.ts；下表映射信息保留（本文件仅 re-export）。
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
