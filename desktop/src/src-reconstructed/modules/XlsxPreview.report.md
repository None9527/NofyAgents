# XlsxPreview 模块抽取报告（自研 xlsx 预览渲染器 · D8 Stage B2）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js`（199,508 行，**未修改**）
- 产物：
  - `/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/XlsxPreview.tsx`（397 行）—— 自研 PreviewPane 组件族全量重建
  - `/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/XlsxPreviewWasmBridge.tsx`（453 行）—— duke-sheets wasm 宿主 / xlsx-worker 桥全量重建
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.jsx`（49,724 行，同一 chunk 的 pretty-print 版；报告行号双轨标注 **js 行 / jsx 行**）
- 上游对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/VENDOR-MANIFEST-LIBS.md`（duke-sheets Rust 工作区证据、@dukelib/sheets-wasm 登记）
- 伴随资产（本任务只读、不在重建范围，供协议核对）：
  - `out/renderer/assets/xlsx-worker-DJiDdvsD.js`（6,202 行，duke-sheets WASM 宿主 worker）
  - `out/renderer/assets/duke_sheets_wasm-WTFY9Nh4.js`（1,349 行，wasm-bindgen glue）
  - `out/renderer/assets/duke_sheets_wasm_bg-BCCK9PkU.wasm`（4,345,449 B）

---

## 0. 摘要：自研层极薄，本 chunk 是一个“库壳”

本 chunk 名义上是“自研 xlsx 预览渲染器”，实测 **99.89% 为 vendored 库代码**：
私有表格引擎 **react-xlsx**（含内嵌 165,246 行地图 TopoJSON 数据，占全 chunk 82.8%）+
**regl**（WebGL）+ **d3/topojson-client 片段**。真正的自研层只有末尾 **94 行**
（4 个符号 + 1 条导出），是 PreviewPane 对 react-xlsx 的包装（页签条 + 三态 + 只读配置）。
按任务口径，另把 **duke-sheets wasm 宿主/桥**（133 行，位于 react-xlsx 段内的接缝区）
一并全量重建。合计重建 227 行源码语义，覆盖 850 行产物（含类型/注释/符号表）。

| 口径 | 行数 | 占比 |
|---|---:|---:|
| 自研 PreviewPane 层（js 199415-199508） | 94 | 0.047% |
| wasm 桥（js 14341-14473）+ wasm 注册语句（js 199414） | 133 + 1 | 0.067% |
| **重建合计** | **227** | **0.114%** |
| vendored（d3/topojson + regl + react-xlsx 其余） | 199,281 | 99.886% |

---

## 1. chunk 结构总图（边界判定依据见 §2）

| # | 段 | js 行 | jsx 行 | 行数 | 占比 | 内容 | 处置 |
|---|---|---|---|---:|---:|---|---|
| 1 | import 块 | 1-27 | 1-27 | 27 | 0.01% | 15 条跨 chunk 导入（react/jsx-runtime/intl/logger/cn/preload-helper + d3-scale/shape 系 + tanstack-virtual + fflate） | 登记 |
| 2 | vendored：d3-array + d3-geo + topojson-client | 28-1834 | 28-1486 | 1,807 | 0.91% | `P`=Adder(fsum)、`ge/_e`=geoStream 分发、`In`=topojson feature、`Mn`=transform（地图图表用） | 登记 |
| 3 | vendored：regl | 1835-9110 | 1487-5974 | 7,276 | 3.65% | `Ln` = `__commonJS` 包装的 createREGL UMD（WebGL 渲染器） | 登记 |
| 4 | vendored：react-xlsx 引擎 | 9111-199414 | 5975-49642 | 190,304 | 95.39% | 见 §4 子段表；**其中 4a 桥段按任务口径重建** | 登记 + 桥重建 |
| 5 | **自研 PreviewPane 层** | 199415-199508 | 49643-49724 | 94 | 0.05% | uy/dy/fy/py + 导出 | **全量重建** |

### 4 段（react-xlsx）子段细分

| 子段 | js 行 | 行数 | 内容（混淆名 → 语义） |
|---|---|---:|---|
| 模块头 | 9111-9130 | 20 | `G`=React interop、`Rn`=regl interop、`K`=jsx-runtime；OOXML chart 命名空间（zn/q/Bn/Vn/Hn/Un）；`Wn`=Office 2016 默认图表 10 色板 |
| 解析/几何 | 9132-12130 | 2,999 | CSV 引号（`Gn/Kn/qn`）、EMU 单位（`$n`=9525）、drawing 锚点（`bs` two-cell/one-cell）、chart/chartEx XML 解析（`Fi` 等） |
| OOXML 写回 | 12131-14130 | 2,000 | `wa`=relationships 命名空间、列宽/行高换算（`Ba/Va/Ha`）、drawing 增删（`Qs`）、`$s` 生成 `rIdReactXlsxImage${n}` |
| 公式/计算 | 14130-14340 | 210 | `fc`=跨表引用正则、`pc/mc`=未解析表引用探测、`hc/gc`=`workbook.calculate()` 陷阱（`[react-xlsx]` warn） |
| **4a wasm 桥** | **14341-14473** | **133** | `_c..bc` 状态、`xc/Sc/Cc/wc/Tc/Ec/Dc`、`Oc`=XlsxWorkerClient、`kc` —— **已重建（XlsxPreviewWasmBridge.tsx）** |
| 模型/错误 | 14474-15671 | 1,198 | `Ac`=92(反斜杠) 路径处理、`Dl`=XlsxFileSizeLimitExceededError（14726）、`Ol`=fileName 推导、`Sl`=字节数格式化 |
| 控制器 | 15672-17817 | 2,146 | `Ru`=useSpreadsheetController：file/src→worker 加载→sheets/tabs/charts/images/formControls 状态机、`Ge/We` 持有/释放 `Oc` |
| 地图数据 | 17818-183063 | 165,246 | `zu`=us-atlas TopoJSON（Albers 投影，objects.counties 等）、`Bu`=world-atlas TopoJSON（countries，量化）——Excel 地图图表底图 |
| 地图/图表助手 | 183064-183971 | 908 | `Vu` clamp、`kd = Pn(Bu, Bu.objects.countries).features`（topojson feature）、`yd`=React.memo 图表组件（183672） |
| 画布渲染 | 183972-189511 | 5,540 | `Hd`=字体栈（Aptos/Calibri/Carlito/Segoe UI…）、单元格/网格/图表 canvas 绘制、`gm`=memo 组件（189364） |
| 常量/剪贴板 | 189512-190101 | 590 | `xm`=24 等尺寸常量、`Tm`=`application/x-react-xlsx-range+json`（区域剪贴板 MIME）、选区/滚动助手 |
| 上下文 | 190102-190103 | 2 | `rg`=控制器上下文（默认 null）、`ig`=头部主题上下文（默认 {isDark:false}） |
| 工具栏 UI | 190104-192831 | 2,728 | `xv`=排序菜单、`Cv`=调色板选择器、`wv`=工具栏、`Iv`=选区配色等（推断，依据 props 解构） |
| 行渲染层 | 192832-193216 | 385 | `iy`=行渲染组件（editingCell/getCellData/onCell* 事件族）、`ay`=React.memo(iy) |
| Spreadsheet 主体 | 193217-199291 | 6,075 | `oy`=网格主组件（虚拟滚动 + 画布 + 图表 + 图片 + 选区 + 编辑） |
| Viewer/入口 | 199292-199413 | 122 | `sy`=SpreadsheetViewer（`react-xlsx-viewer` 类名）、`cy`=自建控制器变体、`ly`=顶层组件（控制器三分支） |
| wasm 注册语句 | 199414 | 1 | `Cc(new URL('duke_sheets_wasm_bg-BCCK9PkU.wasm', import.meta.url).href)` —— **已重建** |

---

## 2. 边界判定依据

### 2.1 vendored 段判定

1. **regl**（1835-9110）：`var Ln = t((e, t) => {...})` 中 `t` 即 `__commonJS`
   （chunk-Cq_f4orQ 导入），UMD 头 `typeof e == 'object' ? t.exports = r() : ... n.createREGL = r()`，
   内部 `(regl) ` 错误前缀、`createREGL` 工厂——与参照安装 `node_modules/regl@2.1.1` 对应。
2. **d3/topojson 片段**（28-1834）：`P`=d3-array Adder（Float64Array(32) 补偿求和）、
   `ge/_e`=d3-geo geoStream 的 {Feature,FeatureCollection}/{Sphere,Point,MultiPoint,LineString,…}
   分发器、`In`=topojson-client feature()（含 `Mn(e.transform)` 解码）。与参照安装
   `d3-geo@3.1.1`、`topojson-client@3.1.0` 对应。
3. **react-xlsx**（9111-199414）：库内自称标记 5 处——
   `[react-xlsx] workbook.calculate() trapped…`（14318/14326/14336，worker 5618/5626 同款）、
   `rIdReactXlsxImage${n}`（14115-14116）、`application/x-react-xlsx-range+json`（14626/189516）、
   `react-xlsx-viewer` 类名（199346）、`[react-xlsx debug]`（16983-17016）。
   **注意**：npm 公开的 `react-xlsx@0.4.10`（"export components - Describe spreadsheets in JSX"）
   是另一个同名小库；本 chunk 的是私有引擎（duke-sheets 驱动的画布表格查看器），
   参照安装与上游 lockfile 中均无声明，判定为**授权/私有 vendored 库**。
4. **地图数据**（17818-183063）：`zu` 为 us-atlas 风格 TopoJSON（Albers USA 投影
   bbox 957.5×606.6，objects.counties）、`Bu` 为 world-atlas 风格 TopoJSON
   （countries，id 为 ISO 3166-1 数字码，如 716=Zimbabwe，量化 transform）——
   供 Excel 地图图表使用；纯数据，无逻辑。

### 2.2 自研层判定（199415-199508）

全 chunk 扫描（199,508 行）得到四个互证信号，**全部只出现在这 94 行内**：

| 信号 | 出现位置 |
|---|---|
| 中文字符串（全 chunk 仅 2 条） | 199432 `[PreviewPane] Excel 工作表已切换`、199473 `[PreviewPane] Excel 文件解析失败` |
| `useIntlContext`（别名 `r`）调用 | 199479（i18n 键 `codeViewer.excel.sheetTabs`） |
| tailwind 设计令牌类名（`bg-background`/`text-destructive`/`border-border`/`bg-surface`/`bg-selected`…） | 199443/199475/199482/199495/199501 |
| `data-office-preview-kind` / `data-office-preview-pending` 属性 | 199483/199496 |

另有：唯一导出 `export { py as PreviewPaneOfficeXlsxContent }`（199508）；
logger（别名 `a`）的 `[PreviewPane]` 前缀与 ZCode 其它自研 chunk（TopBar 族的
`[PreviewPane]`/`sidebar.*` 风格）一致。

### 2.3 wasm 桥归属讨论（14341-14473 + 199414）

桥段位于 react-xlsx 引擎段内部，其直接消费者是 react-xlsx 控制器 `Ru`
（`Be = useWorker && Worker可用 && wc()`、`Ge = () => Fe.current ||= new Oc()`）。
从日志风格（无中文、console.warn 带 `[react-xlsx]` 前缀）看，它**源自 react-xlsx 库**。
但按任务口径（chunk 构成 = “duke-sheets wasm 宿主 + 自研渲染层 + vendored 库”，
重建范围 = “组件树、**wasm 桥**、事件、样式”），且它是 ZCode 预览管线触达
duke-sheets WASM 的唯一通道、与 `xlsx-worker`/`duke_sheets_wasm` 两个自管资产
构成完整闭环，故**按自研层一并全量重建**，独立成 `XlsxPreviewWasmBridge.tsx`。
模块级注册语句（199414）位于 `ly`（vendored）与 `uy`（自研）的接缝上，
两种归属皆有可能（库自带 vs 宿主注入）；重建中作为桥模块的初始化副作用保留，
证据链（资产哈希名与 `@dukelib/sheets-wasm` 的 wasm 逐字节一致，4,345,449 B）见 §5。

---

## 3. 重建符号清单（混淆名 → 语义名 → 行号）

### 3.1 自研 PreviewPane 层（XlsxPreview.tsx，全量逐字重建）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `uy` | `resolveSheetTabTargetIndex` | 199415-199427 | 49643-49649 | 页签键盘导航：Home/End/←/→（循环）；其余键 null |
| `dy` | `SheetTabBar` | 199428-199469 | 49650-49678 | role=tablist/tab + aria-selected + roving tabindex；切表打 debug 日志；焦点随键盘移动；单表不渲染 |
| `fy` | `XlsxParseErrorState` | 199470-199477 | 49679-49690 | role=alert 破坏色文案 + error 日志（路径+错误消息） |
| `py` | `PreviewPaneOfficeXlsxContent` | 199478-199507 | 49691-49723 | chunk 唯一导出：外壳 + react-xlsx Spreadsheet（readOnly/rounded=false/自研页签条替代默认工具栏/三态插槽） |
| — | `export { py as PreviewPaneOfficeXlsxContent }` | 199508 | 49724 | |

### 3.2 wasm 桥（XlsxPreviewWasmBridge.tsx，全量重建）

| 混淆名 | 语义名 | js 行 | jsx 行 |
|---|---|---|---|
| `_c` | `cachedWasmModulePromise` | 14341 | 10638 |
| `vc` | `wasmSourceExplicitlySet` | 14342 | 10639 |
| `yc` | `rawWasmSource` | 14343 | 10640 |
| `bc` | `resolvedWasmSource` | 14343 | 10640 |
| `xc` | `copyToStandaloneBuffer` | 14345 | 10642 |
| `Sc` | `normalizeWasmSource` | 14350 | 10647 |
| `Cc` | `setDukeSheetsWasmSource` | 14357 | 10654 |
| `wc` | `isWasmSourceAvailable` | 14360 | 10657 |
| `Tc` | `getDukeSheetsWasmSource` | 14363 | 10660 |
| `Ec` | `loadDukeSheetsWasmModule` | 14366 | 10663 |
| `Dc` | `createAbortError` | 14382 | 10668 |
| `Oc` | `XlsxWorkerClient`（constructor/dispose/loadWorkbook/getCellSnapshot/parseCharts/getRowsBatch/request/handleError/handleMessage） | 14387-14473 | 10673-10769 |
| `kc` | `cloneArrayBuffer` | 14474 | 10770 |
| — | 模块级 `setDukeSheetsWasmSource(new URL(duke_sheets_wasm_bg-BCCK9PkU.wasm).href)` | 199414 | 49642 |

### 3.3 vendored 接触面（接口级登记，未逐行还原）

| 混淆名 | 语义名 | js 行 | jsx 行 |
|---|---|---|---|
| `ly` | `Spreadsheet`（react-xlsx 顶层；控制器三分支：props → `rg` 上下文 → 自建） | 199406-199413 | 49630-49641 |
| `cy` | `SpreadsheetWithOwnedController`（`Ru` 建控制器后套 `sy`） | 199402-199405 | 49623-49629 |
| `sy` | `SpreadsheetViewer`（`react-xlsx-viewer` 壳 + 主题/控制器双 Provider） | 199292-199401 | 49527-49622 |
| `Ru` | `useSpreadsheetController` | 15672-17817 | 11907-13483 |
| `rg` | `SpreadsheetControllerContext` | 190102 | — |
| `ig` | `SpreadsheetHeaderThemeContext` | 190103 | — |
| `Dl` | `XlsxFileSizeLimitExceededError`（name 串逐字在案） | 14726-14735 | — |

---

## 4. 拆法说明（产物为何是两个文件）

任务产物模式为 `XlsxPreview*.tsx`（允许按子模块拆分）。本例自研层本体仅 94 行，
但加上任务点名的 wasm 桥（133 行）后，两部分职责正交、依赖方向单一
（自研层 →（经 vendored ly/Ru）→ 桥 → worker → wasm），故拆为：

| 文件 | 对应源码段 | 行数 | 内容 |
|---|---|---:|---|
| `XlsxPreview.tsx` | js 199415-199508（+接触面声明） | 397 | 组件树/事件/样式全量重建 + react-xlsx props 接口登记 |
| `XlsxPreviewWasmBridge.tsx` | js 14341-14473 + 199414 | 453 | wasm 源管理 + XlsxWorkerClient + worker 消息协议类型 |

两文件互不 import（真实依赖链中间隔着 vendored 层），各自可独立通过类型检查；
头注释互相引用，行号映射双轨（js / jsx）齐全，尾部各附 SYMBOLS 符号表。

---

## 5. 交叉验证

| 断言 | 证据 | 结论 |
|---|---|---|
| 桥消费的 wasm = duke-sheets Rust 工作区产物 | `duke_sheets_wasm_bg-BCCK9PkU.wasm` 4,345,449 B 与参照安装 `node_modules/@dukelib/sheets-wasm/duke_sheets_wasm_bg.wasm` **逐字节同长**；VENDOR-MANIFEST-LIBS 已登记该 wasm 的 crates 证据（duke-sheets-core/-xlsx/-xlsb/-xls/-formula/-crypto，rustc 2d8144b7） | ✅ |
| glue 导出面 | `duke_sheets_wasm-WTFY9Nh4.js` 1349 行：`export { e as CellValue, t as Workbook, n as Worksheet, F as default, r as init, P as initSync }`，与 `Ec` 的 `e.default({module_or_path})` 调用形态（wasm-bindgen init）吻合 | ✅ |
| @dukelib/sheets-wasm 版本 | 参照安装 package.json：`@dukelib/sheets-wasm@0.1.21`（github.com/guseggert/duke-sheets, bindings/wasm） | ✅ |
| worker 协议四消息 | `xlsx-worker-DJiDdvsD.js` 的 `pa()` 分发器（6150-6202）：`load`→`ua()` 返回 {sheets,tabs,chartsByWorkbookSheetIndex,chartsheets,formControlsByWorkbookSheetIndex,tablesByWorkbookSheetIndex}；`parseCharts`→`da()` 返回 {chartsByWorkbookSheetIndex,chartsheets,tabs}；`getCellSnapshot`→{displayValue,formula}；`getRowsBatch`→duke `getRowsBatch(startRow,rowCount,{includeFormulas,includeHyperlinks,includeMergeInfo,includeStyles,useFormattedValues})` —— 与 `Oc` 四方法逐一对应 | ✅ |
| 调用方 | `styles-CdEGpc2x.js` 160608-160619：`yVt = React.lazy(import('./previewPaneOfficeXlsxContent-XeHwYdMn.js').PreviewPaneOfficeXlsxContent)`；`officeFilePreview-DDCn9-xI.js`：`.xlsx/.xlsm/.xls → 'excel'` 路由 + base64→ArrayBuffer 助手 | ✅ |
| i18n 键 | `codeViewer.excel.sheetTabs` = “工作表”（zcode/packages/ui/src/i18n/zh-CN.json:1206） | ✅ |
| 自研层唯一性 | §2.2 四信号扫描：中文串/国际化合并/设计令牌类名/data-office-* 属性全 chunk 仅出现于 199415-199508 | ✅ |

---

## 6. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| 自研 4 符号（uy/dy/fy/py）JSX 结构、类名、i18n 键、日志文案、事件行为 | **高（逐字转录）** | 直接从压缩源码还原，类名/中文文案/属性名零改动；与 jsx 对照版双向核对 |
| 桥段 13 符号（xc..Oc、kc、注册语句）逻辑 | **高（逐字转录）** | 同上；方法签名由调用点（Ru 的 `Ge/We`、worker `pa()`）双向验证 |
| TS props/协议类型 | **中高（推断）** | 由解构默认值、payload 构造、worker 返回值归纳；深层模型（sheets/tabs/charts 结构）为 `unknown` 占位，未展开 |
| react-xlsx 子段划分（§1 子段表） | **高（边界）/ 中（子段语义标签）** | 边界由顶层声明定界；子段功能标签由常量/命名/props 解构推断（如 `xv`=排序菜单、`iy`=行渲染），未逐行验证 |
| 桥段归属判定（§2.3） | **中（解释性结论）** | 代码事实确凿，但“库自带 vs 宿主注入”的归属二分无法从产物唯一确定；已按任务口径处理并如实标注 |
| react-xlsx 为私有库的判定 | **中高** | 5 处库内自称标记 + 公开 npm 同名库内容不符 + 参照安装/lockfile 无声明；未见 license/版本串 |

---

## 7. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`：两文件解析通过（**0 错误**）。
- `tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler --jsx react-jsx --lib ES2022,DOM,DOM.Iterable --skipLibCheck`
  （借 `/home/none/grok-build/web` 的 @types/react@18.3.31 环境；因 zcode-restored 无
  node_modules，验证在 /tmp/xlsx-verify 临时副本上进行，另附
  `duke_sheets_wasm-WTFY9Nh4.d.ts` 存根对应动态 import 的 glue 导出面）：**0 错误**。
- `out/` 目录未做任何修改（只读访问）。
- 注：本任务为**新建**重建文件，未修改任何既有符号，故未触发 GitNexus 影响分析
  （`gitnexus_impact`/`gitnexus_detect_changes` 针对既有符号的编辑与提交；本仓库
  索引对象为 grok-build Rust 工程，ref-ui 重建产物不在其索引范围内）。

---

## 8. 后续建议

1. **xlsx-worker-DJiDdvsD.js**（6,202 行）与 **duke_sheets_wasm-WTFY9Nh4.js**
   （1,349 行）可按同法登记/重建：前者是 fflate 解压 + wasm 实例化 + 四消息处理器，
   后者是标准 wasm-bindgen glue（可整体登记为 @dukelib/sheets-wasm@0.1.21 产物）。
2. react-xlsx 引擎若需进一步抽取，优先级建议：`Ru` 控制器（15672-17817）→
   `oy` 网格主体（193217-199291）→ 画布渲染层（183972-189511）；
   地图数据段（17818-183063）建议仅登记（纯数据，可外置为资产）。
3. VENDOR-MANIFEST-LIBS 可补一条 react-xlsx 私有库登记（本报告的 5 处自称标记
   与子段表可直接引用）。
4. `zu/Bu` 双底图（US counties + world countries）说明 react-xlsx 支持 Excel
   地图图表渲染——zcode-uiux-spec 若补 Office 预览章节可据此描述。
