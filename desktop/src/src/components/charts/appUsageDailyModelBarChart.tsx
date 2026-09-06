// A0-S4-4c: 自 modules/appUsageDailyModelBarChart.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/charts/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
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

import * as React from 'react';
import { clsx } from 'clsx';
import invariant from 'tiny-invariant'; // 原 tiny-invariant-Dm49c6Qj t
import { useZCodeIntl } from '../../modules/I18n'; // 原 IntlProvider-C321H7m8 n
// usageStatsUiParts 导出：a=紧凑数字格式化, c=模型名兜底, o=日期格式化, t=空态卡片
import {
  formatTokens as formatCompactNumber, // 原 usageStatsUiParts-CiR7YEhh a
  resolveModelLabel as getModelLabel, // 原 usageStatsUiParts-CiR7YEhh c
  formatUtcDateShort as formatUsageDate, // 原 usageStatsUiParts-CiR7YEhh o
  UsageEmptyState, // 原 usageStatsUiParts-CiR7YEhh t
} from '../../modules/UsageStatsUiParts';
// CartesianChart chunk = 纯 recharts 3.8.0 vendor：a=useNeedsClip, i=GraphicalItemClipPath,
// n=YAxis, o=SetErrorBarContext, r=XAxis, s=CartesianGrid, t=CartesianChart
import { CartesianChart } from 'recharts/es6/chart/CartesianChart.js'; // 原 CartesianChart-nORn-0bc t
import { useNeedsClip, GraphicalItemClipPath } from 'recharts/es6/cartesian/GraphicalItemClipPath.js'; // 原 CartesianChart-nORn-0bc a, i
import { XAxis, YAxis, CartesianGrid } from 'recharts'; // 原 CartesianChart-nORn-0bc r, n, s
import { SetErrorBarContext } from 'recharts/es6/context/ErrorBarContext.js'; // 原 CartesianChart-nORn-0bc o
// 已恢复的调色板模块（Cell / 事件 hooks / 取色）
import {
  Cell,
  useMouseLeaveItemDispatch,
  useMouseClickItemDispatch,
  useMouseEnterItemDispatch,
  getUsageChartColor,
} from '../../modules/appUsageChartPalette';
// chart-iT2j9K3u.js = recharts@3.8.0 bundle（+ chart.tsx 封装），别名映射见尾符号表。
// 改接 npm recharts@3.8.0（根导出 / 深路径，深路径类型环境见 ../lib/recharts-deep.d.ts）
// + reselect + ./ChartShadcn（shadcn 图表层）。
import { DefaultZIndexes, Layer, Tooltip, ZIndexLayer } from 'recharts'; // 原 chart-iT2j9K3u Lt, Rn, i, G
import { createSelector } from 'reselect'; // 原 chart-iT2j9K3u wn
import { ChartContainer, ChartTooltip } from '../../modules/ChartShadcn'; // 原 chart-iT2j9K3u t, a
import { selectChartLayout, useChartLayout } from 'recharts/es6/context/chartLayoutContext.js'; // 原 chart-iT2j9K3u $t, nn
import { SetTooltipEntrySettings } from 'recharts/es6/state/SetTooltipEntrySettings.js'; // 原 chart-iT2j9K3u A
import { getPercentValue, mathSign, isNan, isNullish, noop, interpolate, isNumber as isFunction } from 'recharts/es6/util/DataUtils.js'; // 原 chart-iT2j9K3u An, Fn, Mn, Nn, In, jn, Pn（Pn 局部名 isFunction，实为 isNumber）
import { isWellBehavedNumber as isNumber } from 'recharts/es6/util/isWellBehavedNumber.js'; // 原 chart-iT2j9K3u Cn（局部名 isNumber，实为 isWellBehavedNumber）
import { selectRootBarSize, selectBarGap, selectRootMaxBarSize, selectBarCategoryGap } from 'recharts/es6/state/selectors/rootPropsSelectors.js'; // 原 chart-iT2j9K3u Bt, Rt, Vt, zt
import { RegisterGraphicalItemId } from 'recharts/es6/context/RegisterGraphicalItemId.js'; // 原 chart-iT2j9K3u D
import { resolveDefaultProps } from 'recharts/es6/util/resolveDefaultProps.js'; // 原 chart-iT2j9K3u Dn
import { useAppSelector } from 'recharts/es6/state/hooks.js'; // 原 chart-iT2j9K3u En
import { CartesianLabelListContextProvider, LabelListFromLabelProp } from 'recharts/es6/component/LabelList.js'; // 原 chart-iT2j9K3u F, I
import { svgPropertiesNoEvents, svgPropertiesNoEventsFromUnknown } from 'recharts/es6/util/svgPropertiesNoEvents.js'; // 原 chart-iT2j9K3u Vn, Hn
import { selectActiveTooltipIndex, selectActiveTooltipDataKey } from 'recharts/es6/state/selectors/tooltipSelectors.js'; // 原 chart-iT2j9K3u J, K
import { useAnimationId } from 'recharts/es6/util/useAnimationId.js'; // 原 chart-iT2j9K3u Jt
import { findAllByType } from 'recharts/es6/util/ReactUtils.js'; // 原 chart-iT2j9K3u M
import { isStacked } from 'recharts/es6/state/types/StackedGraphicalItem.js'; // 原 chart-iT2j9K3u Mt
import { getStackSeriesIdentifier } from 'recharts/es6/util/stacks/getStackSeriesIdentifier.js'; // 原 chart-iT2j9K3u Nt
import { SetLegendPayload } from 'recharts/es6/state/SetLegendPayload.js'; // 原 chart-iT2j9K3u O
import { propsAreEqual } from 'recharts/es6/util/propsAreEqual.js'; // 原 chart-iT2j9K3u Qt
import { selectUnfilteredCartesianItems, selectAxisWithScale, selectCartesianAxisSize, selectTicksOfGraphicalItem, selectStackGroups } from 'recharts/es6/state/selectors/axisSelectors.js'; // 原 chart-iT2j9K3u St, ft, mt, xt, yt
import { SetCartesianGraphicalItem } from 'recharts/es6/state/SetGraphicalItem.js'; // 原 chart-iT2j9K3u T
import { arrayTooltipSearcher } from 'recharts/es6/state/optionsSlice.js'; // 原 chart-iT2j9K3u W
import { selectChartDataWithIndexesIfNotInPanoramaPosition3 } from 'recharts/es6/state/selectors/dataSelectors.js'; // 原 chart-iT2j9K3u Wt
import { JavascriptAnimate } from 'recharts/es6/animation/JavascriptAnimate.js'; // 原 chart-iT2j9K3u Yt
import { selectChartOffsetInternal, selectAxisViewBox } from 'recharts/es6/state/selectors/selectChartOffsetInternal.js'; // 原 chart-iT2j9K3u cn, sn
import { getBandSizeOfAxis, getBaseValueOfBar, getNormalizedStackId, getCateCoordinateOfBar, getTooltipNameProp, truncateByDomain, getValueByDataKey } from 'recharts/es6/util/ChartUtils.js'; // 原 chart-iT2j9K3u dn, fn, gn, pn, vn, xn, yn
import { Shape } from 'recharts/es6/util/ActiveShapeUtils.js'; // 原 chart-iT2j9K3u j
import { adaptEventsOfChild } from 'recharts/es6/util/types.js'; // 原 chart-iT2j9K3u kn
import { useIsPanorama } from 'recharts/es6/context/PanoramaContext.js'; // 原 chart-iT2j9K3u on

/* ─────────────────────────── 公共类型（推断） ─────────────────────────── */

/** 图表布局。把握度高（recharts 上游同名联合）。 */
type ChartLayout = 'horizontal' | 'vertical' | 'centric' | 'radial';
/* ── tombstone〔A1-R186〕死界面普查批第五批（components/charts/appUsageDailyModelBarChart.tsx：1 面／2 行，本批该文件共 1 碑）：本地 type AxisType@98-98（1 行）纯删，2 行等行墓碑在原位。判据〔A1-R176 立／A1-R183 v7／A1-R184 v8〕：一面为死当且仅当 Ⓐ本文件内无代码位读者落在其自身定义跨度之外，且 Ⓑ不带 export（或带 export 而无一家导入方把该名作 specifier 拉取）；级联＝读者全落在已判死之面内者亦判死，迭代至不动点（本批 3 轮收敛，全树 1924 面中得死面 66）。量测一律用 token 级 code-only 掩码 v8（单点模块导入、13 形自检 + 9 负对照），禁行首前缀法〔A1-R174 沉淀①〕。type AxisType：代码位读者 0（本文件内、其定义跨度外，逐行以掩码 v8 实测）；未 export ⇒ 跨文件读者结构性不可能。同名定义站：AxisType 施前全树 1 家、本批销 1 家 ⇒ 销账后该名自全树消失。
 *    折入上方单行文档注 @97-97「轴类型。」——係本面专属注（其 referent 即本面、无活体成员）⇒ 按〔A1-R176〕判据折入本碑，其散文逐字保留〔A1-R165 s8〕、定界符只描述不引用〔A1-R173 沉淀①〕。型-only 批：interface 与 type 别名皆非台账对象〔A1-R164 登记〕⇒ 台账 588/571/510 不得变动（反向哨兵：若变动即证动了 declare、须立即停批核查）；esbuild 擦除全部型构造 ⇒ 三 bundle 必逐字节全等〔A1-R173 沉淀③／A1-R174 沉淀⑥，可用于预测〕。原界面共 1 行（另有折入之单行文档注 1 行，合计 2 行），等行置换以保行数不变、免重锚；逐字原文见 git 历史。净零行：本碑 2 行置换原 2 行，文件行数 1335 不变、零重锚（本文件 appUsageDailyModelBarChart 引证密度：六形并集、去重键 (token,档,行)、扫描面 356 源 + 4 活文档＝去重 0 条（原始发射 0）；六形全树零命中 ⇒ 净零行非引证所强制，仍照本批工艺一律强制（等行墓碑），免与它文件引证口径分叉）。★口径须自载：六形係**下界**——R185 查出第七形「Name 型面（NNN）」，本批之骑手网另以 P0 裸名谓词兜底；两口径同判「净零行强制」故结论不受影响〔A1-R173 沉淀⑧〕。 ── */
/** recharts Redux state（宽松建模）。// TODO(infer): 完整切片未建模。 */
type RechartsState = any;
/** 柱状图设置项（graphicalItems.cartesianItems 中 type==='bar' 的条目）。 */
interface BarSettings {
  id?: string;
  type: 'bar';
  dataKey?: string | number;
  stackId?: string | number;
  barSize?: number | string;
  maxBarSize?: number | string;
  minPointSize?: number | ((value: unknown, index: number) => number);
  data?: unknown[];
  hide?: boolean;
  isPanorama?: boolean;
  hasCustomShape?: boolean;
  [key: string]: unknown;
}
/** 条带位置（某 stack/单柱在类目带内的偏移与宽度）。 */
interface BarPosition {
  stackId: string | number | undefined;
  dataKeys: Array<string | number>;
  position: { offset: number; size: number };
}
/** 尺寸列表条目（combineBarSizeList 输出）。 */
interface BarSizeEntry {
  stackId: string | number | undefined;
  dataKeys: Array<string | number>;
  barSize: number | undefined;
}

/* ════════════════════════ vendor 段 1：barSelectors 及其 combiner ════════════════════════
 * 上游：recharts/es6/state/selectors/barSelectors.js
 *       + state/selectors/combiners/{combineBarSizeList,combineAllBarPositions,
 *         combineBarPosition,combineStackedData}.js
 *       + state/selectors/graphicalItemSelectors.js（轴向 id 选择器）
 * ════════════════════════════════════════════════════════════════════════ */

/** 取单个柱的尺寸：自身尺寸优先，其次全局尺寸；百分比经 getPercentValue 折算。 */
const getBarSize = (globalSize: number | string | undefined, totalSize: number, selfSize?: number | string): number | undefined => {
  const barSize = selfSize ?? globalSize;
  if (isNullish(barSize)) return undefined;
  return getPercentValue(barSize, totalSize, 0);
};

/** 尺寸列表组合器：堆叠柱按 stackId 分组取首柱尺寸，非堆叠柱各自一条。 */
const combineBarSizeList = (allBars: BarSettings[], globalSize: number | string | undefined, totalSize: number): BarSizeEntry[] => {
  const initialValue: Record<string, BarSettings[]> = {};
  const stackedBars = allBars.filter(isStacked);
  const unstackedBars = allBars.filter((b) => b.stackId == null);
  const groupByStack = stackedBars.reduce((acc, bar) => {
    let s = acc[bar.stackId as string];
    s ??= [];
    s.push(bar);
    acc[bar.stackId as string] = s;
    return acc;
  }, initialValue);
  const stackedSizeList = Object.entries(groupByStack).map(([stackId, bars]) => ({
    stackId,
    dataKeys: bars.map((b) => b.dataKey as string | number),
    barSize: getBarSize(globalSize, totalSize, bars[0]?.barSize),
  }));
  const unstackedSizeList = unstackedBars.map((b) => ({
    stackId: undefined,
    dataKeys: [b.dataKey].filter((dk) => dk != null) as Array<string | number>,
    barSize: getBarSize(globalSize, totalSize, b.barSize),
  }));
  return [...stackedSizeList, ...unstackedSizeList];
};

/* babel _objectSpread2 辅助（上游编译产物自带，逐字保留语义） */
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
function _objectSpread(target: any, ...sources: any[]) {
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

/** 位置组合器：显式 barSize 时按尺寸和居中排布（超宽则 0.9 收缩），否则均分类目带。 */
function getBarPositions(
  barGap: number | string,
  barCategoryGap: number | string,
  bandSize: number,
  sizeList: BarSizeEntry[],
  maxBarSize: number | undefined,
): BarPosition[] | undefined {
  const len = sizeList.length;
  if (!(len < 1)) {
    let realBarGap = getPercentValue(barGap, bandSize, 0, true);
    let result: BarPosition[];
    const initialValue: BarPosition[] = [];
    if (isNumber(sizeList[0]?.barSize)) {
      let useFull = false;
      let fullBarSize = bandSize / len;
      let sum = sizeList.reduce((res, entry) => res + (entry.barSize || 0), 0);
      sum += (len - 1) * realBarGap;
      if (sum >= bandSize) {
        sum -= (len - 1) * realBarGap;
        realBarGap = 0;
      }
      if (sum >= bandSize && fullBarSize > 0) {
        useFull = true;
        fullBarSize *= 0.9;
        sum = len * fullBarSize;
      }
      const prev = { offset: (((bandSize - sum) / 2) >> 0) - realBarGap, size: 0 };
      result = sizeList.reduce((res, entry) => {
        const newPosition: BarPosition = {
          stackId: entry.stackId,
          dataKeys: entry.dataKeys,
          position: { offset: prev.offset + prev.size + realBarGap, size: useFull ? fullBarSize : entry.barSize ?? 0 },
        };
        const newRes = [...res, newPosition];
        prev.offset = newPosition.position.offset;
        prev.size = newPosition.position.size;
        return newRes;
      }, initialValue);
    } else {
      const categoryOffset = getPercentValue(barCategoryGap, bandSize, 0, true);
      if (bandSize - 2 * categoryOffset - (len - 1) * realBarGap <= 0) realBarGap = 0;
      let originalSize = (bandSize - 2 * categoryOffset - (len - 1) * realBarGap) / len;
      if (originalSize > 1) originalSize >>= 0;
      const size = isNumber(maxBarSize) ? Math.min(originalSize, maxBarSize!) : originalSize;
      result = sizeList.reduce(
        (res, entry, i) => [
          ...res,
          {
            stackId: entry.stackId,
            dataKeys: entry.dataKeys,
            position: { offset: categoryOffset + (originalSize + realBarGap) * i + (originalSize - size) / 2, size },
          },
        ],
        initialValue,
      );
    }
    return result;
  }
  return undefined;
}

/** 全部柱位置组合器：带尺寸与类目带尺寸不一致时做居中偏移补偿。 */
const combineAllBarPositions = (
  sizeList: BarSizeEntry[],
  maxBarSize: number | undefined,
  barGap: number | string,
  barCategoryGap: number | string,
  bandSize: number,
  axisBandSize: number | undefined, // selectAxisBandSize 可返回 undefined（与 recharts barSelectors 一致）
  userMaxBarSize?: number,
): BarPosition[] | undefined => {
  const effectiveMaxBarSize = isNullish(userMaxBarSize) ? maxBarSize : userMaxBarSize;
  let positions = getBarPositions(barGap, barCategoryGap, bandSize === axisBandSize ? axisBandSize : bandSize, sizeList, effectiveMaxBarSize);
  if (bandSize !== axisBandSize && positions != null) {
    positions = positions.map((p) => ({
      ...p,
      position: { ...p.position, offset: p.position.offset - bandSize / 2 },
    }));
  }
  return positions;
};

/** 堆叠数据组合器：按 stackSeriesIdentifier 在堆叠组中取对应序列。 */
const combineStackedData = (stackGroups: any, barSettings: BarSettings | undefined) => {
  const stackSeriesIdentifier = getStackSeriesIdentifier(barSettings);
  if (!stackGroups || stackSeriesIdentifier == null || barSettings == null) return undefined;
  const { stackId } = barSettings;
  if (stackId == null) return undefined;
  const stackGroup = stackGroups[stackId as string];
  if (!stackGroup) return undefined;
  const { stackedData } = stackGroup;
  if (!stackedData) return undefined;
  return stackedData.find((sd: any) => sd.key === stackSeriesIdentifier);
};

/** 单柱位置组合器：在全部位置中按 stackId + dataKey 命中。 */
const combineBarPosition = (allBarPositions: BarPosition[] | undefined, barSettings: BarSettings | undefined) => {
  if (allBarPositions == null || barSettings == null) return undefined;
  const position = allBarPositions.find(
    (p) => p.stackId === barSettings.stackId && barSettings.dataKey != null && p.dataKeys.includes(barSettings.dataKey as string | number),
  );
  if (position != null) return position.position;
  return undefined;
};

/** 取柱条目的 zIndex（非法时回退缺省）。上游：zIndex/getZIndexFromUnknown。 */
function getZIndex(entry: unknown, fallback: number): number {
  return entry && typeof entry === 'object' && 'zIndex' in entry && typeof (entry as { zIndex: unknown }).zIndex === 'number' && isNumber((entry as { zIndex: number }).zIndex)
    ? (entry as { zIndex: number }).zIndex
    : fallback;
}

/** 按图形项 id 取其 xAxisId（缺省 0）。上游：graphicalItemSelectors。 */
function selectXAxisIdFromGraphicalItemId(state: RechartsState, id: string | undefined): number | string {
  return state.graphicalItems.cartesianItems.find((item: any) => item.id === id)?.xAxisId ?? 0;
}
/** 按图形项 id 取其 yAxisId（缺省 0）。上游：graphicalItemSelectors。 */
function selectYAxisIdFromGraphicalItemId(state: RechartsState, id: string | undefined): number | string {
  return state.graphicalItems.cartesianItems.find((item: any) => item.id === id)?.yAxisId ?? 0;
}

/** 同步柱设置：按 id 取未过滤柱条目（与 props 同步的权威来源）。 */
const selectSynchronisedBarSettings = createSelector(
  [selectUnfilteredCartesianItems, (_state: RechartsState, id: string | undefined) => id],
  (graphicalItems: any[], id: string | undefined) => graphicalItems.filter((item) => item.type === 'bar').find((item) => item.id === id),
);
/** 根级 maxBarSize。 */
const selectMaxBarSize = createSelector([selectSynchronisedBarSettings], (barSettings: any) => barSettings?.maxBarSize);
/** cells 拾取器（第 4 参原样返回）。 */
const pickCells = (_state: RechartsState, _id: string | undefined, _isPanorama: boolean, cells: React.ReactElement[]) => cells;
/** isPanorama 拾取器（第 3 参原样返回）。 */
const pickIsPanorama = (_state: RechartsState, _id: string | undefined, isPanorama: boolean) => isPanorama;
/** 全部可见柱：同轴 + 同全景标志 + 未隐藏 + 类型为 bar。 */
const selectAllVisibleBars = createSelector(
  [selectChartLayout, selectUnfilteredCartesianItems, selectXAxisIdFromGraphicalItemId, selectYAxisIdFromGraphicalItemId, pickIsPanorama],
  (layout: ChartLayout, allItems: any[], xAxisId: number | string, yAxisId: number | string, isPanorama: boolean) =>
    allItems
      .filter((i) => (layout === 'horizontal' ? i.xAxisId === xAxisId : i.yAxisId === yAxisId))
      .filter((i) => i.isPanorama === isPanorama)
      .filter((i) => i.hide === false)
      .filter((i) => i.type === 'bar'),
);
/** 柱所属堆叠组（按轴向取）。 */
const selectBarStackGroups = (state: RechartsState, id: string | undefined, isPanorama: boolean) => {
  const layout = selectChartLayout(state);
  const xAxisId = selectXAxisIdFromGraphicalItemId(state, id);
  const yAxisId = selectYAxisIdFromGraphicalItemId(state, id);
  if (xAxisId == null || yAxisId == null) return undefined;
  return layout === 'horizontal' ? selectStackGroups(state, 'yAxis', yAxisId, isPanorama) : selectStackGroups(state, 'xAxis', xAxisId, isPanorama);
};
/** 柱所在类目轴的条带尺寸（含 maxBarSize 兜底链）。 */
const selectBarBandSize = (state: RechartsState, id: string | undefined, isPanorama: boolean): number => {
  const barSettings = selectSynchronisedBarSettings(state, id);
  if (barSettings == null) return 0;
  const xAxisId = selectXAxisIdFromGraphicalItemId(state, id);
  const yAxisId = selectYAxisIdFromGraphicalItemId(state, id);
  if (xAxisId == null || yAxisId == null) return 0;
  const layout = selectChartLayout(state);
  const globalMaxBarSize = selectRootMaxBarSize(state);
  const { maxBarSize: childMaxBarSize } = barSettings;
  const maxBarSize = isNullish(childMaxBarSize) ? globalMaxBarSize : childMaxBarSize;
  let axis: any, ticks: any;
  if (layout === 'horizontal') {
    axis = selectAxisWithScale(state, 'xAxis', xAxisId, isPanorama);
    ticks = selectTicksOfGraphicalItem(state, 'xAxis', xAxisId, isPanorama);
  } else {
    axis = selectAxisWithScale(state, 'yAxis', yAxisId, isPanorama);
    ticks = selectTicksOfGraphicalItem(state, 'yAxis', yAxisId, isPanorama);
  }
  return getBandSizeOfAxis(axis, ticks, true) ?? maxBarSize ?? 0;
};
/** 轴条带尺寸（不含 maxBarSize 兜底）。 */
const selectAxisBandSize = (state: RechartsState, id: string | undefined, isPanorama: boolean): number | undefined => {
  const layout = selectChartLayout(state);
  const xAxisId = selectXAxisIdFromGraphicalItemId(state, id);
  const yAxisId = selectYAxisIdFromGraphicalItemId(state, id);
  if (xAxisId == null || yAxisId == null) return undefined;
  let axis: any, ticks: any;
  if (layout === 'horizontal') {
    axis = selectAxisWithScale(state, 'xAxis', xAxisId, isPanorama);
    ticks = selectTicksOfGraphicalItem(state, 'xAxis', xAxisId, isPanorama);
  } else {
    axis = selectAxisWithScale(state, 'yAxis', yAxisId, isPanorama);
    ticks = selectTicksOfGraphicalItem(state, 'yAxis', yAxisId, isPanorama);
  }
  return getBandSizeOfAxis(axis, ticks);
};
/** 尺寸列表选择器。 */
const selectBarSizeList = createSelector([selectAllVisibleBars, selectRootBarSize, selectCartesianAxisSize], combineBarSizeList);
/** 全部柱位置选择器。 */
const selectAllBarPositions = createSelector(
  [selectBarSizeList, selectRootMaxBarSize, selectBarGap, selectBarCategoryGap, selectBarBandSize, selectAxisBandSize, selectMaxBarSize],
  combineAllBarPositions,
);
/** 单柱位置选择器。 */
const selectBarPosition = createSelector([selectAllBarPositions, selectSynchronisedBarSettings], combineBarPosition);
/** 单柱堆叠数据选择器。 */
const selectStackedDataOfItem = createSelector([selectBarStackGroups, selectSynchronisedBarSettings], combineStackedData);
/** 带刻度的轴向选择器组（按柱 id 定向）。 */
const selectXAxisWithScale = (state: RechartsState, id: string | undefined, isPanorama: boolean) => {
  const xAxisId = selectXAxisIdFromGraphicalItemId(state, id);
  if (xAxisId != null) return selectAxisWithScale(state, 'xAxis', xAxisId, isPanorama);
  return undefined;
};
const selectYAxisWithScale = (state: RechartsState, id: string | undefined, isPanorama: boolean) => {
  const yAxisId = selectYAxisIdFromGraphicalItemId(state, id);
  if (yAxisId != null) return selectAxisWithScale(state, 'yAxis', yAxisId, isPanorama);
  return undefined;
};
const selectXAxisTicks = (state: RechartsState, id: string | undefined, isPanorama: boolean) => {
  const xAxisId = selectXAxisIdFromGraphicalItemId(state, id);
  if (xAxisId != null) return selectTicksOfGraphicalItem(state, 'xAxis', xAxisId, isPanorama);
  return undefined;
};
const selectYAxisTicks = (state: RechartsState, id: string | undefined, isPanorama: boolean) => {
  const yAxisId = selectYAxisIdFromGraphicalItemId(state, id);
  if (yAxisId != null) return selectTicksOfGraphicalItem(state, 'yAxis', yAxisId, isPanorama);
  return undefined;
};

/**
 * 柱矩形总选择器：数据切片 + 位置 + 轴刻度 + 堆叠数据齐备时，
 * 调 computeBarRectangles 生成每个数据点的矩形几何。
 */
const selectBarRectangles = createSelector(
  [
    selectChartOffsetInternal,
    selectAxisViewBox,
    selectXAxisWithScale,
    selectYAxisWithScale,
    selectXAxisTicks,
    selectYAxisTicks,
    selectBarPosition,
    selectChartLayout,
    selectChartDataWithIndexesIfNotInPanoramaPosition3,
    selectAxisBandSize,
    selectStackedDataOfItem,
    selectSynchronisedBarSettings,
    pickCells,
  ],
  (offset, axisViewBox, xAxis, yAxis, xAxisTicks, yAxisTicks, pos, layout, dataWithIndexes, bandSize, stackedData, barSettings, cells) => {
    const { chartData, dataStartIndex, dataEndIndex } = dataWithIndexes ?? {};
    if (
      barSettings == null ||
      pos == null ||
      axisViewBox == null ||
      (layout !== 'horizontal' && layout !== 'vertical') ||
      xAxis == null ||
      yAxis == null ||
      xAxisTicks == null ||
      yAxisTicks == null ||
      bandSize == null
    ) {
      return undefined;
    }
    const { data } = barSettings;
    const displayedData = data != null && data.length > 0 ? data : chartData?.slice(dataStartIndex, dataEndIndex + 1);
    if (displayedData == null) return undefined;
    return computeBarRectangles({
      layout,
      barSettings,
      pos,
      parentViewBox: axisViewBox,
      bandSize,
      xAxis,
      yAxis,
      xAxisTicks,
      yAxisTicks,
      stackedData,
      displayedData,
      offset,
      cells,
      dataStartIndex,
    });
  },
);

/* ════════════════════════ vendor 段 2：BarStack 上下文（cartesian/BarStack.js 节选） ════════════════════════ */

/** 堆叠上下文（BarStack 组件提供；本图未用 BarStack，恒为 undefined）。 */
const BarStackContext = React.createContext<{ stackId: string | number; radius?: number } | undefined>(undefined);

/** 解析柱的 stackId：上下文优先，其次 props（经规范化）。 */
const useStackId = (childStackId?: string | number) => {
  const stackSettings = React.useContext(BarStackContext);
  if (stackSettings != null) return stackSettings.stackId;
  if (childStackId == null) return undefined;
  return getNormalizedStackId(childStackId);
};

/** 堆叠圆角裁剪 id：`recharts-bar-stack-clip-path-<stackId>-<index>`。 */
const getBarStackClipPathId = (stackId: string | number, index: number) => `recharts-bar-stack-clip-path-${stackId}-${index}`;

/** 取堆叠裁剪 url（无上下文时 undefined）。 */
const useBarStackClipPathUrl = (index: number) => {
  const barStackContext = React.useContext(BarStackContext);
  if (barStackContext != null) {
    const { stackId } = barStackContext;
    return `url(#${getBarStackClipPathId(stackId, index)})`;
  }
  return undefined;
};

/** 堆叠裁剪层：给每根柱套一层带 clipPath 的 Layer（无上下文时透传）。 */
const BarStackClipLayer = ({ index, ...rest }: { index: number } & Record<string, unknown>) => {
  const clipPathUrl = useBarStackClipPathUrl(index);
  return <Layer className="recharts-bar-stack-layer" clipPath={clipPathUrl} {...rest} />;
};

/* ════════════════════════ vendor 段 3：cartesian/Bar.js ════════════════════════ */

const _excluded = ['onMouseEnter', 'onMouseLeave', 'onClick'] as const;
const _excluded2 = ['value', 'background', 'tooltipPosition'] as const;
const _excluded3 = ['id'] as const;
const _excluded4 = ['onMouseEnter', 'onClick', 'onMouseLeave'] as const;

/** babel _extends（Object.assign 语义）。 */
function _extends(...args: any[]) {
  const target = args[0];
  for (let i = 1; i < args.length; i++) {
    const source = args[i];
    for (const key in source) if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
  }
  return target;
}
/** babel _objectWithoutProperties（剔除指定键，含 Symbol）。 */
function _objectWithoutProperties(obj: any, excluded: readonly string[]) {
  if (obj == null) return {};
  const target: any = _objectWithoutPropertiesLoose(obj, excluded);
  if (Object.getOwnPropertySymbols) {
    const symbols = Object.getOwnPropertySymbols(obj);
    for (let i = 0; i < symbols.length; i++) {
      const sym = symbols[i];
      if (excluded.indexOf(sym as unknown as string) === -1 && Object.prototype.propertyIsEnumerable.call(obj, sym)) target[sym] = obj[sym];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose(source: any, excluded: readonly string[]) {
  if (source == null) return {};
  const target: any = {};
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (excluded.indexOf(key) !== -1) continue;
      target[key] = source[key];
    }
  }
  return target;
}

/**
 * BarRectangle（util/BarUtils.js）：在通用 Shape（ActiveShapeUtils）上
 * 固定矩形形状与激活/非激活类名。
 */
function BarRectangle(props: any) {
  return (
    <Shape
      shapeType="rectangle"
      activeClassName="recharts-active-bar"
      inActiveClassName="recharts-inactive-bar"
      {...props}
    />
  );
}

/** 图例载荷工厂：柱 -> 单条图例项（颜色取 fill）。 */
const computeLegendPayloadFromBarData = (props: any) => {
  const { dataKey, name, fill, legendType, hide } = props;
  return [{ inactive: hide, dataKey, type: legendType, color: fill, value: getTooltipNameProp(name, dataKey), payload: props }];
};

/** 柱的 tooltip 条目设置（注册进 tooltip 状态）。 */
const SetBarTooltipEntrySettings = React.memo((props: any) => {
  const { dataKey, stroke, strokeWidth, fill, name, hide, unit, tooltipType, id } = props;
  const tooltipEntrySettings = {
    dataDefinedOnItem: undefined,
    getPosition: noop,
    settings: {
      stroke,
      strokeWidth,
      fill,
      dataKey,
      nameKey: undefined,
      name: getTooltipNameProp(name, dataKey),
      hide,
      type: tooltipType,
      color: fill,
      unit,
      graphicalItemId: id,
    },
  };
  return <SetTooltipEntrySettings tooltipEntrySettings={tooltipEntrySettings} />;
});

/** 柱背景：每个数据点一根 #eee 背景柱（挂全套交互事件）。 */
function BarBackground(props: any) {
  const activeIndex = useAppSelector(selectActiveTooltipIndex);
  const { data, dataKey, background: backgroundFromProps, allOtherBarProps } = props;
  const { onMouseEnter: onMouseEnterFromProps, onMouseLeave: onMouseLeaveFromProps, onClick: onItemClickFromProps } = allOtherBarProps;
  const restOfAllOtherProps = _objectWithoutProperties(allOtherBarProps, _excluded);
  const onMouseEnterFromContext = useMouseEnterItemDispatch(onMouseEnterFromProps, dataKey, allOtherBarProps.id);
  const onMouseLeaveFromContext = useMouseLeaveItemDispatch(onMouseLeaveFromProps);
  const onClickFromContext = useMouseClickItemDispatch(onItemClickFromProps, dataKey, allOtherBarProps.id);
  if (!backgroundFromProps || data == null) return null;
  const backgroundProps = svgPropertiesNoEventsFromUnknown(backgroundFromProps);
  return (
    <ZIndexLayer zIndex={getZIndex(backgroundFromProps, DefaultZIndexes.barBackground)}>
      {data.map((entry: any, i: number) => {
        const { value, background: backgroundFromDataEntry, tooltipPosition } = entry;
        const rest = _objectWithoutProperties(entry, _excluded2);
        if (!backgroundFromDataEntry) return null;
        const onMouseEnter = onMouseEnterFromContext(entry, i);
        const onMouseLeave = onMouseLeaveFromContext(entry, i);
        const onClick = onClickFromContext(entry, i);
        const barRectangleProps = {
          option: backgroundFromProps,
          isActive: String(i) === activeIndex,
          ...rest,
          fill: '#eee',
          ...backgroundFromDataEntry,
          ...backgroundProps,
          ...adaptEventsOfChild(restOfAllOtherProps, entry, i),
          onMouseEnter,
          onMouseLeave,
          onClick,
          dataKey,
          index: i,
          className: 'recharts-bar-background-rectangle',
        };
        return <BarRectangle key={`background-bar-${i}`} {...barRectangleProps} />;
      })}
    </ZIndexLayer>
  );
}

/** 标签上下文供给：把矩形几何转成 LabelList 条目（动画期间隐藏标签）。 */
function BarLabelListProvider({ showLabels, children, rects }: any) {
  const labelListEntries = rects?.map((entry: any) => {
    const viewBox = { x: entry.x, y: entry.y, width: entry.width, lowerWidth: entry.width, upperWidth: entry.width, height: entry.height };
    return { ...viewBox, value: entry.value, payload: entry.payload, parentViewBox: entry.parentViewBox, viewBox, fill: entry.fill };
  });
  return <CartesianLabelListContextProvider value={showLabels ? labelListEntries : undefined}>{children}</CartesianLabelListContextProvider>;
}

/**
 * 激活态柱：命中 activeTooltipIndex（共享 tooltip 时忽略 dataKey，
 * 独占时须同 dataKey）时进高亮层，并用 rAF 两阶段触发 CSS 过渡。
 */
function BarRectangleWithActiveState(props: any) {
  const { shape, activeBar, baseProps, entry, index, dataKey } = props;
  const activeIndex = useAppSelector(selectActiveTooltipIndex);
  const activeDataKey = useAppSelector(selectActiveTooltipDataKey);
  const isActive = activeBar && String(entry.originalDataIndex) === activeIndex && (activeDataKey == null || dataKey === activeDataKey);
  const [stayInLayer, setStayInLayer] = React.useState(false);
  const [hasMountedActive, setHasMountedActive] = React.useState(false);
  React.useEffect(() => {
    let rafId: number | undefined;
    if (isActive) {
      setStayInLayer(true);
      rafId = requestAnimationFrame(() => setHasMountedActive(true));
    } else {
      setHasMountedActive(false);
    }
    return () => cancelAnimationFrame(rafId as number);
  }, [isActive]);
  const handleTransitionEnd = React.useCallback(() => {
    if (!isActive) setStayInLayer(false);
  }, [isActive]);
  const isVisuallyActive = isActive && hasMountedActive;
  const shouldRenderInLayer = isActive || stayInLayer;
  const option = isActive ? (activeBar === true ? shape : activeBar) : shape;
  const content = (
    <BarRectangle {...baseProps} name={String(baseProps.name)} {...entry} isActive={isVisuallyActive} option={option} index={index} dataKey={dataKey} onTransitionEnd={handleTransitionEnd} />
  );
  if (shouldRenderInLayer) {
    return (
      <ZIndexLayer zIndex={DefaultZIndexes.activeBar}>
        <BarStackClipLayer index={entry.originalDataIndex}>{content}</BarStackClipLayer>
      </ZIndexLayer>
    );
  }
  return content;
}

/** 非激活态柱（activeBar 为假值时走它，省去选择器订阅开销）。 */
function BarRectangleNeverActive(props: any) {
  const { shape, baseProps, entry, index, dataKey } = props;
  return <BarRectangle {...baseProps} name={String(baseProps.name)} {...entry} isActive={false} option={shape} index={index} dataKey={dataKey} />;
}

/** 柱矩形群：逐数据点渲染（带堆叠裁剪层与交互事件）。 */
function BarRectangles({ data, props }: any) {
  const basePropsSource = svgPropertiesNoEvents(props) ?? {};
  const { id } = basePropsSource;
  const baseProps = _objectWithoutProperties(basePropsSource, _excluded3);
  const { shape, dataKey, activeBar } = props;
  const { onMouseEnter: onMouseEnterFromProps, onClick: onItemClickFromProps, onMouseLeave: onMouseLeaveFromProps } = props;
  const restOfAllOtherProps = _objectWithoutProperties(props, _excluded4);
  const onMouseEnterFromContext = useMouseEnterItemDispatch(onMouseEnterFromProps, dataKey, id);
  const onMouseLeaveFromContext = useMouseLeaveItemDispatch(onMouseLeaveFromProps);
  const onClickFromContext = useMouseClickItemDispatch(onItemClickFromProps, dataKey, id);
  if (!data) return null;
  return (
    <>
      {data.map((entry: any, i: number) => (
        <BarStackClipLayer
          index={entry.originalDataIndex}
          key={`rectangle-${entry?.x}-${entry?.y}-${entry?.value}-${i}`}
          className="recharts-bar-rectangle"
          {...adaptEventsOfChild(restOfAllOtherProps, entry, i)}
          onMouseEnter={onMouseEnterFromContext(entry, i)}
          onMouseLeave={onMouseLeaveFromContext(entry, i)}
          onClick={onClickFromContext(entry, i)}
        >
          {activeBar ? (
            <BarRectangleWithActiveState shape={shape} activeBar={activeBar} baseProps={baseProps} entry={entry} index={i} dataKey={dataKey} />
          ) : (
            <BarRectangleNeverActive shape={shape} baseProps={baseProps} entry={entry} index={i} dataKey={dataKey} />
          )}
        </BarStackClipLayer>
      ))}
    </>
  );
}

/** 动画包装：JavascriptAnimate 驱动矩形插值（含上一帧缓存）。 */
function RectanglesWithAnimation({ props, previousRectanglesRef }: any) {
  const { data, layout, isAnimationActive, animationBegin, animationDuration, animationEasing, onAnimationEnd, onAnimationStart } = props;
  const prevData = previousRectanglesRef.current;
  const animationId = useAnimationId(props, 'recharts-bar-');
  const [isAnimating, setIsAnimating] = React.useState(false);
  const showLabels = !isAnimating;
  const handleAnimationEnd = React.useCallback(() => {
    if (typeof onAnimationEnd === 'function') onAnimationEnd();
    setIsAnimating(false);
  }, [onAnimationEnd]);
  const handleAnimationStart = React.useCallback(() => {
    if (typeof onAnimationStart === 'function') onAnimationStart();
    setIsAnimating(true);
  }, [onAnimationStart]);
  return (
    <BarLabelListProvider showLabels={showLabels} rects={data}>
      <JavascriptAnimate
        animationId={animationId}
        begin={animationBegin}
        duration={animationDuration}
        isActive={isAnimationActive}
        easing={animationEasing}
        onAnimationEnd={handleAnimationEnd}
        onAnimationStart={handleAnimationStart}
        key={animationId}
      >
        {(t: number) => {
          const stepData =
            t === 1
              ? data
              : data?.map((entry: any, index: number) => {
                  const prev = prevData && prevData[index];
                  if (prev) {
                    return { ...entry, x: interpolate(prev.x, entry.x, t), y: interpolate(prev.y, entry.y, t), width: interpolate(prev.width, entry.width, t), height: interpolate(prev.height, entry.height, t) };
                  }
                  if (layout === 'horizontal') {
                    const height = interpolate(0, entry.height, t);
                    const y = interpolate(entry.stackedBarStart, entry.y, t);
                    return { ...entry, y, height };
                  }
                  const width = interpolate(0, entry.width, t);
                  const x = interpolate(entry.stackedBarStart, entry.x, t);
                  return { ...entry, width, x };
                });
          if (t > 0) previousRectanglesRef.current = stepData ?? null;
          if (stepData == null) return null;
          return (
            <Layer>
              <BarRectangles props={props} data={stepData} />
            </Layer>
          );
        }}
      </JavascriptAnimate>
      <LabelListFromLabelProp label={props.label} />
      {props.children}
    </BarLabelListProvider>
  );
}

/** 矩形渲染入口（持有上一帧 ref）。 */
function RenderRectangles(props: any) {
  const previousRectanglesRef = React.useRef(null);
  return <RectanglesWithAnimation previousRectanglesRef={previousRectanglesRef} props={props} />;
}

/** minPointSize 缺省值。 */
const defaultMinPointSize = 0;

/** ErrorBar 数据点格式化：堆叠值取 [1]（终点）。 */
const errorBarDataPointFormatter = (dataPoint: any, dataKey: any) => {
  const value = Array.isArray(dataPoint.value) ? dataPoint.value[1] : dataPoint.value;
  return { x: dataPoint.x, y: dataPoint.y, value, errorVal: getValueByDataKey(dataPoint, dataKey) };
};

/** 柱主体（类组件）：裁剪定义 + 背景 + 矩形群。 */
class BarWithState extends React.PureComponent<any> {
  render() {
    const { hide, data, dataKey, className, xAxisId, yAxisId, needClip, background, id } = this.props;
    if (hide || data == null) return null;
    const layerClass = clsx('recharts-bar', className);
    const clipPathId = id;
    return (
      <Layer className={layerClass} id={id}>
        {needClip && (
          <defs>
            <GraphicalItemClipPath clipPathId={clipPathId} xAxisId={xAxisId} yAxisId={yAxisId} />
          </defs>
        )}
        <Layer className="recharts-bar-rectangles" clipPath={needClip ? `url(#clipPath-${clipPathId})` : undefined}>
          <BarBackground data={data} dataKey={dataKey} background={background} allOtherBarProps={this.props} />
          <RenderRectangles {...this.props} />
        </Layer>
      </Layer>
    );
  }
}

/** Bar 缺省 props。 */
const defaultBarProps = {
  activeBar: false,
  animationBegin: 0,
  animationDuration: 400,
  animationEasing: 'ease',
  background: false,
  hide: false,
  isAnimationActive: 'auto',
  label: false,
  legendType: 'rect',
  minPointSize: defaultMinPointSize,
  xAxisId: 0,
  yAxisId: 0,
  zIndex: DefaultZIndexes.bar,
};

/** minPointSize 回调包装：函数透传；非法值类型触发 invariant 并回退缺省。 */
const minPointSizeCallback = (minPointSize: any, defaultMinPointSizeArg: number = 0) => {
  return (value: any, index: number) => {
    if (isFunction(minPointSize)) return minPointSize;
    const isValueAFunction = isFunction(value) || isNullish(value);
    if (isValueAFunction) return minPointSize(value, index);
    invariant(false, `minPointSize callback function received a value with type of ${typeof value}. Currently only numbers or null/undefined are supported.`);
    return defaultMinPointSizeArg;
  };
};

/** Bar 实现：取矩形选择器结果并计算 ErrorBar 偏移。 */
function BarImpl(props: any) {
  const { xAxisId, yAxisId, hide, legendType, minPointSize, activeBar, animationBegin, animationDuration, animationEasing, isAnimationActive } = props;
  const { needClip } = useNeedsClip(xAxisId, yAxisId);
  const layout = useChartLayout();
  const isPanorama = useIsPanorama();
  const cells = findAllByType(props.children, Cell);
  const rects = useAppSelector((state: RechartsState) => selectBarRectangles(state, props.id, isPanorama, cells));
  if (layout !== 'vertical' && layout !== 'horizontal') return null;
  let errorBarOffset: number;
  const firstDataPoint = rects?.[0];
  if (firstDataPoint == null || firstDataPoint.height == null || firstDataPoint.width == null) {
    errorBarOffset = 0;
  } else {
    errorBarOffset = layout === 'vertical' ? firstDataPoint.height / 2 : firstDataPoint.width / 2;
  }
  return (
    <SetErrorBarContext xAxisId={xAxisId} yAxisId={yAxisId} data={rects} dataPointFormatter={errorBarDataPointFormatter} errorBarOffset={errorBarOffset}>
      <BarWithState
        {...props}
        layout={layout}
        needClip={needClip}
        data={rects}
        xAxisId={xAxisId}
        yAxisId={yAxisId}
        hide={hide}
        legendType={legendType}
        minPointSize={minPointSize}
        activeBar={activeBar}
        animationBegin={animationBegin}
        animationDuration={animationDuration}
        animationEasing={animationEasing}
        isAnimationActive={isAnimationActive}
      />
    </SetErrorBarContext>
  );
}

/**
 * 柱矩形几何计算（纯函数，上游导出同名）：
 * 堆叠时按堆叠域截断，逐点算 x/y/宽/高、背景矩形、tooltip 锚点与
 * minPointSize 补偿；零尺寸矩形（非自定义形状）提前剔除。
 */
function computeBarRectangles(args: any): any[] {
  const {
    layout,
    barSettings: { dataKey, minPointSize: minPointSizeProp, hasCustomShape },
    pos,
    bandSize,
    xAxis,
    yAxis,
    xAxisTicks,
    yAxisTicks,
    stackedData,
    displayedData,
    offset,
    cells,
    parentViewBox,
    dataStartIndex,
  } = args;
  const numericAxis = layout === 'horizontal' ? yAxis : xAxis;
  // 假定数值轴域恒为数值（与上游一致）
  const stackedDomain = stackedData ? numericAxis.scale.domain() : null;
  const baseValue = getBaseValueOfBar({ numericAxis });
  const stackedBarStart = numericAxis.scale.map(baseValue);
  return displayedData
    .map((entry: any, index: number) => {
      let value: any, x: any, y: any, width: any, height: any, background: any;
      if (stackedData) {
        const untruncatedValue = stackedData[index + dataStartIndex];
        if (untruncatedValue == null) return null;
        value = truncateByDomain(untruncatedValue, stackedDomain);
      } else {
        value = getValueByDataKey(entry, dataKey);
        if (!Array.isArray(value)) value = [baseValue, value];
      }
      const minPointSize = minPointSizeCallback(minPointSizeProp, defaultMinPointSize)(value[1], index);
      if (layout === 'horizontal') {
        const baseValueScale = yAxis.scale.map(value[0]);
        const currentValueScale = yAxis.scale.map(value[1]);
        if (baseValueScale == null || currentValueScale == null) return null;
        x = getCateCoordinateOfBar({ axis: xAxis, ticks: xAxisTicks, bandSize, offset: pos.offset, entry, index });
        y = currentValueScale ?? baseValueScale ?? undefined;
        width = pos.size;
        let computedHeight = baseValueScale - currentValueScale;
        height = isNan(computedHeight) ? 0 : computedHeight;
        background = { x, y: offset.top, width, height: offset.height };
        if (Math.abs(minPointSize) > 0 && Math.abs(height) < Math.abs(minPointSize)) {
          const delta = mathSign(height || minPointSize) * (Math.abs(minPointSize) - Math.abs(height));
          y -= delta;
          height += delta;
        }
      } else {
        const baseValueScale = xAxis.scale.map(value[0]);
        const currentValueScale = xAxis.scale.map(value[1]);
        if (baseValueScale == null || currentValueScale == null) return null;
        x = baseValueScale;
        y = getCateCoordinateOfBar({ axis: yAxis, ticks: yAxisTicks, bandSize, offset: pos.offset, entry, index });
        width = currentValueScale - baseValueScale;
        height = pos.size;
        background = { x: offset.left, y, width: offset.width, height };
        if (Math.abs(minPointSize) > 0 && Math.abs(width) < Math.abs(minPointSize)) {
          const delta = mathSign(width || minPointSize) * (Math.abs(minPointSize) - Math.abs(width));
          width += delta;
        }
      }
      if (x == null || y == null || width == null || height == null || (!hasCustomShape && (width === 0 || height === 0))) return null;
      return {
        ...entry,
        stackedBarStart,
        x,
        y,
        width,
        height,
        value: stackedData ? value : value[1],
        payload: entry,
        background,
        tooltipPosition: { x: x + width / 2, y: y + height / 2 },
        parentViewBox,
        originalDataIndex: index,
        ...(cells && cells[index] && cells[index].props),
      };
    })
    .filter(Boolean);
}

/** Bar 组件入口：注册图形项 + 图例 + tooltip 设置后渲染实现层。 */
function BarFn(outsideProps: any) {
  const props = resolveDefaultProps(outsideProps, defaultBarProps);
  const stackId = useStackId(props.stackId);
  const isPanorama = useIsPanorama();
  return (
    <RegisterGraphicalItemId id={props.id} type="bar">
      {(id: string) => (
        <>
          <SetLegendPayload legendPayload={computeLegendPayloadFromBarData(props)} />
          <SetBarTooltipEntrySettings
            dataKey={props.dataKey}
            stroke={props.stroke}
            strokeWidth={props.strokeWidth}
            fill={props.fill}
            name={props.name}
            hide={props.hide}
            unit={props.unit}
            tooltipType={props.tooltipType}
            id={id}
          />
          <SetCartesianGraphicalItem
            type="bar"
            id={id}
            data={undefined}
            xAxisId={props.xAxisId}
            yAxisId={props.yAxisId}
            zAxisId={0}
            dataKey={props.dataKey}
            stackId={stackId}
            hide={props.hide}
            barSize={props.barSize}
            minPointSize={props.minPointSize}
            maxBarSize={props.maxBarSize}
            isPanorama={isPanorama}
            hasCustomShape={props.shape != null}
          />
          <ZIndexLayer zIndex={props.zIndex}>
            <BarImpl {...props} id={id} />
          </ZIndexLayer>
        </>
      )}
    </RegisterGraphicalItemId>
  );
}

/** recharts <Bar>（memo + propsAreEqual，displayName 'Bar'）。 */
const Bar = React.memo(BarFn, propsAreEqual);
Bar.displayName = 'Bar';

/* ════════════════════════ vendor 段 4：chart/BarChart.js ════════════════════════ */

const allowedTooltipTypes = ['axis', 'item'];

/** recharts <BarChart>：CartesianChart 的柱状图便捷封装。 */
const BarChart = React.forwardRef((props: any, ref: React.Ref<any>) => (
  <CartesianChart
    chartName="BarChart"
    defaultTooltipEventType="axis"
    validateTooltipEventTypes={allowedTooltipTypes}
    tooltipPayloadSearcher={arrayTooltipSearcher}
    categoricalChartProps={props}
    ref={ref}
  />
));

/* ════════════════════════ first-party 段：按日模型用量柱状图 ════════════════════════ */

/** 图表外边距（上 8、左右 24，右侧 24 给 Y 轴刻度留白——Y 轴隐藏，留白供视觉呼吸）。 */
const DAILY_MODEL_BAR_CHART_MARGIN = { top: 8, right: 24, left: 24 };

/** 快照中单模型的当日用量。 // TODO(infer): 完整快照类型在 usageStatsService。 */
interface DailyModelUsageEntry {
  modelId?: string | null;
  totalTokens: number;
}
interface DailyUsageSnapshot {
  date: string;
  models: DailyModelUsageEntry[];
}
interface UsageSnapshot {
  dailyModelUsage: DailyUsageSnapshot[];
  models: Array<{ modelId?: string | null; totalTokens: number }>;
}

/** tooltip 载荷过滤：只保留数值有限且 > 0 的条目（0 值系列不进 tooltip）。 */
function filterPositiveTooltipEntries(payload: Array<{ value?: unknown }> | undefined) {
  return (payload ?? []).filter((entry) => {
    const numeric = typeof entry.value === 'number' ? entry.value : Number(entry.value);
    return Number.isFinite(numeric) && numeric > 0;
  });
}

/**
 * X 轴刻度稀疏化：≤14 天全显；否则首尾必显、中间按步长取样
 * （>45 天步长 7，15-45 天步长 5）。
 */
function shouldShowDateTick(index: number, total: number): boolean {
  if (total <= 14) return true;
  const step = total > 45 ? 7 : 5;
  return index === 0 || index === total - 1 || index % step === 0;
}

/** 造一行空的「按日用量」记录（total=0，各模型键初始 0）。 */
function createEmptyDailyUsageRow(label: string, tooltipLabel: string, modelKeys: Array<{ key: string }>) {
  const row: Record<string, unknown> = { label, tooltipLabel, total: 0 };
  for (const modelKey of modelKeys) row[modelKey.key] = 0;
  return row;
}

/**
 * 组装「按日 × 模型」图表数据：
 * 逐日聚合各模型 token 数（未知 modelId 归 '__unknown__' 并跳过无映射者），
 * 累加当日 total，最后按日期字符串字典序升序输出。
 */
function buildDailyModelUsageRows({
  snapshot,
  locale,
  modelKeys,
  modelKeyById,
}: {
  snapshot: UsageSnapshot;
  locale: string;
  modelKeys: Array<{ key: string }>;
  modelKeyById: Map<string, string>;
}) {
  const rowByDate = new Map<string, Record<string, unknown>>();
  for (const daily of snapshot.dailyModelUsage) {
    const dateLabel = formatUsageDate(locale, daily.date);
    const row = rowByDate.get(daily.date) ?? createEmptyDailyUsageRow(dateLabel, dateLabel, modelKeys);
    for (const modelUsage of daily.models) {
      const modelKey = modelKeyById.get(modelUsage.modelId ?? `__unknown__`);
      if (modelKey) {
        row[modelKey] = Number(row[modelKey] ?? 0) + modelUsage.totalTokens;
        row.total = (row.total as number) + modelUsage.totalTokens;
      }
    }
    rowByDate.set(daily.date, row);
  }
  return [...rowByDate.entries()].sort(([dateA], [dateB]) => dateA.localeCompare(dateB)).map(([, row]) => row);
}

/**
 * 准备柱状图模型：取总用量前 6 的模型，配调色板色与展示名，
 * 生成 chartConfig（供 ChartContainer 注入 --color-* 变量）与图表数据。
 */
function prepareDailyModelBarChartModel({
  intl,
  locale,
  snapshot,
}: {
  intl: { formatMessage: (d: { id: string }, v?: Record<string, unknown>) => string };
  locale: string;
  snapshot: UsageSnapshot;
}) {
  const topModels = snapshot.models.slice(0, 6);
  const modelKeys = topModels.map((model, index) => ({
    modelId: model.modelId,
    key: `model${index}`,
    color: getUsageChartColor(index),
    label: getModelLabel(intl, model.modelId),
  }));
  const modelKeyById = new Map(modelKeys.map((m) => [m.modelId ?? `__unknown__`, m.key]));
  const chartConfig = modelKeys.reduce<Record<string, { label: string; color: string }>>((acc, m) => {
    acc[m.key] = { label: m.label, color: m.color };
    return acc;
  }, {});
  const chartData = buildDailyModelUsageRows({ snapshot, locale, modelKeys, modelKeyById });
  return {
    topModels,
    modelKeys,
    chartConfig,
    chartData,
    maxTokens: Math.max(0, ...chartData.map((row) => row.total as number)),
  };
}

/** 自定义 tooltip 内容：过滤掉 0/非数值条目后交给 shadcn ChartTooltip。 */
function PositiveEntriesTooltip(props: any) {
  const positivePayload = React.useMemo(() => filterPositiveTooltipEntries(props.payload), [props.payload]);
  if (!props.active || positivePayload.length === 0) return null;
  return <ChartTooltip {...props} payload={positivePayload} />;
}

/**
 * 「按日模型用量」堆叠柱状图（原导出名 AppUsageDailyModelBarChart）。
 *
 * 布局：卡片标题 + 图表（空数据显示空态卡片）+ 3 列模型图例。
 * 数据系列：前 6 个模型按 model0..model5 堆叠（stackId="tokens"），
 * 颜色经 ChartContainer 注入的 --color-modelN 变量（调色板取色）。
 */
function AppUsageDailyModelBarChart({ snapshot }: { snapshot: UsageSnapshot }) {
  const { intl, locale } = useZCodeIntl();
  const { topModels, modelKeys, chartConfig, chartData, maxTokens } = React.useMemo(
    () => prepareDailyModelBarChartModel({ intl, locale, snapshot }),
    [intl, locale, snapshot],
  );
  const tickFormatter = React.useCallback(
    (label: string, index: number) => (shouldShowDateTick(index, chartData.length) ? label : ''),
    [chartData.length],
  );
  const tooltipLabelFormatter = React.useCallback(
    (_label: unknown, payload: Array<{ payload?: { total?: unknown; tooltipLabel?: string } }>) => {
      const first = payload[0]?.payload;
      const total = typeof first?.total === 'number' ? first.total : 0;
      return `${first?.tooltipLabel ?? ''} - ${formatCompactNumber(locale, total)} ${intl.formatMessage({ id: 'settings.usage.tokenUnit' })}`;
    },
    [intl, locale],
  );
  const tooltipContent = React.useMemo(
    () => <PositiveEntriesTooltip indicator="line" labelFormatter={tooltipLabelFormatter} />,
    [tooltipLabelFormatter],
  );
  return (
    <section className="space-y-3 rounded-lg bg-surface p-4">
      <h3 className="text-ui-base font-medium text-foreground">{intl.formatMessage({ id: 'settings.usage.dailyChartTitle' })}</h3>
      {maxTokens <= 0 ? (
        <UsageEmptyState
          title={intl.formatMessage({ id: 'settings.usage.emptyTitle' })}
          description={intl.formatMessage({ id: 'settings.usage.emptyDescription' })}
        />
      ) : (
        <div className="rounded-md bg-surface/60 px-3 py-3">
          <ChartContainer config={chartConfig} className="h-60 w-full">
            <BarChart accessibilityLayer data={chartData} margin={DAILY_MODEL_BAR_CHART_MARGIN}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} minTickGap={0} tickMargin={8} tickFormatter={tickFormatter} />
              <YAxis hide domain={[0, maxTokens]} />
              <Tooltip cursor={false} content={tooltipContent} />
              {modelKeys.map((modelKey) => (
                <Bar key={modelKey.key} dataKey={modelKey.key} stackId="tokens" fill={`var(--color-${modelKey.key})`} radius={0} />
              ))}
            </BarChart>
          </ChartContainer>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {topModels.map((model, index) => (
          <div key={model.modelId ?? '__unknown__'} className="flex min-w-0 items-center gap-2 text-ui-base">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: getUsageChartColor(index) }} />
            <span className="truncate text-foreground-subtle">{getModelLabel(intl, model.modelId)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export { AppUsageDailyModelBarChart };

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: exportName -> 原名(minified) -> 语义名
 * ════════════════════════════════════════════════════════════════════════
 * 导出符号（1 个）：
 *   AppUsageDailyModelBarChart -> Jt -> AppUsageDailyModelBarChart（原导出未混淆）
 *
 * first-party 局部符号（8 个）：
 *   - -> Vt -> DAILY_MODEL_BAR_CHART_MARGIN   图表外边距 {8,24,24}
 *   - -> Ht -> filterPositiveTooltipEntries   tooltip 正值过滤
 *   - -> Ut -> shouldShowDateTick             刻度稀疏化（14/45 阈值）
 *   - -> Wt -> createEmptyDailyUsageRow       空行工厂
 *   - -> Gt -> buildDailyModelUsageRows       按日聚合 + 字典序排序
 *   - -> Kt -> prepareDailyModelBarChartModel 前 6 模型 + 配色 + chartConfig
 *   - -> qt -> PositiveEntriesTooltip         过滤型 tooltip 内容
 *   - -> $  -> jsxRuntime                     （r()，jsx-runtime 命名空间）
 *
 * vendor 段符号（recharts@3.8.0，原名 -> 上游名 -> 上游文件）：
 *   B  -> getBarSize                          combiners/combineBarSizeList.js（内部）
 *   Be -> combineBarSizeList                  combiners/combineBarSizeList.js
 *   Ge -> getBarPositions                     combiners/combineAllBarPositions.js（内部）
 *   Ke -> combineAllBarPositions              combiners/combineAllBarPositions.js
 *   qe -> combineStackedData                  combiners/combineStackedData.js
 *   Je -> combineBarPosition                  combiners/combineBarPosition.js
 *   Ye -> getZIndex                           zIndex/getZIndexFromUnknown.js
 *   H  -> selectXAxisIdFromGraphicalItemId    selectors/graphicalItemSelectors.js
 *   U  -> selectYAxisIdFromGraphicalItemId    selectors/graphicalItemSelectors.js
 *   q  -> selectSynchronisedBarSettings       selectors/barSelectors.js
 *   Qe -> selectMaxBarSize                    selectors/barSelectors.js
 *   $e -> pickCells                           selectors/barSelectors.js
 *   Ze -> pickIsPanorama                      selectors/barSelectors.js
 *   et -> selectAllVisibleBars                selectors/barSelectors.js
 *   tt -> selectBarStackGroups                selectors/barSelectors.js
 *   nt -> selectBarSizeList                   selectors/barSelectors.js
 *   rt -> selectBarBandSize                   selectors/barSelectors.js
 *   it -> selectAxisBandSize                  selectors/barSelectors.js
 *   at -> selectBarRectangles                 selectors/barSelectors.js
 *   lt -> BarStackContext                     cartesian/BarStack.js
 *   ut -> useStackId                          cartesian/BarStack.js
 *   dt -> getBarStackClipPathId               cartesian/BarStack.js
 *   ft -> useBarStackClipPathUrl              cartesian/BarStack.js
 *   pt -> BarStackClipLayer                   cartesian/BarStack.js
 *   K  -> BarRectangle                        util/BarUtils.js（Shape 的矩形包装）
 *   Ct -> computeLegendPayloadFromBarData     cartesian/Bar.js
 *   wt -> SetBarTooltipEntrySettings          cartesian/Bar.js
 *   Tt -> BarBackground                       cartesian/Bar.js
 *   Et -> BarLabelListProvider                cartesian/Bar.js
 *   Dt -> BarRectangleWithActiveState         cartesian/Bar.js
 *   Ot -> BarRectangleNeverActive             cartesian/Bar.js
 *   kt -> BarRectangles                       cartesian/Bar.js
 *   At -> RectanglesWithAnimation             cartesian/Bar.js
 *   jt -> RenderRectangles                    cartesian/Bar.js
 *   Q  -> defaultMinPointSize                 cartesian/Bar.js
 *   Mt -> errorBarDataPointFormatter          cartesian/Bar.js
 *   Nt -> BarWithState                        cartesian/Bar.js
 *   Pt -> defaultBarProps                     cartesian/Bar.js
 *   Xe -> minPointSizeCallback                util/BarUtils.js
 *   Ze2-> (上游 _excluded 常量 4 组)          cartesian/Bar.js
 *   Ft -> BarImpl                             cartesian/Bar.js
 *   It -> computeBarRectangles                cartesian/Bar.js
 *   Lt -> BarFn                               cartesian/Bar.js
 *   Rt -> Bar（memo，displayName 'Bar'）       cartesian/Bar.js
 *   zt -> allowedTooltipTypes                 chart/BarChart.js
 *   Bt -> BarChart                            chart/BarChart.js
 *   Ve/V/He/Ue/We/Ge2... -> babel 辅助        （_extends/_objectSpread 等）
 *
 * 导入符号（跨 chunk 别名 -> 语义名）：
 *   chart-iT2j9K3u.js（recharts bundle）：$t=selectChartLayout, A=SetTooltipEntrySettings,
 *     An=getPercentValue, Bt=selectRootBarSize, Cn=isNumber, D=RegisterGraphicalItemId,
 *     Dn=resolveDefaultProps, En=useAppSelector, F=CartesianLabelListContextProvider,
 *     Fn=mathSign, G=ZIndexLayer, Hn=svgPropertiesNoEventsFromUnknown,
 *     I=LabelListFromLabelProp, In=noop, J=selectActiveTooltipIndex, Jt=useAnimationId,
 *     K=selectActiveTooltipDataKey, Lt=DefaultZIndexes, M=findAllByType, Mn=isNan,
 *     Mt=isStacked, Nn=isNullish, Nt=getStackSeriesIdentifier, O=SetLegendPayload,
 *     Pn=isFunction, Qt=propsAreEqual, Rn=Layer, Rt=selectBarGap,
 *     St=selectUnfilteredCartesianItems, T=SetCartesianGraphicalItem,
 *     Vn=svgPropertiesNoEvents, Vt=selectRootMaxBarSize, W=arrayTooltipSearcher,
 *     Wt=selectChartDataWithIndexesIfNotInPanoramaPosition3, Yt=JavascriptAnimate,
 *     a=ChartTooltip(chart.tsx 封装), cn=selectChartOffsetInternal, dn=getBandSizeOfAxis,
 *     fn=getBaseValueOfBar, ft=selectAxisWithScale, gn=getNormalizedStackId, i=Tooltip,
 *     j=Shape(ActiveShapeUtils), jn=interpolate, kn=adaptEventsOfChild, mt=selectCartesianAxisSize,
 *     nn=useChartLayout, on=useIsPanorama, pn=getCateCoordinateOfBar, sn=selectAxisViewBox,
 *     t=ChartContainer(chart.tsx 封装), vn=getTooltipNameProp, wn=createSelector,
 *     xn=truncateByDomain, xt=selectTicksOfGraphicalItem, yn=getValueByDataKey,
 *     yt=selectStackGroups, zt=selectBarCategoryGap
 *   CartesianChart-nORn-0bc.js：a=useNeedsClip, i=GraphicalItemClipPath, n=YAxis,
 *     o=SetErrorBarContext, r=XAxis, s=CartesianGrid, t=CartesianChart
 *   usageStatsUiParts-CiR7YEhh.js：a=formatCompactNumber, c=getModelLabel,
 *     o=formatUsageDate, t=UsageEmptyState
 *   IntlProvider-C321H7m8.js：n=useZCodeIntl
 *   appUsageChartPalette-BeN2wLzW.js：a=Cell, i=useMouseLeaveItemDispatch,
 *     n=useMouseClickItemDispatch, r=useMouseEnterItemDispatch, t=getUsageChartColor
 *   bundle-mjs-D8tLE0rB.js：r=clsx；tiny-invariant-Dm49c6Qj.js：t=invariant
 * ════════════════════════════════════════════════════════════════════════ */
