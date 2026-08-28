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
 * 二、外部依赖清单（跨段/跨 chunk；本文件以 `declare const _: any` 挂接，
 *     括号内 = 定义处行号；均不属本批 199292–199508 范围）
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
import {
  reactInterop, // 原 G（js 9111）
  jsxRuntime, // 原 K（js 9113）
  setDukeSheetsWasmSource, // 原 Cc（js 14357）
  XlsxFileSizeLimitExceededError, // 原 Dl（js 14726）
} from "./XlsxDeepP";
import {
  joinClassNames, // 原 ag（js 190104）
  SpreadsheetHeaderThemeContext, // 原 ig（js 190103）
  SpreadsheetControllerContext, // 原 rg（js 190102）
  resolveFileTooLargeNode, // 原 jv（js 192234）
  resolveToolbarNode, // 原 Tv（js 192125）
  useGridTheme, // 原 w_（js 191175）
} from "./XlsxDeepC";
import { useSpreadsheetController } from "./XlsxDeepA"; // 原 Ru（js 15672）
import { SpreadsheetGrid } from "./XlsxDeepB"; // 原 oy（js 193217）
import { useZCodeIntl } from "./I18n"; // 原 r（IntlProvider-C321H7m8.js 导出 n）
import { t as logger } from "./logger"; // 原 a（logger-PFDwl5Yq.js 导出 t）
import { cn } from "./UtilsCn"; // 原 s（utils-CEEH0K_K.js 导出 t）

function SpreadsheetViewer({
  allowResizeInReadOnly: e = !1,
  className: t,
  controller: n,
  emptyState: r,
  enableCanvasSelectionAnimation: i = !0,
  enableGestureZoom: a = !0,
  errorState: o,
  experimentalCanvas: s = !0,
  fileTooLargeState: c,
  getCellStyle: l,
  headerBackgroundColor: u,
  headerTextColor: d,
  height: f,
  isDark: p = !1,
  loadingComponent: m,
  loadingState: h,
  onFormControlAction: g,
  onFormControlChange: _,
  renderChartLoading: v,
  renderFormControl: y,
  renderImage: b,
  renderImageSelection: x,
  renderScroller: S,
  renderTableHeaderMenu: C,
  rounded: w = !0,
  selectionColor: T,
  selectionFillColor: E,
  selectionHeaderColor: D,
  showImages: O = !0,
  showDefaultToolbar: k = !0,
  toolbar: A,
}: any) {
  let j = useGridTheme(p, u, d),
    { displayFileName: M, error: N } = n,
    P =
      N instanceof XlsxFileSizeLimitExceededError
        ? resolveFileTooLargeNode(
            c,
            {
              displayFileName: M,
              fileSizeBytes: N.fileSizeBytes,
              maxFileSizeBytes: N.maxFileSizeBytes,
            },
            j,
          )
        : void 0;
  return (0, jsxRuntime.jsx)(SpreadsheetHeaderThemeContext.Provider, {
    value: { headerBackgroundColor: u, headerTextColor: d, isDark: p },
    children: (0, jsxRuntime.jsx)(SpreadsheetControllerContext.Provider, {
      value: n,
      children:
        P === void 0
          ? (0, jsxRuntime.jsxs)(`div`, {
              className: joinClassNames(`react-xlsx-viewer`, t),
              style: {
                blockSize: f,
                backgroundColor: j.surface,
                borderRadius: w ? 12 : 0,
                color: j.text,
                display: `flex`,
                flex: `1 1 auto`,
                flexDirection: `column`,
                inlineSize: `100%`,
                isolation: `isolate`,
                maxHeight: `100%`,
                maxWidth: `100%`,
                minHeight: 0,
                minWidth: 0,
                overflow: `hidden`,
                position: `relative`,
                width: `100%`,
              },
              children: [
                resolveToolbarNode(A, k, n, j),
                (0, jsxRuntime.jsx)(`div`, {
                  style: { display: `flex`, flex: 1, minHeight: 0, minWidth: 0 },
                  children: (0, jsxRuntime.jsx)(SpreadsheetGrid, {
                    allowResizeInReadOnly: e,
                    controller: n,
                    emptyState: r,
                    enableCanvasSelectionAnimation: i,
                    enableGestureZoom: a,
                    errorState: o,
                    experimentalCanvas: s,
                    fileTooLargeState: c,
                    getCellStyle: l,
                    loadingComponent: m,
                    loadingState: h,
                    onFormControlAction: g,
                    onFormControlChange: _,
                    palette: j,
                    renderChartLoading: v,
                    renderFormControl: y,
                    renderImage: b,
                    renderImageSelection: x,
                    renderScroller: S,
                    renderTableHeaderMenu: C,
                    selectionColor: T,
                    selectionFillColor: E,
                    selectionHeaderColor: D,
                    showImages: O,
                  }),
                }),
              ],
            })
          : P,
    }),
  });
}
function SpreadsheetWithOwnedController(e: any) {
  let t = useSpreadsheetController(e);
  return (0, jsxRuntime.jsx)(SpreadsheetViewer, { ...e, controller: t });
}
function Spreadsheet(e: any) {
  let t = reactInterop.useContext(SpreadsheetControllerContext);
  return e.controller
    ? (0, jsxRuntime.jsx)(SpreadsheetViewer, { ...e, controller: e.controller })
    : t
      ? (0, jsxRuntime.jsx)(SpreadsheetViewer, { ...e, controller: t })
      : (0, jsxRuntime.jsx)(SpreadsheetWithOwnedController, { ...e });
}
setDukeSheetsWasmSource(`` + new URL(`duke_sheets_wasm_bg-BCCK9PkU.wasm`, import.meta.url).href);
function resolveSheetTabTargetIndex({ currentIndex: e, key: t, tabCount: n }: any) {
  return n < 1
    ? null
    : t === `Home`
      ? 0
      : t === `End`
        ? n - 1
        : t === `ArrowLeft`
          ? (e - 1 + n) % n
          : t === `ArrowRight`
            ? (e + 1) % n
            : null;
}
function SheetTabBar({ controller: e, label: t }: any) {
  let { activeTabIndex: n, setActiveTabIndex: r, tabs: i } = e;
  if (i.length <= 1) return null;
  let o = (e: any) => {
      (r(e), logger.debug(`[PreviewPane] Excel 工作表已切换`, { sheetIndex: e, sheetName: i[e]?.name }));
    },
    c = (e: any, t: any) => {
      let n = resolveSheetTabTargetIndex({ currentIndex: t, key: e.key, tabCount: i.length });
      n !== null &&
        (e.preventDefault(),
        o(n),
        e.currentTarget.parentElement?.querySelectorAll(`[role="tab"]`)?.item(n).focus());
    };
  return (0, jsxRuntime.jsx)(`div`, {
    "aria-label": t,
    className: `flex min-h-0 shrink-0 gap-1 overflow-x-auto border-b border-border bg-surface px-2 py-1`,
    role: `tablist`,
    children: i.map((e: any, t: any) => {
      let r = t === n;
      return (0, jsxRuntime.jsx)(
        `button`,
        {
          "aria-selected": r,
          className: cn(
            `h-7 max-w-48 shrink-0 truncate rounded-md px-2 text-ui-sm transition-colors`,
            r
              ? `bg-selected text-foreground`
              : `text-foreground-subtle hover:bg-hover hover:text-foreground`,
          ),
          onClick: () => o(t),
          onKeyDown: (e: any) => c(e, t),
          role: `tab`,
          tabIndex: r ? 0 : -1,
          title: e.name,
          type: `button`,
          children: e.name,
        },
        e.id,
      );
    }),
  });
}
function XlsxParseErrorState({ error: e, message: t, sourcePath: n }: any) {
  return (
    (0, reactInterop.useEffect)(() => {
      logger.error(`[PreviewPane] Excel 文件解析失败`, { path: n, error: e.message });
    }, [e, n]),
    (0, jsxRuntime.jsx)(`div`, { className: `p-3 text-sm text-destructive`, role: `alert`, children: t })
  );
}
function PreviewPaneOfficeXlsxContent({ buffer: e, errorMessage: t, isDark: n, sourcePath: i }: any) {
  let { intl: a } = useZCodeIntl(),
    o = a.formatMessage({ id: `codeViewer.excel.sheetTabs` });
  return (0, jsxRuntime.jsx)(`div`, {
    className: `h-full min-h-0 w-full min-w-0 overflow-hidden bg-background`,
    "data-office-preview-kind": `excel`,
    children: (0, jsxRuntime.jsx)(Spreadsheet, {
      file: e,
      fileName: i,
      height: `100%`,
      isDark: n,
      readOnly: !0,
      rounded: !1,
      showDefaultToolbar: !1,
      toolbar: (0, reactInterop.useCallback)((e: any) => (0, jsxRuntime.jsx)(SheetTabBar, { controller: e, label: o }), [o]),
      loadingState: (0, jsxRuntime.jsx)(`div`, {
        "aria-busy": `true`,
        className: `h-full min-h-0 w-full bg-background`,
        "data-office-preview-pending": !0,
      }),
      errorState: (e: any) => (0, jsxRuntime.jsx)(XlsxParseErrorState, { error: e, message: t, sourcePath: i }),
      fileTooLargeState: () =>
        (0, jsxRuntime.jsx)(`div`, {
          className: `p-3 text-sm text-destructive`,
          role: `alert`,
          children: t,
        }),
    }),
  });
}
export { PreviewPaneOfficeXlsxContent as PreviewPaneOfficeXlsxContent };

/*
 * ============================================================================
 * 符号表（B5-12t；行号 = 主口径 js 行；语义名与 ·export 分级同 §一映射表）
 * ============================================================================
 *  [顶层视图/壳层]
 *   sy → SpreadsheetViewer (199292) | cy → SpreadsheetWithOwnedController (199402)
 *   ly → Spreadsheet (199406)
 *  [页签条/错误态/入口]
 *   uy → resolveSheetTabTargetIndex (199415) | dy → SheetTabBar (199428)
 *   fy → XlsxParseErrorState (199470) | py → PreviewPaneOfficeXlsxContent (199478) ·export
 *  wasm 源注册调用（199414）消费 XlsxDeepP 的 Cc；导出语句 199508 为 chunk 终行。
 *  外部依赖 15 组（行号在案）见文件头 §二。
 *  边界：下界 199291 与 B5-12b（XlsxDeepB.tsx，oy 收尾）互斥。
 * ============================================================================
 */
