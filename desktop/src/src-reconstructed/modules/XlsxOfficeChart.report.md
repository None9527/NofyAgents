# XlsxOfficeChart.report.md — 批次 B5-12b 覆盖报告

- **批次**：B5-12b（xlsx 深部下半 + office 装配接线 + CartesianChart 分包落定）
- **日期**：2026-08-28
- **产物**：
  - `desktop/src/src-reconstructed/modules/XlsxDeepB.tsx`（6,530 行）
  - `desktop/src/src-reconstructed/modules/OfficeWiring.tsx`（1,662 行）
  - 本报告（`XlsxOfficeChart.report.md`）
  - **CartesianChart.tsx 免产出**（C 段裁决为纯 vendor，见 §1）
- **只读原件**（全程未写）：
  - `desktop/src/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js`（xlsx，199,413+ 行）
  - `desktop/src/out/renderer/assets/pptxRendererPreviewEngine-BIIRLBue.js`（pptx，55,446 行）
  - `desktop/src/out/renderer/assets/CartesianChart-nORn-0bc.js`（1,739 行）
  - `desktop/src/out/renderer/assets/previewPaneOfficeLegacyDocContent-HWD4EOEM.js`（47,538 行，仅 W3 接线查证）
  - 孪生 jsx：`desktop/src/src-reconstructed/renderer/assets/pptxRendererPreviewEngine-BIIRLBue.jsx`（44,678 行，交叉参照）

---

## 1. C 段性质裁决：CartesianChart-nORn-0bc.js = 纯 recharts 3.8.0 vendor

**裁决：纯 vendor 体，按 VENDOR-MANIFEST 策略版本登记、不转录。无 first-party
包装/补丁层 → `CartesianChart.tsx` 免产出。**

### 1.1 证据

| 证据 | 行号（js） |
|---|---|
| `q.displayName = `CartesianAxis`` | 773 |
| `bt.displayName = `CartesianGrid`` | 1101 |
| `Kt.displayName = `XAxis`` | 1402 |
| `sn.displayName = `YAxis`` | 1623 |
| `recharts-cartesian-axis*` 类名族 | 459/512/516/589/596 |
| CartesianChart defaultProps `mn`（accessibilityLayer/barCategoryGap `10%`/barGap 4/layout `horizontal`/syncMethod `index`） | 1688–1699 |
| 导出表 `export { Et as a, Dt as i, sn as n, Tt as o, Kt as r, bt as s, hn as t };` | 1739（末行） |

无中文文案、无 tailwind/data-slot/zcode 标识、无对内部模块的 import——整块为
recharts 3.8.0（版本依据 `chartVendor.report.md` §1：node_modules/recharts =
3.8.0，特征字符串吻合）经 rollup 分包的产物，夹带 babel 运行时助手与
`lodash/omit`（`ze`）。

### 1.2 导出 → recharts 3.8.0 模块对照（版本登记）

| 导出别名 | 内部符号 | 语义 | recharts 3.8.0 上游文件 |
|---|---|---|---|
| `t` | `hn` | CartesianChart 工厂（createChart 结构） | `chart/CartesianChart.js` |
| `r` | `Kt` | XAxis | `cartesian/XAxis.js` |
| `n` | `sn` | YAxis | `cartesian/YAxis.js` |
| `s` | `bt` | CartesianGrid | `cartesian/CartesianGrid.js` |
| `o` | `Tt` | ScatterContextProvider（context `wt`） | `context/ScatterContext.js` |
| `i` | `Dt` | GraphicalItemClipPath | `cartesian/GraphicalItemClipPath.js` |
| `a` | `Et` | useClipPathRequired | `chart/useClipPathRequired.js`（3.8.0 新增） |
| —（内部） | `Te…Me`（69–161） | getTicks/appendOffset 等 | `util/TickUtils.js` |
| —（内部） | `q`（773） | CartesianAxis | `cartesian/CartesianAxis.js` |
| —（内部） | `ze` | lodash omit | `lodash/omit` |
| —（内部） | `mn`（1688） | CartesianChart defaultProps | `chart/CartesianChart.js` |

### 1.3 消费者登记

- `AppUsageDailyModelBarChart-037NXfkz.js`：import `a/i/n/o/r/s/t` 全部 7 别名
  （`Ne` 于 896 行调用、`<Pe clipPathId xAxisId yAxisId>` 857、`Ie` provider 912、
  `ze` chartName=`BarChart` 1064、`Re/Le/Fe` 网格/轴）。
- `CodingPlanUsageLineChart-BpNLwqMV.js`、`styles mapDeps`（330 行）引用本分包。
- 与 `chartVendor.report.md` §4 行 155「未单独登记」项衔接：**本条即其登记**。

---

## 2. A 段：xlsx 深部下半 —— `oy`（Spreadsheet 网格主组件）

### 2.1 覆盖

| 项 | 原件行号（js） | 产物位置 |
|---|---|---|
| `oy` 函数体（唯一符号） | 193217–199291（6,075 行） | XlsxDeepB.tsx 422–6496（**逐字抽取，1:1**） |
| 头部脚手架（映射表/declare/常量登记） | —（派生） | XlsxDeepB.tsx 1–421 |
| 尾部导出 + 符号表 | —（派生） | XlsxDeepB.tsx 6497–6530 |

`oy` = react-xlsx（私有 duke-sheets 引擎，非公开 vendor → 依计划转录）的
Spreadsheet 网格主组件：@tanstack/react-virtual 虚拟滚动（`k` = useVirtualizer
3.13.23，来自 esm-BY6T6pIH.js）、canvas 四面板绘制（corner/left/top/scroll）、
选区/编辑/剪贴板/缩放/手势/冻结窗格。混淆名零改动保留；语义名仅在映射表登记
（`oy → SpreadsheetGrid`，导出别名）。

### 2.2 头部脚手架（XlsxDeepB.tsx 1–421）

- `declare global { Window.__xlsxCanvasProfile?: any }`（原 196160 读取；兼作剖析记录数组）。
- `declare namespace G/K`：React / jsx-runtime 宽松互操作（vendored interop 约定，返回 any）。
- `declare function k(...)`：useVirtualizer（@tanstack/react-virtual 3.13.23）。
- **38 个常量逐值登记**（原 189512–189563 常量段，属他批转录范围，此处只登记值）：
  xm=24、Sm=80、Cm=24、wm=40、Tm=`application/x-react-xlsx-range+json`、Em=200、
  Dm=50、Om=120、km=24、Am=600、jm=120、Mm=2e3、Nm=120、Pm=160、Fm=24、Im=200、
  Lm=24、Rm=600、zm=480、Bm=4、Vm=16、Um=8、Wm=480、Gm=480、Km=Gm−96、qm=Gm×1.5、
  Jm=Wm×2、Ym=48、Xm=0.0025、eh/th/nh/ih 色值、ah 8 向数组、dh=[]、fh 光标映射。
- `Dl`（错误类构造）、`gm/ay/xv/Iv`（ReactComponent 接口）。
- **111 条 `declare function`**（外部依赖 148 符号中属本文件外者），按段分组并注
  原 js 行号锚点：测量/字体 189593–190057、选区/布局/编辑 190104–192831、
  控制器 ac/oc/sc 14200–14206、dc 14259、canvas 层 183972–189511（B5-12a canonical）等。

### 2.3 范围内 vendored 子段注记

对照 `XlsxPreview.report.md` §8 子段表：**193217–199291 区间内无 vendored 子段**
——整段即 `oy` 本体。其余子段均在区间外：控制器 `Ru` 15672–17817、canvas 渲染
183972–189511（以上 B5-12a）、常量/剪贴板 189512–190101、工具条 190104–192831
（他批）、行渲染 192832–193216、入口 `sy/cy/ly` 199292–199413。

### 2.4 与 B5-12a 的行号互斥

本批 A 段 = js 193217–199291；B5-12a = js 15672–17817 + 183972–189511。
两集合不相交。`gm`（189364）等 12a 符号在本文件仅接口级 declare，canonical 属
XlsxDeepA.tsx（整合期改 import）。

---

## 3. B 段：office 装配接线 + DEFERRED_PRESET_GEOMETRY 余量（OfficeWiring.tsx）

### 3.1 §W 装配接线拓扑（登记；接线本体已在既有重建落定，不重复转录）

| 接线 | vendor/符号 | 原件锚点 | 消费点 | 注入点（已重建） |
|---|---|---|---|---|
| W1 JSZip 3.10.1 | V1 段 jsx 13–3262 / js 13–5723；绑定 `var s = n(o())` js 5724（jsx 3263） | `await s.loadAsync(e)` js 5943（jsx 3462） | pptxRendererPreviewEngine.tsx:76 registerJszip / :80 requireJszip / :358 |
| W2 echarts 5.x+zrender | V2 段 jsx 14650–41068；`Ej`=init 包装 js 36739（jsx 28524）；`lx`=LinearGradient jsx 21575 | `Ej(e)` js 54974（jsx 44254）；`new lx` js 52001/53648（jsx 41172/42715） | pptxRendererPreviewEngine.tsx:90 registerEchartsInit / :94 requireEchartsInit / :1704 |
| W3 docx wasm | 符号簇 js 18073–18097（br/xr/Sr/Cr/wr/Tr） | 模块级调用 js 47425 | previewPaneOfficeLegacyDocContent.tsx:235 initAndRegisterDocxWasm / :251 调用 |

结构化登记见 `OFFICE_WIRING_TOPOLOGY`（OfficeWiring.tsx 124 起）。

### 3.2 §G 几何余量覆盖清单（39 锚点 − 1 已建 = 38 转录 + Di 生成器）

符号 → 原件行号（js / jsx 锚点）→ 产物行号（OfficeWiring.tsx）。全部 [A] 级
（babel 范围抽取，块内字节一致；把握度分级见 §5.3 统计）。

| 符号 | js | jsx 锚点 | OfficeWiring.tsx |
|---|---|---|---|
| downArrowCallout | 10504 | 7766 | 132 |
| rightArrowCallout | 10539 | 7788 | 168 |
| leftArrowCallout | 10572 | 7808 | 202 |
| upArrowCallout | 10605 | 7828 | 236 |
| upDownArrowCallout | 10638 | 7848 | 270 |
| leftRightArrowCallout | 10683 | 7868 | 316 |
| uturnArrow | 10728 | 7890 | 362 |
| leftUpArrow | 10800 | 7934 | 410 |
| bentArrow | 10924 | 7998 | 446 |
| bentUpArrow | 10955 | 8022 | 478 |
| curvedRightArrow | 10980 | 8036 | 504 |
| curvedLeftArrow | 11048 | 8088 | 573 |
| curvedUpArrow | 11081 | 8152 | 575 |
| curvedDownArrow | 11139 | 8196 | 634 |
| **Di**（生成器） | 11195 | 8238 | 691 |
| circularArrow | 11421 | 8238 | 918 |
| leftCircularArrow | 11422 | 8238 | 920 |
| leftRightCircularArrow | 11423 | 8446 | 922 |
| quadArrowCallout | 11513 | 8499 | 963 |
| leftRightUpArrow | 11578 | 8520 | 1029 |
| swooshArrow | 11619 | 8540 | 1071 |
| flowChartPunchedTape | 11778 | 8644 | 1110 |
| flowChartMagneticTape | 11885 | 8692 | 1158 |
| flowChartMultidocument | 11917 | 8722 | 1191 |
| cloudCallout | 12039 | 8788 | 1209 |
| borderCallout1 | 12061 | 8804 | **跳过**（pptxEngineGeometry.ts 671–676 已建，公式一致） |
| sun | 12638 | 9200 | 1236 |
| moon | 12696 | 9244 | 1295 |
| lightningBolt | 12710 | 9256 | 1310 |
| bracketPair | 12726 | 9290 | 1327 |
| bracePair | 12741 | 9330 | 1343 |
| leftBracket | 12762 | 9267 | 1365 |
| rightBracket | 12780 | 9280 | 1384 |
| leftBrace | 12799 | 9370 | 1404 |
| rightBrace | 12832 | 9395 | 1438 |
| actionButtonBlank | 12863 | 9410 | 1470 |
| wave | 12948 | 9423 | 1472 |
| doubleWave | 12977 | 9450 | 1502 |
| irregularSeal1 | 13016 | 9460 | 1542 |
| irregularSeal2 | 13047 | 9479 | 1574 |

导出：`Di as circularArrowPairBuilder`（1609）。

### 3.3 未转录余量（记录，属多区域余量范围）

- `Ti`（jsx 8099–8127）/`Ei`（jsx 8128–8150）：单预设→多区域包装（引用
  `wi`=splitOuterPath、`Ci`=mirrorPathVertically，二者已在 pptxEngineGeometry.ts）。
- `ki` 字形 Map（jsx 9374–9417：actionButtonForwardNext/BackPrevious/Return/
  Beginning/End/Information/Document）与 `Ai` 查找（jsx 9419–9422）。
- 归属 `DEFERRED_MULTI_REGION_ANCHORS`（pptxEngineGeometry.ts 1508–1524，36 项）。

---

## 4. 边界裁决摘要

1. **C 段**：纯 recharts 3.8.0 vendor → 版本登记不转录；CartesianChart.tsx 免产出（§1）。
2. **gm（js 189364）**：canonical 属 B5-12a（XlsxDeepA.tsx）；XlsxDeepB 仅接口 declare。
3. **189512–190101 常量段 / 190104–192831 工具条段**：属他批转录范围；XlsxDeepB
   头部以逐值登记 + `declare function`（111 条，带行号锚点）接口级衔接。
4. **borderCallout1**：pptxEngineGeometry.ts 671–676 已逐字重建（adj1 18750 /
   adj2 −8333 / adj3 112500 / adj4 −38333 公式一致）→ 本批跳过，不重复登记。
5. **既有分歧（只记录，不修改）**：pptxEngineGeometry.ts 62–75 重建的 `arcSegment`
   与原件 `H` 语义有出入（终点计算：中心绝对 vs 当前点相对 → flowChartDelay/Display
   端点不同）。本批 38 预设均不依赖 `H`（各自内置局部弧助手），无耦合风险。
6. **孪生差异裁决**：pptx 的 js 孪生与 jsx 孪生存在文本差异（js 带保留括号如
   `(s * c) / 1e5`、长数组折行不同）。任务门禁以 **原件 js** 为准 → §G 采用 babel
   从 js 范围抽取，块内字节一致（初版曾按 jsx 转录，已整体重制）。
7. **格式裁决**：原件注册为逗号链（`}), V.set(...)`）；OfficeWiring 按既有重建约定
   （pptxEngineGeometry.ts 同例）拆为独立语句——仅块间标点变化，块内（含缩进）
   与 js 字节一致。
8. **与 B5-12a 互斥**：A 段 193217–199291 与 12a（15672–17817 + 183972–189511）
   行号集合不相交；B 段仅取 DEFERRED_PRESET_GEOMETRY_ANCHORS 清单内预设，
   pptx 7 文件既有重建零重复。

---

## 5. 验证记录（四项门禁）

### 5.1 门禁 1：esbuild（`--loader:.tsx=tsx --jsx=preserve`）

| 产物 | 结果 |
|---|---|
| XlsxDeepB.tsx | ✅ 0 错（173.1kb） |
| OfficeWiring.tsx | ✅ 0 错（34.7kb） |
| CartesianChart.tsx | 免产出（§1 裁决） |

### 5.2 门禁 2：tsc strict

- `/tmp/tsconfig.XlsxDeepB.json`：strict、ES2022、jsx preserve、moduleResolution
  Bundler、typeRoots→`web/node_modules/@types`、paths 强制 @types/react 解析、
  include 仅该产物 → **0 错**。
- `/tmp/tsconfig.OfficeWiring.json`：同上；因依赖链拉入既有 `pptxEngineTypes.ts`
  （其 `[Symbol.dispose]` 需 ESNext.Disposable 类型），lib 增补 `ESNext.Disposable`
  （target 仍 ES2022）→ **0 错**。
- 类型注记均为机械添加：参数 `: any`/`: number`、裸 `let xe;` → `xe: number;`、
  `V.get(...)` 调用位 `!`——不改动任何表达式/分支/常量。

### 5.3 门禁 3：锚点回代（15/15 逐字命中，≥8 达标）

| # | 产物:行 | 原件:行 | 内容 | 结果 |
|---|---|---|---|---|
| A1 | XlsxDeepB.tsx:422 | xlsx js:193217 | `function oy({` | PASS |
| A2 | XlsxDeepB.tsx:1205 | xlsx js:194000 | 采样行 | PASS |
| A3 | XlsxDeepB.tsx:2705 | xlsx js:195500 | 采样行 | PASS |
| A4 | XlsxDeepB.tsx:3365 | xlsx js:196160 | `let e = typeof window < `u` ? window.__xlsxCanvasProfile : void 0,` | PASS |
| A5 | XlsxDeepB.tsx:4205 | xlsx js:197000 | 采样行 | PASS |
| A6 | XlsxDeepB.tsx:5705 | xlsx js:198500 | 采样行 | PASS |
| A7 | XlsxDeepB.tsx:6496 | xlsx js:199291 | oy 体末行 `  });` | PASS |
| B1 | OfficeWiring.tsx:133 | pptx js:10505 | `    let r = n?.get(`adj1`) ?? 25e3,` | PASS |
| B2 | OfficeWiring.tsx:692 | pptx js:11196 | Di 首行 `  let a = e / 2,` | PASS |
| B3 | OfficeWiring.tsx:748 | pptx js:11252 | `    be = Math.abs(ve >= 0 ? ye : _e),` | PASS |
| B4 | OfficeWiring.tsx:923 | pptx js:11424 | `  let r = e / 400,` | PASS |
| B5 | OfficeWiring.tsx:1111 | pptx js:11779 | `  let n = e / 20,` | PASS |
| B6 | OfficeWiring.tsx:1210 | pptx js:12040 | `  let r = yi(n, `adj1`, -20833),` | PASS |
| B7 | OfficeWiring.tsx:1296 | pptx js:12697 | moon 早退 `  if (e <= 0 || t <= 0) return ...` | PASS |
| B8 | OfficeWiring.tsx:1473 | pptx js:12949 | wave 首行 | PASS |

保真度统计：
- XlsxDeepB 主体（422–6496）= 原件 193217–199291 **逐字抽取（6,075/6,075 行）**。
- OfficeWiring §G 代码行 1,434 行中 **1,367 行（95.3%）与原件 js 字节一致**；
  其余 67 行为机械类型注记行、`!` 行、登记常量与注记。

### 5.4 门禁 4：报告完整性

本报告含：覆盖清单（§2/§3，符号→行号）、C 段裁决（§1）、边界裁决（§4）、
验证记录（§5）、符号表（§6）、遗留问题（§7）。

### 5.5 `out/` 只读 md5 抽验

| 文件 | 基线（开工前） | 完工后 |
|---|---|---|
| previewPaneOfficeXlsxContent-XeHwYdMn.js | `4193214026dc469cb45056f49795e25e` | `4193214026dc469cb45056f49795e25e` ✅ 一致 |
| pptxRendererPreviewEngine-BIIRLBue.js | `02b3288447a609a826511301b9ec9bfc` | `02b3288447a609a826511301b9ec9bfc` ✅ 一致 |
| CartesianChart-nORn-0bc.js | `fa70cf40a3022d20c7bcfc295aa4166e` | `fa70cf40a3022d20c7bcfc295aa4166e` ✅ 一致 |

---

## 6. 符号表（汇总）

### XlsxDeepB.tsx

| 符号 | 语义 | 原件锚点 | 把握度 |
|---|---|---|---|
| `oy`（导出 `SpreadsheetGrid`） | react-xlsx 网格主组件 | js 193217–199291 | [A] 逐字 |
| `G`/`K` | React / jsx-runtime 互操作（宽松 declare） | js 9111–9130 区 | [B] |
| `k` | useVirtualizer（@tanstack/react-virtual 3.13.23） | esm-BY6T6pIH.js | [A] |
| xm…fh（38 常量） | 尺寸/限额/色板/光标 | js 189512–189572 | [A] 值登记 |
| 111 条 declare | 选区/测量/布局/编辑/工具条/控制器/canvas 助手 | js 14200–192831 逐条 | [B] 接口级 |

### OfficeWiring.tsx

| 符号 | 原混淆名 | 语义 | 把握度 |
|---|---|---|---|
| `OFFICE_WIRING_TOPOLOGY` | — | W1/W2/W3 接线拓扑登记 | [B] |
| `V`（本地别名） | `V` | PRESET_GEOMETRY_PATHS | [A] |
| `circularArrowPairBuilder` | `Di` | circularArrow 对生成器（6e4 角单位） | [A] |
| 38 个 `V.set` 预设 | 同名注册键 | 见 §3.2 表 | [A] |
| （余量）`Ti/Ei/ki/Ai` | 同名 | 多区域包装/字形表，未转录 | 记录 |

---

## 7. 遗留问题清单

1. **多区域余量**：`Ti/Ei/ki/Ai` 与 `DEFERRED_MULTI_REGION_ANCHORS`（36 项）
   待后续批次转录（OfficeWiring.tsx §3.3 已登记锚点）。
2. **`arcSegment` 语义分歧**（既有重建 vs 原件 `H`）：记录在案，未改动；
   若后续重建依赖 `H` 的预设（flowChartDelay/Display 已用重建版），需统一裁决。
3. **常量段/工具条段本体转录**（189512–190101 / 190104–192831）仍属待办批次；
   XlsxDeepB 以值登记 + 接口 declare 衔接，整合期替换为 import。
4. **`gm/ay/xv/Iv` 等 B5-12a canonical 符号**：整合期将 declare 改为自
   XlsxDeepA.tsx 的 import。
5. **xlsx 入口层**（199292–199413 `sy/cy/ly`）与行渲染层（192832–193216）不在
   本批范围，待相应批次落定。
6. recharts 分包（C 段）如后续需要符号级登记，可按 §1.2 对照表扩展
   VENDOR-MANIFEST；本批登记到导出别名粒度。
