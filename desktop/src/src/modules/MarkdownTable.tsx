/* eslint-disable */
/**
 * ============================================================================
 * MarkdownTable.tsx — ZCode 3.7.6 markdown 渲染层 · 表格子模块
 * （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（21,756 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js
 * 对照 jsx：src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx
 * 定性：streamdown@2.5.0 first-party 层 —— 表格数据提取/序列化 + 表格控件族。
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名（js 行 / jsx 行；上游 streamdown 导出名见括注）
 * ----------------------------------------------------------------------------
 *   ly → extractTableDataFromElement  DOM 表格 → {headers, rows}（上游 m）(19849 / 16254)
 *   uy → tableDataToCSV           CSV 序列化（引号转义，上游 n）(19867 / 16272)
 *   dy → tableDataToTSV           TSV 序列化（\t \n \r 字面量化，上游 o）(19896 / 16300)
 *   fy → escapeMarkdownTableCell  单元格 `\`/`|` 转义（上游 p）(19931 / 16333)
 *   py → tableDataToMarkdown      Markdown 表格序列化（上游 q）(19946 / 16344)
 *   my → TableCopyDropdown        复制下拉（Markdown/CSV/TSV；clipboard.write
 *                                 双 MIME text/plain+text/html，上游 r）(19956 / 16354)
 *   hy → TableDownloadDropdown    下载下拉（CSV/Markdown，上游 s）(20062 / 16417)
 *   gy → TableFullscreenButton    表格全屏（portal + sticky 表头，上游 t）(20144 / 16455)
 *   _y → TableWrapper             表格外壳 + 控件条（data-streamdown=table-wrapper）
 *                                 (20238 / 16495)
 *
 * 外部依赖：MarkdownContext.tsx（上下文/图标/文案/下载/滚动锁）
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/markdown/MarkdownTable.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  extractTableDataFromElement,
  tableDataToCSV,
  tableDataToTSV,
  escapeMarkdownTableCell,
  tableDataToMarkdown,
  TableCopyDropdown,
  TableDownloadDropdown,
  TableFullscreenButton,
  TableWrapper,
} from '../components/markdown/MarkdownTable';
export type {
  TableData,
  TableCopyDropdownProps,
  TableDownloadDropdownProps,
  TableFullscreenButtonProps,
  TableWrapperProps,
} from '../components/markdown/MarkdownTable';
