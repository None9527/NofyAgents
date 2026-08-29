// A0-S4-1: 自 modules/UtilsCn.tsx 原样迁入（D8-B2 · utils-CEEH0K_K.js 重建；B5 头块与尾符号表留原文件，原文件现为薄 re-export shim）。

// bundle-mjs-D8tLE0rB.js 是 tailwind-merge@3.5.0 的 dist/bundle-mjs.mjs 产物
// （内联 clsx@2.1.1）。minified 导出别名 -> 上游名：
//   r -> 内部函数 t() -> clsx            （clsx 经典实现：toVal + 参数串接）
//   t -> 内部 Ne      -> extendTailwindMerge
//   n -> 内部 Pe      -> twMerge（默认实例；本模块不使用，保持上游导出面登记）
// 改接 npm 同名包（版本与 VENDOR-MANIFEST-LIBS.md 登记一致：
// clsx@2.1.1、tailwind-merge@3.5.0）。
import { clsx as clsxMin } from 'clsx'; // 原 bundle-mjs-D8tLE0rB r
import { extendTailwindMerge as extendTailwindMergeMin } from 'tailwind-merge'; // 原 bundle-mjs-D8tLE0rB t

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

/** clsx：把 ClassValue 串接为类名字符串（原为 bundle-mjs 内联副本，现直用 npm 包）。 */
const clsx = clsxMin;

/**
 * extendTailwindMerge：基于默认配置创建定制合并器。
 * 注意原码调用形态为 `extendTailwindMerge({ extend: ... })`（单参数配置对象）。
 */
const extendTailwindMerge = extendTailwindMergeMin;

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
