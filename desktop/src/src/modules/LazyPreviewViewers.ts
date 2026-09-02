/* eslint-disable */
/**
 * ============================================================================
 * LazyPreviewViewers.ts — styles 融合 chunk 最后两个未实体化符号
 * lVt/dVt React.lazy 分包包装逐字重建（批次 B5-15b · 全量解码最后 declare 残留）
 * ============================================================================
 *
 * 来源文件（主口径，213,979 行，只读；md5 基线 48d71d4874b0868d61fd35a328bf6ad5）：
 *   desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * jsx 孪生交叉参照：
 *   desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 覆盖区段（两段，合计 15 行；中段 160679–160687 uVt 属 CodeViewer.tsx
 * PdfPreviewSuspense，已实体化，互斥不重复）：
 *   - lVt → LazyPdfViewer        当前 160672–160678 / jsx 132852
 *   - dVt → LazyPptxPreviewViewer 当前 160688–160695 / jsx 132865
 * 边界实测：任务书标 dVt 止 ~160697，实测 160695（160696 为 fVt 起点）。
 *
 * 边界互斥（只注记）：
 *   - 上界 160671 `}` 为 cVt 收尾（它批）；下界 160696 fVt = PptxPreviewSuspense
 *     （CodeViewer.tsx 已实体化）。
 *
 * 重建口径（与 B5-15 一致）：逐字转录（字符串常量/依赖索引数组/import 说明符/
 *   调用形态零改动）；顶层符号改语义名（与 CodeViewer.tsx 304/311 declare 名一致，
 *   整合期直接改指）；类型标注仅箭头回调形参 `: any`（可机械剥离）；
 *   外部依赖 `declare const` 挂接（行号在案，见 §二）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（当前 js 行 / jsx 孪生行）
 * ----------------------------------------------------------------------------
 *   lVt → LazyPdfViewer         (160672–160678) 把握度：高
 *   dVt → LazyPptxPreviewViewer (160688–160695) 把握度：高
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（行号在案）
 * ----------------------------------------------------------------------------
 *   Q = React interop           chunk 996 `var Q = r(F(), 1)`
 *   Y = 动态 import 预载包装     chunk import 856（preload-helper-BHSF1fZ9.js 导出 t，
 *                               三参 (loader, deps, url) 包装）
 *   __vite__mapDeps = vite 运行时依赖索引表  chunk 1（`const __vite__mapDeps = (`）
 *
 * 消费方证据：lVt ← uVt（160685，CodeViewer.tsx PdfPreviewSuspense）；
 *   dVt ← fVt（160709，CodeViewer.tsx PptxPreviewSuspense）。
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 外部依赖挂接（行号在案，见上 §二；类型从宽）
// ----------------------------------------------------------------------------
import * as React from "react"; // A1-R10 2f：原 Q（chunk 996 `var Q = r(F(), 1)`）= React interop——canonical 即 React 命名空间；Q.lazy 调用面改 React.lazy 逐字语义（下两处 BODY）
/* ── tombstone（A1-R10 2f）：declare const Q: any（React interop，chunk 996）删除，改指 React（上行 import）。 ── */
declare const Y: any; // 动态 import 预载包装（chunk import 856；preload-helper-BHSF1fZ9.js）
declare const __vite__mapDeps: (idx: number[]) => string[]; // vite 运行时（chunk 1）

// [B5-15b BODY1 START js 160672]
var LazyPdfViewer = (0, React.lazy)(() =>
  Y(
    () => import(`./pdf-viewer-m6YcRb_5.js`).then((e: any) => ({ default: e.PdfViewer })),
    __vite__mapDeps([293, 1, 112, 294, 295, 296, 297, 298, 299, 300, 301, 302]),
    import.meta.url,
  ),
);
// [B5-15b BODY1 END js 160678]

// [B5-15b BODY2 START js 160688]
var LazyPptxPreviewViewer = (0, React.lazy)(() =>
  Y(
    () =>
      import(`./pptx-preview-viewer-B1z6CWke.js`).then((e: any) => ({ default: e.PptxPreviewViewer })),
    __vite__mapDeps([303, 1, 112, 304, 305, 295, 296, 297, 306, 294, 298, 299, 307, 308, 309]),
    import.meta.url,
  ),
);
// [B5-15b BODY2 END js 160695]

// 整合期导出（chunk 原始形态为模块私有 var、无导出语句；此处追加具名导出供
// CodeViewer.tsx 304/311 两个 declare 改指，不影响体区段逐字回代）。
export { LazyPdfViewer, LazyPptxPreviewViewer };

/* ============================================================================
 * 符号总表（B5-15b）
 * ----------------------------------------------------------------------------
 * | 混淆名 | 语义名                | 当前 js 行     | jsx 行   | 把握度 |
 * |--------|-----------------------|----------------|----------|--------|
 * | lVt    | LazyPdfViewer         | 160672–160678  | 132852   | 高     |
 * | dVt    | LazyPptxPreviewViewer | 160688–160695  | 132865   | 高     |
 *
 * 边界注记：
 *   - 中段 160679–160687（uVt = PdfPreviewSuspense）与下界 160696 起（fVt =
 *     PptxPreviewSuspense）属 CodeViewer.tsx，已实体化，互斥不重复。
 *   - 整合期：CodeViewer.tsx 304/311 两个 `declare const LazyPdfViewer /
 *     LazyPptxPreviewViewer` 改指本产物导出（本批不改动 CodeViewer.tsx）。
 * ============================================================================
 */
