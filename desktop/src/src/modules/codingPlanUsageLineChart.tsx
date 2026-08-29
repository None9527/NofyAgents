/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ZCode 恢复版 · first-party renderer chunk 完整解混淆
 * ════════════════════════════════════════════════════════════════════════════
 *  原始 chunk   : out/renderer/assets/CodingPlanUsageLineChart-BpNLwqMV.js
 *                 （1065 行；pretty 版 …/CodingPlanUsageLineChart-BpNLwqMV.jsx 996 行）
 *  恢复日期     : 2026-08-26
 *  恢复方法     : LLM 语义重命名 + JSX 还原 + 逐行对照 node_modules 上游
 *    · 结构：行 1-888（jsx 口径）为 **vendored recharts@3.8.0 Line 全家桶**
 *      （shape/Dot.js、component/Dots.js、component/ActivePoints.js、
 *      state/selectors/lineSelectors.js、cartesian/Line.js 全文、
 *      chart/LineChart.js），行 890-996 为 **ZCode first-party
 *      「Coding Plan 用量折线图」**。
 *    · vendor 段逐函数对照 recharts/es6 源码（见尾符号表）。
 *    · first-party 段依据：i18n key（settings.usage.emptyTitle）、
 *      usageStatsUiParts 的 formatCompactNumber/formatTurnCount/UsageEmptyState、
 *      本 chunk 内联的 6 色调色板（与调色板模块同值）交叉验证。
 *
 *  行为等价声明：
 *    1) vendor 段按上游逐语句转写，仅改名与 JSX 还原（含描边虚线
 *       动画的 getStrokeDasharray/repeat 逐字逻辑、上一帧点插值、
 *       animateNewValues 的双倍宽度飞入）；
 *    2) first-party 段：系列取前 6、小时粒度直接截取 'HH:MM'、
 *       日粒度经 Intl.DateTimeFormat(month:short, day:numeric) 格式化、
 *       tick 稀疏化（14/45 阈值）、valueKind token/count 双格式化逐字保留；
 *    3) 类名、--color-seriesN 变量、type="monotone"、strokeWidth=2、dot=false
 *       逐字保留。
 *  唯一文本级差异：逗号表达式/三元展开为语句，无可观察差异。
 * ════════════════════════════════════════════════════════════════════════════
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/charts/codingPlanUsageLineChart.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  CodingPlanUsageLineChart,
} from '../components/charts/codingPlanUsageLineChart';
