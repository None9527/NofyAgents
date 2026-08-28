# chart-iT2j9K3u vendor 登记报告（recharts 封装件）

- **原始 chunk**：`out/renderer/assets/chart-iT2j9K3u.js`（406,108 字节，14,496 行）
- **定性**：**vendor —— recharts@3.8.0 打包产物**，内嵌 ZCode first-party 的
  shadcn 风格 `chart.tsx` 封装（ChartContainer/ChartTooltip/ChartLegendContent/useChart）。
- **登记日期**：2026-08-26
- **结论**：按任务约定「若是 recharts 封装则按 vendor 处理并登记上游」，
  本 chunk **不做全量解混淆**（406KB 的 recharts 全量 bundle），
  仅登记上游身份、导出别名映射（供已恢复模块引用）与内嵌 first-party 件清单。

---

## 1. 身份证据（把握度：高）

1. **版本**：`node_modules/recharts/package.json` = 3.8.0；chunk 内可逐一找到
   recharts 3.8.0 的特征字符串与组件名：
   - `displayName = 'Bar' / 'Line' / 'Pie' / 'Cell'`（本系列图表 chunk 内）；
   - redux slice 名 `'tooltip'`、action 类型 `'tooltip/setActiveMouseOverItemIndex'`、
     `'tooltip/mouseLeaveItem'`、`'tooltip/setActiveClickItemIndex'`
     （已在标样 appUsageChartPalette 的运行时验证中实测命中）；
   - `recharts-bar-stack-clip-path-`、`recharts-pie-sector`、`recharts-line-curve`、
     `recharts-active-dot` 等 3.8.0 类名。
2. **逐函数对照**：三个图表模块恢复时已将本 chunk 的相关导出与
   `node_modules/recharts/es6/{cartesian/Bar.js, cartesian/Line.js, polar/Pie.js,
   chart/BarChart.js, chart/LineChart.js, chart/PieChart.js, chart/PolarChart.js,
   state/selectors/barSelectors.js, state/selectors/lineSelectors.js,
   state/selectors/pieSelectors.js, state/selectors/polarSelectors.js,
   cartesian/BarStack.js, component/Dots.js, component/ActivePoints.js,
   shape/Dot.js, util/BarUtils.js}` 逐语句比对，全部一致
   （差异仅 babel 编译形态与 minify 改名）。
3. **内嵌 first-party 件**：chunk 尾部含 `useChart must be used within a <ChartContainer />`
   错误文案与 `data-slot="chart"`、`--color-${key}` 主题变量注入（`<style>` 标签），
   即 shadcn/ui `chart.tsx` 的 ZCode 定制版（类名含 ZCode 设计系统记号：
   `text-ui-base/relaxed`、`border-border/50`、`fill-muted-foreground`）。

## 2. 内嵌 first-party 符号（chart.tsx 封装，jsx 口径行号见
`src-reconstructed/renderer/assets/chart-iT2j9K3u.jsx`）

| chunk 内部名 | 导出别名 | 语义名 | jsx 行 | 说明 |
|---|---|---|---|---|
| `VT` | `t` | `ChartContainer` | 13178 | 图表容器：data-chart id + 主题变量注入 + 缺省 320x200 |
| `HT` | （未导出） | `ChartStyle` | 13204 | `<style>` 注入 `--color-<key>`（light/dark 双份） |
| `zT` | （未导出） | `ChartContext` | 13172 | createContext({config}) |
| `BT` | （未导出） | `useChart` | 13174 | 上下文 hook（脱离容器抛错） |
| `WT` | `a` | `ChartTooltip` | 13214 | tooltip 内容：indicator=dot/line/dashed、hideLabel、formatter、labelFormatter |
| `KT` | `r` | `ChartLegendContent` | 13259 | 图例内容：色块 + label，verticalAlign top/bottom |
| `qT` | （未导出） | `getPayloadConfigFromPayload` | 13272 | config 键解析（payload 优先） |

## 3. 被 first-party 模块消费的导出别名映射

（完整映射见各模块尾符号表；此处汇总别名 -> 内部名 -> 语义名）

| 别名 | 内部名 | 语义名 | 上游文件 |
|---|---|---|---|
| `Tn` | `F` | useAppDispatch | state/hooks.js |
| `X` | `C_` | setActiveClickItemIndex | state/tooltipSlice.js |
| `Y` | `x_` | mouseLeaveItem | state/tooltipSlice.js |
| `Z` | `b_` | setActiveMouseOverItemIndex | state/tooltipSlice.js |
| `En` | `I` | useAppSelector | state/hooks.js |
| `J` | `Tv` | selectActiveTooltipIndex | state/selectors/tooltipSelectors.js |
| `K` | `Dv` | selectActiveTooltipDataKey | state/selectors/tooltipSelectors.js |
| `q` | `Ov` | selectActiveTooltipGraphicalItemId | state/selectors/tooltipSelectors.js |
| `i` | `UT` | Tooltip | component/Tooltip.js |
| `n` | `GT` | Legend | component/Legend.js |
| `Rn` | `un` | Layer | container/Layer.js |
| `G` | `Oy` | ZIndexLayer | zIndex/ZIndexLayer.js |
| `Lt` | `fm` | DefaultZIndexes | zIndex/DefaultZIndexes.js |
| `j` | `aC` | Shape | util/ActiveShapeUtils.js |
| `Xt` | `Id` | Curve | shape/Curve.js |
| `V` | `Sx` | Text | component/Text.js |
| `Nf`/`Yt` | `Nf` | JavascriptAnimate | animation/JavascriptAnimate.js |
| `jn` | `jn` | interpolate | util/DataUtils.js |
| `P` | `P` | isNullish | util/DataUtils.js |
| `Cn` | `V` | isNumber | util/DataUtils.js |
| `Pn` | `N` | isFunction | util/DataUtils.js |
| `Fn` | `Cn` | mathSign | util/DataUtils.js |
| `Mn` | `wn` | isNan | util/DataUtils.js |
| `In` | `Fn` | noop | util/DataUtils.js |
| `An` | `kn` | getPercentValue | util/DataUtils.js |
| `yn` | `H` | getValueByDataKey | util/ChartUtils.js |
| `vn`/`$s` | `$s` | getTooltipNameProp | util/ChartUtils.js |
| `dn` | `Zs` | getBandSizeOfAxis | util/ChartUtils.js |
| `bn` | `Is` | isCategoricalAxis | util/ChartUtils.js |
| `pn` | `Ws` | getCateCoordinateOfBar | util/ChartUtils.js |
| `mn` | `Us` | getCateCoordinateOfLine | util/ChartUtils.js |
| `fn` | `Gs` | getBaseValueOfBar | util/ChartUtils.js |
| `xn` | `zs` | truncateByDomain | util/ChartUtils.js |
| `Kt` | `fp` | getMaxRadius | util/PolarUtils.js |
| `qt` | `q` | polarToCartesian | util/PolarUtils.js |
| `gn` | `Hs` | getNormalizedStackId | util/stacks/getStackSeriesIdentifier.js |
| `Nt` | `Pm` | getStackSeriesIdentifier | util/stacks/getStackSeriesIdentifier.js |
| `Mt` | `Im` | isStacked | util/stacks（graphicalItem 判定） |
| `M` | `OS` | findAllByType | util/ReactUtils.js |
| `N` | `kS` | isClipDot | util/ReactUtils.js |
| `Bn` | `$t` | filterProps | util/ReactUtils.js |
| `kn` | `er` | adaptEventsOfChild | util/types.js |
| `On` | `Qn` | adaptEventHandlers | util/types.js |
| `Vn` | `nm` | svgPropertiesNoEvents | util/svgPropertiesNoEvents.js |
| `Hn` | `Zt` | svgPropertiesNoEventsFromUnknown | util/svgPropertiesNoEvents.js |
| `zn` | `Qt` | svgPropertiesAndEvents | util/svgPropertiesAndEvents.js |
| `P`/`xS` | `xS` | getClassNameFromUnknown | util/svgPropertiesNoEvents.js |
| `Dn` | `or` | resolveDefaultProps | util/resolveDefaultProps.js |
| `Jt` | `Pf` | useAnimationId | util/useAnimationId.js |
| `Qt` | `Au` | propsAreEqual | util/propsAreEqual.js |
| `wn` | `L` | createSelector | reselect（依赖） |
| `$t` | `W` | selectChartLayout | context/chartLayoutContext.js |
| `nn` | `al` | useChartLayout | context/chartLayoutContext.js |
| `on` | `Cc` | useIsPanorama | context/PanoramaContext.js |
| `_` | `VC` | usePlotArea | hooks.js |
| `g` | `HC` | useActiveTooltipDataPoints | hooks.js |
| `Tn` | `F` | useAppDispatch | state/hooks.js |
| `D` | `fC` | RegisterGraphicalItemId | context/RegisterGraphicalItemId.js |
| `T` | `xC` | SetCartesianGraphicalItem | state/SetGraphicalItem.js |
| `E` | `SC` | SetPolarGraphicalItem | state/SetGraphicalItem.js |
| `A` | `oC` | SetTooltipEntrySettings | state/SetTooltipEntrySettings.js |
| `O` | `sC` | SetLegendPayload（cartesian） | state/SetLegendPayload.js |
| `k` | `cC` | SetPolarLegendPayload（centric/radial 守卫） | state/SetLegendPayload.js |
| `u` | `rT` | RechartsStoreProvider | state/RechartsStoreProvider.js |
| `h` | `UC` | ChartDataContextProvider | context/chartDataContext.js |
| `c` | `oT` | ReportChartProps | state/ReportChartProps.js |
| `s` | `sT` | ReportEventSettings | state/ReportEventSettings.js |
| `l` | `aT` | ReportMainChartProps | state/ReportMainChartProps.js |
| `f` | `kw` | setPolarOptions | state/ReportPolarOptions.js |
| `o` | `IT` | CategoricalChart | chart/CategoricalChart.js |
| `W` | `Wy` | arrayTooltipSearcher | state/optionsSlice.js |
| `d` | `Zw` | initialEventSettingsState | state/eventSettingsSlice.js |
| `St` | `_h` | selectUnfilteredCartesianItems | state/selectors/axisSelectors.js |
| `ft` | `a_` | selectAxisWithScale | state/selectors/axisSelectors.js |
| `xt` | `i_` | selectTicksOfGraphicalItem | state/selectors/axisSelectors.js |
| `mt` | `$g` | selectCartesianAxisSize | state/selectors/axisSelectors.js |
| `yt` | `Bh` | selectStackGroups | state/selectors/axisSelectors.js |
| `cn` | `U` | selectChartOffsetInternal | state/selectors/selectChartOffsetInternal.js |
| `sn` | `xc` | selectAxisViewBox | state/selectors/selectChartOffsetInternal.js |
| `Wt` | `Hp` | selectChartDataWithIndexesIfNotInPanoramaPosition3 | state/selectors/dataSelectors.js |
| `Gt` | `Vp` | selectChartDataWithIndexesIfNotInPanoramaPosition4 | state/selectors/dataSelectors.js |
| `ie` | `Bp` | selectChartDataAndAlwaysIgnoreIndexes | state/selectors/dataSelectors.js |
| `Bt` | `am` | selectRootBarSize | state/selectors/rootPropsSelectors.js |
| `Vt` | `nm` | selectRootMaxBarSize | state/selectors/rootPropsSelectors.js |
| `Rt` | `im` | selectBarGap | state/selectors/rootPropsSelectors.js |
| `zt` | `rm` | selectBarCategoryGap | state/selectors/rootPropsSelectors.js |
| `F` | `cS` | CartesianLabelListContextProvider | component/LabelList.js |
| `L` | `uS` | PolarLabelListContextProvider | component/LabelList.js |
| `I` | `mS` | LabelListFromLabelProp | component/LabelList.js |
| `ln` | `lc` | DATA_ITEM_GRAPHICAL_ITEM_ID_ATTRIBUTE_NAME | util（'data-recharts-item-id'） |
| `un` | `cc` | DATA_ITEM_INDEX_ATTRIBUTE_NAME | util（'data-recharts-item-index'） |

> 注：`Tn/X/Y/Z` 四个别名已在标样（appUsageChartPalette）中经运行时验证。
> 其余别名经导出表 + 上游源码双重对照；标注「上游文件」为 recharts@3.8.0 es6 源码路径。

## 4. 消费者

- `appUsageChartPalette-BeN2wLzW.js`（Tn/X/Y/Z）
- `AppUsageDailyModelBarChart-037NXfkz.js`、`AppUsageModelUsagePieChart-_KCE1AAL.js`、
  `CodingPlanUsageLineChart-BpNLwqMV.js`（大量别名，见各模块报告）
- `CartesianChart-nORn-0bc.js`（recharts CartesianChart/XAxis/YAxis/CartesianGrid 分包，
  同为 vendor 件，未在本批次任务清单内，未单独登记）
- 其余引用者（styles 主 chunk 等）不在本批次范围。

## 5. 合规备注

- 未修改 `out/` 下任何文件（仅读取）。
- recharts 为 MIT 许可；本登记不复制其源码，仅做身份与映射记录。
