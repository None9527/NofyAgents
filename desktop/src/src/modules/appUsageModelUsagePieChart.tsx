/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ZCode 恢复版 · first-party renderer chunk 完整解混淆
 * ════════════════════════════════════════════════════════════════════════════
 *  原始 chunk   : out/renderer/assets/AppUsageModelUsagePieChart-_KCE1AAL.js
 *                 （1116 行；pretty 版 …/AppUsageModelUsagePieChart-_KCE1AAL.jsx 992 行）
 *  恢复日期     : 2026-08-26
 *  恢复方法     : LLM 语义重命名 + JSX 还原 + 逐行对照 node_modules 上游
 *    · 结构：行 1-879（jsx 口径）为 **vendored recharts@3.8.0 Pie 全家桶**
 *      （state/selectors/polarSelectors.js + pieSelectors.js、polar/Pie.js 全文、
 *      chart/PolarChart.js + chart/PieChart.js），行 881-992 为
 *      **ZCode first-party「模型用量占比饼图」**。
 *    · vendor 段逐函数对照 recharts/es6 源码（见尾符号表）；顶部两条
 *      极坐标 tooltip 载荷选择器链按上游 selectors 语义命名，
 *      个别深层组合器标注 TODO(infer)。
 *    · first-party 段依据：i18n key（settings.usage.modelChart.*）、
 *      usageStatsUiParts 的 formatCompactNumber/formatPercent/UsageEmptyState、
 *      调色板模块与 IntlProvider 交叉验证。
 *
 *  行为等价声明：
 *    1) vendor 段按上游逐语句转写，仅改名与 JSX 还原；
 *    2) first-party 段「前 6 模型 + 其余归并 Other」分片逻辑（>6 个模型时
 *       取前 5 + Other 共 6 片）、占比计算（total>0 防 0 除）、
 *       中心汇总数字与右侧明细列表逐字保留；
 *    3) 饼图几何参数（innerRadius '56%'、outerRadius '86%'、
 *       paddingAngle 2（单片时 0）、stroke var(--color-surface)）逐字保留。
 *  唯一文本级差异：逗号表达式/三元展开为语句，无可观察差异。
 * ════════════════════════════════════════════════════════════════════════════
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/charts/appUsageModelUsagePieChart.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  AppUsageModelUsagePieChart,
} from '../components/charts/appUsageModelUsagePieChart';
