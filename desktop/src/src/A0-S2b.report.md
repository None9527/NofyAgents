# A0-S2b 批次报告 — xlsx 域 declare 接线

日期：2026-08-29 · 阶段：PORTING-PLAN A0.1 · 批次：S2-b
范围：src/modules/ 下 8 个 xlsx 域文件 + 1 个新增 .d.ts 垫片。
出处台账：B5-MERGE-NOTES §4、XlsxDeepC.report §4、XlsxDeepPT.report §7.4、
XlsxPreview.report、XlsxOfficeChart.report §3–4/§6。

## 1. 替换矩阵

| 文件 | declare 替换数 | 改指目标 | 使用点改名 | 备注 |
|---|---|---|---|---|
| XlsxDeepA.tsx | 94（10 → `./XlsxDeepC`；84 → `./XlsxDeepP`） | bd…yd 10 对象 → C 导出；G/K + wc/Oc/Ec + 解析/写回/常量族 84 → P 导出 | 745 处 | 保留 d3×21、topojson×7、地图数据×2 共 30 条 declare（任务清单未列） |
| XlsxDeepB.tsx | 151（145 → `./XlsxDeepC`；Dl/ac/oc/sc/dc 5 → `./XlsxDeepP`；gm 1 → `./XlsxDeepA`） | 常量族 36 + 助手群 109 → C；XlsxFileSizeLimitExceededError/columnWidthToPx/rowHeightToPx/snapGridSize/resizeRectWithHandle → P；ChartSvgRenderer → A | 411 处 | 保留 declare global、namespace G/K、function k（useVirtualizer）；删除已无消费的 `type ReactComponent` |
| XlsxDeepC.tsx | 6（G/K/Rn/xa/Ca/nc → `./XlsxDeepP`） | reactInterop/jsxRuntime/reglInterop/resolveFontColor/resolveFillColor/emuToPx | 109 处 | 保留 bm/ym declare（实体在 XlsxDeepA，接线将成 A↔C 环，任务清单亦未列） |
| XlsxDeepT.tsx | 15（G/K/Cc/Dl → `./XlsxDeepP`；ag/rg/ig/Tv/jv/w_ → `./XlsxDeepC`；Ru → `./XlsxDeepA`；oy → `./XlsxDeepB`；r → `./I18n`；a → `./logger`；s → `./UtilsCn`） | 全部命中现有导出，无保留 | 36 处 | r=useZCodeIntl、a=`t as logger`、s=cn；三目标模块导出齐备，未改那些文件 |
| XlsxPreview.tsx | 4（cn → `./UtilsCn`；useIntlContext → `useZCodeIntl` @ `./I18n`；logger → `t as logger` @ `./logger`；Spreadsheet → `./XlsxDeepT`） | 全部命中 | —（D8 语义口径，本就语义名） | 唯一调用点 `useIntlContext()` → `useZCodeIntl()`；删除随行的 `interface IntlShape` |
| XlsxPreviewWasmBridge.tsx | 0（动态 import 走垫片） | `import("./duke_sheets_wasm-WTFY9Nh4.js")` → 新增同名 .d.ts | — | 保留 `declare function preloadModule`（DocxWasmGlue 先例） |
| OfficeWiring.tsx | 0 | — | — | 无 declare，仅核验（现有 import 均通过） |
| **合计** | **270** | | **1301** | |

### 补导出（1 件）
- `XlsxDeepT.tsx`：`function Spreadsheet`（原 ly）加 `export`——供 XlsxPreview.tsx 导入；不改实现。

### 目标侧类型微调（2 件，类型唯一、发射不变）
- `XlsxDeepC.tsx` `chartSeriesDataAttrs(e, t?, n?)`：t/n 改可选——原 bundle 调用点即 1–3 参（XlsxDeepA 728–7854 群 34 处 TS2554 因此清零）。
- `XlsxDeepP.tsx` `parseWorkbookImageAssets(e, t?)`：t 改可选——XlsxDeepA 728 单参调用（1 处 TS2554 清零）。

### 新增垫片（1 件）
- `src/modules/duke_sheets_wasm-WTFY9Nh4.d.ts`：对应只读产物 `out/renderer/assets/duke_sheets_wasm-WTFY9Nh4.js`，
  导出面按 glue 尾行逐字反推（CellValue/Workbook/Worksheet/init/initSync/default），
  做法参照 `pdf-viewer-m6YcRb_5.d.ts`。垫片同时使 XlsxDeepP.tsx 内同一资产的动态
  import 可解析，其上方原 `@ts-expect-error`（TS2307）指令随之失效，予以移除
  （属移除既有指令，非新增）。

### XlsxDeepP.tsx 既有错误修复（本批门禁前置）
- `normalizeColorSpec` 内两处 `?? ` 链尾 `void 0`：TS 5.9.3 判 `void 0` 型变为
  never-nullish（TS2881），任何 `as` 断言均不能救（经隔离试验确认），改为
  `undefined` 字面量（运行时等价，发射语义不变），行内注释注明原形。

## 2. 接线形式
- 语义名导入，原混淆名以行尾注释保留：`import { emuToPx, /* 原 nc */ } from "./XlsxDeepP"`。
- 各文件头 §依赖清单 注释已同步标注「已接线」及去向。
- XlsxPreview.tsx 导入侧类型标注：`const Spreadsheet = SpreadsheetImpl as React.FC<SpreadsheetProps>`
  （实体形参 any，按本文件既有 props 口径标注，不改发射语义；原 `declare const Spreadsheet: React.FC<SpreadsheetProps>` 删除）。

## 3. 环状依赖核查
实际依赖图：P 为叶（不反向 import C/A/B/T）；A→C,P；B→C,P,A；C→P；T→P,C,A,B,I18n,logger,UtilsCn；XlsxPreview→T,XlsxDeepT 系外仅 I18n/logger/UtilsCn。**无 import 环**（C 的 bm/ym 保留 declare 亦规避了潜在 A↔C 环）。tsc/esbuild 均未报环或「使用未初始化」类错误。

## 4. 门禁结果（从 desktop/src/src 运行）
1. **tsc -p tsconfig.json**：8 文件相关错误 **3 → 0**（前：XlsxDeepP TS2881×2、XlsxPreviewWasmBridge TS2307×1）。
   全项目错误数：基线文件 364；开工时实测 362（并行批漂移）；完工实测 **1543**。
   增量全部来自并行批在改文件（SettingsPanelsCapability/ExtendedViews/WorkspaceShell/
   MarkdownIntegration/services/Settings/Home 等数百条 TS2459「declares … but it is not
   exported」），与本批无关：全项目无任何错误引用本批 8 文件的导出；本批 8 文件唯一
   外部导入方 FileRewindDialogDeep.tsx（`isDarkTheme` from XlsxDeepC）该导入无错、
   导出面完好。本批净贡献：−3（8 文件清零），未新增他文件错误。
2. **esbuild ×8**（--loader:.tsx=tsx --jsx=automatic）：8/8 文件 0 错。
3. **逆口径抽查 ×3**：
   - bd→chartSeriesDataAttrs：A 原 declare 注 183890 = XlsxDeepC §一映射表（行 85）= 导出实体行 1225 ✓
   - nc→emuToPx：C 原 declare 注 14191 = XlsxDeepP §一映射表（行 360）= 导出实体行 5619 ✓
   - oy→SpreadsheetGrid：T 原 declare 注 193217 = XlsxDeepB §一映射表（js 193217–199291）= `export { oy as SpreadsheetGrid }` 行 6343 ✓
4. **out/ md5 复验**：`previewPaneOfficeXlsxContent-XeHwYdMn.js` = 4193214026dc469cb45056f49795e25e（不变；`git status out/` 干净）。

## 5. 遗留（如实）
1. **XlsxDeepC bm/ym**（resolveGridTheme/isDarkGridTheme）：实体在 XlsxDeepA，接线成 A↔C 环，且不在本批任务清单——保留 declare，待后续批次（或将实体迁至 P 层）处理。
2. **XlsxDeepA 30 条 d3/topojson/地图数据 declare**：属其他 chunk（d3-shape/scale/hierarchy、topojson、us/world-atlas 数据），非 xlsx 域导出面，任务清单未列——保留。
3. **XlsxDeepP 9 条 chunk 导入 declare**（e/n/Ln/i/o/N/M/j/A）：P 自身的跨 chunk 依赖（interop require / react / regl 包装 / jsx-runtime 装载 / preload-helper / browser zip 助手），不属本批清单——保留。
4. **XlsxDeepB namespace G/K 与 function k**：vendored React interop / jsx-runtime / @tanstack/react-virtual 消费面，按 B5-12b 登记口径保留。
5. **XlsxPreviewWasmBridge `declare function preloadModule`**：DocxWasmGlue 先例口径，保留。
6. **全项目错误数 1543 > 基线 364**：并行批中间态所致（见 §4.1），非本批引入；本批 8 文件已清零且不欠他文件。
7. 工具留档：/tmp/s2b/（maps.mjs 替换台账、A/B/C/T.json 改名映射、rename.mjs 作用域感知改名器、verify-exports.mjs 导出面核对）。
