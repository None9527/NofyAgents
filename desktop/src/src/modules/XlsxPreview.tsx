/* eslint-disable */
/**
 * ============================================================================
 * XlsxPreview.tsx — ZCode 自研 xlsx 预览渲染层（PreviewPane 包装族）
 *                  （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（融合 chunk，199,508 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js
 * 对照文件（同一 chunk 的 pretty-print 版，行号双轨标注：js 行 / jsx 行）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.jsx
 * 同族文件：
 *   XlsxPreviewWasmBridge.tsx —— duke-sheets wasm 宿主 / xlsx-worker 桥
 *   XlsxPreview.report.md     —— 边界判定 / 拆法 / 占比 / 把握度
 *
 * ----------------------------------------------------------------------------
 * 〇、本模块在融合 chunk 中的位置
 * ----------------------------------------------------------------------------
 * 自研层 = 该 chunk 末尾 js 199415-199508 / jsx 49643-49724，共 4 个符号 +
 * 1 条导出；其余 199,414 行全部为 vendored 库段（d3/topojson 片段、regl、
 * react-xlsx 引擎，含内嵌地图数据），登记见报告 §1。
 * 判定依据：全 chunk 仅此处出现中文字符串（2 条 [PreviewPane] 日志）、
 * useIntlContext 调用、tailwind 设计令牌类名与 data-office-preview-* 属性。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  自研组件族（本文件全量重建）：
 *   uy  → resolveSheetTabTargetIndex  工作表页签键盘导航目标索引 (199415 / 49643)
 *   dy  → SheetTabBar                 工作表页签条（role=tablist） (199428 / 49650)
 *   fy  → XlsxParseErrorState         解析失败态（role=alert + error 日志） (199470 / 49679)
 *   py  → PreviewPaneOfficeXlsxContent 预览面板主组件（chunk 唯一导出） (199478 / 49691)
 *
 *  vendored react-xlsx 接触面（接口级登记，不逐行还原）：
 *   ly  → Spreadsheet                 react-xlsx 顶层组件（控制器注入三分支） (199406 / 49630)
 *   cy  → SpreadsheetWithOwnedController 自建控制器变体 (199402 / 49623)
 *   sy  → SpreadsheetViewer           react-xlsx-viewer 呈现壳 (199292 / 49527)
 *   Ru  → useSpreadsheetController    控制器 hook（file→worker→模型/页签） (15672 / 11907)
 *   rg  → SpreadsheetControllerContext 控制器上下文 (190102 / —)
 *   ig  → SpreadsheetHeaderThemeContext 头部主题上下文 {isDark} (190103 / —)
 *   Dl  → XlsxFileSizeLimitExceededError 文件超限错误 (14726 / —)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入；标注来源 chunk 与导出字母。
 *     A0-S2b：2–5 已接线为真实 import）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *                                    （chunk 内别名 G / K；本文件用 react 包直连）
 *  2. useIntlContext (r)             〔已接线 → useZCodeIntl @ ./I18n〕
 *  3. logger (a)                     〔已接线 → t as logger @ ./logger〕
 *  4. cn() 类名合并 (s)              〔已接线 → cn @ ./UtilsCn〕
 *  5. react-xlsx Spreadsheet (ly)    〔已接线 → Spreadsheet @ ./XlsxDeepT（补导出）〕
 * 调用方（上游）：styles-CdEGpc2x.js 160608-160619 处
 *   `yVt = React.lazy(() => import('./previewPaneOfficeXlsxContent-XeHwYdMn.js')
 *      .then(m => m.PreviewPaneOfficeXlsxContent))`，
 *   由 office 文件类型路由（officeFilePreview-DDCn9-xI.js：.xlsx/.xlsm/.xls →
 *   'excel'）分派；文件字节经该路由的 base64→ArrayBuffer 助手（导出 n）解码。
 * i18n 键：codeViewer.excel.sheetTabs = “工作表”
 *   （zcode/packages/ui/src/i18n/zh-CN.json:1206）
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/xlsx/XlsxPreview.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  resolveSheetTabTargetIndex,
  SheetTabBar,
  XlsxParseErrorState,
  PreviewPaneOfficeXlsxContent,
} from '../components/xlsx/XlsxPreview';
export type {
  SpreadsheetSheetTab,
  SheetTabBarController,
  XlsxError,
  SpreadsheetProps,
  PreviewPaneOfficeXlsxContentProps,
} from '../components/xlsx/XlsxPreview';
