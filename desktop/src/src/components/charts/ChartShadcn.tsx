// A0-S4-4c: 自 modules/ChartShadcn.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/charts/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ZCode 恢复版 · chart-iT2j9K3u.js 的 shadcn/ui chart 包装层完整解混淆
 *  （D8 Stage B2 · chart 包装/utils/IME 族）
 * ════════════════════════════════════════════════════════════════════════════
 *  原始 chunk   : out/renderer/assets/chart-iT2j9K3u.js（14,496 行）
 *  恢复日期     : 2026-08-26
 *  恢复方法     :
 *    · recharts 本体 = 登记制（见下方「vendored 登记」，不逐行还原）；
 *    · shadcn/ui chart 包装层（chunk 尾 14137–14344 行）全量语义重建，
 *      逐字对照 shadcn/ui 公开源码（registry `chart.tsx`，即
 *      ui.shadcn.com/docs/components/chart 的实现）确认身份；
 *    · 消费者交叉验证：CodingPlanUsageLineChart-BpNLwqMV.js /
 *      AppUsageDailyModelBarChart-037NXfkz.js / AppUsageModelUsagePieChart-_KCE1AAL.js
 *      分别以 `<t config=…>`（ChartContainer）、`<i content={<a …/>}>`
 *      （ChartTooltip+ChartTooltipContent）、`<n content={<r …/>}>`
 *      （ChartLegend+ChartLegendContent）形态消费本层。
 *
 * ┌────────────────────────── vendored 登记（recharts 本体） ──────────────────────────┐
 * │ chart-iT2j9K3u.js = d3-array(部分) + recharts@3.8.0 全量 + 其运行时依赖，      │
 * │ 按 Rollup 拓扑序交错排布；版本证据：node_modules recharts=3.8.0               │
 * │ （pilot 已对本 chunk 的 Cell/tooltipContext/tooltipSlice 做过逐字节比对，     │
 * │  见 appUsageChartPalette.report.md）。                                        │
 * │  区域登记（行号以 .js 为准）：                                                 │
 * │   1–807      d3-array 子集（quickselect `Ue` 73、quantile `Ge` 121…）+        │
 * │              CJS/interop 助手（`tn`=_extends 860 附近、`nn/rn` 无符号表属性）   │
 * │   808        React interop `j = t(r())`                                       │
 * │   811–818    recharts util/svgPropertiesNoEvents.js + excludeEventProps.js    │
 * │              （aria-* / SVG 呈现属性与 React 事件属性白名单两张长表）           │
 * │   ~860       recharts container/Surface.js（`an`，`recharts-surface` 907）     │
 * │   2556–2600  redux（minified；`@@redux/INIT` 2561）                            │
 * │   2717–2837  immer（`immer-nothing/-draftable/-state` Symbol）                 │
 * │   3903       @reduxjs/toolkit（minified 错误消息）                             │
 * │   4662       recharts component/ResponsiveContainer.js（`Zc`；                │
 * │              initialDimension 4462/4559/4572；**未导出**，仅层内使用）         │
 * │   5324–5336  react-redux（`react-redux-context` Symbol、Provider）            │
 * │   5601–5602  recharts component/Legend.js（`Ju`=memo(qu,Au)，displayName)     │
 * │   6061–6073  d3-shape 曲线族（curveBasis…curveStepBefore 映射表）              │
 * │   7577–8422  decimal.js-light（`[DecimalError]` 7577）                        │
 * │   9872–9875  recharts state/tooltipSlice actions：                            │
 * │              b_=setActiveMouseOverItemIndex / x_=mouseLeaveItem /             │
 * │              C_=setActiveClickItemIndex（pilot 已逐一比对）                    │
 * │   10873–10914 eventemitter3 + recharts eventBus（`rechartsEventEmitter`）     │
 * │   11238      recharts component/Tooltip.js（`xb`）                            │
 * │   11797/12158/12267 recharts component/Text/Label/LabelList（displayName）    │
 * │   12349–12377 react-is（isFragment 等，recharts 依赖）                        │
 * │   13555–13572 recharts state/store：`nT`=createStore(RTK configureStore)、    │
 * │              `rT`=ChartDataContextProvider（导出别名 `u`，pilot 已登记）       │
 * │   14033      recharts chart/CategoricalChart 渲染壳（`recharts-wrapper`）      │
 * │   14090–14136 recharts container/Surface 紧凑形态（`IT`，导出别名 `o`）        │
 * │   14137–14344 ★ shadcn/ui chart 包装层（first-party，本文件重建对象）★        │
 * │   14345–14496 export 块（约 160 个别名，供 5 个图表消费者 chunk 使用）         │
 * │  本层用到的 chunk 内 recharts 符号：                                           │
 * │   `Zc`=ResponsiveContainer（未导出） / `xb`=Tooltip（经 `UT` 导出为 `i`）/     │
 * │   `Ju`=Legend（经 `GT` 导出为 `n`）                                            │
 * └──────────────────────────────────────────────────────────────────────────────┘
 *
 *  与 shadcn/ui 公开源码（chart.tsx）的逐节对照结论：
 *    · 结构、类名、props、默认值、memo 依赖数组全部一致；
 *    · ZCode 定制差异共 4 处（均逐字保留于本文件）：
 *       1) ChartContainer 类名 `text-xs` → `text-ui-base`（ZCode 字号体系）；
 *       2) ChartTooltipContent 容器类名 `text-xs` → `text-ui-base/relaxed`；
 *       3) `id || uniqueId.replace(...)` → `id ?? uniqueId.replace(...)`
 *          （chartId 拼接，?? 为原码形态）；
 *       4) `theme || color` / `label || …` 等 3 处 `||` → `??`
 *          （ChartStyle 过滤、ChartStyle 取色、tooltipLabel 取值，?? 为原码形态）。
 *    · ChartStyle 在原 chunk 中不导出（shadcn 上游导出），此处保持不导出。
 *
 *  行为等价声明：本文件与原始 chunk 14137–14344 行运行时行为等价——
 *    1) 全部类名/i18n 无关字符串/`--color-*` CSS 变量模板逐字保留；
 *    2) `??`/`?.`/三元短路形态逐字保留；
 *    3) useMemo 依赖数组逐字保留（[o, c, t, i, l, m, p] 等）；
 *    4) 导出面对齐原 chunk：ChartContainer(t)/ChartTooltipContent(a)/
 *       ChartLegendContent(r)/ChartTooltip(i)/ChartLegend(n)；
 *       useChart(BT)/ChartContext(zT)/ChartStyle(HT)/getPayloadConfigFromPayload(qT)
 *       在原 chunk 为层内符号不导出，本文件为可读性 export useChart/ChartConfig
 *       类型（新增导出仅为重建便利，注释标明）。
 *  唯一结构性差异：ResponsiveContainer 在原码为 chunk 内部符号 `Zc`（未导出），
 *  本文件自 npm `recharts`（=3.8.0，与 vendored 本体同源）导入，语义一致。
 * ════════════════════════════════════════════════════════════════════════════
 */

import * as React from 'react';

// ─── 跨 chunk 依赖（改接重建模块 / npm 依赖） ───────────────────────────
// utils-CEEH0K_K.js 导出 t = cn（见 UtilsCn.tsx 重建）。
import { cn as cnMin } from '../../modules/UtilsCn'; // 原 utils-CEEH0K_K t
// chart-iT2j9K3u.js 导出：
//   i = UT = xb = recharts component/Tooltip.js（ChartTooltip 即其再导出）
//   n = GT = Ju = recharts component/Legend.js （ChartLegend 即其再导出）
import { Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts'; // 原 chart-iT2j9K3u i, n
// ResponsiveContainer 在原 chunk 为内部符号 `Zc`（未导出）；vendored 本体即
// recharts@3.8.0 component/ResponsiveContainer.js（结构逐节比对一致：
// initialDimension / SizeDetectorContainer / ResponsiveContainerContextProvider）。
import { ResponsiveContainer } from 'recharts';

/** 类名合并（ZCode 定制 tailwind-merge 版，见 UtilsCn.tsx）。 */
const cn = cnMin as (...inputs: Array<string | false | null | undefined | Record<string, boolean | null | undefined>>) => string;

/* ─────────────────────────── 类型声明 ─────────────────────────── */

/**
 * shadcn/ui ChartConfig（与上游 chart.tsx 的 ChartConfig 逐字同构）。
 * 每个数据系列键可给 label/icon，并二选一给 color（单主题）或
 * theme（light/dark 双主题 CSS 变量值）。
 */
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

/** ChartContext 承载的值（上游 `type ChartContextProps = { config: ChartConfig }`）。 */
type ChartContextProps = {
  config: ChartConfig;
};

/**
 * recharts tooltip/legend payload 条目（按本层实际读取面建模，把握度高）：
 * type/name/dataKey/value/color/payload.fill 均有用法证据。
 * // TODO(infer): recharts 上游 Payload 泛型字段更多，此处只建模消费面。
 */
interface ChartPayloadEntry {
  type?: string;
  name?: string | number;
  dataKey?: string | number;
  value?: unknown;
  color?: string;
  payload?: Record<string, unknown> & { fill?: string };
  [key: string]: unknown;
}

/** ChartTooltipContent 的 labelFormatter（上游签名）。 */
type LabelFormatter = (
  label: React.ReactNode,
  payload: ChartPayloadEntry[],
) => React.ReactNode;

/** ChartTooltipContent 的 formatter（上游签名：返回值直接替换条目渲染）。 */
type TooltipFormatter = (
  value: unknown,
  name: string | number,
  item: ChartPayloadEntry,
  index: number,
  payload: ChartPayloadEntry,
) => React.ReactNode;

/* ─────────────────────────── THEMES 与缺省尺寸 ─────────────────────────── */

/**
 * 主题 → CSS 选择器前缀（上游 `const THEMES = { light: "", dark: ".dark" }`）。
 * ChartStyle 用它为 light/dark 各生成一段 `[data-chart=…] { --color-*: …; }`。
 */
const THEMES = { light: '', dark: '.dark' } as const;

/**
 * ChartContainer 的 initialDimension 缺省值
 * （上游 `const fallbackContainerDimensions = { width: 320, height: 200 }`，
 *  原码 `RT`；作为 recharts ResponsiveContainer 的首帧尺寸）。
 */
const FALLBACK_CONTAINER_DIMENSIONS = { width: 320, height: 200 };

/* ─────────────────────────── ChartContext / useChart ─────────────────────────── */

/**
 * shadcn ChartContext（原码 `zT = React.createContext(null)`）。
 * 值形如 `{ config }`；容器外使用时 useChart 抛错。
 */
export const ChartContext = React.createContext<ChartContextProps | null>(null);

/**
 * useChart（原码 `BT`，层内符号不导出；此处 export 仅为重建可读性）。
 * 与上游一致：容器外调用抛 `useChart must be used within a <ChartContainer />`。
 */
export function useChart(): ChartContextProps {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

/* ─────────────────────────── ChartContainer（导出别名 t） ─────────────────────────── */

export interface ChartContainerProps extends React.ComponentProps<'div'> {
  /** 图表 id；缺省时用 useId 生成（冒号被替换为空串）。 */
  id?: string;
  /** 附加类名（经 cn 合并）。 */
  className?: string;
  /** recharts 图表元素（经 ResponsiveContainer 自适应）。 */
  children: React.ComponentProps<typeof ResponsiveContainer>['children'];
  /** shadcn ChartConfig：系列 → label/icon/color/theme。 */
  config: ChartConfig;
  /** ResponsiveContainer 首帧尺寸缺省 320×200。 */
  initialDimension?: { width: number; height: number };
}

/**
 * shadcn ChartContainer（原码 `VT`，导出别名 `t`）。
 * 结构：ChartContext.Provider > div[data-slot=chart][data-chart=chartId]
 *        > [ChartStyle, ResponsiveContainer(initialDimension){children}]。
 * 注意原码 chartId 用 `??`（非上游的 `||`）：空串 id 不再回退到 useId。
 */
export function ChartContainer({
  id,
  className,
  children,
  config,
  initialDimension = FALLBACK_CONTAINER_DIMENSIONS,
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, '')}`;
  const contextValue = React.useMemo(() => ({ config }), [config]);

  return (
    <ChartContext.Provider value={contextValue}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          // ZCode 定制：上游此处为 text-xs，ZCode 用自有字号 text-ui-base
          `flex aspect-video justify-center text-ui-base [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden`,
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer initialDimension={initialDimension}>
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

/* ─────────────────────────── ChartStyle（层内符号，不导出） ─────────────────────────── */

/**
 * ChartStyle（原码 `HT`，层内符号；上游导出、ZCode 不导出，保持一致）。
 * 为条目含 theme|color 的系列注入 CSS 变量：
 *   <style> 内对 THEMES 的每个主题输出
 *   `{prefix} [data-chart={id}] {\n  --color-{key}: {color};\n}`。
 * 注意原码两处 `??`：过滤用 `e.theme ?? e.color`，取色用 `theme?.[t] ?? color`。
 */
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, itemConfig]) => itemConfig.theme ?? itemConfig.color);

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ?? itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join('\n')}
}
`,
          )
          .join('\n'),
      }}
    />
  );
};

/* ─────────────────────────── ChartTooltip（导出别名 i） ─────────────────────────── */

/**
 * shadcn ChartTooltip = recharts Tooltip 的再导出
 * （原码 `UT = xb`，导出别名 `i`；消费者以 `<ChartTooltip content={<ChartTooltipContent …/>}/>` 使用）。
 */
export const ChartTooltip = RechartsTooltip;

/* ─────────────────────────── ChartTooltipContent（导出别名 a） ─────────────────────────── */

export interface ChartTooltipContentProps extends React.ComponentProps<'div'> {
  /** recharts 注入：tooltip 是否激活。 */
  active?: boolean;
  /** recharts 注入：当前悬停/激活的数据条目集。 */
  payload?: ChartPayloadEntry[];
  className?: string;
  /** 指示器形态：dot（默认）/ line / dashed。 */
  indicator?: 'line' | 'dot' | 'dashed';
  /** 隐藏标签行。 */
  hideLabel?: boolean;
  /** 隐藏指示器色块。 */
  hideIndicator?: boolean;
  /** 显式标签（字符串时先查 config 的 label）。 */
  label?: React.ReactNode;
  /** 标签自定义渲染。 */
  labelFormatter?: LabelFormatter;
  labelClassName?: string;
  /** 条目自定义渲染（提供时直接替换默认条目渲染）。 */
  formatter?: TooltipFormatter;
  /** 强制指示器颜色（缺省取 payload.fill → item.color）。 */
  color?: string;
  /** 从条目取系列名的字段名。 */
  nameKey?: string;
  /** 从条目取标签的字段名。 */
  labelKey?: string;
}

/**
 * shadcn ChartTooltipContent（原码 `WT`，导出别名 `a`）。
 * ZCode 定制：容器类名 `text-xs` → `text-ui-base/relaxed`；其余与上游逐字一致。
 */
export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? 'value'}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === 'string'
        ? (config[label as keyof typeof config]?.label ?? label)
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn('font-medium', labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }

    if (!value) {
      return null;
    }

    return <div className={cn('font-medium', labelClassName)}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot';

  return (
    <div
      className={cn(
        // ZCode 定制：上游此处为 text-xs，ZCode 用 text-ui-base/relaxed
        'grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-ui-base/relaxed shadow-xl',
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== 'none')
          .map((item, index) => {
            const key = `${nameKey ?? item.name ?? item.dataKey ?? 'value'}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color ?? item.payload?.fill ?? item.color;

            return (
              <div
                key={index}
                className={cn(
                  'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                  indicator === 'dot' && 'items-center',
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload as ChartPayloadEntry)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn('shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)', {
                            'h-2.5 w-2.5': indicator === 'dot',
                            'w-1': indicator === 'line',
                            'w-0 border-[1.5px] border-dashed bg-transparent':
                              indicator === 'dashed',
                            'my-0.5': nestLabel && indicator === 'dashed',
                          })}
                          style={
                            {
                              '--color-bg': indicatorColor,
                              '--color-border': indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        'flex flex-1 justify-between leading-none',
                        nestLabel ? 'items-end' : 'items-center',
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label ?? item.name}
                        </span>
                      </div>
                      {item.value != null && (
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {typeof item.value === 'number'
                            ? item.value.toLocaleString()
                            : String(item.value)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

/* ─────────────────────────── ChartLegend（导出别名 n） ─────────────────────────── */

/**
 * shadcn ChartLegend = recharts Legend 的再导出
 * （原码 `GT = Ju`，导出别名 `n`；消费者以 `<ChartLegend content={<ChartLegendContent …/>}/>` 使用）。
 */
export const ChartLegend = RechartsLegend;

/* ─────────────────────────── ChartLegendContent（导出别名 r） ─────────────────────────── */

export interface ChartLegendContentProps extends React.ComponentProps<'div'> {
  /** recharts 注入：图例条目集。 */
  payload?: ChartPayloadEntry[];
  /** 图例纵向位置（决定上/下内边距）。 */
  verticalAlign?: 'top' | 'bottom' | 'middle';
  /** 隐藏图标色块。 */
  hideIcon?: boolean;
  /** 从条目取系列名的字段名。 */
  nameKey?: string;
  className?: string;
}

/**
 * shadcn ChartLegendContent（原码 `KT`，导出别名 `r`）。与上游逐字一致
 * （key 为条目索引，`[&>svg]:h-3 w-3` 图标尺寸，缺省色块 2×2 圆角）。
 */
export function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}
    >
      {payload
        .filter((item) => item.type !== 'none')
        .map((item, index) => {
          const key = `${nameKey ?? item.dataKey ?? 'value'}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={index}
              className={cn(
                'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground',
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
    </div>
  );
}

/* ─────────────────────────── getPayloadConfigFromPayload（层内符号，不导出） ─────────────────────────── */

/**
 * getPayloadConfigFromPayload（原码 `qT`，层内助手，不导出）。
 * 从 tooltip/legend 条目反查 ChartConfig：
 *   1) 条目（或其 payload 子对象）里键为 key 且值为字符串 → 用该值作配置键；
 *   2) 否则直接用 key；
 *   3) 配置键命中 config 则返回对应项，否则退回 config[key]。
 */
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  const payloadPayload =
    'payload' in payload &&
    typeof (payload as Record<string, unknown>).payload === 'object' &&
    (payload as Record<string, unknown>).payload !== null
      ? ((payload as Record<string, unknown>).payload as Record<string, unknown>)
      : undefined;

  let configLabelKey = key;

  if (
    key in payload &&
    typeof (payload as Record<string, unknown>)[key as keyof typeof payload] === 'string'
  ) {
    configLabelKey = (payload as Record<string, unknown>)[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: exportName -> 原名(minified) -> 语义名
 * ════════════════════════════════════════════════════════════════════════
 * shadcn 层导出符号（5 个，exportName 为原 chunk 导出别名）：
 *   t -> VT -> ChartContainer          图表容器（context + CSS 变量 + 自适应）
 *   a -> WT -> ChartTooltipContent     tooltip 内容（label/指示器/条目渲染）
 *   n -> GT -> ChartLegend             = recharts Legend 再导出（GT = Ju）
 *   r -> KT -> ChartLegendContent      图例内容（色块/图标 + label）
 *   i -> UT -> ChartTooltip            = recharts Tooltip 再导出（UT = xb）
 * shadcn 层层内符号（4 个，原 chunk 不导出）：
 *   - -> zT -> ChartContext            createContext(null)（本文件 export 以便引用）
 *   - -> BT -> useChart                容器外调用抛错（本文件 export 以便引用）
 *   - -> HT -> ChartStyle              <style> CSS 变量注入器（保持不导出）
 *   - -> qT -> getPayloadConfigFromPayload 条目→配置反查（保持不导出）
 *   - -> LT -> THEMES                  { light: '', dark: '.dark' }
 *   - -> RT -> FALLBACK_CONTAINER_DIMENSIONS { width: 320, height: 200 }
 * 导入符号：
 *   （utils chunk） t -> cn            类名合并（见 UtilsCn.tsx）
 *   （chart chunk 内） Zc -> ResponsiveContainer（未导出，本文件自 npm recharts 导入）
 *   （chart chunk 内） j -> React、$ -> jsx-runtime（a() interop）
 * ════════════════════════════════════════════════════════════════════════ */
