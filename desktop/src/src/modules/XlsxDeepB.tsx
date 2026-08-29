/* eslint-disable */
/**
 * ============================================================================
 * XlsxDeepB.tsx — react-xlsx 深部下半：oy 网格主组件（B5-12b · 逐字重建）
 * ============================================================================
 *
 * 源 chunk（只读）：
 *   desktop/src/out/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.js
 *   （199,508 行；本文件覆盖 **js 193217–199291**，6,075 行，单一符号 oy）
 * jsx 孪生（交叉参照）：
 *   desktop/src/src-reconstructed/renderer/assets/previewPaneOfficeXlsxContent-XeHwYdMn.jsx
 *   （49,724 行；oy = jsx 44862–49526）
 *
 * 登记：XlsxPreview.report.md §1 子段表「Spreadsheet 主体 193217–199291」；
 *       COVERAGE-LEDGER §c #24（react-xlsx 深部 Ru→oy→canvas 渲染层）下半。
 * 并行批次：B5-12a（XlsxDeepA.tsx）= js 15672–17817（Ru 控制器）+
 *           183972–189511（canvas 渲染层）；与本批行号互斥。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表
 * ----------------------------------------------------------------------------
 *   oy → SpreadsheetGrid（网格主组件：虚拟滚动 + 画布绘制 + 图表/图片/表单控件
 *        覆盖层 + 选区/编辑/剪贴板/缩放/手势 + 冻结窗格 + 排序/筛选接线）
 *        （jsx 44862–49526 / js 193217–199291；chunk 内唯一顶层声明）
 *
 * 局部变量约定：oy 体内约 436 个嵌套函数、数百个混淆局部名（We/Ge/Ke…）
 *   **全部按原样保留**——逐字转录零漂移；语义索引见文件尾符号表与
 *   XlsxOfficeChart.report.md §2（关键局部名语义注记）。
 *   类型注解 `: any` 为机器补注（满足 strict 检查，不改变运行时行为）。
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖（oy 自由变量 148 个，按源段分组登记；行号 = js。
 *     A0-S2b：[C]/[P]/[E]/[R]/[L]/[S] 共 151 条 declare 已接线为真实 import）
 * ----------------------------------------------------------------------------
 *   [H1] G = React 互操作（原 9111 `G = e(n(), 1)`）→ declare namespace G（保留）
 *   [H2] K = jsx-runtime（原 9113 `K = i()`）→ declare namespace K（保留）
 *   [H3] k = useVirtualizer —— @tanstack/react-virtual 3.13.23（vendored，
 *        esm-BY6T6pIH.js；VENDOR-MANIFEST-LIBS.md 已登记）→ declare function k（保留）
 *   [C]  常量段 189512–189563〔已接线 → ./XlsxDeepC 导出（36 常量）〕
 *   [P]  解析/几何助手 ac/oc/sc（14200–14206）、dc（14259）〔已接线 → ./XlsxDeepP〕
 *   [E]  Dl = XlsxFileSizeLimitExceededError（14726–14735）〔已接线 → ./XlsxDeepP〕
 *   [R]  gm = canvas 网格 memo 组件（189364；canonical 属 B5-12a）〔已接线 → ./XlsxDeepA〕
 *   [L]  ay = G.memo(iy) 行渲染器（193182）〔已接线 → MemoSpreadsheetRow @ ./XlsxDeepC〕
 *   [S]  选区/测量/布局/编辑/工具条助手群（189593–192831）〔已接线 → ./XlsxDeepC〕
 * ============================================================================
 */

/* 全局：画布性能剖析开关（原 193243 window.__xlsxCanvasProfile 读取） */

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/xlsx/XlsxDeepB.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  SpreadsheetGrid,
} from '../components/xlsx/XlsxDeepB';
export { default } from '../components/xlsx/XlsxDeepB';
