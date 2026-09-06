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

/** tailwind-merge 的类名合并器签名（把握度高，上游 LRU 缓存等细节不暴露）。 〔A1-R186〕★本注（块 @28-28、类别「死面之标签」）係下方被删面之**标签**：其主语 TwMerge 已随死界面普查批第五批销账 ⇒ 本注失去该 referent。★〔A1-R186 裁定 part (ii)，dossier-F f.1〕本注所标签之实体 zcodeTwMerge 经重测仍活（命中 2 处：lib/cn.ts@72／lib/cn.ts@90；口径＝掩码 v8 之代码位命中、已排除本批全部被删区间（故係**施后**值，恒 ≤ 施前值））⇒ 按〔A1-R176〕判别式（注之 referent 是否尚有活体成员）本注必须存活。§5.3 不对称：多一骑手只费一行、漏一骑手则留一句假散文 ⇒ 疑则存之、存活并加骑手。原文逐字保留、只增不改（骑手只增文、不删旧字）。 */
/* ── tombstone〔A1-R186〕死界面普查批第五批：本地 type TwMerge（1 行、代码位读者 0、未 export ⇒ 跨文件读者结构性不可能）纯删，1 行**单行形**等行墓碑在原位（长形判据文与型-only 论证见本批其余 56 碑）；同名定义站：TwMerge 施前全树 1 家、本批销 1 家 ⇒ 销账后该名自全树消失。净零行：本碑 1 行置换原 1 行，文件行数 94 不变、零重锚（cn 引证密度：六形并集、去重键 (token,档,行)、扫描面 356 源 + 4 活文档＝去重 0 条（原始发射 0）；六形全树零命中 ⇒ 净零行非引证所强制，仍照本批工艺一律强制（等行墓碑），免与它文件引证口径分叉）。 ── */

/**
 * extendTailwindMerge 的配置（此处只建模本模块用到的 extend.classGroups；
 * 上游完整配置面见 tailwind-merge@3.5.0 的 Partial<TwMergeConfig>）。
 〔A1-R186〕★本注（块 @31-34、类别「死面之标签」）係下方被删面之**标签**：其主语 ExtendTailwindMergeConfig 已随死界面普查批第五批销账 ⇒ 本注失去该 referent。★★本注係旧簇跨度所吞之窗口注（本批按 57 簇重新分类后方得归主），其 referent 经重测仍活（extendTailwindMerge 命中 3 处；口径＝掩码 v8 之代码位命中、已排除本批全部被删区间（故係**施后**值，恒 ≤ 施前值））⇒ 必须存活。裁定出处逐字引自 dossier-F：「dossier-F f.1: its referents extendTailwindMerge (cn.ts @11/@50/@72) and the config literal @73-77 are live」。§5.3 不对称：多一骑手只费一行、漏一骑手则留一句假散文 ⇒ 疑则存之、存活并加骑手。原文逐字保留、只增不改（骑手只增文、不删旧字）。 */
/* ── tombstone〔A1-R186〕死界面普查批第五批（lib/cn.ts：2 面／6 行，本批该文件共 2 碑）：本地 type ExtendTailwindMergeConfig@35-39（5 行）纯删，5 行等行墓碑在原位。判据〔A1-R176 立／A1-R183 v7／A1-R184 v8〕：一面为死当且仅当 Ⓐ本文件内无代码位读者落在其自身定义跨度之外，且 Ⓑ不带 export（或带 export 而无一家导入方把该名作 specifier 拉取）；级联＝读者全落在已判死之面内者亦判死，迭代至不动点（本批 3 轮收敛，全树 1924 面中得死面 66）。量测一律用 token 级 code-only 掩码 v8（单点模块导入、13 形自检 + 9 负对照），禁行首前缀法〔A1-R174 沉淀①〕。
 *    type ExtendTailwindMergeConfig：代码位读者 0（本文件内、其定义跨度外，逐行以掩码 v8 实测）；未 export ⇒ 跨文件读者结构性不可能。同名定义站：ExtendTailwindMergeConfig 施前全树 1 家、本批销 1 家 ⇒ 销账后该名自全树消失。
 *    邻接注记裁定（±4 行窗口）：@28／@34 之注记皆**存活**、其原文逐字保留并各带同批骑手（骑手只增文、不删旧字），已断言与 HEAD 之差异仅限骑手所增。型-only 批：interface 与 type 别名皆非台账对象〔A1-R164 登记〕⇒ 台账 588/571/510 不得变动（反向哨兵：若变动即证动了 declare、须立即停批核查）；esbuild 擦除全部型构造 ⇒ 三 bundle 必逐字节全等〔A1-R173 沉淀③／A1-R174 沉淀⑥，可用于预测〕。
 *    原界面共 5 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    净零行：本碑 5 行置换原 5 行，文件行数 94 不变、零重锚（本文件 cn 引证密度：六形并集、去重键 (token,档,行)、扫描面 356 源 + 4 活文档＝去重 0 条（原始发射 0）；六形全树零命中 ⇒ 净零行非引证所强制，仍照本批工艺一律强制（等行墓碑），免与它文件引证口径分叉）。★口径须自载：六形係**下界**——R185 查出第七形「Name 型面（NNN）」，本批之骑手网另以 P0 裸名谓词兜底；两口径同判「净零行强制」故结论不受影响〔A1-R173 沉淀⑧〕。 ── */

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
