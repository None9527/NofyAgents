/* eslint-disable */
/**
 * ============================================================================
 * XlsxDeepT.tsx — react-xlsx 私有引擎深部（尾段）：顶层 SpreadsheetViewer +
 * 页签条 + 预览面板入口（B5-12t 批次 · 逐字重建）
 * ============================================================================
 *
 * 来源文件（主口径，199,508 行，未改动，只读；md5 基线 4193214026dc469cb45056f49795e25e）：
 *   desktop/src/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js
 * jsx 孪生交叉参照（同一 chunk 的 pretty-print 版，49,724 行）：
 *   desktop/src/src-reconstructed/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.jsx
 *
 * 覆盖区段：js 199292–199508（217 行）——chunk 尾段：
 *   - sy = SpreadsheetViewer（199292）：顶层视图组件（主题/控制器 Provider 包裹、
 *     文件过大态分流、画布主体 oy 装配）
 *   - cy = SpreadsheetWithOwnedController（199402）+ ly = Spreadsheet（199406）：
 *     控制器所有权分流壳层（消费 B5-12a 的 Ru 与 B5-12b 的 oy）
 *   - wasm 源注册调用（199414，消费 XlsxDeepP 的 Cc=setDukeSheetsWasmSource）
 *   - uy = resolveSheetTabTargetIndex（199415）/ dy = SheetTabBar（199428）/
 *     fy = XlsxParseErrorState（199470）
 *   - py = PreviewPaneOfficeXlsxContent（199478）：chunk 唯一导出符号，
 *     预览面板对外入口（国际化页签标签 + 只读装配）
 *   - 导出语句（199508）：`export { py as PreviewPaneOfficeXlsxContent };`
 * 双归属注记：199415–199508 亦被 D8 语义口径 XlsxPreview.tsx 覆盖（语义重建，
 * 非逐字轨道），见 XlsxDeepPT.report.md §7。
 * 排除（边界互斥，仅注记）：下界 199291 与 B5-12b（XlsxDeepB.tsx，oy 收尾）互斥。
 *
 * 重建口径（与 XlsxDeepA/B/C/P 一致）：
 *   - 逐字转录：字符串常量（含全部模板字面量/类名/数据属性名/中文日志文案、
 *     国际化键）、分支结构、JSX 调用形态零改动。JSX 保留原始编译形态
 *     `(0, K.jsx)(...)` / `(0, K.jsxs)(...)`（jsx 孪生糖语法仅作交叉参照）。
 *   - 顶层符号全部改语义名（下表，7 名）；函数体内局部变量名保留原混淆名不改，
 *     以保证逐字可回代。
 *   - 导出结构保持原始形态：py 的函数声明不加 `export`（chunk 原始形态即
 *     私有声明 + 尾部具名导出语句；若改为内联 export 将与尾部语句构成
 *     重复导出，esbuild 报错）。
 *   - 类型标注（可机械剥离，原文件不含字面 `any`）：解构形参整体标
 *     `{ ... }: any`（6 处）；箭头回调形参按 tsc strict 报错坐标机械注入
 *     `: any`（8 处）；单形参函数标 `: any`（2 处：cy/ly）。
 *   - 外部依赖一律 `declare const X: any` 挂接（行号在案，见 §二）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：主口径 js 行 / jsx 孪生行；
 *     ·export = chunk 导出符号）
 * ----------------------------------------------------------------------------
 *   sy  → SpreadsheetViewer                (js 199292 / jsx 49527)
 *   cy  → SpreadsheetWithOwnedController   (js 199402 / jsx 49623)
 *   ly  → Spreadsheet                      (js 199406 / jsx 49630)
 *   uy  → resolveSheetTabTargetIndex       (js 199415 / jsx 49643)
 *   dy  → SheetTabBar                      (js 199428 / jsx 49650)
 *   fy  → XlsxParseErrorState              (js 199470 / jsx 49679)
 *   py  → PreviewPaneOfficeXlsxContent     (js 199478 / jsx 49691) ·export
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨段/跨 chunk；括号内 = 定义处行号；均不属本批
 *     199292–199508 范围。A0-S2b：15 组 declare 全部已接线为真实 import：
 *     1–4 → ./XlsxDeepP；5–10 → ./XlsxDeepC；11 → ./XlsxDeepA；
 *     12 → ./XlsxDeepB；13 → ./I18n；14 → ./logger；15 → ./UtilsCn）
 * ----------------------------------------------------------------------------
 *  同 chunk 跨段（B5-12p 导出，实体在 XlsxDeepP.tsx）：
 *   1. G  = React interop（js 9111 var 链首成员）
 *   2. K  = jsx-runtime（js 9113 var 链成员）
 *   3. Cc = setDukeSheetsWasmSource（js 14357）
 *   4. Dl = XlsxFileSizeLimitExceededError（js 14726）
 *  同 chunk 跨段（B5-12c 导出，实体在 XlsxDeepC.tsx）：
 *   5. ag = joinClassNames（js 190104）
 *   6. rg = SpreadsheetControllerContext（js 190102）
 *   7. ig = SpreadsheetHeaderThemeContext（js 190103）
 *   8. Tv = resolveToolbarNode（js 192125）
 *   9. jv = resolveFileTooLargeNode（js 192234）
 *  10. w_ = useGridTheme（js 191175）
 *  同 chunk 跨段（B5-12a/b 实体）：
 *  11. Ru = useSpreadsheetController（js 15672，XlsxDeepA.tsx）
 *  12. oy = SpreadsheetCanvas 主体（js 193217，XlsxDeepB.tsx）
 *  chunk 导入（chunk 行号）：
 *  13. r  = IntlProvider 上下文钩子（IntlProvider-C321H7m8.js 导出 n，chunk 行 3）
 *  14. a  = 日志器（logger-PFDwl5Yq.js 导出 t，chunk 行 5）
 *  15. s  = 类名拼接工具（utils-CEEH0K_K.js 导出 t，chunk 行 7）
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 外部依赖挂接（行号在案，见上 §二）——A0-S2b：15 组 declare 全部已接线为真实 import
// ----------------------------------------------------------------------------

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/xlsx/XlsxDeepT.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  Spreadsheet,
  PreviewPaneOfficeXlsxContent,
} from '../components/xlsx/XlsxDeepT';
