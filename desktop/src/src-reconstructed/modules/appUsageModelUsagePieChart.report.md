# AppUsageModelUsagePieChart 恢复决策记录

- **原始 chunk**：`out/renderer/assets/AppUsageModelUsagePieChart-_KCE1AAL.js`
  （1,116 行，32,186 字节；pretty 版 jsx 992 行）
- **恢复产物**：`src-reconstructed/modules/appUsageModelUsagePieChart.tsx`
- **恢复日期**：2026-08-26
- **恢复方法**：LLM 语义重命名 + JSX 还原 + 逐行对照 `node_modules/recharts@3.8.0`
- **定性**：**混合件** —— vendored recharts@3.8.0「Pie 全家桶」（约 880 行，
  jsx 口径）+ **ZCode first-party「模型用量占比饼图」**（约 110 行）

---

## 1. 模块定性

| 成分 | jsx 行范围 | 上游 |
|---|---|---|
| 极坐标基础选择器（`selectPolarItemsSettings`…`selectPolarAppliedValues` + 数值域派生） | 9-27 | recharts `state/selectors/polarSelectors.js` |
| 极坐标 tooltip 载荷选择器链（`selectPolarTooltipPayload` 等） | 28-46 | recharts selectors（极坐标分支；个别深层组合器标 TODO(infer)） |
| 饼选择器族（`selectSynchronisedPieSettings`/`selectDisplayedData`/`selectPieLegend`/`selectPieSectors`） | 69-101 | recharts `state/selectors/pieSelectors.js` |
| Pie 组件管线（`SetPiePayloadLegend`…`Pie`，含 `computePieSectors`） | 182-672 | recharts `polar/Pie.js` |
| `ReportPolarOptions` | 674-680 | recharts `state/ReportPolarOptions.js` |
| `PolarChart` + `defaultPolarChartProps` | 682-826 | recharts `chart/PolarChart.js` |
| `PieChart` + `defaultPieChartProps` | 868-879 | recharts `chart/PieChart.js` |
| **first-party 段**（分片上限/标签兜底/数据准备/组件） | 881-992 | ZCode 应用代码 |

## 2. 符号决策表（摘要）

完整映射见恢复版尾符号表。关键判定：

| 原名 | 语义名 | 把握度 | 依据 |
|---|---|---|---|
| `jt` | `Pie` | **高** | `displayName='Pie'`（jsx 671-672） |
| `Jt` | `PieChart` | **高** | `chartName:'PieChart'`、defaultTooltipEventType 'item'、validateTooltipEventTypes ['item']，与上游逐字一致 |
| `Vt` | `PolarChart` | **高** | RechartsStoreProvider→ChartDataContextProvider→ReportMainChartProps→ReportEventSettings→ReportChartProps→ReportPolarOptions→CategoricalChart 链与上游 PolarChart.js 逐字一致 |
| `qt` | `defaultPieChartProps` | **高** | `{...defaultPolarChartProps, layout:'centric', startAngle:0, endAngle:360}` |
| `Tt` | `computePieSectors` | **高** | 纯函数：值占比分配角度、minAngle 保底、paddingAngle 间隔、cornerRadius 解析、tooltipPayload/tooltipPosition 生成，与上游逐语句一致 |
| `wt` | `PieSectors` | **高** | 三重命中判定（activeIndex + dataKey + graphicalItemId）与 `data-recharts-item-*` 属性常量 |
| `ue`/`ze`/`Oe` 相关 | `selectActiveTooltipGraphicalItemId` / `DATA_ITEM_INDEX_ATTRIBUTE_NAME` / `DATA_ITEM_GRAPHICAL_ITEM_ID_ATTRIBUTE_NAME` | **高** | chart chunk 内 `cc='data-recharts-item-index'`、`lc='data-recharts-item-id'` 字面量 |
| `P`(qt) | `polarToCartesian` | **高** | `(cx, cy, radius, angle) -> {x, y}`，util/PolarUtils |
| `E`(L) | `PolarLabelListContextProvider` | **高** | 上游 PieLabelListProvider 的 import 名单确认 |
| `k`(cC) | `SetPolarLegendPayload` | **高** | chart chunk 内 `cC` 带 `layout !== 'centric' && !== 'radial'` 守卫，区别于 `sC`（cartesian 版） |
| `Q` | `MAX_PIE_SLICES`（=6） | **高** | 分片逻辑阈值 |
| `Yt` | `getPieModelLabel` | **高** | 与 usageStatsUiParts 的 getModelLabel 同款（`settings.usage.unknownModel` 兜底） |
| `Xt` | `prepareModelPieChartData` | **高** | >6 模型时前 5 + Other（`settings.usage.modelChart.other`）；占比防 0 除 |
| `Zt` | `PIE_CHART_MARGIN` | **高** | `{4,4,4,4}` |
| `Qt` | `AppUsageModelUsagePieChart` | **高** | 原导出名未混淆 |

## 3. 把握度分布

**命名决策（共约 70 个符号 = 62 导入 + 本地定义，含 babel 辅助）：**

| 把握度 | 数量 | 符号 |
|---|---|---|
| 高 | **62** | 上游逐行对照成功的全部选择器/组件/纯函数 + first-party 全部 7 符号 |
| 中（`// TODO(infer)`） | **8** | 极坐标 tooltip 载荷链的深层输入/组合器：`selectActiveLabel`(om)、`selectTooltipPayloadSearcher`(Wh)、`selectTooltipAxisDataKey`(Gh)、`combineTooltipPayloadConfigurationsInput`(Me)、`combinePolarAppliedNumericalValues`(Ae)、`selectPolarAppliedNumericalValuesInput`(Be)、`pickTooltipEventType`(dd)、`selectPolarTooltipEvents`(Cg) —— 这些是模块图保留项（渲染路径不消费），按上游 selectors 语义命名 |
| 低 | **0** | — |

**类型推断：**

| 把握度 | 数量 | 项目 |
|---|---|---|
| 高 | 2 | `PieSlice`、`ModelUsageSnapshot` 核心字段 |
| 中（`// TODO(infer)`） | 2 | `PieSettings` 完整字段、`RechartsState` |

## 4. JSX 还原说明

原 chunk 全部经 `React.createElement`。恢复版对 13 个组件逐一还原 JSX；
`computePieSectors` 内的 `prev` 累积链（上游用 `x = _objectSpread(...)`
逐段构造扇区对象）按上游顺序展开为对象字面量，字段与求值顺序不变。

## 5. 行为等价性说明

- vendor 段逐语句转写自上游（含 `>>`/`%` 运算、`parseFloat(cornerRadius)`、
  `mathSign(deltaAngle) * paddingAngle * (value === 0 ? 0 : 1)` 间隔抑制、
  lodash.get 取 `paddingAngle`（经 `lodashGetModule.default`，与上游
  `import lodashGet from 'lodash.get'` 的默认互操作一致））；
- first-party 段：分片/占比/中心总量/明细列表/类名逐字保留；
- 唯一文本级差异：逗号表达式与三元展开（无可观察差异）。

## 6. 验证

- **esbuild 解析**：0 错。
- **运行时等价检查（导出面）**：原始 chunk 与恢复版副本导出键均恰为
  `{AppUsageModelUsagePieChart}` 且均为函数组件 —— PASS
  （harness：`/tmp/verify-charts-surface.mjs`）。
- **深度渲染对比不可行的原因**：同柱状图模块（需 recharts store + 极坐标
  几何 + react-dom；本环境无 react-dom）。等价性由上游逐行转写 + 导出面
  实测承担。

## 7. 流程合规备注

- 未修改 `out/` 下任何文件（仅读取）。
- 仅新建恢复文档/源码，未编辑既有符号，故未执行 `gitnexus_impact` /
  `gitnexus_detect_changes`（本会话亦无 GitNexus MCP 工具可用）。
- vendor 上游登记：recharts@3.8.0（MIT），详见 `chartVendor.report.md`。
