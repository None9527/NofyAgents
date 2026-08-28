/**
 * A0-S2b 类型垫片：对应只读构建产物 out/renderer/assets/duke_sheets_wasm-WTFY9Nh4.js
 * （@dukelib/sheets-wasm@0.1.21 wasm-bindgen glue，vite 动态分包，无类型声明；
 * 仅供 XlsxPreviewWasmBridge.ts 的动态 import("./duke_sheets_wasm-WTFY9Nh4.js")
 * 通过 tsc 解析。导出面按 glue 尾行逐字反推：
 *   export { e as CellValue, t as Workbook, n as Worksheet, F as default, r as init, P as initSync }
 * 结构化类型见 XlsxPreviewWasmBridge.ts 的 DukeSheetsWasmModule 接口。）
 */
export declare const CellValue: any;
export declare const Workbook: any;
export declare const Worksheet: any;
export declare function init(...args: any[]): any;
export declare function initSync(...args: any[]): any;
declare const _default: any;
export default _default;
