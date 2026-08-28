# XlsxDeepPT.report.md — B5-12p/t：react-xlsx 私有引擎深部前导段（js 9111–15671）+ 尾段（js 199292–199508）逐字重建

批次：B5-12p（前导段，产物 `XlsxDeepP.tsx`）+ B5-12t（尾段，产物 `XlsxDeepT.tsx`）
主口径：`desktop/src/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js`
（199,508 行，只读未改动；完工 md5 复验 = `4193214026dc469cb45056f49795e25e`，与基线一致）
jsx 孪生：`desktop/src/src-reconstructed/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.jsx`（49,724 行）

本报告为新报告而非追加 `XlsxDeepC.report.md`：纪律禁止改动既有 .report.md。
前批（XlsxDeepA/B/C）的 declare 替换清单延续「只记录不执行」口径，本批新增清单见 §7.4。

## 0. 摘要

| 产物 | 覆盖 | 行数 | 符号 | 导出 | esbuild | tsc strict | 锚点 | 全量逆映射 |
|---|---|---:|---:|---:|---|---|---|---|
| `XlsxDeepP.tsx` | js 9111–15671（6,561 行） | 7,292 | 440 | 87 | 0 错 | 0 错 | 10/10 | 6561/6561 逐字节 |
| `XlsxDeepT.tsx` | js 199292–199508（217 行） | 331 | 7 | 1（py） | 0 错 | 0 错 | 10/10 | 217/217 逐字节 |

**前导段性质裁决：FIRST-PARTY（react-xlsx 私有引擎本体）**，全量逐字转录；证据链见 §2。
至此本 chunk 的 first-party 区段（9111–199508，扣除纯数据地图段 17818–183063 由
vendored 登记覆盖）已由 XlsxDeepA/B/C/P/T 五个产物实现逐字全覆盖（§1.3）。

## 1. 覆盖清单

### 1.1 XlsxDeepP.tsx 子段划分（与 XlsxPreview.report §1「4 段（react-xlsx）子段细分」对齐）

| 子段 | js 行 | 行数 | 符号数 | 内容 |
|---|---|---:|---:|---|
| P0 模块头 | 9111–9131 | 21 | 10（+未具名链成员 9121–9131） | `G`=reactInterop / `Rn`=reglInterop / `K`=jsxRuntime 装载；OOXML chart/drawing 命名空间常量族 zn/q/Bn/Vn/Hn/Un/Wn；`officeChartPalette` Office 2016 十色板 |
| P1 解析/几何 | 9132–12130 | 3,000 | 146 | CSV 引号（quoteFormulaString）、EMU（emuPerPx=9525）、drawing 锚点、chart/chartEx XML 解析、条件格式解析、主题色解析（xa=resolveFontColor 12082 / Ca=resolveFillColor 12105 实体） |
| P2 写回/序列化 | 12131–14130 | 2,000 | 140 | `officeRelationshipsNamespace` var 链（12131 起）、列宽/行高换算、drawing 增删、`rIdReactXlsxImage${n}`（14115–14116）、zip 写入（消费 chunk 导入 A/j） |
| P3 公式/计算+网格 | 14131–14340 | 210 | 15 | 跨表引用正则、`workbook.calculate()` 陷阱（`[react-xlsx]` warn 14318/14326/14336）、nc=emuToPx（14191）、缩放档位 |
| P4 wasm 桥 | 14341–14474 | 134 | 13 | `_c..bc` wasm 源状态、`Cc`=setDukeSheetsWasmSource（14357）、`Oc`=XlsxWorkerClient 请求协议、动态 `import('./duke_sheets_wasm-WTFY9Nh4.js')`（14370） |
| P5 模型/错误/常量 | 14475–15671 | 1,197 | 116 | 字节规范化、限额检查、`Dl`=XlsxFileSizeLimitExceededError（14726）、工作簿模型/窗体控件/剪贴板/导出下载助手、14617 常量链（saveDebounceMs 链头） |

### 1.2 XlsxDeepT.tsx 符号清单（js 199292–199508）

| 符号 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---:|---:|---|
| sy | SpreadsheetViewer | 199292 | 49527 | 顶层视图（主题/控制器 Provider、文件过大态分流、画布主体 oy 装配） |
| cy | SpreadsheetWithOwnedController | 199402 | 49623 | 自建控制器壳层（消费 Ru） |
| ly | Spreadsheet | 199406 | 49630 | 控制器三分支顶层组件 |
| —（注册语句） | wasm 源注册 | 199414 | 49706 | `Cc(`` + new URL(`duke_sheets_wasm_bg-BCCK9PkU.wasm`, import.meta.url).href)` |
| uy | resolveSheetTabTargetIndex | 199415 | 49643 | 页签键盘导航索引 |
| dy | SheetTabBar | 199428 | 49650 | 工作表页签条（中文日志 199432） |
| fy | XlsxParseErrorState | 199470 | 49679 | 解析错误态（中文日志 199473） |
| py | PreviewPaneOfficeXlsxContent | 199478 | 49691 | chunk 唯一导出符号（·export，199508） |

### 1.3 chunk 全覆盖总表（first-party 逐字轨道）

| js 行 | 内容 | 归属 |
|---|---|---|
| 1–27 | 模块导入头 | 各产物 declare 挂接登记（非转录对象） |
| 28–1834 | d3/topojson vendored | VENDOR-MANIFEST-LIBS.md 登记，不转录 |
| 1835–9110 | regl 2.1.1 vendored（Ln 惰性包装 1835） | VENDOR-MANIFEST-LIBS.md 登记，不转录 |
| **9111–15671** | **react-xlsx 引擎前导段** | **XlsxDeepP.tsx（本批）** |
| 15672–17817 | 控制器 Ru | XlsxDeepA.tsx（B5-12a） |
| 17818–183063 | 地图数据（us-atlas/world-atlas TopoJSON，纯数据） | vendored 登记，不转录 |
| 183064–183971 | 地图/图表助手 + 曲面图面板 | XlsxDeepC.tsx（B5-12c） |
| 183972–189511 | 画布渲染 | XlsxDeepA.tsx（B5-12a） |
| 189512–193216 | 常量族/上下文/工具栏 UI/行渲染层 | XlsxDeepC.tsx（B5-12c） |
| 193217–199291 | oy 网格主组件 | XlsxDeepB.tsx（B5-12b） |
| **199292–199508** | **Viewer/入口 + 导出语句** | **XlsxDeepT.tsx（本批）** |

## 2. 前导段性质裁决（缺口 1 裁决：FIRST-PARTY）

**结论**：js 9111–15671 为 first-party（react-xlsx 私有引擎本体），非 vendored 库体；
全量逐字转录为 `XlsxDeepP.tsx`，nc/xa/Ca 等已挂接符号实体化导出。

### 2.1 证据链

1. **自称标记（库内自指，非任何上游库特征）**：
   - `[react-xlsx] workbook.calculate() trapped…` console.warn ×3（js 14318/14326/14336）
   - `rIdReactXlsxImage${n}` 关系 ID 生成（js 14115–14116）
   - `application/x-react-xlsx-range+json` 私有剪贴板 MIME（js 14626，`ol` 常量）
   - （旁证，段外同款）`[react-xlsx debug]` 16983–17016、`react-xlsx-viewer` 类名 199346
2. **@dukelib/sheets-wasm 绑定**：动态 `import('./duke_sheets_wasm-WTFY9Nh4.js')`
   （js 14370）与模块级注册 `Cc(`` + new URL(`duke_sheets_wasm_bg-BCCK9PkU.wasm`,
   import.meta.url).href)`（js 199414）。该 wasm 资产（4,345,449 B）与 glue chunk 在
   VENDOR-MANIFEST-LIBS.md 登记为 **first-party Rust**（rustc 2d8144b7，duke-sheets
   私有工作区），非公开上游库。
3. **应用层 OOXML 常量**：9114–9131 命名空间 URI 族 + Office 2016 默认图表十色板
   （`officeChartPalette`），是产品实现选择而非库体代码。
4. **OOXML 包解析细节**：`xl/theme/theme1.xml`（js 12490）、`xl/media`、content-types
   与 relationships 的自实现解析/写回（P1/P2 全段），与 duke-sheets 分工明确。
5. **VENDOR-MANIFEST-LIBS.md 行 200**：整 chunk 登记为「first-party canvas
   spreadsheet preview + xlsx-worker bridge」，包装层 = 是；行 19 导出名登记
   `PreviewPaneOfficeXlsxContent`。
6. **vendored 特征零命中**：无 UMD 头/`__commonJS` 包装（对照 regl 1835 的
   `var Ln = t((e, t) => {…})` 形态）、无版本字符串、无参照安装对应。npm 公开
   `react-xlsx@0.4.10`（"Describe spreadsheets in JSX"）为同名异库，已在
   XlsxPreview.report §2.1 排除；参照安装与上游 lockfile 中均无本引擎声明。
7. **@pierre/theme**：全 chunk 检索 `pierre` 零命中（该特征在本 chunk 不存在，裁决时已核查）。
8. **结构连续性**：与已转录 first-party 段共享 var 链/闭包引用——模块头 9111 var 链
   向 XlsxDeepA/C 导出 G/Rn/K；14617 常量链被 XlsxDeepA 消费；段内符号被控制器 Ru
   （B5-12a）以 84 条 declare 挂接消费（§7.4），无库体边界痕迹。

### 2.2 口径说明

XlsxPreview.report §2.1 曾把 9111–199414 标注为「授权/私有 vendored 库」；后续
VENDOR-MANIFEST-LIBS.md（行 200）以 first-party 登记。B5 逐字轨道采用 manifest 口径：
该引擎无公开上游、无版本可登记，即便属「私有授权」也不构成可按版本登记的 vendored
库体，转录（而非仅登记）是正确处理。wasm 桥子段 14341–14474 的归属讨论沿用
XlsxPreview.report §2.3 结论（按自研层重建；双归属见 §7.1）。

## 3. export 判据

- **判据**：符号在定义区间（P：9111–15671）之外、first-party 区 15672–199508 内被
  真实引用（word-boundary + 字符串/模板/正则/注释 span-aware；跳过单点属性访问）。
- **shadow 复验**：oy（B5-12b）506 个局部名对所有候选消费位点做作用域遮蔽检查；
  22 处 spread 消费位点全部被 oy 局部遮蔽 → 判 PRIVATE。
- **结果**：P 段 87 导出 / 352 私有；T 段仅 py（chunk 终行导出语句 199508）。
- **链头导出**：9111 与 14617 两条 var 链以链头 `export var` 导出整链（含 Qc/$c/el/
  tl/ol/sl/rl/il 等链成员），过导出可接受（XlsxDeepC 同判例）。
- 87 导出对既有挂接的完备性：XlsxDeepA 84 条 + XlsxDeepC 6 条 + XlsxDeepB 1 条
  （Dl）+ XlsxDeepT 4 条（G/K/Cc/Dl）declare 全部命中导出集（§7.4 核查通过）。

## 4. 语义命名

- P 段 440 名、T 段 7 名，全部取自字面量/API/调用位点直接证据；与
  XlsxDeepA/XlsxPreviewWasmBridge/XlsxPreview 已定名复用（如 emuToPx、
  setDukeSheetsWasmSource、XlsxFileSizeLimitExceededError、SheetTabBar）。
- 冲突处理：Na 与 nl 同为「最小行高」语义 → Na=minRowHeightPx（几何）/
  nl=minSheetRowHeightPx（模型）。
- `bc`（14344，裸 var 链成员 `bc;`）初版枚举遗漏 → 补入，共 440。
- 对象键 `to:`（锚点对象，8 处）与顶层符号 `to`=serializeXmlWb（12306）同名冲突：
  键位保持原文不改名（§5 修复 5）。

## 5. 结构修复目录（全部可机械还原；逆映射管线已实现）

### 5.1 XlsxDeepP

1. **体首行补 `var ` 并左对齐**：js 9111 原为 chunk 级 var 链续行 `  G = e(n(), 1),`，
   独立成文为 `export var reactInterop = e(n(), 1),`；逆映射剥离 export、改名后
   还原 `  G = e(n(), 1),`。
2. **整行可剥离 `// @ts-expect-error`**：js 14370 同级 chunk 资产动态
   `import('./duke_sheets_wasm-WTFY9Nh4.js')` 之上（tsc TS2307 无法解析）。
3. **`Array.from(<any>)` → `(... as any[])` 45 处**（38 单行 + 6 多行 + 1 跨形参）：
   TS 5.6.3 对 `Array.from(any)` 推断 `unknown[]` 导致级联 TS18046/TS2339；
   逆映射以括号平衡扫描解包还原。
4. **对象字面量动态索引 `({...} as any)` 3 处**：schemeColorFromTheme（bg1/bg2/tx1/
   tx2 映射）、borderCss×2（边框样式映射）。
5. **对象键 `to:` 保留原文 8 处**（js 11343/11390/11417/13218/13246/13444/13449/
   14256）：前向改名曾误将键 `to:` 改为 `serializeXmlWb:`（与顶层符号 to 同名），
   已修复还原；逆映射对「行首/{/, 之后 + 冒号跟随」的键位跳过改名
   （同时保护 `defaultRowHeightPx:` 等原文未缩键 3 处：js 13038/14796/14856）。
   全段 shorthand 属性碰撞扫描：零命中（`${Ta}`/`${Da}` 为模板插值，非 shorthand）。

### 5.2 XlsxDeepT

6. **导出结构保持原始形态**：py 函数声明不加内联 `export`（chunk 原始形态即私有
   声明 + 尾部具名导出语句；内联 export 将与尾部语句构成重复导出，esbuild 报错）。
   尾部语句在产物中为 `export { PreviewPaneOfficeXlsxContent as
   PreviewPaneOfficeXlsxContent };`，逆映射改名后得 `export { py as py };`，
   再经导出语句专项修复还原 `export { py as PreviewPaneOfficeXlsxContent };`。

### 5.3 类型标注（全部可机械剥离；原文不含字面 `any`）

- P：顶层函数/解构形参 `: any`、箭头回调按 tsc 坐标注入 `: any`、可选形参
  `?: any`（resolveFontColor/parseWorkbookMetadata/buildFormControlsBySheet 等）、
  默认形参 `: any = ...`（calculateWorkbookSafe 的 `t: any = {}`、request 的
  `t: any[] = []`）、链成员/局部声明 `: any` / `: any[]`。
- T：解构形参整体 `{ ... }: any` 6 处、箭头回调 `: any` 8 处、单形参 `: any` 2 处。

## 6. 验证记录（门禁）

### 6.1 门禁 1：esbuild（0 错）

```
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/XlsxDeepP.tsx --loader:.tsx=tsx --jsx=preserve  → 0 错（213.6kb）
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/XlsxDeepT.tsx --loader:.tsx=tsx --jsx=preserve  → 0 错（6.2kb）
```

### 6.2 门禁 2：tsc strict（0 错）

`/tmp/tsconfig.XlsxDeepP.json` / `/tmp/tsconfig.XlsxDeepT.json`（strict、ES2022、
jsx preserve、module ESNext、moduleResolution Bundler、typeRoots →
`web/node_modules/@types`、types []、include 仅该产物）→ 两产物均 0 错。

### 6.3 门禁 3：锚点回代 + 全量逆映射

- XlsxDeepP 锚点 10/10（全部 chunk 内唯一）：
  js 9111（var 修复）/ 9132 quoteFormulaString / 9259 emuPerPx / 12131
  officeRelationshipsNamespace / 14191 emuToPx / 14341 cachedWasmModulePromise /
  14357 setDukeSheetsWasmSource / 14477 backslashCharCode / 14617 saveDebounceMs /
  14726 XlsxFileSizeLimitExceededError。
- XlsxDeepT 锚点 10/10（全部 chunk 内唯一）：
  js 199292 SpreadsheetViewer / 199325 useGridTheme 消费行 / 199339
  ig.Provider / 199402 SpreadsheetWithOwnedController / 199414 wasm 注册语句 /
  199428 SheetTabBar / 199432 中文日志行 / 199478 PreviewPaneOfficeXlsxContent /
  199492 toolbar useCallback / 199508 导出语句（专项修复）。
- 全量逆映射（剥离标注/解包 cast/剥 export/还原结构修复/span-aware 改名回代）：
  **P：6561/6561 逐字节一致；T：217/217 逐字节一致；0 失配。**

### 6.4 门禁 5：out/ 只读 + md5 复验

完工后 `md5 desktop/src/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js`
= `4193214026dc469cb45056f49795e25e`（与基线一致；全程未写入 out/）。

## 7. 边界与双归属

### 7.1 wasm 桥（js 14341–14474）双归属

D8 语义口径 `XlsxPreviewWasmBridge.tsx` 已覆盖该段（语义重建）；本批 B5 逐字口径
在 XlsxDeepP P4 子段再次逐字覆盖。两轨并存，整合批次二选一或互证。

### 7.2 自研入口层（js 199415–199508）双归属

D8 语义口径 `XlsxPreview.tsx` 已覆盖（XlsxPreview.report §2.2 四信号判定自研层）；
本批 XlsxDeepT 逐字覆盖 199292–199508（含该 94 行）。两轨并存。

### 7.3 行号标签更正（对 XlsxDeepC.tsx §二，不改其文件）

XlsxDeepC.tsx §二 将 `G` 标注为 9112；实测 chunk：9111 `G = e(n(), 1),` /
9112 `Rn = e(Ln(), 1),` / 9113 `K = i(),`。即 G=9111、Rn=9112、K=9113，
C 的 G 标签偏移一行（K 标签正确）。本批产物按实测行号登记。

### 7.4 declare 替换清单（本批实体化后新增；只记录不执行，供整合批次）

- **XlsxDeepA.tsx：84 条**（行 279–280 G/K；325–327 wc/Oc/Ec；329–406 区间内
  Yn/Zn/na/fa/pa/Ca/xa/is/Us/Ws/Ks/Js/tc/ic/ac/oc/sc/cc/uc/dc/ru/gc/Xc/Tl/El/Dl/
  Ol/Al/jl/Ml/Pl/Ll/Hl/Ul/Wl/Gl/Kl/ql/Xl/Zl/Ql/$l/nu/au/ou/su/cu/lu/uu/du/fu/pu/
  mu/hu/_u/vu/yu/bu/ju/Nu/Pu/Fu/Iu/Lu/xl/vl/yl/rl/il/$c/Qc/el/tl/ol/sl）
  → 全部改为自 `XlsxDeepP.tsx` 导入对应语义名（84 条已逐一核对在 87 导出集内）。
- **XlsxDeepC.tsx：6 条**（行 384 G→reactInterop、385 K→jsxRuntime、
  386 Rn→reglInterop、387 xa→resolveFontColor、388 Ca→resolveFillColor、
  391 nc→emuToPx）→ 改为自 `XlsxDeepP.tsx` 导入。
- **XlsxDeepB.tsx：1 条**（行 157 Dl→XlsxFileSizeLimitExceededError）→ 改为自
  `XlsxDeepP.tsx` 导入。
- 前批（XlsxDeepA/B 的 B5-12c 替换清单 155 条等）延续只记录口径，未执行。

## 8. 遗留清单

1. §7.4 declare 替换（84+6+1 条）与前批替换清单，待整合批次统一执行。
2. D8 语义轨（XlsxPreview.tsx / XlsxPreviewWasmBridge.tsx）与 B5 逐字轨并存，
   双归属段（14341–14474、199415–199508）待整合批次裁决取舍。
3. vendored 段（28–1834 d3/topojson、1835–9110 regl、17818–183063 地图数据）
   仅登记不转录（VENDOR-MANIFEST-LIBS.md 在案）——非 first-party，不属覆盖缺口。
4. chunk 导入头（1–27）以各产物 declare 注记形式登记，无独立产物。
