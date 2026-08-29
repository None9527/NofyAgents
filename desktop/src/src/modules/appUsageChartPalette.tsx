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

import type { MouseEvent as ReactMouseEvent } from 'react';

// chart-iT2j9K3u.js 是 recharts@3.8.0 的打包产物；下面的导出别名（Tn/X/Y/Z）
// 是 minify 后的名字，逐一对照如下（内部名 -> recharts 上游名，已核对源码）：
//   Tn -> 内部 F  -> useAppDispatch               (recharts/state/hooks.js)
//   X  -> 内部 C_ -> setActiveClickItemIndex      (recharts/state/tooltipSlice.js)
//   Y  -> 内部 x_ -> mouseLeaveItem               (recharts/state/tooltipSlice.js)
//   Z  -> 内部 b_ -> setActiveMouseOverItemIndex  (recharts/state/tooltipSlice.js)
// 改接 npm recharts@3.8.0 深路径（类型环境见 ../lib/recharts-deep.d.ts）。
import { useAppDispatch } from 'recharts/es6/state/hooks.js'; // 原 chart-iT2j9K3u Tn
import {
  setActiveClickItemIndex, // 原 chart-iT2j9K3u X
  mouseLeaveItem, // 原 chart-iT2j9K3u Y
  setActiveMouseOverItemIndex, // 原 chart-iT2j9K3u Z
} from 'recharts/es6/state/tooltipSlice.js';

/* ─────────────────────────── 类型声明（推断） ─────────────────────────── */

/**
 * recharts 平面坐标。
 * // TODO(infer): 此处按 data.tooltipPosition 的用法推断为 {x, y}；
 * // recharts 上游 ChartCoordinate 可能允许更多可选字段。
 */
export interface ChartCoordinate {
  x: number;
  y: number;
}

/** recharts DataKey：数据字段名 / 序号 / 取值函数（与上游类型一致，把握度高）。 */
export type DataKey = string | number | ((entry: unknown) => unknown);

/**
 * 图表数据中的一行。消费者（柱状图/饼图）会附带 date、modelId、totalTokens 等
 * 业务字段，但本模块只依赖 tooltipPosition。
 * // TODO(infer): 业务字段由消费者定义，这里用索引签名兜底。
 */
export interface UsageChartDataItem {
  tooltipPosition?: ChartCoordinate;
  [key: string]: unknown;
}

/** 用户经 props 传入的事件回调（onMouseEnter / onMouseLeave / onClick）。 */
export type ItemEventCallback = (
  data: UsageChartDataItem,
  index: number,
  event: ReactMouseEvent,
) => void;

/**
 * item 交互 action 的 payload（与 tooltipSlice reducer 读取的字段一一对应，
 * 把握度高：activeIndex / activeDataKey / activeCoordinate / activeGraphicalItemId）。
 */
export interface ActiveItemPayload {
  activeIndex: string;
  activeDataKey: DataKey;
  activeCoordinate: ChartCoordinate | undefined;
  activeGraphicalItemId: string | undefined;
}

/**
 * recharts 内部 Redux action。
 * // TODO(infer): action.type 形如 'tooltip/<reducerName>'（slice 名为 'tooltip'，
 * // 已在 chart chunk 中确认），此处以宽松联合表示。
 */
export type ChartAction =
  | { type: 'tooltip/setActiveMouseOverItemIndex'; payload: ActiveItemPayload }
  | { type: 'tooltip/mouseLeaveItem' }
  | { type: 'tooltip/setActiveClickItemIndex'; payload: ActiveItemPayload };

/**
 * recharts 图表 store 的 dispatch；脱离图表上下文时上游返回恒等函数作兜底。
 * // TODO(infer): 完整 Redux dispatch 签名（含 thunk/中间件重载）未建模。
 */
export type ChartDispatch = (action: ChartAction) => ChartAction;

type ActionCreatorWithPayload<P> = (payload: P) => ChartAction;
type ActionCreatorWithoutPayload = () => ChartAction;

/* ──────── chart chunk 符号的类型化绑定（minified 别名 -> 语义名） ──────── */

/* ──────── recharts 符号的类型化绑定（语义名 -> 本模块契约） ────────
 * useAppDispatch：取当前图表 Redux store 的 dispatch。
 * setActiveClickItemIndex：标记「点击了某个数据项」。
 * mouseLeaveItem：标记「鼠标离开了数据项」。
 * setActiveMouseOverItemIndex：标记「鼠标悬停在某个数据项上」。
 * 深路径导入为 any 类型（见 ../lib/recharts-deep.d.ts），
 * 下方绑定把调用面约束到本模块建模的契约。
 * ─────────────────────────────────────────────────────────────────── */

/** recharts useAppDispatch：取当前图表 Redux store 的 dispatch。 */
const useAppDispatchTyped = useAppDispatch as unknown as () => ChartDispatch;
/** recharts tooltipSlice action：标记「点击了某个数据项」。 */
const setActiveClickItemIndexTyped = setActiveClickItemIndex as unknown as ActionCreatorWithPayload<ActiveItemPayload>;
/** recharts tooltipSlice action：标记「鼠标离开了数据项」。 */
const mouseLeaveItemTyped = mouseLeaveItem as unknown as ActionCreatorWithoutPayload;
/** recharts tooltipSlice action：标记「鼠标悬停在某个数据项上」。 */
const setActiveMouseOverItemIndexTyped = setActiveMouseOverItemIndex as unknown as ActionCreatorWithPayload<ActiveItemPayload>;

/* ─────────────────────────── 1. Cell 占位组件 ─────────────────────────── */

/**
 * Cell 的 props：本身不消费任何 prop，仅作为「逐数据点样式载体」存在于
 * chart 组件的 children 中，由 Bar/Pie 等经 findAllByType(children, Cell)
 * 收集后把 fill 等属性施加到对应图形元素上。
 * // TODO(infer): 已确证的只有 fill（饼图消费者用法），其余为常见 SVG 属性猜测。
 */
export type CellProps = {
  fill?: string;
  stroke?: string;
  key?: string | number;
  [prop: string]: unknown;
};

/**
 * recharts <Cell> 占位组件（vendored 自 recharts@3.8.0 component/Cell.js，
 * 上游标注 @deprecated，将在 recharts 4.0 移除）。
 *
 * 本组件不渲染任何内容（返回 null）：它只是声明式容器，例如：
 *   <Pie ...>{topModels.map(m => <Cell key={m.modelId} fill={`var(--color-${m.key})`} />)}</Pie>
 * 注意：必须保留 displayName —— 调试与部分按名识别的工具依赖它。
 */
export const Cell = (_props: CellProps): null => null;
Cell.displayName = 'Cell';

/* ─────────────── 2/3/4. 数据项交互事件 hooks（recharts tooltipContext） ─────────────── */

/**
 * 鼠标进入数据项。柯里化三层：
 *   (onMouseEnterFromProps, dataKey, graphicalItemId)  ← 组件渲染期调用（hook）
 *     => (data, index)                                  ← 每个数据点绑定一次
 *       => (event) => { ... }                           ← 真正挂到 DOM 的事件处理器
 * 触发时：先调用用户 props 回调（可空），再 dispatch 把悬停项写入
 * recharts tooltip/交互 store（activeIndex 统一转字符串）。
 */
export const useMouseEnterItemDispatch = (
  onMouseEnterFromProps: ItemEventCallback | null | undefined,
  dataKey: DataKey,
  graphicalItemId: string | undefined,
) => {
  const dispatch = useAppDispatchTyped();
  return (data: UsageChartDataItem, index: number) => (event: ReactMouseEvent) => {
    onMouseEnterFromProps?.(data, index, event);
    dispatch(
      setActiveMouseOverItemIndexTyped({
        activeIndex: String(index),
        activeDataKey: dataKey,
        activeCoordinate: data.tooltipPosition,
        activeGraphicalItemId: graphicalItemId,
      }),
    );
  };
};

/**
 * 鼠标离开数据项。与进入版不同：不需要 dataKey / graphicalItemId，
 * 因为离开只需把 store 中的悬停状态清掉（dispatch(mouseLeaveItem())）。
 */
export const useMouseLeaveItemDispatch = (
  onMouseLeaveFromProps: ItemEventCallback | null | undefined,
) => {
  const dispatch = useAppDispatchTyped();
  return (data: UsageChartDataItem, index: number) => (event: ReactMouseEvent) => {
    onMouseLeaveFromProps?.(data, index, event);
    dispatch(mouseLeaveItemTyped());
  };
};

/**
 * 点击数据项。结构与 enter 版完全对称，仅 dispatch 的 action 换成
 * setActiveClickItemIndex（写入 itemInteraction.click 而非 .hover）。
 */
export const useMouseClickItemDispatch = (
  onMouseClickFromProps: ItemEventCallback | null | undefined,
  dataKey: DataKey,
  graphicalItemId: string | undefined,
) => {
  const dispatch = useAppDispatchTyped();
  return (data: UsageChartDataItem, index: number) => (event: ReactMouseEvent) => {
    onMouseClickFromProps?.(data, index, event);
    dispatch(
      setActiveClickItemIndexTyped({
        activeIndex: String(index),
        activeDataKey: dataKey,
        activeCoordinate: data.tooltipPosition,
        activeGraphicalItemId: graphicalItemId,
      }),
    );
  };
};

/* ─────────────────────────── 5. 应用用量图调色板 ─────────────────────────── */

/**
 * 应用用量（App Usage）图表调色板：6 个主题 CSS 变量（本 chunk 得名于此）。
 * 具体色值在 styles-BxSv8qTx.css 中按 light/dark 主题定义，例如：
 *   --color-usage-chart-1: var(--color-sky-600)   （light）
 *   --color-usage-chart-1: var(--color-sky-500)   （dark）
 * 柱状图/饼图按「前 6 个模型」的顺序用它们给数据系列着色。
 * 注意：保持模块内不导出（原 chunk 仅经 getUsageChartColor 暴露）。
 */
const USAGE_CHART_COLORS = [
  'var(--color-usage-chart-1)',
  'var(--color-usage-chart-2)',
  'var(--color-usage-chart-3)',
  'var(--color-usage-chart-4)',
  'var(--color-usage-chart-5)',
  'var(--color-usage-chart-6)',
] as const;

export type UsageChartColor = (typeof USAGE_CHART_COLORS)[number];

/**
 * 按数据系列序号取调色板颜色。
 * `index % length` —— 系列多于 6 种时回绕复用；
 * `?? 首色`       —— 越界兜底（负 index 时取模结果为负，下标越界得 undefined）。
 */
export function getUsageChartColor(index: number): UsageChartColor {
  return USAGE_CHART_COLORS[index % USAGE_CHART_COLORS.length] ?? USAGE_CHART_COLORS[0];
}

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: exportName -> 原名(minified) -> 语义名
 * ════════════════════════════════════════════════════════════════════════
 * 导出符号（5 个，exportName 为原 chunk 的导出别名）：
 *   a -> i -> Cell                        recharts Cell 占位组件
 *   i -> o -> useMouseLeaveItemDispatch   鼠标离开数据项事件 hook（recharts 上游同名）
 *   n -> s -> useMouseClickItemDispatch   点击数据项事件 hook（recharts 上游同名）
 *   r -> a -> useMouseEnterItemDispatch   鼠标进入数据项事件 hook（recharts 上游同名）
 *   t -> l -> getUsageChartColor          调色板取色函数
 * 模块内局部符号（1 个，未导出）：
 *   - -> c -> USAGE_CHART_COLORS          6 色 CSS 变量调色板数组
 * 导入符号（4 个，来自 ./chart-iT2j9K3u.js，格式：导出别名 -> chunk 内名 -> 语义名）：
 *   Tn -> e -> useAppDispatch             recharts state/hooks.js
 *   X  -> t -> setActiveClickItemIndex    recharts state/tooltipSlice.js
 *   Y  -> n -> mouseLeaveItem             recharts state/tooltipSlice.js
 *   Z  -> r -> setActiveMouseOverItemIndex recharts state/tooltipSlice.js
 * ════════════════════════════════════════════════════════════════════════ */
