# AppUsageDailyModelBarChart 恢复决策记录

- **原始 chunk**：`out/renderer/assets/AppUsageDailyModelBarChart-037NXfkz.js`
  （1,221 行，32,122 字节；pretty 版 jsx 1,097 行）
- **恢复产物**：`src-reconstructed/modules/appUsageDailyModelBarChart.tsx`
- **恢复日期**：2026-08-26
- **恢复方法**：LLM 语义重命名 + JSX 还原 + 逐行对照 `node_modules/recharts@3.8.0`
  与 `src-reconstructed/modules/appUsageChartPalette.tsx`（标样）交叉验证
- **定性**：**混合件** —— vendored recharts@3.8.0「Bar 全家桶」（约 965 行，
  jsx 口径）+ **ZCode first-party「按日模型用量柱状图」**（约 130 行）

---

## 1. 模块定性

| 成分 | jsx 行范围 | 上游 |
|---|---|---|
| 条带尺寸/位置/堆叠组合器（`getBarSize`…`combineBarPosition`） | 12-158 | recharts `state/selectors/combiners/*.js` |
| 柱选择器族（`selectSynchronisedBarSettings`…`selectBarRectangles`） | 160-249 | recharts `state/selectors/barSelectors.js` |
| BarStack 上下文节选（`BarStackContext`/`useStackId`/`BarStackClipLayer`） | 306-334 | recharts `cartesian/BarStack.js` |
| Bar 组件管线（`BarBackground`…`Bar`，含 `computeBarRectangles`） | 336-959 | recharts `cartesian/Bar.js`（+ `util/BarUtils.js` 的 `minPointSizeCallback`、`zIndex/getZIndexFromUnknown`） |
| `BarChart` | 961-969 | recharts `chart/BarChart.js` |
| **first-party 段**（边距/过滤/刻度/数据组装/组件） | 971-1097 | ZCode 应用代码 |

first-party 段消费者证据：i18n key `settings.usage.dailyChartTitle/tokenUnit/
emptyTitle/emptyDescription` 见于 IntlProvider 双语目录；`stackId="tokens"`、
`var(--color-modelN)`（经 ChartContainer 注入的 `--color-*` 变量，与
`chartConfig` 键对应）；调色板/事件 hook 复用已恢复的标样模块。

## 2. 符号决策表（摘要）

完整映射见恢复版尾符号表。关键判定：

| 原名 | 语义名 | 把握度 | 依据 |
|---|---|---|---|
| `Bt` | `BarChart` | **高** | `chartName:'BarChart'`、defaultTooltipEventType 'axis'、validateTooltipEventTypes ['axis','item']，与上游 chart/BarChart.js 逐字一致 |
| `Rt` | `Bar` | **高** | `displayName='Bar'`；memo+propsAreEqual |
| `at` | `selectBarRectangles` | **高** | 13 输入选择器与上游 barSelectors 尾部逐一对应 |
| `It` | `computeBarRectangles` | **高** | 纯函数体与上游逐语句一致（堆叠截断/minPointSize 补偿/零尺寸剔除） |
| `K` | `BarRectangle` | **高** | 上游 util/BarUtils.js：Shape + 'rectangle' + active/inactive 类名 |
| `ge`(chart 导入 j) | `Shape` | **高** | 上游 util/ActiveShapeUtils（Line/Pie chunk 同物复用，形状参数 'curve'/'sector' 互证） |
| `Vt` | `DAILY_MODEL_BAR_CHART_MARGIN` | **高** | `{top:8,right:24,left:24}` 字面量 |
| `Ht` | `filterPositiveTooltipEntries` | **高** | `Number.isFinite && >0` 过滤 tooltip payload |
| `Ut` | `shouldShowDateTick` | **高** | `≤14 全显；>45 步长 7；否则 5；首尾必显` |
| `Wt` | `createEmptyDailyUsageRow` | **高** | `{label, tooltipLabel, total:0}` + 模型键置 0 |
| `Gt` | `buildDailyModelUsageRows` | **高** | 逐日聚合 + `__unknown__` 兜底 + `localeCompare` 排序 |
| `Kt` | `prepareDailyModelBarChartModel` | **高** | 前 6 模型 + `getUsageChartColor(n)` 配色 + chartConfig |
| `qt` | `PositiveEntriesTooltip` | **高** | 过滤后透传 ChartTooltip |
| `Jt` | `AppUsageDailyModelBarChart` | **高** | 原导出名未混淆 |

跨 chunk 导入（63 个别名）全部经 chart 导出表 + 上游源码双重对照，
其中 chart chunk（recharts bundle）别名总表见 `chartVendor.report.md` §3。

## 3. 把握度分布

**命名决策（共 66 个符号 = 63 导入 + 13 本地定义，其中 babel 辅助 10 个按语义命名）：**

| 把握度 | 数量 | 符号 |
|---|---|---|
| 高 | **64** | 全部选择器/组件/纯函数（上游逐行对照）+ first-party 全部 8 符号 |
| 中 | **0** | — |
| 低 | **0** | — |

**类型推断：**

| 把握度 | 数量 | 项目 |
|---|---|---|
| 高 | 3 | `ChartLayout`、`BarPosition`、`BarSizeEntry` |
| 中（`// TODO(infer)`） | 3 | `RechartsState`（宽松 any）、`BarSettings` 完整字段、快照类型 `UsageSnapshot`（上游 usageStatsService 未建模） |

## 4. JSX 还原说明

原 chunk 全部经 `React.createElement`（minify 产物）。恢复版对 14 个组件
（BarBackground/BarLabelListProvider/BarRectangleWithActiveState/…/主组件）
逐一还原为 JSX；`_extends`/`_objectSpread`/`_objectWithoutProperties` 等
babel 辅助按上游语义以普通函数保留（它们是编译产物的一部分，行为不可省略：
如 `BarRectangles` 的键剔除、`_excluded*` 常量表）。

## 5. 行为等价性说明

- vendor 段：逐语句转写自上游（含 `>>= 0` 取整、`0.9` 收缩、`??` 兜底链、
  `minPointSizeCallback` 的 invariant 分支、`requestAnimationFrame` 两阶段激活）；
- first-party 段：数据组装/刻度/过滤/类名/CSS 变量逐字保留；
- 唯一文本级差异：逗号表达式与三元展开为语句（无可观察差异）。

## 6. 验证

- **esbuild 解析**：0 错（esbuild 0.24.0，`--loader:.tsx=tsx --jsx=automatic`）。
- **运行时等价检查（导出面）**：原始 chunk 与恢复版（esbuild 机械转换副本）
  在 Node ESM 中加载，导出键均恰为 `{AppUsageDailyModelBarChart}` 且均为
  函数组件 —— PASS（harness：`/tmp/verify-charts-surface.mjs`）。
- **深度运行时渲染对比不可行的原因**：组件渲染需要 recharts Redux store、
  CartesianChart 上下文、DOM 测量（容器尺寸/刻度布局）与 react-dom 渲染器；
  本环境无 react-dom（依赖经构建产物内联），无法构造等价渲染沙箱。
  该部分等价性由「上游逐行转写 + 导出面实测」承担，与标样对 vendored
  recharts 件的处理方式一致。

## 7. 流程合规备注

- 未修改 `out/` 下任何文件（仅读取）。
- 仅新建恢复文档/源码，未编辑既有符号，故未执行 `gitnexus_impact` /
  `gitnexus_detect_changes`（本会话亦无 GitNexus MCP 工具可用）。
- vendor 上游登记：recharts@3.8.0（MIT），详见 `chartVendor.report.md`。
