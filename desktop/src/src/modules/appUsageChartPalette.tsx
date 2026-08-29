/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ZCode 恢复版 · first-party renderer chunk 完整解混淆标样（pilot）
 * ════════════════════════════════════════════════════════════════════════════
 *  原始 chunk   : out/renderer/assets/appUsageChartPalette-BeN2wLzW.js（49 行）
 *  恢复日期     : 2026-08-26
 *  恢复方法     : LLM 语义重命名 + JSX 还原
 *    · 依据：变量使用方式、React hooks 模式、参数形状、相邻字符串常量
 *      （CSS 变量名）、以及逐行对照 node_modules/recharts@3.8.0 源码；
 *    · 导出用途经两个消费者 chunk 交叉验证：
 *      AppUsageDailyModelBarChart-037NXfkz.js / AppUsageModelUsagePieChart-_KCE1AAL.js
 *    · 原 chunk 不含任何 JSX 语法（无 jsx/createElement 调用），
 *      故「JSX 还原」在本 chunk 上不适用（详见 .report.md）。
 *
 *  行为等价声明：本文件与原始 chunk 运行时行为等价——
 *    1) Cell 仍渲染 null，displayName 保持 'Cell'（recharts 按组件引用识别它）；
 *    2) 三个事件 hook 工厂保持同一柯里化形状
 *       (callback, dataKey, graphicalItemId) => (data, index) => eventHandler，
 *       dispatch 的 action payload 字段逐字一致（activeIndex 统一为 String(index)）；
 *    3) 调色板取色 `index % length` 回绕 + `?? 首色` 兜底逻辑逐字保留
 *       （负索引时 JS 取模为负 → 越界 → 兜底到第一色）。
 *  唯一文本级差异：原码箭头体内的逗号表达式 `(cb?.(...), dispatch(...))`
 *  展开为两条语句——返回值由 dispatch 的返回值变为 undefined，
 *  但 React 忽略事件处理器的返回值，且 recharts 上游源码本身即写作两条语句，
 *   observable 行为完全一致。
 * ════════════════════════════════════════════════════════════════════════════
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/charts/appUsageChartPalette.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  Cell,
  useMouseEnterItemDispatch,
  useMouseLeaveItemDispatch,
  useMouseClickItemDispatch,
  getUsageChartColor,
} from '../components/charts/appUsageChartPalette';
export type {
  ChartCoordinate,
  DataKey,
  UsageChartDataItem,
  ItemEventCallback,
  ActiveItemPayload,
  ChartAction,
  ChartDispatch,
  CellProps,
  UsageChartColor,
} from '../components/charts/appUsageChartPalette';
