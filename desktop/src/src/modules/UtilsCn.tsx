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

// bundle-mjs-D8tLE0rB.js 是 tailwind-merge@3.5.0 的 dist/bundle-mjs.mjs 产物
// （内联 clsx@2.1.1）。minified 导出别名 -> 上游名：
//   r -> 内部函数 t() -> clsx            （clsx 经典实现：toVal + 参数串接）
//   t -> 内部 Ne      -> extendTailwindMerge
//   n -> 内部 Pe      -> twMerge（默认实例；本模块不使用，保持上游导出面登记）
// @ts-expect-error 原始构建产物为 minified JS、无类型声明；类型契约由下方 cast 约束
import { r as clsxMin, t as extendTailwindMergeMin } from '../../out/renderer/assets/bundle-mjs-D8tLE0rB.js';

/* ─────────────────────────── 类型声明（与上游一致） ─────────────────────────── */

/**
 * clsx ClassValue（与 clsx@2.1.1 的 ClassValue 联合一致，把握度高：
 * 本族全部消费者都以 字符串/对象/数组/布尔短路 混用形式调用 cn）。
 */
export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

/** tailwind-merge 的类名合并器签名（把握度高，上游 LRU 缓存等细节不暴露）。 */
type TwMerge = (...classList: Array<string | undefined | null>) => string;

/**
 * extendTailwindMerge 的配置（此处只建模本模块用到的 extend.classGroups；
 * 上游完整配置面见 tailwind-merge@3.5.0 的 Partial<TwMergeConfig>）。
 */
type ExtendTailwindMergeConfig = {
  extend?: {
    classGroups?: Record<string, string[]>;
  };
};

/* ──────── bundle-mjs 符号的类型化绑定（minified 别名 -> 语义名） ──────── */

/** clsx：把 ClassValue 串接为类名字符串（bundle-mjs 内联副本）。 */
const clsx = clsxMin as (...inputs: ClassValue[]) => string;

/**
 * extendTailwindMerge：基于默认配置创建定制合并器。
 * 注意原码调用形态为 `extendTailwindMergeMin({ extend: ... })`（单参数配置对象）。
 */
const extendTailwindMerge = extendTailwindMergeMin as (
  config: ExtendTailwindMergeConfig,
) => TwMerge;

/* ─────────────────────────── ZCode 定制 tailwind-merge 实例 ─────────────────────────── */

/**
 * ZCode 设计系统的自定义字号工具类（对应 tailwind.config 中的 fontSize 扩展，
 * 样式值在 styles-*.css 主题层定义）。登记进 `font-size` class group 后：
 *  - 互相冲突（同组只留一个）；
 *  - 继承上游 `font-size` 组与 `leading`（行高）的冲突修饰符关系。
 */
export const ZCODE_FONT_SIZE_UTILITIES = [
  'text-ui-lg',
  'text-ui-base',
  'text-ui-sm',
  'text-ui-xs',
  'text-mobile-input-safe',
] as const;

/**
 * ZCode 定制版 twMerge：在 tailwind-merge 默认配置上扩展 font-size 组。
 * （原 chunk 顶层语句 `var n = t({ extend: { classGroups: { 'font-size': [...] } } })`）
 */
const zcodeTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [...ZCODE_FONT_SIZE_UTILITIES],
    },
  },
});

/* ─────────────────────────── cn（本 chunk 唯一导出） ─────────────────────────── */

/**
 * shadcn/ui 约定的类名合并函数 `cn`：
 *   cn(...inputs) = zcodeTwMerge(clsx(inputs))
 * 原码：`function r(...t) { return n(e(t)); }`，导出别名 `t`。
 * 全应用所有 chunk（styles/button/chart/imeComposition/…）都经
 * `import { t } from './utils-CEEH0K_K.js'` 使用它。
 */
export function cn(...inputs: ClassValue[]): string {
  return zcodeTwMerge(clsx(inputs));
}

export default cn;

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: exportName -> 原名(minified) -> 语义名
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
