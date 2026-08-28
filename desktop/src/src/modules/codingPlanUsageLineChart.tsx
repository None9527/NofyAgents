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

import * as React from 'react';
import { clsx } from 'clsx';
// @ts-expect-error 原始构建产物为 minified JS、无类型声明
import { n as useZCodeIntl } from '../../out/renderer/assets/IntlProvider-C321H7m8.js';
// @ts-expect-error usageStatsUiParts 导出：a=紧凑数字, i=次数格式化, t=空态卡片
import {
  a as formatCompactNumber,
  i as formatTurnCount,
  t as UsageEmptyState,
} from '../../out/renderer/assets/usageStatsUiParts-CiR7YEhh.js';
// @ts-expect-error CartesianChart chunk：a=useNeedsClip, i=GraphicalItemClipPath, n=YAxis, o=SetErrorBarContext, r=XAxis, s=CartesianGrid, t=CartesianChart
import {
  a as useNeedsClip,
  i as GraphicalItemClipPath,
  n as YAxis,
  o as SetErrorBarContext,
  r as XAxis,
  s as CartesianGrid,
  t as CartesianChart,
} from '../../out/renderer/assets/CartesianChart-nORn-0bc.js';
// @ts-expect-error chart-iT2j9K3u.js = recharts@3.8.0 bundle（+ chart.tsx 封装），别名映射见尾符号表
import {
  $t as selectChartLayout,
  A as SetTooltipEntrySettings,
  Bn as filterProps,
  D as RegisterGraphicalItemId,
  Dn as resolveDefaultProps,
  En as useAppSelector,
  F as CartesianLabelListContextProvider,
  G as ZIndexLayer,
  Gt as selectChartDataWithIndexesIfNotInPanoramaPosition4,
  Hn as svgPropertiesNoEventsFromUnknown,
  I as LabelListFromLabelProp,
  In as noop,
  J as selectActiveTooltipIndex,
  Jt as useAnimationId,
  Lt as DefaultZIndexes,
  N as isClipDot,
  Nn as isNullish,
  O as SetLegendPayload,
  On as adaptEventHandlers,
  Pn as isNumber,
  Qt as propsAreEqual,
  Rn as Layer,
  St as selectUnfilteredCartesianItems,
  T as SetCartesianGraphicalItem,
  Vn as svgPropertiesNoEvents,
  W as arrayTooltipSearcher,
  Yt as JavascriptAnimate,
  _ as usePlotArea,
  a as ChartTooltip,
  bn as isCategoricalAxis,
  dn as getBandSizeOfAxis,
  ft as selectAxisWithScale,
  g as useActiveTooltipDataPoints,
  i as Tooltip,
  j as Shape,
  jn as interpolate,
  mn as getCateCoordinateOfLine,
  n as Legend,
  nn as useChartLayout,
  on as useIsPanorama,
  r as ChartLegendContent,
  t as ChartContainer,
  vn as getTooltipNameProp,
  wn as createSelector,
  xt as selectTicksOfGraphicalItem,
  yn as getValueByDataKey,
  zn as svgPropertiesAndEvents,
} from '../../out/renderer/assets/chart-iT2j9K3u.js';

/* ─────────────────────────── 公共类型（推断） ─────────────────────────── */

type ChartLayout = 'horizontal' | 'vertical' | 'centric' | 'radial';
type RechartsState = any;
interface LinePoint {
  x: number | null;
  y: number | null;
  value?: unknown;
  payload?: unknown;
}

/* ════════════════════════ vendor 段 1：shape/Dot.js + component/Dots.js + component/ActivePoints.js ════════════════════════ */

/** 圆点：cx/cy/r 均为数字时渲染 <circle class="recharts-dot">。 */
const Dot = (props: any) => {
  const { cx, cy, r, className } = props;
  const dotClass = clsx('recharts-dot', className);
  if (isNumber(cx) && isNumber(cy) && isNumber(r)) {
    return <circle {...svgPropertiesNoEvents(props)} {...adaptEventHandlers(props)} className={dotClass} cx={cx} cy={cy} r={r} />;
  }
  return null;
};

const _excludedDots = ['points'] as const;

/** 单个点的渲染分发：元素克隆 / 函数回调 / 缺省 Dot。 */
function DotItem({ option, dotProps, className }: any) {
  if (React.isValidElement(option)) return React.cloneElement(option, dotProps);
  if (typeof option === 'function') return option(dotProps);
  const dotClassName = clsx(className, typeof option === 'boolean' ? '' : option.className);
  const props = dotProps ?? {};
  const { points } = props;
  const rest = _objectWithoutPropertiesLoose(props, _excludedDots);
  return <Dot {...rest} className={dotClassName} />;
}

/** 点是否渲染：dot 为真恒渲染；否则仅单点数据渲染。 */
function shouldRenderDots(points: LinePoint[] | undefined, dot: unknown) {
  if (points == null) return false;
  if (dot) return true;
  return points.length === 1;
}

/** 点群：逐点 DotItem，支持裁剪（dots- 前缀 clipPath）。 */
function Dots(props: any) {
  const { points, dot, className, dotClassName, dataKey, baseProps, needClip, clipPathId, zIndex = DefaultZIndexes.scatter } = props;
  if (!shouldRenderDots(points, dot)) return null;
  const clipDot = isClipDot(dot);
  const dotBaseProps = filterProps(dot);
  const dotItems = points.map((entry: any, i: number) => {
    const dotProps = {
      r: 3,
      ...baseProps,
      ...dotBaseProps,
      index: i,
      cx: entry.x ?? undefined,
      cy: entry.y ?? undefined,
      dataKey,
      value: entry.value,
      payload: entry.payload,
      points,
    };
    return <DotItem key={`dot-${i}`} option={dot} dotProps={dotProps} className={dotClassName} />;
  });
  const clipProps: { clipPath?: string } = {};
  if (needClip && clipPathId != null) clipProps.clipPath = `url(#clipPath-${clipDot ? '' : 'dots-'}${clipPathId})`;
  return (
    <ZIndexLayer zIndex={zIndex}>
      <Layer className={className} {...clipProps}>
        {dotItems}
      </Layer>
    </ZIndexLayer>
  );
}

/** 单个激活点：activeDot 为 false 或坐标缺失时不渲染。 */
const ActivePoint = (props: any) => {
  const { point, childIndex, mainColor, activeDot, dataKey, clipPath } = props;
  if (activeDot === false || point.x == null || point.y == null) return null;
  const activePointProps = {
    ...{
      index: childIndex,
      dataKey,
      cx: point.x,
      cy: point.y,
      r: 4,
      fill: mainColor ?? 'none',
      strokeWidth: 2,
      stroke: '#fff',
      payload: point.payload,
      value: point.value,
    },
    ...svgPropertiesNoEventsFromUnknown(activeDot),
    ...adaptEventHandlers(activeDot),
  };
  const content = React.isValidElement(activeDot)
    ? React.cloneElement(activeDot, activePointProps)
    : typeof activeDot === 'function'
      ? activeDot(activePointProps)
      : <Dot {...activePointProps} />;
  return (
    <Layer className="recharts-active-dot" clipPath={clipPath}>
      {content}
    </Layer>
  );
};

/** 激活点群：取 tooltip 激活数据对应的点渲染 ActivePoint。 */
function ActivePoints(props: any) {
  const { points, mainColor, activeDot, itemDataKey, clipPath, zIndex = DefaultZIndexes.activeDot } = props;
  const activeIndex = useAppSelector(selectActiveTooltipIndex);
  const activePointsData = useActiveTooltipDataPoints();
  if (points == null || activePointsData == null) return null;
  const activePoint = points.find((point: any) => activePointsData.includes(point.payload));
  if (isNullish(activePoint)) return null;
  return (
    <ZIndexLayer zIndex={zIndex}>
      <ActivePoint point={activePoint} childIndex={Number(activeIndex)} mainColor={mainColor} dataKey={itemDataKey} activeDot={activeDot} clipPath={clipPath} />
    </ZIndexLayer>
  );
}

/** 从 dot 选项解析半径与线宽（非法值回退 r=3/strokeWidth=2）。 */
function getRadiusAndStrokeWidthFromDot(dot: unknown): { r: number; strokeWidth: number } {
  const defaultR = 3;
  const defaultStrokeWidth = 2;
  const dotProps = svgPropertiesNoEventsFromUnknown(dot);
  if (dotProps != null) {
    const { r, strokeWidth } = dotProps as { r?: unknown; strokeWidth?: unknown };
    let radius = Number(r);
    let width = Number(strokeWidth);
    if (Number.isNaN(radius) || radius < 0) radius = defaultR;
    if (Number.isNaN(width) || width < 0) width = defaultStrokeWidth;
    return { r: radius, strokeWidth: width };
  }
  return { r: defaultR, strokeWidth: defaultStrokeWidth };
}

/* ════════════════════════ vendor 段 2：state/selectors/lineSelectors.js ════════════════════════ */

/** X 轴（带刻度）。 */
const selectXAxisWithScale = (state: RechartsState, xAxisId: number | string, _yAxisId: unknown, isPanorama: boolean) =>
  selectAxisWithScale(state, 'xAxis', xAxisId, isPanorama);
/** X 轴刻度。 */
const selectXAxisTicks = (state: RechartsState, xAxisId: number | string, _yAxisId: unknown, isPanorama: boolean) =>
  selectTicksOfGraphicalItem(state, 'xAxis', xAxisId, isPanorama);
/** Y 轴（带刻度）。 */
const selectYAxisWithScale = (state: RechartsState, _xAxisId: unknown, yAxisId: number | string, isPanorama: boolean) =>
  selectAxisWithScale(state, 'yAxis', yAxisId, isPanorama);
/** Y 轴刻度。 */
const selectYAxisTicks = (state: RechartsState, _xAxisId: unknown, yAxisId: number | string, isPanorama: boolean) =>
  selectTicksOfGraphicalItem(state, 'yAxis', yAxisId, isPanorama);
/** 条带尺寸（类目轴才有意义）。 */
const selectBandSize = createSelector(
  [selectChartLayout, selectXAxisWithScale, selectYAxisWithScale, selectXAxisTicks, selectYAxisTicks],
  (layout: ChartLayout, xAxis: any, yAxis: any, xAxisTicks: any, yAxisTicks: any) => {
    if (isCategoricalAxis(layout, 'xAxis')) return getBandSizeOfAxis(xAxis, xAxisTicks, false);
    return getBandSizeOfAxis(yAxis, yAxisTicks, false);
  },
);
/** 折线 id 拾取器（第 5 参原样返回）。 */
const pickLineId = (_state: RechartsState, _xAxisId: unknown, _yAxisId: unknown, _isPanorama: unknown, id: string | undefined) => id;
/** 折线设置判定。 */
function isLineSettings(item: any) {
  return item.type === 'line';
}
/** 同步折线设置（从 state 读，避免 props/state 竞态）。 */
const selectSynchronisedLineSettings = createSelector(
  [selectUnfilteredCartesianItems, pickLineId],
  (graphicalItems: any[], id: string | undefined) => graphicalItems.filter(isLineSettings).find((x) => x.id === id),
);
/** 折线点选择器：齐备时调 computeLinePoints。 */
const selectLinePoints = createSelector(
  [
    selectChartLayout,
    selectXAxisWithScale,
    selectYAxisWithScale,
    selectXAxisTicks,
    selectYAxisTicks,
    selectSynchronisedLineSettings,
    selectBandSize,
    selectChartDataWithIndexesIfNotInPanoramaPosition4,
  ],
  (layout, xAxis, yAxis, xAxisTicks, yAxisTicks, lineSettings, bandSize, dataWithIndexes) => {
    const { chartData, dataStartIndex, dataEndIndex } = dataWithIndexes ?? {};
    if (
      lineSettings == null ||
      xAxis == null ||
      yAxis == null ||
      xAxisTicks == null ||
      yAxisTicks == null ||
      xAxisTicks.length === 0 ||
      yAxisTicks.length === 0 ||
      bandSize == null ||
      (layout !== 'horizontal' && layout !== 'vertical')
    ) {
      return undefined;
    }
    const { dataKey, data } = lineSettings;
    const displayedData = data != null && data.length > 0 ? data : chartData?.slice(dataStartIndex, dataEndIndex + 1);
    if (displayedData == null) return undefined;
    return computeLinePoints({ layout, xAxis, yAxis, xAxisTicks, yAxisTicks, dataKey, bandSize, displayedData });
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
      _ownKeys(Object(source)).forEach((key: any) => Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)));
    }
  }
  return target;
}
function _ownKeys(object: any, enumerableOnly?: boolean) {
  const keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    let symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter((sym) => Object.getOwnPropertyDescriptor(object, sym).enumerable);
    keys.push.apply(keys, symbols);
  }
  return keys;
}
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
function _extends(...args: any[]) {
  const target = args[0];
  for (let i = 1; i < args.length; i++) {
    const source = args[i];
    for (const key in source) if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
  }
  return target;
}

const _excludedLine = ['id'] as const;
const _excludedLine2 = ['type', 'layout', 'connectNulls', 'needClip', 'shape'] as const;
const _excludedLine3 = [
  'activeDot',
  'animateNewValues',
  'animationBegin',
  'animationDuration',
  'animationEasing',
  'connectNulls',
  'dot',
  'hide',
  'isAnimationActive',
  'label',
  'legendType',
  'xAxisId',
  'yAxisId',
  'id',
] as const;

/* ════════════════════════ vendor 段 3：cartesian/Line.js ════════════════════════ */

/** 图例载荷工厂（上游函数名沿用 computeLegendPayloadFromAreaData）。 */
const computeLegendPayloadFromAreaData = (props: any) => {
  const { dataKey, name, stroke, legendType, hide } = props;
  return [{ inactive: hide, dataKey, type: legendType, color: stroke, value: getTooltipNameProp(name, dataKey), payload: props }];
};

/** 折线的 tooltip 条目设置（data 定义在 item 上）。 */
const SetLineTooltipEntrySettings = React.memo((props: any) => {
  const { dataKey, data, stroke, strokeWidth, fill, name, hide, unit, tooltipType, id } = props;
  const tooltipEntrySettings = {
    dataDefinedOnItem: data,
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
      color: stroke,
      unit,
      graphicalItemId: id,
    },
  };
  return <SetTooltipEntrySettings tooltipEntrySettings={tooltipEntrySettings} />;
});

/** 简单描边虚线：`<dash>px <已画长度>px`（动画用）。 */
const generateSimpleStrokeDasharray = (totalLength: number, length: number) => `${length}px ${totalLength}px`;

/** 虚线模式重复 count 次。 */
function repeat(lines: number[], count: number) {
  const linesUnit = lines.length % 2 !== 0 ? [...lines, 0] : lines;
  const result: number[] = [];
  for (let i = 0; i < count; ++i) result.push(...linesUnit);
  return result;
}

/** 按用户虚线模式构造动画中的 strokeDasharray（截断到当前已画长度）。 */
const getStrokeDasharray = (length: number, totalLength: number, lines: number[]) => {
  const lineLength = lines.reduce((pre, next) => pre + next, 0);
  if (!lineLength) return generateSimpleStrokeDasharray(totalLength, length);
  const count = Math.floor(length / lineLength);
  const remainLength = length % lineLength;
  let remainLines: number[] = [];
  for (let i = 0, sum = 0; i < lines.length; sum += lines[i] ?? 0, ++i) {
    const lineValue = lines[i];
    if (lineValue != null && sum + lineValue > remainLength) {
      remainLines = [...lines.slice(0, i), remainLength - sum];
      break;
    }
  }
  const emptyLines = remainLines.length % 2 === 0 ? [0, totalLength] : [totalLength];
  return [...repeat(lines, count), ...remainLines, ...emptyLines].map((line) => `${line}px`).join(', ');
};

/** 静态点群包装（className recharts-line-dots）。 */
function LineDotsWrapper({ clipPathId, points, props }: any) {
  const { dot, dataKey, needClip } = props;
  const { id } = props;
  const baseProps = svgPropertiesNoEvents(_objectWithoutProperties(props, _excludedLine));
  return (
    <Dots
      points={points}
      dot={dot}
      className="recharts-line-dots"
      dotClassName="recharts-line-dot"
      dataKey={dataKey}
      baseProps={baseProps}
      needClip={needClip}
      clipPathId={clipPathId}
    />
  );
}

/** 折线标签上下文供给（动画期间隐藏）。 */
function LineLabelListProvider({ showLabels, children, points }: any) {
  const labelListEntries = React.useMemo(
    () =>
      points?.map((entry: any) => {
        const viewBox = { x: entry.x ?? 0, y: entry.y ?? 0, width: 0, lowerWidth: 0, upperWidth: 0, height: 0 };
        return { ...viewBox, value: entry.value, payload: entry.payload, viewBox, parentViewBox: undefined, fill: undefined };
      }),
    [points],
  );
  return <CartesianLabelListContextProvider value={showLabels ? labelListEntries : undefined}>{children}</CartesianLabelListContextProvider>;
}

/** 静态曲线：主路径（Curve）+ 点群。 */
function StaticCurve({ clipPathId, pathRef, points, strokeDasharray, props }: any) {
  const { type, layout, connectNulls, needClip, shape } = props;
  const curveProps = {
    ...svgPropertiesAndEvents(_objectWithoutProperties(props, _excludedLine2)),
    fill: 'none',
    className: 'recharts-line-curve',
    clipPath: needClip ? `url(#clipPath-${clipPathId})` : undefined,
    points,
    type,
    layout,
    connectNulls,
    strokeDasharray: strokeDasharray ?? props.strokeDasharray,
  };
  return (
    <>
      {points?.length > 1 && <Shape shapeType="curve" option={shape} {...curveProps} pathRef={pathRef} />}
      <LineDotsWrapper points={points} clipPathId={clipPathId} props={props} />
    </>
  );
}

/** 安全取路径总长。 */
function getTotalLength(mainCurve: SVGPathElement | null) {
  try {
    return (mainCurve && mainCurve.getTotalLength && mainCurve.getTotalLength()) || 0;
  } catch {
    return 0;
  }
}

/** 曲线动画：描边生长（虚线模式感知）+ 上一帧点插值 + 新值飞入。 */
function CurveWithAnimation({ clipPathId, props, pathRef, previousPointsRef, longestAnimatedLengthRef }: any) {
  const {
    points,
    strokeDasharray,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing,
    animateNewValues,
    width,
    height,
    onAnimationEnd,
    onAnimationStart,
  } = props;
  const prevPoints = previousPointsRef.current;
  const animationId = useAnimationId(points, 'recharts-line-');
  const currentAnimationIdRef = React.useRef(animationId);
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
  const totalLength = getTotalLength(pathRef.current);
  const longestAnimatedLengthRefLocal = React.useRef(0);
  if (currentAnimationIdRef.current !== animationId) {
    longestAnimatedLengthRefLocal.current = longestAnimatedLengthRef.current;
    currentAnimationIdRef.current = animationId;
  }
  const startingLength = longestAnimatedLengthRefLocal.current;
  return (
    <LineLabelListProvider points={points} showLabels={showLabels}>
      {props.children}
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
          const length = interpolate(startingLength, totalLength + startingLength, t);
          const currentLength = Math.min(length, totalLength);
          const dasharray = isAnimationActive
            ? strokeDasharray
              ? getStrokeDasharray(currentLength, totalLength, `${strokeDasharray}`.split(/[,\s]+/gim).map((v: string) => parseFloat(v)))
              : generateSimpleStrokeDasharray(totalLength, currentLength)
            : strokeDasharray == null
              ? undefined
              : String(strokeDasharray);
          if (t > 0 && totalLength > 0) {
            previousPointsRef.current = points;
            longestAnimatedLengthRef.current = Math.max(longestAnimatedLengthRef.current, currentLength);
          }
          if (prevPoints) {
            const ratio = prevPoints.length / points.length;
            const stepData =
              t === 1
                ? points
                : points.map((entry: any, index: number) => {
                    const prevIndex = Math.floor(index * ratio);
                    const prev = prevPoints[prevIndex];
                    if (prev) {
                      return { ...entry, x: interpolate(prev.x, entry.x, t), y: interpolate(prev.y, entry.y, t) };
                    }
                    if (animateNewValues) {
                      return { ...entry, x: interpolate(width * 2, entry.x, t), y: interpolate(height / 2, entry.y, t) };
                    }
                    return { ...entry, x: entry.x, y: entry.y };
                  });
            previousPointsRef.current = stepData;
            return <StaticCurve props={props} points={stepData} clipPathId={clipPathId} pathRef={pathRef} strokeDasharray={dasharray} />;
          }
          return <StaticCurve props={props} points={points} clipPathId={clipPathId} pathRef={pathRef} strokeDasharray={dasharray} />;
        }}
      </JavascriptAnimate>
      <LabelListFromLabelProp label={props.label} />
    </LineLabelListProvider>
  );
}

/** 曲线渲染入口（持有动画 ref 三件套）。 */
function RenderCurve({ clipPathId, props }: any) {
  const previousPointsRef = React.useRef(null);
  const longestAnimatedLengthRef = React.useRef(0);
  const pathRef = React.useRef(null);
  return <CurveWithAnimation props={props} clipPathId={clipPathId} previousPointsRef={previousPointsRef} longestAnimatedLengthRef={longestAnimatedLengthRef} pathRef={pathRef} />;
}

/** ErrorBar 数据点格式化。 */
const errorBarDataPointFormatter = (dataPoint: any, dataKey: any) => ({
  x: dataPoint.x ?? undefined,
  y: dataPoint.y ?? undefined,
  value: dataPoint.value,
  errorVal: getValueByDataKey(dataPoint.payload, dataKey),
});

/** 折线主体（类组件）：裁剪定义 + 曲线 + 激活点。 */
class LineWithState extends React.Component<any> {
  render() {
    const { hide, dot, points, className, xAxisId, yAxisId, top, left, width, height, id, needClip, zIndex } = this.props;
    if (hide) return null;
    const layerClass = clsx('recharts-line', className);
    const clipPathId = id;
    const { r, strokeWidth } = getRadiusAndStrokeWidthFromDot(dot);
    const clipDot = isClipDot(dot);
    const dotSize = r * 2 + strokeWidth;
    const activePointsClipPath = needClip ? `url(#clipPath-${clipDot ? '' : 'dots-'}${clipPathId})` : undefined;
    return (
      <ZIndexLayer zIndex={zIndex}>
        <Layer className={layerClass}>
          {needClip && (
            <defs>
              <GraphicalItemClipPath clipPathId={clipPathId} xAxisId={xAxisId} yAxisId={yAxisId} />
              {!clipDot && (
                <clipPath id={`clipPath-dots-${clipPathId}`}>
                  <rect x={left - dotSize / 2} y={top - dotSize / 2} width={width + dotSize} height={height + dotSize} />
                </clipPath>
              )}
            </defs>
          )}
          <SetErrorBarContext xAxisId={xAxisId} yAxisId={yAxisId} data={points} dataPointFormatter={errorBarDataPointFormatter} errorBarOffset={0}>
            <RenderCurve props={this.props} clipPathId={clipPathId} />
          </SetErrorBarContext>
        </Layer>
        <ActivePoints activeDot={this.props.activeDot} points={points} mainColor={this.props.stroke} itemDataKey={this.props.dataKey} clipPath={activePointsClipPath} />
      </ZIndexLayer>
    );
  }
}

/** Line 缺省 props。 */
const defaultLineProps = {
  activeDot: true,
  animateNewValues: true,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease',
  connectNulls: false,
  dot: true,
  fill: '#fff',
  hide: false,
  isAnimationActive: 'auto',
  label: false,
  legendType: 'line',
  stroke: '#3182bd',
  strokeWidth: 1,
  xAxisId: 0,
  yAxisId: 0,
  zIndex: DefaultZIndexes.line,
  type: 'linear',
};

/** Line 实现：取点选择器结果 + 绘图区尺寸。 */
function LineImpl(props: any) {
  const propsWithDefaults = resolveDefaultProps(props, defaultLineProps);
  const {
    activeDot,
    animateNewValues,
    animationBegin,
    animationDuration,
    animationEasing,
    connectNulls,
    dot,
    hide,
    isAnimationActive,
    label,
    legendType,
    xAxisId,
    yAxisId,
    id,
  } = propsWithDefaults;
  const rest = _objectWithoutProperties(propsWithDefaults, _excludedLine3);
  const { needClip } = useNeedsClip(xAxisId, yAxisId);
  const plotArea = usePlotArea();
  const layout = useChartLayout();
  const isPanorama = useIsPanorama();
  const points = useAppSelector((state: RechartsState) => selectLinePoints(state, xAxisId, yAxisId, isPanorama, id));
  if ((layout !== 'horizontal' && layout !== 'vertical') || points == null || plotArea == null) return null;
  const { height, width, x, y } = plotArea;
  return (
    <LineWithState
      {...rest}
      id={id}
      connectNulls={connectNulls}
      dot={dot}
      activeDot={activeDot}
      animateNewValues={animateNewValues}
      animationBegin={animationBegin}
      animationDuration={animationDuration}
      animationEasing={animationEasing}
      isAnimationActive={isAnimationActive}
      hide={hide}
      label={label}
      legendType={legendType}
      xAxisId={xAxisId}
      yAxisId={yAxisId}
      points={points}
      layout={layout}
      height={height}
      width={width}
      left={x}
      top={y}
      needClip={needClip}
    />
  );
}

/** 折线点几何计算（纯函数，上游导出同名）。 */
function computeLinePoints(args: any): LinePoint[] {
  const { layout, xAxis, yAxis, xAxisTicks, yAxisTicks, dataKey, bandSize, displayedData } = args;
  return displayedData
    .map((entry: any, index: number) => {
      const value = getValueByDataKey(entry, dataKey);
      if (layout === 'horizontal') {
        return {
          x: getCateCoordinateOfLine({ axis: xAxis, ticks: xAxisTicks, bandSize, entry, index }),
          y: (isNullish(value) ? null : yAxis.scale.map(value)) ?? null,
          value,
          payload: entry,
        };
      }
      const x = isNullish(value) ? null : xAxis.scale.map(value);
      const y = getCateCoordinateOfLine({ axis: yAxis, ticks: yAxisTicks, bandSize, entry, index });
      if (x == null || y == null) return null;
      return { x, y, value, payload: entry };
    })
    .filter(Boolean);
}

/** Line 组件入口：注册图形项 + 图例 + tooltip 设置后渲染实现层。 */
function LineFn(outsideProps: any) {
  const props = resolveDefaultProps(outsideProps, defaultLineProps);
  const isPanorama = useIsPanorama();
  return (
    <RegisterGraphicalItemId id={props.id} type="line">
      {(id: string) => (
        <>
          <SetLegendPayload legendPayload={computeLegendPayloadFromAreaData(props)} />
          <SetLineTooltipEntrySettings
            dataKey={props.dataKey}
            data={props.data}
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
            type="line"
            id={id}
            data={props.data}
            xAxisId={props.xAxisId}
            yAxisId={props.yAxisId}
            zAxisId={0}
            dataKey={props.dataKey}
            hide={props.hide}
            isPanorama={isPanorama}
          />
          <LineImpl {...props} id={id} />
        </>
      )}
    </RegisterGraphicalItemId>
  );
}

/** recharts <Line>（memo + propsAreEqual，displayName 'Line'）。 */
const Line = React.memo(LineFn, propsAreEqual);
Line.displayName = 'Line';

/* ════════════════════════ vendor 段 4：chart/LineChart.js ════════════════════════ */

const allowedLineTooltipTypes = ['axis'];

/** recharts <LineChart>。 */
const LineChart = React.forwardRef((props: any, ref: React.Ref<any>) => (
  <CartesianChart
    chartName="LineChart"
    defaultTooltipEventType="axis"
    validateTooltipEventTypes={allowedLineTooltipTypes}
    tooltipPayloadSearcher={arrayTooltipSearcher}
    categoricalChartProps={props}
    ref={ref}
  />
));

/* ════════════════════════ first-party 段：Coding Plan 用量折线图 ════════════════════════ */

/**
 * 用量图 6 色调色板（本 chunk 内联副本，与 appUsageChartPalette 的
 * USAGE_CHART_COLORS 逐字同值）。
 */
const USAGE_CHART_COLORS = [
  'var(--color-usage-chart-1)',
  'var(--color-usage-chart-2)',
  'var(--color-usage-chart-3)',
  'var(--color-usage-chart-4)',
  'var(--color-usage-chart-5)',
  'var(--color-usage-chart-6)',
];

/** 图表外边距（上 8、右 12、左 8）。 */
const CODING_PLAN_LINE_CHART_MARGIN = { top: 8, right: 12, left: 8 };

/** 按系列序号取色（回绕 + 越界兜底首色，与调色板模块同语义）。 */
function getUsageChartColorLocal(index: number): string {
  return USAGE_CHART_COLORS[index % USAGE_CHART_COLORS.length] ?? USAGE_CHART_COLORS[0];
}

/** 时间粒度。 // TODO(infer): 上游 usageStatsService 可能还有 'week'/'month'。 */
type UsageGranularity = 'hour' | 'day' | string;

/**
 * X 轴时间标签：小时粒度直接取 'HH:MM' 前 5 字符；
 * 日粒度经 Intl.DateTimeFormat(month short + day numeric)；非法日期原样返回。
 */
function formatTimeLabel(locale: string, time: string, granularity: UsageGranularity): string {
  if (granularity === 'hour') return time.slice(0, 5);
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return time;
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date);
}

/** X 轴刻度稀疏化（与按日柱状图同规则：≤14 全显，>45 步长 7，否则 5）。 */
function shouldShowTimeTick(index: number, total: number): boolean {
  if (total <= 14) return true;
  const step = total > 45 ? 7 : 5;
  return index === 0 || index === total - 1 || index % step === 0;
}

/** 折线图数据序列。 */
interface UsageSeries {
  name: string;
  values: number[];
  key?: string;
  color?: string;
}

/**
 * 组装折线图数据：xTime 为时间轴，逐序列把 values[i] 填进对应行
 * （缺失补 0）。
 */
function buildLineChartData(locale: string, xTime: string[], granularity: UsageGranularity, series: Array<UsageSeries & { key: string }>) {
  return xTime.map((time, i) => {
    const row: Record<string, unknown> = { label: formatTimeLabel(locale, time, granularity), time };
    for (const s of series) row[s.key] = s.values[i] ?? 0;
    return row;
  });
}

/**
 * 「Coding Plan 用量」折线图（原导出名 CodingPlanUsageLineChart）。
 *
 * props：
 *  - xTime：时间点数组（小时粒度为 'YYYY-MM-DDTHH:MM' 形式，日粒度为日期）；
 *  - granularity：'hour' | 'day'；
 *  - series：{name, values[]} 序列（最多渲染前 6 条）；
 *  - emptyDescription：空态描述文案（调用方传入）；
 *  - valueKind：'count'（默认，次数）| 'token'（token 数，紧凑格式化）。
 */
function CodingPlanUsageLineChart({
  xTime,
  granularity,
  series,
  emptyDescription,
  valueKind = 'count',
}: {
  xTime: string[];
  granularity: UsageGranularity;
  series: UsageSeries[];
  emptyDescription: string;
  valueKind?: 'count' | 'token';
}) {
  const { intl, locale } = useZCodeIntl();
  const coloredSeries = React.useMemo(
    () =>
      series.slice(0, 6).map((s, index) => ({
        ...s,
        key: `series${index}`,
        color: getUsageChartColorLocal(index),
      })),
    [series],
  );
  const maxValue = React.useMemo(() => Math.max(0, ...coloredSeries.flatMap((s) => s.values)), [coloredSeries]);
  const chartConfig = React.useMemo(
    () =>
      coloredSeries.reduce<Record<string, { label: string; color: string }>>((acc, s) => {
        acc[s.key] = { label: s.name, color: s.color };
        return acc;
      }, {}),
    [coloredSeries],
  );
  const chartData = React.useMemo(() => buildLineChartData(locale, xTime, granularity, coloredSeries), [granularity, locale, coloredSeries, xTime]);
  const tickFormatter = React.useCallback(
    (label: string, index: number) => (shouldShowTimeTick(index, chartData.length) ? label : ''),
    [chartData.length],
  );
  const tooltipFormatter = React.useCallback(
    (value: unknown, name: unknown, item: { color?: string }) => {
      const seriesKey = String(name);
      const seriesLabel = chartConfig[seriesKey]?.label ?? seriesKey;
      return (
        <>
          <div className="h-2.5 w-1 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color ?? `var(--color-${seriesKey})` }} />
          <div className="flex flex-1 items-center justify-between gap-3">
            <span className="text-foreground-subtle">{seriesLabel}</span>
            <span className="font-mono font-medium text-foreground tabular-nums">
              {typeof value === 'number' ? (valueKind === 'token' ? formatCompactNumber(locale, value) : formatTurnCount(locale, value)) : String(value)}
            </span>
          </div>
        </>
      );
    },
    [chartConfig, locale, valueKind],
  );
  const tooltipContent = React.useMemo(
    () => (
      <ChartTooltip
        indicator="line"
        labelFormatter={(label: unknown) => String(label)}
        formatter={tooltipFormatter}
      />
    ),
    [tooltipFormatter],
  );
  if (coloredSeries.length === 0 || xTime.length === 0 || maxValue <= 0) {
    return (
      <UsageEmptyState title={intl.formatMessage({ id: 'settings.usage.emptyTitle' })} description={emptyDescription} />
    );
  }
  return (
    <div className="rounded-lg bg-surface/60 px-3 py-3">
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <LineChart accessibilityLayer data={chartData} margin={CODING_PLAN_LINE_CHART_MARGIN}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} minTickGap={0} tickMargin={8} tickFormatter={tickFormatter} />
          <YAxis hide domain={[0, maxValue]} />
          <Tooltip cursor={false} content={tooltipContent} />
          <Legend content={<ChartLegendContent className="flex-wrap justify-start gap-3" />} />
          {coloredSeries.map((s) => (
            <Line key={s.key} dataKey={s.key} type="monotone" stroke={`var(--color-${s.key})`} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
}

export { CodingPlanUsageLineChart };

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: exportName -> 原名(minified) -> 语义名
 * ════════════════════════════════════════════════════════════════════════
 * 导出符号（1 个）：
 *   CodingPlanUsageLineChart -> Ct -> CodingPlanUsageLineChart（原导出未混淆）
 *
 * first-party 局部符号（8 个）：
 *   - -> $  -> USAGE_CHART_COLORS              6 色 CSS 变量调色板（内联副本）
 *   - -> vt -> CODING_PLAN_LINE_CHART_MARGIN   外边距 {8,12,8}
 *   - -> yt -> getUsageChartColorLocal         取色（回绕+兜底）
 *   - -> bt -> formatTimeLabel                 小时截取/日格式化
 *   - -> xt -> shouldShowTimeTick              刻度稀疏化（14/45 阈值）
 *   - -> St -> buildLineChartData              行组装（缺失补 0）
 *   - -> Ct -> CodingPlanUsageLineChart        主组件
 *   - -> Q  -> jsxRuntime                      （r()，jsx-runtime 命名空间）
 *
 * vendor 段符号（recharts@3.8.0，原名 -> 上游名 -> 上游文件）：
 *   B  -> Dot                                 shape/Dot.js
 *   Ae -> DotItem                             component/Dots.js
 *   je -> shouldRenderDots                    component/Dots.js
 *   Me -> Dots                                component/Dots.js
 *   Ie -> ActivePoint                         component/ActivePoints.js
 *   Le -> ActivePoints                        component/ActivePoints.js
 *   Ue -> getRadiusAndStrokeWidthFromDot      util/getRadiusAndStrokeWidthFromDot.js
 *   K/q/J/Re -> selectX/YAxisWithScale/Ticks  selectors/lineSelectors.js
 *   ze -> selectBandSize                      selectors/lineSelectors.js
 *   Be -> pickLineId                          selectors/lineSelectors.js
 *   Ve -> isLineSettings                      selectors/lineSelectors.js
 *   He -> selectSynchronisedLineSettings      selectors/lineSelectors.js
 *   He2-> selectLinePoints                    selectors/lineSelectors.js（chunk 内名 He）
 *   Qe -> computeLegendPayloadFromAreaData    cartesian/Line.js（上游名如此）
 *   $e -> SetLineTooltipEntrySettings         cartesian/Line.js
 *   et -> generateSimpleStrokeDasharray       cartesian/Line.js
 *   tt -> repeat                              cartesian/Line.js
 *   nt -> getStrokeDasharray                  cartesian/Line.js
 *   rt -> LineDotsWrapper                     cartesian/Line.js
 *   it -> LineLabelListProvider               cartesian/Line.js
 *   at -> StaticCurve                         cartesian/Line.js
 *   ot -> getTotalLength                      cartesian/Line.js
 *   st -> CurveWithAnimation                  cartesian/Line.js
 *   ct -> RenderCurve                         cartesian/Line.js
 *   lt -> errorBarDataPointFormatter          cartesian/Line.js
 *   ut -> LineWithState                       cartesian/Line.js
 *   dt -> defaultLineProps                    cartesian/Line.js
 *   ft -> LineImpl                            cartesian/Line.js
 *   pt -> computeLinePoints                   cartesian/Line.js
 *   mt -> LineFn                              cartesian/Line.js
 *   ht -> Line（memo，displayName 'Line'）     cartesian/Line.js
 *   gt -> allowedLineTooltipTypes             chart/LineChart.js
 *   _t -> LineChart                           chart/LineChart.js
 *   we/_excludedLine* -> babel 剔除键常量      （上游编译产物）
 *   V/H/W/G/Ne/Pe/Fe/Te/Ee/De... -> babel 辅助（_extends/_objectSpread 等）
 *
 * 导入符号（跨 chunk 别名 -> 语义名）：
 *   chart-iT2j9K3u.js（recharts bundle）：$t=selectChartLayout, A=SetTooltipEntrySettings,
 *     Bn=filterProps, D=RegisterGraphicalItemId, Dn=resolveDefaultProps, En=useAppSelector,
 *     F=CartesianLabelListContextProvider, G=ZIndexLayer,
 *     Gt=selectChartDataWithIndexesIfNotInPanoramaPosition4, Hn=svgPropertiesNoEventsFromUnknown,
 *     I=LabelListFromLabelProp, In=noop, J=selectActiveTooltipIndex, Jt=useAnimationId,
 *     Lt=DefaultZIndexes, N=isClipDot, Nn=isNullish, O=SetLegendPayload, On=adaptEventHandlers,
 *     Pn=isNumber, Qt=propsAreEqual, Rn=Layer, St=selectUnfilteredCartesianItems,
 *     T=SetCartesianGraphicalItem, Vn=svgPropertiesNoEvents, W=arrayTooltipSearcher,
 *     Yt=JavascriptAnimate, _=usePlotArea, a=ChartTooltip(chart.tsx), bn=isCategoricalAxis,
 *     dn=getBandSizeOfAxis, ft=selectAxisWithScale, g=useActiveTooltipDataPoints, i=Tooltip,
 *     j=Shape(ActiveShapeUtils), jn=interpolate, mn=getCateCoordinateOfLine, n=Legend,
 *     nn=useChartLayout, on=useIsPanorama, r=ChartLegendContent(chart.tsx),
 *     t=ChartContainer(chart.tsx), vn=getTooltipNameProp, wn=createSelector,
 *     xt=selectTicksOfGraphicalItem, yn=getValueByDataKey, zn=svgPropertiesAndEvents
 *   CartesianChart-nORn-0bc.js：a=useNeedsClip, i=GraphicalItemClipPath, n=YAxis,
 *     o=SetErrorBarContext, r=XAxis, s=CartesianGrid, t=CartesianChart
 *   usageStatsUiParts-CiR7YEhh.js：a=formatCompactNumber, i=formatTurnCount, t=UsageEmptyState
 *   IntlProvider-C321H7m8.js：n=useZCodeIntl
 *   bundle-mjs-D8tLE0rB.js：r=clsx
 * ════════════════════════════════════════════════════════════════════════ */
