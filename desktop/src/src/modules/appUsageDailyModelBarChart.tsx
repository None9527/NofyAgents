/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ZCode 恢复版 · first-party renderer chunk 完整解混淆
 * ════════════════════════════════════════════════════════════════════════════
 *  原始 chunk   : out/renderer/assets/AppUsageDailyModelBarChart-037NXfkz.js
 *                 （1221 行；pretty 版 src-reconstructed/renderer/assets/
 *                   AppUsageDailyModelBarChart-037NXfkz.jsx 1097 行）
 *  恢复日期     : 2026-08-26
 *  恢复方法     : LLM 语义重命名 + JSX 还原 + 逐行对照 node_modules 上游
 *    · 结构：行 1-964（jsx 口径）为 **vendored recharts@3.8.0 Bar 全家桶**
 *      （state/selectors/barSelectors.js + 各 combiner、cartesian/BarStack.js
 *      的上下文部分、cartesian/Bar.js 全文、chart/BarChart.js），
 *      行 966-1097 为 **ZCode first-party「按日模型用量柱状图」**。
 *    · vendor 段逐函数对照 recharts/es6 源码（文件与函数名见 §符号表），
 *      babel 辅助函数（_extends/_objectSpread/_objectWithoutProperties 等）
 *      按 babel 语义命名；
 *    · first-party 段依据：i18n key（settings.usage.*）、usageStatsUiParts
 *      导出的格式化函数、调色板模块（已恢复标样）与 IntlProvider 的
 *      useZCodeIntl 用法交叉验证。
 *
 *  行为等价声明：
 *    1) vendor 段所有选择器/组件按上游逐语句转写，仅改名与 JSX 还原；
 *       柯里化选择器 (state, id, isPanorama, cells) 的参数形状不变；
 *    2) first-party 段数据组装（前 6 模型 + 逐日累加 + 日期字典序排序）、
 *       tick 稀疏化（≤14 全显，>45 步长 7，否则 5，首尾必显）、
 *       tooltip 正值过滤（Number.isFinite && >0）逐字保留；
 *    3) 类名、CSS 变量（var(--color-modelN)）、stackId="tokens" 逐字保留。
 *  唯一文本级差异：逗号表达式/三元展开为语句，无可观察差异。
 * ════════════════════════════════════════════════════════════════════════════
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/charts/appUsageDailyModelBarChart.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  AppUsageDailyModelBarChart,
} from '../components/charts/appUsageDailyModelBarChart';
