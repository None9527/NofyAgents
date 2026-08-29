/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ZCode 恢复版 · first-party renderer chunk 完整解混淆（D8 Stage B2 · chart 包装/utils/IME 族）
 * ════════════════════════════════════════════════════════════════════════════
 *  原始 chunk   : out/renderer/assets/utils-CEEH0K_K.js（18 行）
 *  恢复日期     : 2026-08-26
 *  恢复方法     : LLM 语义重命名 + 逐行对照上游源码
 *    · 依赖 chunk `bundle-mjs-D8tLE0rB.js`（1,185 行）= tailwind-merge@3.5.0 的
 *      dist/bundle-mjs.mjs 打包产物（内联 clsx@2.1.1），已在
 *      VENDOR-MANIFEST-LIBS.md 登记（node_modules-ref 版本证据）。
 *      其导出表（文件尾）：
 *        Pe as n -> twMerge（默认实例，本 chunk 未使用）
 *        t  as r -> clsx（bundle-mjs 内联的 clsx 函数 t()，及其 toVal e()）
 *        Ne as t -> extendTailwindMerge
 *    · 本 chunk 即 shadcn/ui 约定的 `lib/utils.ts`（cn helper）的 ZCode 定制版：
 *      标准版为 `twMerge(clsx(inputs))`；ZCode 用 extendTailwindMerge 扩展了
 *      一个自有 class group `font-size`，收录 5 个自定义字号工具类
 *      （text-ui-lg / text-ui-base / text-ui-sm / text-ui-xs /
 *        text-mobile-input-safe），使它们参与 tailwind-merge 的冲突消解
 *      （例如 `cn('text-ui-base', 'text-ui-sm')` 只保留后者，
 *        且与上游 `font-size` 组共享 `leading` 冲突修饰符规则）。
 *
 *  行为等价声明：本文件与原始 chunk 运行时行为等价——
 *    1) 扩展配置 `{ extend: { classGroups: { 'font-size': [...5 项] } } }` 逐字一致；
 *    2) `cn(...inputs) = extendedTwMerge(clsx(inputs))` 调用顺序一致；
 *    3) 导出面一致：原 chunk 仅导出 `t`（=cn）。
 *  无文本级差异。
 * ════════════════════════════════════════════════════════════════════════════
 */

/* ─────────────────────────── A0-S4-1 shim ───────────────────────────
 * 实体代码已原样迁入 ../lib/cn.ts（原文件 31–121 行，含 npm 绑定注释、
 * 类型声明、ZCODE_FONT_SIZE_UTILITIES、zcodeTwMerge、cn、default 导出）。
 * 本文件保留 B5 头块与尾符号表；导出面不变，全部导入方无需改动。
 */
export { cn, ZCODE_FONT_SIZE_UTILITIES } from '../lib/cn';
export type { ClassValue } from '../lib/cn';
export { default } from '../lib/cn';

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: exportName -> 原名(minified) -> 语义名
 * A0-S4-1：实体已迁 ../lib/cn.ts；下表映射信息保留（本文件仅 re-export）。
 * ════════════════════════════════════════════════════════════════════════
 * 导出符号（1 个）：
 *   t -> r -> cn                       类名合并（clsx + 定制 tailwind-merge）
 * 模块内局部符号（2 个，未导出）：
 *   - -> n -> zcodeTwMerge             extendTailwindMerge 定制实例
 *   - -> （常量数组）-> ZCODE_FONT_SIZE_UTILITIES（重建时命名，原码为内联字面量）
 * 导入符号（2 个，来自 ./bundle-mjs-D8tLE0rB.js = tailwind-merge@3.5.0 bundle）：
 *   r -> （内部函数 t）-> clsx          clsx@2.1.1（内联副本）
 *   t -> （内部 Ne）   -> extendTailwindMerge
 * ════════════════════════════════════════════════════════════════════════ */
