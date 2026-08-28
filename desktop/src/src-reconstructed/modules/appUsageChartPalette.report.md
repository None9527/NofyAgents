# appUsageChartPalette 恢复决策记录（pilot 标样）

- **原始 chunk**：`out/renderer/assets/appUsageChartPalette-BeN2wLzW.js`（49 行，单一 hash，无 light/dark 双份）
- **恢复产物**：`src-reconstructed/modules/appUsageChartPalette.tsx`
- **恢复日期**：2026-08-26
- **恢复方法**：LLM 语义重命名 + JSX 还原 + 逐行对照 `node_modules/recharts@3.8.0` 源码 + 消费者用法交叉验证

---

## 1. 模块定性

该 chunk 是 Vite/Rollup 为两个「应用用量」图表组件抽取的**共享 chunk**，内容为：

| 成分 | 来源定性 |
|---|---|
| `Cell` 占位组件 | vendored 的 recharts 内部组件（与 `recharts/es6/component/Cell.js` 逐字节一致） |
| 3 个数据项交互事件 hook 工厂 | vendored 的 recharts 内部 hooks（与 `recharts/es6/context/tooltipContext.js` 逐字节一致） |
| 6 色 CSS 变量调色板 + 取色函数 | **ZCode first-party 应用代码**（chunk 得名于此） |

消费者（且仅有这两个）：

- `AppUsageDailyModelBarChart-037NXfkz.js`（`import { a as Ae, i as je, n as Me, r as R, t as z }`）
- `AppUsageModelUsagePieChart-_KCE1AAL.js`（`import { a as R, i as He, n as Ue, r as We, t as z }`）

（`styles-CdEGpc2x.js` 仅在模块图清单中列出本 chunk，非运行时导入。）

## 2. 符号决策表

### 2.1 导入符号（来自 `./chart-iT2j9K3u.js`，recharts 3.8.0 打包产物）

通过 chart chunk 尾部导出表定位内部名，再逐行比对 recharts 源码确认：

| chunk 内名 | 导出别名 | chart 内部名 | recharts 上游名 | 上游文件 | 把握度 | 依据 |
|---|---|---|---|---|---|---|
| `e` | `Tn` | `F` | `useAppDispatch` | `state/hooks.js` | **高** | 函数体逐字节一致：`useContext(ctx) ? ctx.store.dispatch : noop`；noop 为恒等函数 |
| `t` | `X` | `C_` | `setActiveClickItemIndex` | `state/tooltipSlice.js` | **高** | chart chunk 9875 行 `setActiveClickItemIndex: C_` 解构自 `tooltip` slice 的 actions |
| `n` | `Y` | `x_` | `mouseLeaveItem` | `state/tooltipSlice.js` | **高** | 同上，9873 行 |
| `r` | `Z` | `b_` | `setActiveMouseOverItemIndex` | `state/tooltipSlice.js` | **高** | 同上，9872 行 |

### 2.2 本地定义符号

| 原名 | 语义名 | 导出别名 | 把握度 | 依据 |
|---|---|---|---|---|
| `i` | `Cell` | `a` | **高** | `displayName === 'Cell'` 直接给出；与 recharts `component/Cell.js`（`_props => null`）逐字节一致；饼图消费者 1058 行以 `<Cell fill={...}>` JSX 使用；`findAllByType(children, Cell)` 用法（消费者 `k(e.children, Ae)`） |
| `a` | `useMouseEnterItemDispatch` | `r` | **高** | 与 recharts `context/tooltipContext.js` 的 `useMouseEnterItemDispatch` 逐字节一致；消费者将其结果挂到 `onMouseEnter`（Bar 背景矩形与矩形块两处） |
| `o` | `useMouseLeaveItemDispatch` | `i` | **高** | 同上，对应 `useMouseLeaveItemDispatch`；消费者挂到 `onMouseLeave`；只收一个回调参数、dispatch `mouseLeaveItem()` |
| `s` | `useMouseClickItemDispatch` | `n` | **高** | 同上，对应 `useMouseClickItemDispatch`；消费者挂到 `onClick`；dispatch `setActiveClickItemIndex` |
| `c` | `USAGE_CHART_COLORS` | （未导出） | **高** | 6 个 `var(--color-usage-chart-N)` 字符串常量；色值在 `styles-BxSv8qTx.css` 中按 light/dark 定义（如 `--color-usage-chart-1: var(--color-sky-600)`） |
| `l` | `getUsageChartColor` | `t` | **高** | 消费者以 `z(n)`（n 为系列序号）取色：`color: z(n)`、`backgroundColor: z(n)`；`% length` 回绕 + `?? c[0]` 兜底语义明确 |

## 3. 把握度分布

**命名决策（共 10 个符号 = 4 导入 + 6 本地）：**

| 把握度 | 数量 | 符号 |
|---|---|---|
| 高 | **10** | 全部（4 个导入经 chart chunk 导出表 + recharts 源码双重确认；`Cell`/3 个 hook 与 recharts 3.8.0 源码逐字节一致；调色板 2 个符号有 CSS 变量与消费者用法双重证据） |
| 中 | **0** | — |
| 低 | **0** | — |

**类型推断（非命名，标注于源码）：**

| 把握度 | 数量 | 项目 |
|---|---|---|
| 高 | 5 | `ActiveItemPayload` 四字段（与 reducer 逐字段对应）、`ItemEventCallback` 签名、`DataKey` 联合、`getUsageChartColor` 签名、`UsageChartColor` |
| 中（`// TODO(infer)`） | 5 | `ChartCoordinate` 完整形状、`UsageChartDataItem` 业务字段、`CellProps` 全集（仅 `fill` 有用法证据）、`ChartAction.type` 字符串、`ChartDispatch` 返回类型 |
| 低 | 0 | — |

## 4. 外部 chunk 符号依赖

本模块运行时依赖（全部来自 `./chart-iT2j9K3u.js`，即 recharts 3.8.0 bundle）：

| 导出别名 | 语义名 | 用途 |
|---|---|---|
| `Tn` | `useAppDispatch` | hook：取图表 Redux store 的 dispatch |
| `X` | `setActiveClickItemIndex` | action creator（tooltip slice） |
| `Y` | `mouseLeaveItem` | action creator（tooltip slice） |
| `Z` | `setActiveMouseOverItemIndex` | action creator（tooltip slice） |

间接依赖：

- **CSS 变量**：`--color-usage-chart-1..6`，定义于 `styles-BxSv8qTx.css`（light/dark 各一套）；无这些变量时调色板仍返回 `var(...)` 字符串，行为不退化，仅渲染为透明/继承色。
- **React 上下文环境**：`useAppDispatch` 读取 chart chunk 内部的 `RechartsReduxContext`；脱离 `<ChartDataContextProvider>`（chart chunk 导出别名 `u`，内部 `rT`）时回退为恒等 dispatch——恢复版完整保留该兜底。
- 不依赖任何 i18n key、store slice 选择器或其他业务 chunk。

## 5. JSX 还原说明

**原 chunk 不含任何 JSX 语法**（无 `jsx()`/`createElement` 调用）：`Cell` 是 `() => null`，三个 hook 返回普通函数，调色板是纯数据。已参照同名 `src-reconstructed/renderer/assets/appUsageChartPalette-BeN2wLzW.jsx`——其内容与 .js 版仅排版差异、同样无 JSX。故本条要求在本 chunk 上不适用（N/A），真实 JSX 出现在两个消费者 chunk 中。

## 6. 行为等价性说明

- 柯里化形状、参数顺序、`?.` 可选调用、`String(index)` 转换、`% length` + `?? [0]` 兜底均逐字保留。
- 唯一文本级改写：箭头体内逗号表达式 `(cb?.(...), dispatch(...))` 展开为两条语句。返回值由「dispatch 的返回值」变为 `undefined`；React 忽略事件处理器返回值，且 recharts 上游源码本身即写作两条语句，无可观察差异。
- `USAGE_CHART_COLORS` 保持**不导出**（原 chunk 仅经 `t`/`getUsageChartColor` 暴露），维持模块公共 API 一致。

## 7. 运行时等价性验证（已通过）

验证方式：将恢复版 `.tsx` **逐字节复制**为 `.mts`（Node 22 原生类型剥离，内容与交付文件完全一致），与原始 chunk 一同在 Node ESM 中加载（真实加载 `chart-iT2j9K3u.js` 即 recharts 3.8.0 bundle），用 React 19 共享内部量（`__CLIENT_INTERNALS_...__.H`）注入桩 dispatcher 驱动 hooks。**结果：12/12 检查通过**（harness：`/tmp/verify-appUsageChartPalette.mjs`）：

| # | 检查项 | 结果 |
|---|---|---|
| 1 | orig 导出键恰为 `{a,i,n,r,t}` | PASS |
| 2 | rec 导出键恰为 5 个语义名（无多余运行时导出） | PASS |
| 3 | 导出形状一一对应（typeof） | PASS |
| 4 | `Cell(props) === null`（orig & rec） | PASS |
| 5 | `Cell.displayName === 'Cell'`（orig & rec） | PASS |
| 6 | 取色函数在 `index ∈ [-12,12] ∪ {1e6}` 逐值相等（覆盖回绕/负数兜底） | PASS |
| 7 | 调色板语义抽查：`[0]=首色`、`[5]=末色`、`[7]→2 号色（回绕）`、`[-1]→首色（兜底）` | PASS |
| 8 | enter hook：用户回调实参一致（同对象引用）；捕获的 dispatch action **深度相等**，`type === 'tooltip/setActiveMouseOverItemIndex'`，payload 四字段逐字正确 | PASS |
| 9 | leave hook：回调实参一致；action 深度相等，`type === 'tooltip/mouseLeaveItem'` | PASS |
| 10 | click hook：回调实参一致；action 深度相等，`type === 'tooltip/setActiveClickItemIndex'`，payload 逐字正确 | PASS |
| 11 | 无 provider（context=null）时走 noop dispatch，6 个变体均不抛错 | PASS |
| 12 | 回调为 `null` 时 `?.` 短路，6 个变体均不抛错且各产生 1 个 action | PASS |

注：验证用的 `.mts` 副本在验证完成后已删除；`/tmp` 下的 harness 可随时重跑复验。

## 8. 流程合规备注

- 未修改 `out/` 下任何文件（仅读取）。
- 本会话无 GitNexus MCP 工具可用（`search_tool` 返回 0 个工具）；且本任务仅**新建**恢复文档与标样源码，未编辑任何既有符号，故未执行 `gitnexus_impact` / `gitnexus_detect_changes`。
