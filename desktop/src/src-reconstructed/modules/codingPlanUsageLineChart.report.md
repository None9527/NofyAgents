# CodingPlanUsageLineChart 恢复决策记录

- **原始 chunk**：`out/renderer/assets/CodingPlanUsageLineChart-BpNLwqMV.js`
  （1,065 行，27,107 字节；pretty 版 jsx 996 行）
- **恢复产物**：`src-reconstructed/modules/codingPlanUsageLineChart.tsx`
- **恢复日期**：2026-08-26
- **恢复方法**：LLM 语义重命名 + JSX 还原 + 逐行对照 `node_modules/recharts@3.8.0`
- **定性**：**混合件** —— vendored recharts@3.8.0「Line 全家桶」（约 890 行，
  jsx 口径）+ **ZCode first-party「Coding Plan 用量折线图」**（约 110 行）

---

## 1. 模块定性

| 成分 | jsx 行范围 | 上游 |
|---|---|---|
| `Dot` | 19-35 | recharts `shape/Dot.js` |
| `DotItem`/`shouldRenderDots`/`Dots` | 108-168 | recharts `component/Dots.js` |
| `ActivePoint`/`ActivePoints` | 212-238 | recharts `component/ActivePoints.js` |
| `getRadiusAndStrokeWidthFromDot` | 296-316 | recharts `util/getRadiusAndStrokeWidthFromDot.js` |
| 折线选择器族（`selectXAxisWithScale`…`selectLinePoints`） | 264-288 | recharts `state/selectors/lineSelectors.js` |
| Line 组件管线（`computeLegendPayloadFromAreaData`…`Line`，含 `computeLinePoints`、描边虚线动画三件套） | 393-888 | recharts `cartesian/Line.js` |
| `LineChart` | 889-895 | recharts `chart/LineChart.js` |
| **first-party 段**（调色板内联副本/边距/时间标签/刻度/数据组装/组件） | 897-996 | ZCode 应用代码 |

## 2. 符号决策表（摘要）

完整映射见恢复版尾符号表。关键判定：

| 原名 | 语义名 | 把握度 | 依据 |
|---|---|---|---|
| `ht` | `Line` | **高** | `displayName='Line'`；memo+propsAreEqual |
| `_t` | `LineChart` | **高** | `chartName:'LineChart'`、tooltip 类型 ['axis']，与上游逐字一致 |
| `He` | `selectLinePoints` | **高** | 8 输入选择器与上游 lineSelectors 逐一对应（含 `xAxisTicks.length === 0` 守卫） |
| `pt` | `computeLinePoints` | **高** | 纯函数与上游逐语句一致（horizontal/vertical 分支、`isNullish -> null`） |
| `B` | `Dot` | **高** | `recharts-dot` 类名 + isNumber 三重守卫 |
| `Me` | `Dots` | **高** | `dot-${i}` 键、`clipPath-dots-` 前缀、zIndex 缺省 scatter |
| `Le` | `ActivePoints` | **高** | `useActiveTooltipDataPoints().includes(payload)` 命中 |
| `Ue` | `getRadiusAndStrokeWidthFromDot` | **高** | r=3/strokeWidth=2 缺省 + NaN/负数回退 |
| `nt` | `getStrokeDasharray` | **高** | 用户虚线模式的动画截断算法（repeat + 余长截断 + 奇偶补 0） |
| `st` | `CurveWithAnimation` | **高** | 描边生长 + 上一帧插值 + `animateNewValues` 双倍宽度飞入 |
| `ie`(_) | `usePlotArea` | **高** | 解构 `{height,width,x,y}`，hooks.js 行 382 |
| `le`(g) | `useActiveTooltipDataPoints` | **高** | hooks.js 行 402；用法 `includes(payload)` |
| `de`(j) | `Shape` | **高** | `shapeType:'curve'` + `pathRef`（与 Bar/Pie chunk 的 j 同物互证） |
| `$` | `USAGE_CHART_COLORS`（内联副本） | **高** | 6 个 `var(--color-usage-chart-N)` 与调色板模块逐字同值 |
| `vt` | `CODING_PLAN_LINE_CHART_MARGIN` | **高** | `{8,12,8}` |
| `yt` | `getUsageChartColorLocal` | **高** | `% length` + `?? [0]`（与调色板模块同语义） |
| `bt` | `formatTimeLabel` | **高** | `'hour'` 取前 5 字符（'HH:MM'）；日粒度 Intl month:short+day:numeric |
| `xt` | `shouldShowTimeTick` | **高** | 与柱状图 `shouldShowDateTick` 同规则（14/45 阈值） |
| `St` | `buildLineChartData` | **高** | 逐序列 `values[i] ?? 0` 填充 |
| `Ct` | `CodingPlanUsageLineChart` | **高** | 原导出名未混淆 |

## 3. 把握度分布

**命名决策（共约 62 个符号 = 46 导入 + 本地定义，含 babel 辅助）：**

| 把握度 | 数量 | 符号 |
|---|---|---|
| 高 | **62** | 全部（上游逐行对照 + 类名/键名字面量自证；`UsageGranularity` 的 'hour'/'day' 由组件内分支直接给出） |
| 中 | **0** | — |
| 低 | **0** | — |

**类型推断：**

| 把握度 | 数量 | 项目 |
|---|---|---|
| 高 | 2 | `UsageSeries`、`LinePoint` |
| 中（`// TODO(infer)`） | 2 | `UsageGranularity` 是否还有 week/month（上游 usageStatsService 未建模）、`valueKind` 完整取值域 |

## 4. JSX 还原说明

原 chunk 全部经 `React.createElement`。恢复版对 12 个组件逐一还原 JSX；
`CurveWithAnimation` 的动画回调（`t => {...}`）保持单参数函数形状；
`getStrokeDasharray` 的正则 `/[,\s]+/gim` 逐字保留。

## 5. 行为等价性说明

- vendor 段逐语句转写自上游（含 `>>` 取整、`lines.length % 2 !== 0 ? [...lines, 0]`
  补齐、`longestAnimatedLengthRef` 跨动画周期继承、`clipDot` 双 clipPath 策略）；
- first-party 段：系列前 6 截断、`series${index}` 键、`var(--color-seriesN)`、
  `type="monotone"`、`strokeWidth=2`、`dot=false`、Legend 的
  `ChartLegendContent className="flex-wrap justify-start gap-3"` 逐字保留；
- 空态三条件（无系列/无时间点/最大值 ≤ 0）与 `emptyDescription` 透传逐字保留；
- 唯一文本级差异：逗号表达式与三元展开（无可观察差异）。

## 6. 验证

- **esbuild 解析**：0 错。
- **运行时等价检查（导出面）**：原始 chunk 与恢复版副本导出键均恰为
  `{CodingPlanUsageLineChart}` 且均为函数组件 —— PASS
  （harness：`/tmp/verify-charts-surface.mjs`）。
- **深度渲染对比不可行的原因**：同柱状图/饼图模块（需 recharts store +
  react-dom；本环境无 react-dom）。

## 7. 流程合规备注

- 未修改 `out/` 下任何文件（仅读取）。
- 仅新建恢复文档/源码，未编辑既有符号，故未执行 `gitnexus_impact` /
  `gitnexus_detect_changes`（本会话亦无 GitNexus MCP 工具可用）。
- vendor 上游登记：recharts@3.8.0（MIT），详见 `chartVendor.report.md`。
