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

import * as React from 'react';
import { clsx } from 'clsx';
import { useZCodeIntl } from './I18n'; // 原 IntlProvider-C321H7m8 n
// usageStatsUiParts 导出：a=紧凑数字, s=百分比, t=空态卡片
import {
  formatTokens as formatCompactNumber, // 原 usageStatsUiParts-CiR7YEhh a
  formatPercent, // 原 usageStatsUiParts-CiR7YEhh s
  UsageEmptyState, // 原 usageStatsUiParts-CiR7YEhh t
} from './UsageStatsUiParts';
// CartesianChart chunk = 纯 recharts 3.8.0 vendor：t=CartesianChart（极坐标版经 PolarChart 复用）
import { CartesianChart } from 'recharts/es6/chart/CartesianChart.js'; // 原 CartesianChart-nORn-0bc t
// 已恢复的调色板模块
import {
  Cell,
  useMouseLeaveItemDispatch,
  useMouseClickItemDispatch,
  useMouseEnterItemDispatch,
  getUsageChartColor,
} from './appUsageChartPalette';
// chart-iT2j9K3u.js = recharts@3.8.0 bundle（+ chart.tsx 封装），别名映射见尾符号表。
// 改接 npm recharts@3.8.0（根导出 / 深路径，深路径类型环境见 ../lib/recharts-deep.d.ts）
// + reselect + ./ChartShadcn + ../lib/rechartsChunkInternals（bundle 内部件转录）。
import { Curve, DefaultZIndexes, Layer, Text, Tooltip, ZIndexLayer } from 'recharts'; // 原 chart-iT2j9K3u Xt, Lt, Rn, V, i, G
import { createSelector } from 'reselect'; // 原 chart-iT2j9K3u wn
import { ChartContainer, ChartTooltip } from './ChartShadcn'; // 原 chart-iT2j9K3u t, a
import {
  lodashGetModule, // 原 chart-iT2j9K3u Ln
  pickId, // 原 chart-iT2j9K3u pt
  pickTooltipEventType, // 原 chart-iT2j9K3u _t
  selectPolarTooltipEvents, // 原 chart-iT2j9K3u jt
  combinePolarAppliedNumericalValues, // 原 chart-iT2j9K3u nt
  combineTooltipPayloadConfigurationsInput, // 原 chart-iT2j9K3u ot
  selectTooltipPayloadConfigurationsInput, // 原 chart-iT2j9K3u at
} from '../lib/rechartsChunkInternals';
import { combineTooltipPayload } from 'recharts/es6/state/selectors/combiners/combineTooltipPayload.js'; // 原 chart-iT2j9K3u $
import { selectChartLayout } from 'recharts/es6/context/chartLayoutContext.js'; // 原 chart-iT2j9K3u $t
import { SetTooltipEntrySettings } from 'recharts/es6/state/SetTooltipEntrySettings.js'; // 原 chart-iT2j9K3u A
import { getPercentValue, mathSign, interpolate, isNumber as isFunction } from 'recharts/es6/util/DataUtils.js'; // 原 chart-iT2j9K3u An, Fn, jn, Pn（Pn 局部名 isFunction，实为 isNumber）
import { RegisterGraphicalItemId } from 'recharts/es6/context/RegisterGraphicalItemId.js'; // 原 chart-iT2j9K3u D
import { resolveDefaultProps } from 'recharts/es6/util/resolveDefaultProps.js'; // 原 chart-iT2j9K3u Dn
import { SetPolarGraphicalItem } from 'recharts/es6/state/SetGraphicalItem.js'; // 原 chart-iT2j9K3u E
import { useAppSelector, useAppDispatch } from 'recharts/es6/state/hooks.js'; // 原 chart-iT2j9K3u En, Tn
import { pickAxisType } from 'recharts/es6/state/selectors/pickAxisType.js'; // 原 chart-iT2j9K3u Ft
import { svgPropertiesNoEventsFromUnknown, svgPropertiesNoEvents as svgPropertiesNoEventsOfProps } from 'recharts/es6/util/svgPropertiesNoEvents.js'; // 原 chart-iT2j9K3u Hn, Vn（Vn 局部名 svgPropertiesNoEventsOfProps，实为 svgPropertiesNoEvents）
import { selectActiveLabel, selectActiveTooltipIndex, selectActiveTooltipDataKey, selectActiveTooltipGraphicalItemId } from 'recharts/es6/state/selectors/tooltipSelectors.js'; // 原 chart-iT2j9K3u Ht, J, K, q
import { LabelListFromLabelProp, PolarLabelListContextProvider } from 'recharts/es6/component/LabelList.js'; // 原 chart-iT2j9K3u I, L
import { useAnimationId } from 'recharts/es6/util/useAnimationId.js'; // 原 chart-iT2j9K3u Jt
import { getMaxRadius, polarToCartesian } from 'recharts/es6/util/PolarUtils.js'; // 原 chart-iT2j9K3u Kt, qt
import { findAllByType } from 'recharts/es6/util/ReactUtils.js'; // 原 chart-iT2j9K3u M
import { getClassNameFromUnknown } from 'recharts/es6/util/getClassNameFromUnknown.js'; // 原 chart-iT2j9K3u P
import { pickAxisId } from 'recharts/es6/state/selectors/pickAxisId.js'; // 原 chart-iT2j9K3u Pt
import { combineAppliedValues, selectTooltipAxisDataKey, combineGraphicalItemsSettings, itemAxisPredicate, combineGraphicalItemsData, combineDisplayedData, selectAllErrorBarSettings as selectPolarAppliedNumericalValuesInput } from 'recharts/es6/state/selectors/axisSelectors.js'; // 原 chart-iT2j9K3u Q, gt, it, lt, rt, tt, ut（ut 局部名 selectPolarAppliedNumericalValuesInput，实为 selectAllErrorBarSettings）
import { selectChartDataAndAlwaysIgnoreIndexes } from 'recharts/es6/state/selectors/dataSelectors.js'; // 原 chart-iT2j9K3u Ut
import { arrayTooltipSearcher } from 'recharts/es6/state/optionsSlice.js'; // 原 chart-iT2j9K3u W
import { JavascriptAnimate } from 'recharts/es6/animation/JavascriptAnimate.js'; // 原 chart-iT2j9K3u Yt
import { ReportChartProps } from 'recharts/es6/state/ReportChartProps.js'; // 原 chart-iT2j9K3u c
import { selectChartOffsetInternal } from 'recharts/es6/state/selectors/selectChartOffsetInternal.js'; // 原 chart-iT2j9K3u cn
import { initialEventSettingsState } from 'recharts/es6/state/eventSettingsSlice.js'; // 原 chart-iT2j9K3u d
import { combineTooltipPayloadConfigurations } from 'recharts/es6/state/selectors/combiners/combineTooltipPayloadConfigurations.js'; // 原 chart-iT2j9K3u et
import { updatePolarOptions as setPolarOptions } from 'recharts/es6/state/polarOptionsSlice.js'; // 原 chart-iT2j9K3u f（局部名 setPolarOptions，实为 updatePolarOptions）
import { ChartDataContextProvider } from 'recharts/es6/context/chartDataContext.js'; // 原 chart-iT2j9K3u h
import { selectTooltipPayloadSearcher } from 'recharts/es6/state/selectors/selectTooltipPayloadSearcher.js'; // 原 chart-iT2j9K3u ht
import { Shape } from 'recharts/es6/util/ActiveShapeUtils.js'; // 原 chart-iT2j9K3u j
import { SetPolarLegendPayload } from 'recharts/es6/state/SetLegendPayload.js'; // 原 chart-iT2j9K3u k
import { adaptEventsOfChild } from 'recharts/es6/util/types.js'; // 原 chart-iT2j9K3u kn
import { ReportMainChartProps } from 'recharts/es6/state/ReportMainChartProps.js'; // 原 chart-iT2j9K3u l
import { DATA_ITEM_GRAPHICAL_ITEM_ID_ATTRIBUTE_NAME, DATA_ITEM_INDEX_ATTRIBUTE_NAME } from 'recharts/es6/util/Constants.js'; // 原 chart-iT2j9K3u ln, un
import { CategoricalChart } from 'recharts/es6/chart/CategoricalChart.js'; // 原 chart-iT2j9K3u o
import { ReportEventSettings } from 'recharts/es6/state/ReportEventSettings.js'; // 原 chart-iT2j9K3u s
import { RechartsStoreProvider } from 'recharts/es6/state/RechartsStoreProvider.js'; // 原 chart-iT2j9K3u u
import { getTooltipNameProp, getValueByDataKey } from 'recharts/es6/util/ChartUtils.js'; // 原 chart-iT2j9K3u vn, yn
import { selectTooltipEventType } from 'recharts/es6/state/selectors/selectTooltipEventType.js'; // 原 chart-iT2j9K3u vt

/* ─────────────────────────── 公共类型（推断） ─────────────────────────── */

type RechartsState = any;
interface PieSettings {
  id?: string;
  type: 'pie';
  dataKey?: string | number;
  nameKey?: string | number;
  name?: string;
  data?: unknown[];
  fill?: string;
  legendType?: string;
  tooltipType?: string;
  cx?: number | string;
  cy?: number | string;
  startAngle?: number;
  endAngle?: number;
  innerRadius?: number | string;
  outerRadius?: number | string | ((entry: unknown) => number | string);
  maxRadius?: number;
  minAngle?: number;
  paddingAngle?: number;
  cornerRadius?: number | string;
  presentationProps?: Record<string, unknown>;
  [key: string]: unknown;
}

/* ════════════════════════ vendor 段 1：极坐标选择器（polarSelectors.js / pieSelectors.js） ════════════════════════ */

/** 未过滤极坐标图形项。上游：polarSelectors.js selectUnfilteredPolarItems。 */
const selectUnfilteredPolarItems = (state: RechartsState) => state.graphicalItems.polarItems;

/** 极坐标图形项设置组合选择器。上游：selectPolarItemsSettings。 */
const selectPolarItemsSettings = createSelector(
  [selectUnfilteredPolarItems, pickId, createSelector([pickAxisType, pickAxisId], itemAxisPredicate)],
  combineGraphicalItemsSettings,
);
/** 极坐标图形项数据。上游：selectPolarGraphicalItemsData。 */
const selectPolarGraphicalItemsData = createSelector([selectPolarItemsSettings], combineGraphicalItemsData);
/** 极坐标显示数据。上游：selectPolarDisplayedData。 */
const selectPolarDisplayedData = createSelector([selectPolarGraphicalItemsData, selectChartDataAndAlwaysIgnoreIndexes], combineDisplayedData);
/** 极坐标应用值。上游：selectPolarAppliedValues。 */
const selectPolarAppliedValues = createSelector([selectPolarDisplayedData, pickId, selectPolarItemsSettings], combineAppliedValues);
/** 全部极坐标数值（含 errorBar 域计算用；结果未被引用——模块图保留项）。 */
createSelector([selectPolarDisplayedData, pickId, selectPolarItemsSettings], (data: any[], axisSettings: any, items: any[]) => {
  return items.length > 0
    ? data.flatMap((entry) => items.flatMap((item) => ({ value: getValueByDataKey(entry, axisSettings.dataKey ?? item.dataKey), errorDomain: [] }))).filter(Boolean)
    : axisSettings?.dataKey == null
      ? data.map((entry) => ({ value: entry, errorDomain: [] }))
      : data.map((entry) => ({ value: getValueByDataKey(entry, axisSettings.dataKey), errorDomain: [] }));
});

/** 极坐标不支持项的占位（恒 undefined）。// TODO(infer): 上游 unsupportedInPolarChart。 */
const unsupportedInPolarChart = () => undefined;

/**
 * 极坐标 tooltip 载荷选择器。// TODO(infer): 上游为极坐标版
 * selectTooltipPayload（selectors.js 的 polar 分支），深层输入按
 * 上游顺序命名，个别组合器未逐一溯源。
 */
const selectPolarTooltipPayload = createSelector(
  [
    pickId,
    selectChartLayout,
    selectPolarDisplayedData,
    selectPolarAppliedValues,
    selectActiveLabel,
    pickAxisType,
    createSelector(
      [pickId, selectTooltipPayloadSearcher, selectTooltipAxisDataKey, unsupportedInPolarChart, createSelector([selectPolarDisplayedData, pickId, selectPolarItemsSettings, selectPolarAppliedNumericalValuesInput, pickAxisType], combinePolarAppliedNumericalValues), unsupportedInPolarChart, selectChartLayout, pickAxisType],
      combineTooltipPayloadConfigurationsInput,
    ),
  ],
  combineTooltipPayload,
);

/** tooltip 事件/载荷派生链（模块图保留项，结果未被渲染路径引用）。 */
createSelector(
  [pickTooltipEventType, createSelector([pickId, selectPolarTooltipPayload, createSelector([selectPolarTooltipPayload, selectTooltipEventType, pickTooltipEventType], selectTooltipPayloadConfigurationsInput), pickAxisType], combineTooltipPayloadConfigurations)],
  selectPolarTooltipEvents,
);

/** 同步饼设置：按 id 取未过滤极坐标项中 type==='pie' 的条目。 */
const selectSynchronisedPieSettings = createSelector(
  [selectUnfilteredPolarItems, (_state: RechartsState, id: string | undefined) => id],
  (graphicalItems: any[], id: string | undefined) => graphicalItems.filter((item) => item.type === 'pie').find((item) => item.id === id),
);

/** 稳定空数组引用（防重渲染）。 */
const emptyArray: React.ReactElement[] = [];
/** cells 拾取器：空数组归一为稳定引用。 */
const pickCells = (_state: RechartsState, _id: string | undefined, cells?: React.ReactElement[]) => (cells?.length === 0 ? emptyArray : cells);

/** 饼显示数据：item.data 优先，其次图表数据，再次 cells 的 presentationProps。 */
const selectDisplayedData = createSelector(
  [selectChartDataAndAlwaysIgnoreIndexes, selectSynchronisedPieSettings, pickCells],
  (dataWithIndexes: any, pieSettings: PieSettings | undefined, cells?: React.ReactElement[]) => {
    const { chartData } = dataWithIndexes ?? {};
    if (pieSettings != null) {
      let displayedData: any[] | undefined = pieSettings?.data != null && pieSettings.data.length > 0 ? pieSettings.data : chartData;
      if ((!displayedData || !displayedData.length) && cells != null) {
        displayedData = cells.map((cell) => ({ ...pieSettings.presentationProps, ...(cell.props as Record<string, unknown>) }));
      }
      if (displayedData != null) return displayedData;
    }
    return undefined;
  },
);

/** 饼图例载荷：名称取 nameKey/name，颜色按 cell.fill > entry.fill > settings.fill 优先。 */
const selectPieLegend = createSelector(
  [selectDisplayedData, selectSynchronisedPieSettings, pickCells],
  (displayedData: any[] | undefined, pieSettings: PieSettings | undefined, cells?: React.ReactElement[]) => {
    if (displayedData == null || pieSettings == null) return undefined;
    return displayedData.map((entry, i) => {
      const name = getValueByDataKey(entry, pieSettings.nameKey, pieSettings.name);
      let color: string | undefined;
      if (cells != null && cells[i] != null && cells[i]!.props != null && (cells[i]!.props as { fill?: string }).fill) {
        color = (cells[i]!.props as { fill?: string }).fill;
      } else if (typeof entry === 'object' && entry != null && 'fill' in entry) {
        color = (entry as { fill: string }).fill;
      } else {
        color = pieSettings.fill;
      }
      return { value: getTooltipNameProp(name, pieSettings.dataKey), color, payload: entry, type: pieSettings.legendType };
    });
  },
);

/** 饼扇区几何选择器。 */
const selectPieSectors = createSelector(
  [selectDisplayedData, selectSynchronisedPieSettings, pickCells, selectChartOffsetInternal],
  (displayedData: any[] | undefined, pieSettings: PieSettings | undefined, cells: React.ReactElement[] | undefined, offset: any) => {
    if (pieSettings == null || displayedData == null) return undefined;
    return computePieSectors({ offset, pieSettings, displayedData, cells });
  },
);

/* ─────── babel 辅助（_objectSpread/_objectWithoutProperties/_extends，语义同上游编译产物） ─────── */

function _defineProperty(obj: any, key: any, value: any) {
  if ((key = _toPropertyKey(key)) in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey(arg: any) {
  const key = _toPrimitive(arg, 'string');
  return typeof key === 'symbol' ? key : key + '';
}
function _toPrimitive(input: any, hint?: string) {
  if (typeof input !== 'object' || !input) return input;
  const prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    const res = prim.call(input, hint || 'default');
    if (typeof res !== 'object') return res;
    throw TypeError('@@toPrimitive must return a primitive value.');
  }
  return (hint === 'string' ? String : Number)(input);
}
function _objectSpread(target: any, ..._sources: any[]) {
  for (let i = 1; i < arguments.length; i++) {
    const source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      _ownKeys(Object(source), true).forEach((key: any) => _defineProperty(target, key, source[key]));
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      _ownKeys(Object(source)).forEach((key: any) => Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)!));
    }
  }
  return target;
}
function _ownKeys(object: any, enumerableOnly?: boolean) {
  const keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    let symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter((sym) => Object.getOwnPropertyDescriptor(object, sym)?.enumerable);
    keys.push.apply(keys, symbols as unknown as string[]);
  }
  return keys;
}
function _objectWithoutProperties(obj: any, excluded: readonly string[]) {
  if (obj == null) return {};
  const target: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (excluded.indexOf(key) !== -1) continue;
      target[key] = obj[key];
    }
  }
  if (Object.getOwnPropertySymbols) {
    const symbols = Object.getOwnPropertySymbols(obj);
    for (let i = 0; i < symbols.length; i++) {
      const sym = symbols[i];
      if (excluded.indexOf(sym as unknown as string) === -1 && Object.prototype.propertyIsEnumerable.call(obj, sym)) target[sym] = obj[sym];
    }
  }
  return target;
}
function _extends(...args: any[]) {
  const target = args[0];
  for (let i = 1; i < args.length; i++) {
    const source = args[i];
    for (const key in source) if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
  }
  return target;
}

const _excludedPie = ['key'] as const;
const _excludedPie2 = ['onMouseEnter', 'onClick', 'onMouseLeave'] as const;
const _excludedPie3 = ['id'] as const;
const _excludedPie4 = ['id'] as const;

/* ════════════════════════ vendor 段 2：polar/Pie.js ════════════════════════ */

/** 饼图例载荷注册：取扇区选择器结果经 SetPolarLegendPayload 上报。 */
function SetPiePayloadLegend(props: any) {
  const cells = React.useMemo(() => findAllByType(props.children, Cell), [props.children]);
  const legendPayload = useAppSelector((state: RechartsState) => selectPieLegend(state, props.id, cells));
  if (legendPayload == null) return null;
  return <SetPolarLegendPayload legendPayload={legendPayload} />;
}

/** 从 activeShape 选项里提取 fill（元素取 props.fill，对象取 .fill）。 */
function getActiveShapeFill(activeShape: unknown): string | undefined {
  if (!(activeShape == null || typeof activeShape === 'boolean' || typeof activeShape === 'function')) {
    if (React.isValidElement(activeShape)) {
      const fill = (activeShape as React.ReactElement<{ fill?: unknown }>).props?.fill;
      return typeof fill === 'string' ? fill : undefined;
    }
    const { fill } = activeShape as { fill?: unknown };
    return typeof fill === 'string' ? fill : undefined;
  }
  return undefined;
}

/** 饼的 tooltip 条目设置：扇区逐一提供 dataDefinedOnItem 与定位函数。 */
const SetPieTooltipEntrySettings = React.memo((props: any) => {
  const { dataKey, nameKey, sectors, stroke, strokeWidth, fill, name, hide, tooltipType, id, activeShape } = props;
  const activeShapeFill = getActiveShapeFill(activeShape);
  const tooltipEntrySettings = {
    dataDefinedOnItem: sectors.map((entry: any) => {
      const tooltipPayload = entry.tooltipPayload;
      if (activeShapeFill == null || tooltipPayload == null) return tooltipPayload;
      return tooltipPayload.map((item: any) => ({ ...item, color: activeShapeFill, fill: activeShapeFill }));
    }),
    getPosition: (index: string) => sectors[Number(index)]?.tooltipPosition,
    settings: {
      stroke,
      strokeWidth,
      fill,
      dataKey,
      nameKey,
      name: getTooltipNameProp(name, dataKey),
      hide,
      type: tooltipType,
      color: fill,
      unit: '',
      graphicalItemId: id,
    },
  };
  return <SetTooltipEntrySettings tooltipEntrySettings={tooltipEntrySettings} />;
});

/** 标签文本锚点：终点在圆心右/左/正上。 */
const getTextAnchor = (x: number, cx: number) => (x > cx ? 'start' : x < cx ? 'end' : 'middle');

/** 外半径解析：函数型按数据点求值；百分比/数值按最大半径折算（缺省 80%）。 */
const getOuterRadius = (dataPoint: unknown, outerRadius: PieSettings['outerRadius'], maxPieRadius: number) => {
  if (typeof outerRadius === 'function') return getPercentValue(outerRadius(dataPoint), maxPieRadius, maxPieRadius * 0.8);
  return getPercentValue(outerRadius as number | string, maxPieRadius, maxPieRadius * 0.8);
};

/** 单数据点的极坐标解析：cx/cy/内外半径/最大半径。 */
const parseCoordinateOfPie = (pieSettings: PieSettings, offset: any, dataPoint: unknown) => {
  const { top, left, width, height } = offset;
  const maxPieRadius = getMaxRadius(width, height);
  return {
    cx: left + getPercentValue(pieSettings.cx as number | string, width, width / 2),
    cy: top + getPercentValue(pieSettings.cy as number | string, height, height / 2),
    innerRadius: getPercentValue(pieSettings.innerRadius as number | string, maxPieRadius, 0),
    outerRadius: getOuterRadius(dataPoint, pieSettings.outerRadius, maxPieRadius),
    maxRadius: pieSettings.maxRadius || Math.sqrt(width * width + height * height) / 2,
  };
};

/** 角度跨度（带方向，封顶 360）。 */
const parseDeltaAngle = (startAngle: number, endAngle: number) => mathSign(endAngle - startAngle) * Math.min(Math.abs(endAngle - startAngle), 360);

/** 标签引导线渲染：元素克隆 / 函数回调 / 缺省 Curve。 */
const renderLabelLineItem = (option: any, props: any) => {
  if (React.isValidElement(option)) return React.cloneElement(option, props);
  if (typeof option === 'function') return option(props);
  const className = clsx('recharts-pie-label-line', typeof option === 'boolean' ? '' : option.className);
  const { key } = props;
  const otherProps = _objectWithoutProperties(props, _excludedPie);
  return <Curve {...otherProps} type="linear" className={className} />;
};

/** 标签文本渲染：元素克隆 / 函数回调 / 缺省 Text。 */
const renderLabelItem = (option: any, props: any, value: unknown) => {
  if (React.isValidElement(option)) return React.cloneElement(option, props);
  let label = value;
  if (typeof option === 'function') {
    label = option(props);
    if (React.isValidElement(label)) return label;
  }
  const className = clsx('recharts-pie-label-text', getClassNameFromUnknown(option));
  return (
    <Text {...props} alignmentBaseline="middle" className={className}>
      {label}
    </Text>
  );
};

/** 饼标签群：每个扇区按中角外推 offsetRadius（缺省 20）放标签与引导线。 */
function PieLabels({ sectors, props, showLabels }: any) {
  const { label, labelLine, dataKey } = props;
  if (!showLabels || !label || !sectors) return null;
  const baseProps = svgPropertiesNoEventsOfProps(props);
  const labelProps = svgPropertiesNoEventsFromUnknown(label);
  const labelLineProps = svgPropertiesNoEventsFromUnknown(labelLine);
  const offsetRadius = (typeof label === 'object' && 'offsetRadius' in label && typeof label.offsetRadius === 'number' && label.offsetRadius) || 20;
  const labels = sectors.map((entry: any, i: number) => {
    const midAngle = (entry.startAngle + entry.endAngle) / 2;
    const endPoint = polarToCartesian(entry.cx, entry.cy, entry.outerRadius + offsetRadius, midAngle);
    const labelItemProps = {
      ...baseProps,
      ...entry,
      stroke: 'none',
      ...labelProps,
      index: i,
      textAnchor: getTextAnchor(endPoint.x, entry.cx),
      ...endPoint,
    };
    const lineItemProps = {
      ...baseProps,
      ...entry,
      fill: 'none',
      stroke: entry.fill,
      ...labelLineProps,
      index: i,
      points: [polarToCartesian(entry.cx, entry.cy, entry.outerRadius, midAngle), endPoint],
      key: 'line',
    };
    return (
      <ZIndexLayer zIndex={DefaultZIndexes.label} key={`label-${entry.startAngle}-${entry.endAngle}-${entry.midAngle}-${i}`}>
        <Layer>
          {labelLine && renderLabelLineItem(labelLine, lineItemProps)}
          {renderLabelItem(label, labelItemProps, getValueByDataKey(entry, dataKey))}
        </Layer>
      </ZIndexLayer>
    );
  });
  return <Layer className="recharts-pie-labels">{labels}</Layer>;
}

/** 标签分发：对象型且带 position 走 LabelListFromLabelProp，否则 PieLabels。 */
function PieLabelList({ sectors, props, showLabels }: any) {
  const { label } = props;
  if (typeof label === 'object' && label && 'position' in label) return <LabelListFromLabelProp label={label} />;
  return <PieLabels sectors={sectors} props={props} showLabels={showLabels} />;
}

/** 扇区群：命中判定（activeIndex + dataKey + graphicalItemId）+ 激活/非激活形状切换。 */
function PieSectors(props: any) {
  const { sectors, activeShape, inactiveShape, allOtherPieProps, shape, id } = props;
  const activeIndex = useAppSelector(selectActiveTooltipIndex);
  const activeDataKey = useAppSelector(selectActiveTooltipDataKey);
  const activeGraphicalItemId = useAppSelector(selectActiveTooltipGraphicalItemId);
  const { onMouseEnter, onClick, onMouseLeave } = allOtherPieProps;
  const restOfAllOtherProps = _objectWithoutProperties(allOtherPieProps, _excludedPie2);
  const onMouseEnterFromContext = useMouseEnterItemDispatch(onMouseEnter, allOtherPieProps.dataKey, id);
  const onMouseLeaveFromContext = useMouseLeaveItemDispatch(onMouseLeave);
  const onClickFromContext = useMouseClickItemDispatch(onClick, allOtherPieProps.dataKey, id);
  if (sectors == null || sectors.length === 0) return null;
  return (
    <>
      {sectors.map((entry: any, i: number) => {
        if (entry?.startAngle === 0 && entry?.endAngle === 0 && sectors.length !== 1) return null;
        const graphicalItemMatches = activeGraphicalItemId == null || activeGraphicalItemId === id;
        const isActive = String(i) === activeIndex && (activeDataKey == null || allOtherPieProps.dataKey === activeDataKey) && graphicalItemMatches;
        const inactiveShapeOption = activeShape && isActive ? activeShape : activeIndex ? inactiveShape : null;
        const sectorProps = {
          ...entry,
          stroke: entry.stroke,
          tabIndex: -1,
          [DATA_ITEM_INDEX_ATTRIBUTE_NAME]: i,
          [DATA_ITEM_GRAPHICAL_ITEM_ID_ATTRIBUTE_NAME]: id,
        };
        return (
          <Layer
            key={`sector-${entry?.startAngle}-${entry?.endAngle}-${entry.midAngle}-${i}`}
            tabIndex={-1}
            className="recharts-pie-sector"
            {...adaptEventsOfChild(restOfAllOtherProps, entry, i)}
            onMouseEnter={onMouseEnterFromContext(entry, i)}
            onMouseLeave={onMouseLeaveFromContext(entry, i)}
            onClick={onClickFromContext(entry, i)}
          >
            <Shape option={shape ?? inactiveShapeOption} index={i} shapeType="sector" isActive={isActive} {...sectorProps} />
          </Layer>
        );
      })}
    </>
  );
}

/**
 * 扇区几何计算（纯函数，上游导出同名）：按值占比分配角度，
 * 处理 minAngle 保底、paddingAngle 间隔、cornerRadius、tooltip 载荷与锚点。
 */
function computePieSectors(args: any): any[] | undefined {
  const { pieSettings, displayedData, cells, offset } = args;
  const { cornerRadius, startAngle, endAngle, dataKey, nameKey, tooltipType } = pieSettings;
  const minAngle = Math.abs(pieSettings.minAngle);
  const deltaAngle = parseDeltaAngle(startAngle, endAngle);
  const totalAngle = Math.abs(deltaAngle);
  const paddingAngle = displayedData.length <= 1 ? 0 : pieSettings.paddingAngle ?? 0;
  const nonZeroCount = displayedData.filter((entry: any) => getValueByDataKey(entry, dataKey, 0) !== 0).length;
  const totalPadding = (totalAngle >= 360 ? nonZeroCount : nonZeroCount - 1) * paddingAngle;
  const availableAngle = totalAngle - nonZeroCount * minAngle - totalPadding;
  const totalValue = displayedData.reduce((acc: number, entry: any) => {
    const value = getValueByDataKey(entry, dataKey, 0);
    return acc + (isFunction(value) ? 0 : (value as number) || 0);
  }, 0);
  let sectors: any[] | undefined;
  if (totalValue > 0) {
    let prev: any;
    sectors = displayedData.map((entry: any, i: number) => {
      const value = getValueByDataKey(entry, dataKey, 0);
      const name = getValueByDataKey(entry, nameKey, i);
      const coordinate = parseCoordinateOfPie(pieSettings, offset, entry);
      const percent = ((isFunction(value) ? 0 : (value as number)) || 0) / totalValue;
      let sectorStartAngle: number;
      const entryWithCells = { ...entry, ...(cells && cells[i] && cells[i].props) };
      const color = entryWithCells != null && 'fill' in entryWithCells && typeof entryWithCells.fill === 'string' ? entryWithCells.fill : pieSettings.fill;
      sectorStartAngle = i ? prev.endAngle + mathSign(deltaAngle) * paddingAngle * (value === 0 ? 0 : 1) : startAngle;
      const sectorEndAngle = sectorStartAngle + mathSign(deltaAngle) * ((value === 0 ? 0 : minAngle) + percent * availableAngle);
      const midAngle = (sectorStartAngle + sectorEndAngle) / 2;
      const middleRadius = (coordinate.innerRadius + coordinate.outerRadius) / 2;
      const tooltipPayload = [{ name, value, payload: entryWithCells, dataKey, type: tooltipType, color, fill: color, graphicalItemId: pieSettings.id }];
      const tooltipPosition = polarToCartesian(coordinate.cx, coordinate.cy, middleRadius, midAngle);
      prev = {
        ...pieSettings.presentationProps,
        percent,
        cornerRadius: typeof cornerRadius === 'string' ? parseFloat(cornerRadius) : cornerRadius,
        name,
        tooltipPayload,
        midAngle,
        middleRadius,
        tooltipPosition,
        ...entryWithCells,
        ...coordinate,
        value,
        dataKey,
        startAngle: sectorStartAngle,
        endAngle: sectorEndAngle,
        payload: entryWithCells,
        paddingAngle: mathSign(deltaAngle) * paddingAngle,
      };
      return prev;
    });
  }
  return sectors;
}

/** 扇区标签上下文供给（动画期间隐藏）。 */
function PieLabelListProvider({ showLabels, sectors, children }: any) {
  const labelListEntries = React.useMemo(() => {
    if (!showLabels || !sectors) return [];
    return sectors.map((entry: any) => ({
      value: entry.value,
      payload: entry.payload,
      clockWise: false,
      parentViewBox: undefined,
      viewBox: {
        cx: entry.cx,
        cy: entry.cy,
        innerRadius: entry.innerRadius,
        outerRadius: entry.outerRadius,
        startAngle: entry.startAngle,
        endAngle: entry.endAngle,
        clockWise: false,
      },
      fill: entry.fill,
    }));
  }, [sectors, showLabels]);
  return <PolarLabelListContextProvider value={showLabels ? labelListEntries : undefined}>{children}</PolarLabelListContextProvider>;
}

/** 扇区动画：角度插值（累积式，保持相邻扇区无缝衔接）。 */
function SectorsWithAnimation({ props, previousSectorsRef, id }: any) {
  const { sectors, isAnimationActive, animationBegin, animationDuration, animationEasing, activeShape, inactiveShape, onAnimationStart, onAnimationEnd } = props;
  const animationId = useAnimationId(props, 'recharts-pie-');
  const prevSectors = previousSectorsRef.current;
  const [isAnimating, setIsAnimating] = React.useState(false);
  const handleAnimationEnd = React.useCallback(() => {
    if (typeof onAnimationEnd === 'function') onAnimationEnd();
    setIsAnimating(false);
  }, [onAnimationEnd]);
  const handleAnimationStart = React.useCallback(() => {
    if (typeof onAnimationStart === 'function') onAnimationStart();
    setIsAnimating(true);
  }, [onAnimationStart]);
  return (
    <PieLabelListProvider showLabels={!isAnimating} sectors={sectors}>
      <JavascriptAnimate
        animationId={animationId}
        begin={animationBegin}
        duration={animationDuration}
        isActive={isAnimationActive}
        easing={animationEasing}
        onAnimationStart={handleAnimationStart}
        onAnimationEnd={handleAnimationEnd}
        key={animationId}
      >
        {(t: number) => {
          const stepData: any[] = [];
          let prevEndAngle = (sectors && sectors[0])?.startAngle ?? 0;
          sectors?.forEach((sector: any, index: number) => {
            const prev = prevSectors && prevSectors[index];
            const entryPadding = index > 0 ? lodashGetModule.default(sector, 'paddingAngle', 0) : 0;
            if (prev) {
              const angle = interpolate(prev.endAngle - prev.startAngle, sector.endAngle - sector.startAngle, t);
              const next = { ...sector, startAngle: prevEndAngle + entryPadding, endAngle: prevEndAngle + angle + entryPadding };
              stepData.push(next);
              prevEndAngle = next.endAngle;
            } else {
              const { endAngle, startAngle } = sector;
              const angle = interpolate(0, endAngle - startAngle, t);
              const next = { ...sector, startAngle: prevEndAngle + entryPadding, endAngle: prevEndAngle + angle + entryPadding };
              stepData.push(next);
              prevEndAngle = next.endAngle;
            }
          });
          previousSectorsRef.current = stepData;
          return (
            <Layer>
              <PieSectors sectors={stepData} activeShape={activeShape} inactiveShape={inactiveShape} allOtherPieProps={props} shape={props.shape} id={id} />
            </Layer>
          );
        }}
      </JavascriptAnimate>
      <PieLabelList showLabels={!isAnimating} sectors={sectors} props={props} />
      {props.children}
    </PieLabelListProvider>
  );
}

/** Pie 缺省 props。 */
const defaultPieProps = {
  animationBegin: 400,
  animationDuration: 1500,
  animationEasing: 'ease',
  cx: '50%',
  cy: '50%',
  dataKey: 'value',
  endAngle: 360,
  fill: '#808080',
  hide: false,
  innerRadius: 0,
  isAnimationActive: 'auto',
  label: false,
  labelLine: true,
  legendType: 'rect',
  minAngle: 0,
  nameKey: 'name',
  outerRadius: '80%',
  paddingAngle: 0,
  rootTabIndex: 0,
  startAngle: 0,
  stroke: '#fff',
  zIndex: DefaultZIndexes.area,
};

/** Pie 实现：扇区选择器 + tooltip 设置 + 动画渲染。 */
function PieImpl(props: any) {
  const { id } = props;
  const propsWithoutId = _objectWithoutProperties(props, _excludedPie3);
  const { hide, className, rootTabIndex } = props;
  const cells = React.useMemo(() => findAllByType(props.children, Cell), [props.children]);
  const sectors = useAppSelector((state: RechartsState) => selectPieSectors(state, id, cells));
  const previousSectorsRef = React.useRef(null);
  const layerClass = clsx('recharts-pie', className);
  if (hide || sectors == null) {
    previousSectorsRef.current = null;
    return <Layer tabIndex={rootTabIndex} className={layerClass} />;
  }
  return (
    <ZIndexLayer zIndex={props.zIndex}>
      <SetPieTooltipEntrySettings
        dataKey={props.dataKey}
        nameKey={props.nameKey}
        sectors={sectors}
        stroke={props.stroke}
        strokeWidth={props.strokeWidth}
        fill={props.fill}
        name={props.name}
        hide={props.hide}
        tooltipType={props.tooltipType}
        id={id}
        activeShape={props.activeShape}
      />
      <Layer tabIndex={rootTabIndex} className={layerClass}>
        <SectorsWithAnimation props={{ ...propsWithoutId, sectors }} previousSectorsRef={previousSectorsRef} id={id} />
      </Layer>
    </ZIndexLayer>
  );
}

/** Pie 组件入口：注册极坐标图形项 + 图例 + 实现层。 */
function PieFn(outsideProps: any) {
  const props = resolveDefaultProps(outsideProps, defaultPieProps);
  const { id } = props;
  const propsWithoutId = _objectWithoutProperties(props, _excludedPie4);
  const presentationProps = svgPropertiesNoEventsOfProps(propsWithoutId);
  return (
    <RegisterGraphicalItemId id={id} type="pie">
      {(registeredId: string) => (
        <>
          <SetPolarGraphicalItem
            type="pie"
            id={registeredId}
            data={propsWithoutId.data}
            dataKey={propsWithoutId.dataKey}
            hide={propsWithoutId.hide}
            angleAxisId={0}
            radiusAxisId={0}
            name={propsWithoutId.name}
            nameKey={propsWithoutId.nameKey}
            tooltipType={propsWithoutId.tooltipType}
            legendType={propsWithoutId.legendType}
            fill={propsWithoutId.fill}
            cx={propsWithoutId.cx}
            cy={propsWithoutId.cy}
            startAngle={propsWithoutId.startAngle}
            endAngle={propsWithoutId.endAngle}
            paddingAngle={propsWithoutId.paddingAngle}
            minAngle={propsWithoutId.minAngle}
            innerRadius={propsWithoutId.innerRadius}
            outerRadius={propsWithoutId.outerRadius}
            cornerRadius={propsWithoutId.cornerRadius}
            presentationProps={presentationProps}
            maxRadius={props.maxRadius}
          />
          <SetPiePayloadLegend {...propsWithoutId} id={registeredId} />
          <PieImpl {...propsWithoutId} id={registeredId} />
        </>
      )}
    </RegisterGraphicalItemId>
  );
}

/** recharts <Pie>（displayName 'Pie'）。 */
const Pie: typeof PieFn & { displayName?: string } = PieFn;
Pie.displayName = 'Pie';

/* ════════════════════════ vendor 段 3：chart/PolarChart.js + chart/PieChart.js ════════════════════════ */

/** ReportPolarOptions：把极坐标选项（cx/cy/角度/半径）写入 redux。 */
function ReportPolarOptions(props: any) {
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    dispatch(setPolarOptions(props));
  }, [dispatch, props]);
  return null;
}

const _excludedPolar = ['layout'] as const;

/** 极坐标图缺省 props（含事件设置初值）。 */
const defaultPolarChartProps = {
  accessibilityLayer: true,
  stackOffset: 'none',
  barCategoryGap: '10%',
  barGap: 4,
  margin: { top: 5, right: 5, bottom: 5, left: 5 },
  reverseStackOrder: false,
  syncMethod: 'index',
  layout: 'radial',
  responsive: false,
  cx: '50%',
  cy: '50%',
  innerRadius: 0,
  outerRadius: '80%',
  ...initialEventSettingsState,
};

/** 极坐标图骨架：redux store + 数据/布局/事件/极坐标选项上报 + CategoricalChart。 */
const PolarChart = React.forwardRef(function PolarChart(props: any, ref: React.Ref<any>) {
  const polarChartProps = resolveDefaultProps(props.categoricalChartProps, defaultPolarChartProps);
  const { layout } = polarChartProps;
  const otherCategoricalProps = _objectWithoutProperties(polarChartProps, _excludedPolar);
  const { chartName, defaultTooltipEventType, validateTooltipEventTypes, tooltipPayloadSearcher } = props;
  const options = { chartName, defaultTooltipEventType, validateTooltipEventTypes, tooltipPayloadSearcher, eventEmitter: undefined };
  return (
    <RechartsStoreProvider preloadedState={{ options }} reduxStoreName={polarChartProps.id ?? chartName}>
      <ChartDataContextProvider chartData={polarChartProps.data} />
      <ReportMainChartProps layout={layout} margin={polarChartProps.margin}>
        <ReportEventSettings throttleDelay={polarChartProps.throttleDelay} throttledEvents={polarChartProps.throttledEvents} />
        <ReportChartProps
          baseValue={undefined}
          accessibilityLayer={polarChartProps.accessibilityLayer}
          barCategoryGap={polarChartProps.barCategoryGap}
          maxBarSize={polarChartProps.maxBarSize}
          stackOffset={polarChartProps.stackOffset}
          barGap={polarChartProps.barGap}
          barSize={polarChartProps.barSize}
          syncId={polarChartProps.syncId}
          syncMethod={polarChartProps.syncMethod}
          className={polarChartProps.className}
          reverseStackOrder={polarChartProps.reverseStackOrder}
        />
        <ReportPolarOptions
          cx={polarChartProps.cx}
          cy={polarChartProps.cy}
          startAngle={polarChartProps.startAngle}
          endAngle={polarChartProps.endAngle}
          innerRadius={polarChartProps.innerRadius}
          outerRadius={polarChartProps.outerRadius}
        />
        <CategoricalChart {...otherCategoricalProps} ref={ref} />
      </ReportMainChartProps>
    </RechartsStoreProvider>
  );
});

/** 饼图缺省 props：极坐标缺省 + centric 布局 + 0..360 角度。 */
const defaultPieChartProps = { ...defaultPolarChartProps, layout: 'centric', startAngle: 0, endAngle: 360 };

const allowedPieTooltipTypes = ['item'];

/** recharts <PieChart>。 */
const PieChart = React.forwardRef((props: any, ref: React.Ref<any>) => {
  const propsWithDefaults = resolveDefaultProps(props, defaultPieChartProps);
  return (
    <PolarChart
      chartName="PieChart"
      defaultTooltipEventType="item"
      validateTooltipEventTypes={allowedPieTooltipTypes}
      tooltipPayloadSearcher={arrayTooltipSearcher}
      categoricalChartProps={propsWithDefaults}
      ref={ref}
    />
  );
});

/* ════════════════════════ first-party 段：模型用量占比饼图 ════════════════════════ */

/** 饼图分片上限：最多 6 片（超出部分归并 Other）。 */
const MAX_PIE_SLICES = 6;

/** 模型名兜底：空名显示「未知模型」文案。 */
function getPieModelLabel(intl: { formatMessage: (d: { id: string }) => string }, modelId?: string | null): string {
  return modelId?.trim() || intl.formatMessage({ id: 'settings.usage.unknownModel' });
}

/** 快照中单个模型的用量。 // TODO(infer): 完整类型在 usageStatsService。 */
interface ModelUsage {
  modelId?: string | null;
  totalTokens: number;
}
interface ModelUsageSnapshot {
  models: ModelUsage[];
}

/** 饼图切片。 */
interface PieSlice {
  key: string;
  label: string;
  color: string;
  totalTokens: number;
  share: number;
}

/**
 * 准备饼图数据：过滤 0 用量模型，取前若干片（>6 个模型时前 5 + Other），
 * 计算占比（总量为 0 时占比记 0），产出 chartConfig 与切片数组。
 */
function prepareModelPieChartData({ intl, snapshot }: { intl: { formatMessage: (d: { id: string }) => string }; snapshot: ModelUsageSnapshot }) {
  const positiveModels = snapshot.models.filter((m) => m.totalTokens > 0);
  const totalModelTokens = positiveModels.reduce((acc, m) => acc + m.totalTokens, 0);
  const hasOverflow = positiveModels.length > MAX_PIE_SLICES;
  const directSliceCount = hasOverflow ? MAX_PIE_SLICES - 1 : MAX_PIE_SLICES;
  const directSlices: PieSlice[] = positiveModels.slice(0, directSliceCount).map((model, index) => ({
    key: `model${index}`,
    label: getPieModelLabel(intl, model.modelId),
    color: getUsageChartColor(index),
    totalTokens: model.totalTokens,
    share: totalModelTokens > 0 ? model.totalTokens / totalModelTokens : 0,
  }));
  const overflowTokens = (hasOverflow ? positiveModels.slice(directSliceCount) : []).reduce((acc, m) => acc + m.totalTokens, 0);
  const otherSlices: PieSlice[] =
    overflowTokens > 0
      ? [
          {
            key: `model${directSliceCount}`,
            label: intl.formatMessage({ id: 'settings.usage.modelChart.other' }),
            color: getUsageChartColor(directSliceCount),
            totalTokens: overflowTokens,
            share: totalModelTokens > 0 ? overflowTokens / totalModelTokens : 0,
          },
        ]
      : [];
  const slices = [...directSlices, ...otherSlices];
  return {
    chartConfig: slices.reduce<Record<string, { label: string; color: string }>>((acc, slice) => {
      acc[slice.key] = { label: slice.label, color: slice.color };
      return acc;
    }, {}),
    chartData: slices,
    totalModelTokens,
  };
}

/** 饼图外边距（四周 4px）。 */
const PIE_CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };

/**
 * 「模型用量占比」环形饼图（原导出名 AppUsageModelUsagePieChart）。
 *
 * 布局：卡片标题 + （空数据显示空态卡片 | 左侧环形饼图 + 中心总量，
 * 右侧逐模型明细列表：色块 / 名称 / 占比 / token 数）。
 */
function AppUsageModelUsagePieChart({ snapshot }: { snapshot: ModelUsageSnapshot }) {
  const { intl, locale } = useZCodeIntl();
  const { chartConfig, chartData, totalModelTokens } = React.useMemo(() => prepareModelPieChartData({ intl, snapshot }), [intl, snapshot]);
  const tokenUnit = intl.formatMessage({ id: 'settings.usage.tokenUnit' });
  const tooltipFormatter = React.useCallback(
    (value: unknown, _name: unknown, item: { payload?: { totalTokens?: number; share?: number; label?: string; color?: string }; color?: string }) => {
      const payload = item.payload;
      const tokens = typeof value === 'number' ? value : payload?.totalTokens ?? 0;
      const share = payload?.share ?? 0;
      return (
        <>
          <div className="mt-0.5 h-2.5 w-1 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color ?? payload?.color }} />
          <div className="grid min-w-0 flex-1 gap-1">
            <div className="truncate text-foreground-subtle">{payload?.label ?? String(_name)}</div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono font-medium text-foreground tabular-nums">
                {formatCompactNumber(locale, tokens)} {tokenUnit}
              </span>
              <span className="font-mono text-foreground-subtle tabular-nums">{formatPercent(locale, share)}</span>
            </div>
          </div>
        </>
      );
    },
    [locale, tokenUnit],
  );
  // hideLabel/indicator/formatter 为 shadcn 内容层属性：原码直接透传给 recharts Tooltip（其对未知 props 不消费），故经 spread 透传
  const tooltipContent = React.useMemo(
    () => <ChartTooltip {...({ hideLabel: true, indicator: 'line', formatter: tooltipFormatter } as Record<string, unknown>)} />,
    [tooltipFormatter],
  );
  return (
    <section className="space-y-3 rounded-lg bg-surface p-4">
      <h3 className="text-ui-base font-medium text-foreground">{intl.formatMessage({ id: 'settings.usage.modelChartTitle' })}</h3>
      {totalModelTokens <= 0 ? (
        <UsageEmptyState
          title={intl.formatMessage({ id: 'settings.usage.emptyTitle' })}
          description={intl.formatMessage({ id: 'settings.usage.emptyDescription' })}
        />
      ) : (
        <div className="grid gap-4 rounded-md bg-surface/60 px-3 py-3 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
          <div className="relative mx-auto h-56 w-full max-w-64">
            <ChartContainer config={chartConfig} className="relative z-20 h-56 w-full">
              <PieChart accessibilityLayer margin={PIE_CHART_MARGIN}>
                <Tooltip cursor={false} content={tooltipContent} />
                <Pie
                  data={chartData}
                  dataKey="totalTokens"
                  nameKey="key"
                  innerRadius="56%"
                  outerRadius="86%"
                  paddingAngle={chartData.length > 1 ? 2 : 0}
                  stroke="var(--color-surface)"
                  strokeWidth={2}
                >
                  {chartData.map((slice) => (
                    <Cell key={slice.key} fill={`var(--color-${slice.key})`} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-8 text-center">
              <div className="max-w-full truncate text-lg font-semibold text-foreground">{formatCompactNumber(locale, totalModelTokens)}</div>
              <div className="max-w-full truncate text-ui-base text-foreground-subtle">{tokenUnit}</div>
            </div>
          </div>
          <div className="min-w-0 self-center" role="list">
            {chartData.map((slice) => (
              <div
                key={slice.key}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 border-b border-border/70 py-2 last:border-b-0"
                role="listitem"
              >
                <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: slice.color }} />
                <span className="min-w-0 truncate font-mono text-ui-base text-foreground">{slice.label}</span>
                <span className="font-mono text-ui-base text-foreground-subtle tabular-nums">{formatPercent(locale, slice.share)}</span>
                <span className="col-start-2 min-w-0 truncate text-ui-base text-foreground-subtle">
                  {formatCompactNumber(locale, slice.totalTokens)} {tokenUnit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export { AppUsageModelUsagePieChart };

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: exportName -> 原名(minified) -> 语义名
 * ════════════════════════════════════════════════════════════════════════
 * 导出符号（1 个）：
 *   AppUsageModelUsagePieChart -> Qt -> AppUsageModelUsagePieChart（原导出未混淆）
 *
 * first-party 局部符号（7 个）：
 *   - -> Q  -> MAX_PIE_SLICES               分片上限 6
 *   - -> Yt -> getPieModelLabel             模型名兜底
 *   - -> Xt -> prepareModelPieChartData     前 5 + Other 分片 + 占比
 *   - -> $  -> jsxRuntime                   （r()，jsx-runtime 命名空间）
 *   - -> Zt -> PIE_CHART_MARGIN             四周 4px
 *   - -> Qt -> AppUsageModelUsagePieChart   主组件
 *   - -> (无) -> PieSlice/ModelUsage 等类型  恢复版新增类型
 *
 * vendor 段符号（recharts@3.8.0，原名 -> 上游名 -> 上游文件）：
 *   B  -> selectUnfilteredPolarItems        selectors/polarSelectors.js
 *   V  -> selectPolarItemsSettings          selectors/polarSelectors.js
 *   H  -> selectPolarDisplayedData          selectors/polarSelectors.js
 *   Ge -> selectPolarAppliedValues          selectors/polarSelectors.js
 *   Ke -> unsupportedInPolarChart(占位)      （恒 undefined）
 *   qe -> selectPolarTooltipPayload         selectors（极坐标 tooltip 载荷，TODO(infer)）
 *   U  -> selectSynchronisedPieSettings     selectors/pieSelectors.js
 *   $e -> emptyArray                        selectors/pieSelectors.js
 *   W  -> pickCells                         selectors/pieSelectors.js
 *   et -> selectDisplayedData               selectors/pieSelectors.js
 *   tt -> selectPieLegend                   selectors/pieSelectors.js
 *   nt -> selectPieSectors                  selectors/pieSelectors.js
 *   pt -> SetPiePayloadLegend               polar/Pie.js
 *   mt -> getActiveShapeFill                polar/Pie.js
 *   ht -> SetPieTooltipEntrySettings        polar/Pie.js
 *   gt -> getTextAnchor                     polar/Pie.js
 *   _t -> getOuterRadius                    polar/Pie.js
 *   yt -> parseCoordinateOfPie              polar/Pie.js
 *   bt -> parseDeltaAngle                   polar/Pie.js
 *   xt -> renderLabelLineItem               polar/Pie.js
 *   St -> renderLabelItem                   polar/Pie.js
 *   Ct -> PieLabels                         polar/Pie.js
 *   wt -> PieLabelList                      polar/Pie.js
 *   Tt -> PieSectors                        polar/Pie.js
 *   Tt2-> computePieSectors                 polar/Pie.js（chunk 内名亦为 Tt 的
 *        同名纯函数——原码 `function Tt(e)` 与上游 computePieSectors 对应）
 *   Et -> PieLabelListProvider              polar/Pie.js
 *   Dt -> SectorsWithAnimation              polar/Pie.js
 *   Ot -> defaultPieProps                   polar/Pie.js
 *   kt -> PieImpl                           polar/Pie.js
 *   At -> PieFn                             polar/Pie.js
 *   jt -> Pie（displayName 'Pie'）           polar/Pie.js
 *   Mt -> ReportPolarOptions                state/ReportPolarOptions.js
 *   Bt -> defaultPolarChartProps            chart/PolarChart.js
 *   Vt -> PolarChart                        chart/PolarChart.js
 *   qt -> defaultPieChartProps              chart/PieChart.js
 *   Kt -> allowedPieTooltipTypes            chart/PieChart.js
 *   Jt -> PieChart                          chart/PieChart.js
 *   Nt -> DATA_ITEM_INDEX/GRAPHICAL_ITEM_ID 属性名常量（util 属性表）
 *   Je/Ye/Xe/Ze/Qe/Ht2/Gt2... -> babel 辅助（_extends/_objectSpread 等）
 *
 * 导入符号（跨 chunk 别名 -> 语义名）：
 *   chart-iT2j9K3u.js（recharts bundle）：$=combineTooltipPayload, $t=selectChartLayout,
 *     A=SetTooltipEntrySettings, An=getPercentValue, D=RegisterGraphicalItemId,
 *     Dn=resolveDefaultProps, E=SetPolarGraphicalItem, En=useAppSelector, Fn=mathSign,
 *     Ft=pickAxisType, G=ZIndexLayer, Hn=svgPropertiesNoEventsFromUnknown,
 *     Ht=selectActiveLabel(TODO(infer)), I=LabelListFromLabelProp, J=selectActiveTooltipIndex,
 *     Jt=useAnimationId, K=selectActiveTooltipDataKey, Kt=getMaxRadius,
 *     L=PolarLabelListContextProvider, Ln=lodash.get(默认互操作), Lt=DefaultZIndexes,
 *     M=findAllByType, P=getClassNameFromUnknown, Pn=isFunction, Pt=pickAxisId,
 *     Q=combineAppliedValues, Rn=Layer, Tn=useAppDispatch, Ut=selectChartDataAndAlwaysIgnoreIndexes,
 *     V=Text, Vn=svgPropertiesNoEvents, W=arrayTooltipSearcher, Xt=Curve, Yt=JavascriptAnimate,
 *     _t=pickTooltipEventType(TODO(infer)), a=ChartTooltip(chart.tsx), at/et/ge/ve/be/fe=tooltip
 *     配置链输入(TODO(infer)), c=ReportChartProps, cn=selectChartOffsetInternal,
 *     d=initialEventSettingsState, f=setPolarOptions, h=ChartDataContextProvider,
 *     ht=selectTooltipPayloadSearcher(TODO(infer)), i=Tooltip, it=combineGraphicalItemsSettings,
 *     j=Shape(ActiveShapeUtils), jn=interpolate, jt=selectPolarTooltipEvents(TODO(infer)),
 *     k=SetPolarLegendPayload, kn=adaptEventsOfChild, l=ReportMainChartProps,
 *     ln=DATA_ITEM_GRAPHICAL_ITEM_ID_ATTRIBUTE_NAME, lt=itemAxisPredicate,
 *     nt=combinePolarAppliedNumericalValues(TODO(infer)), o=CategoricalChart,
 *     ot=combineTooltipPayloadConfigurationsInput(TODO(infer)), pt=pickId,
 *     q=selectActiveTooltipGraphicalItemId, qt=polarToCartesian(util/PolarUtils),
 *     rt=combineGraphicalItemsData, s=ReportEventSettings, t=ChartContainer(chart.tsx),
 *     tt=combineDisplayedData, u=RechartsStoreProvider, un=DATA_ITEM_INDEX_ATTRIBUTE_NAME,
 *     ut=selectPolarAppliedNumericalValuesInput(TODO(infer)), vn=getTooltipNameProp,
 *     vt=selectTooltipEventType(TODO(infer)), wn=createSelector, yn=getValueByDataKey
 *   CartesianChart-nORn-0bc.js：t=CartesianChart（仅模块图引用，极坐标路径经 PolarChart）
 *   usageStatsUiParts-CiR7YEhh.js：a=formatCompactNumber, s=formatPercent, t=UsageEmptyState
 *   IntlProvider-C321H7m8.js：n=useZCodeIntl
 *   appUsageChartPalette-BeN2wLzW.js：a=Cell, i=useMouseLeaveItemDispatch,
 *     n=useMouseClickItemDispatch, r=useMouseEnterItemDispatch, t=getUsageChartColor
 *   bundle-mjs-D8tLE0rB.js：r=clsx
 * ════════════════════════════════════════════════════════════════════════ */
