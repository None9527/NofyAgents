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


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/charts/ChartShadcn.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  ChartContext,
  useChart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '../components/charts/ChartShadcn';
export type {
  ChartConfig,
  ChartContainerProps,
  ChartTooltipContentProps,
  ChartLegendContentProps,
} from '../components/charts/ChartShadcn';
