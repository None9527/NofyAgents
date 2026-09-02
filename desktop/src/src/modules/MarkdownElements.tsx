/* eslint-disable */
/**
 * ============================================================================
 * MarkdownElements.tsx — ZCode 3.7.6 markdown 渲染层 · 元素渲染器族
 * （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（21,756 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js
 * 对照 jsx：src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx
 * 定性：streamdown@2.5.0 first-party 层 —— hast-util-to-jsx-runtime 的
 *      `components` 映射表（26 个标签覆盖），全部元素组件带
 *      `data-streamdown` 标记与 memo（比较 = className + mdast 位置）。
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名（js 行 / jsx 行；displayName 为上游原名）
 * ----------------------------------------------------------------------------
 *   Sy → nodesHaveEqualPosition  mdast position 相等 (20290)
 *   $  → memoPropsAreEqual      className + position (20301)
 *   Cy → resolveControlFlag     布尔或按族细分的控件开关解析 (20304)
 *   wy → resolveTableControl    controls.table.{copy|download|fullscreen} (20305)
 *   Ty → resolveCodeControl     controls.code.{download|copy} (20310)
 *   Ey → resolveMermaidControl  controls.mermaid.{download|copy|fullscreen|panZoom} (20315)
 *   Dy → MarkdownOl    (20320)   Oy → MarkdownLi (20331)
 *   ky → MarkdownUl    (20342)   Ay → MarkdownHr (20353)
 *   jy → MarkdownStrong(20363)   My → MarkdownA  → 见 MarkdownLink.tsx
 *   Ny…Ry → MarkdownH1…H6 (20430-20496)
 *   zy → MarkdownTable (20512)   By → MarkdownThead (20523)
 *   Vy → MarkdownTbody (20534)   Hy → MarkdownTr (20545)
 *   Uy → MarkdownTh    (20556)   Wy → MarkdownTd (20567)
 *   Gy → MarkdownBlockquote (20581)
 *   Ky → MarkdownSup (20592)     qy → MarkdownSub (20603)
 *   Jy → MarkdownSection（data-footnotes 空节过滤）(20653)
 *   Yy → MarkdownCode（inline/block/mermaid/自定义渲染器 四分派）(20660)
 *   Xy → MarkdownImg（加载失败降级 + 悬停下载）(20763)
 *   Zy → MarkdownParagraph（单图/单代码块透传，不包 <p>）(20765)
 *   Qy → STREAMDOWN_COMPONENTS  标签→组件映射表 (20778)
 *   $y/eb → RTL/字母探测正则 (20809)
 *   tb → detectTextDirection（上游导出 u）(20809)
 *   vy → START_LINE_REGEX /startLine=(\d+)/ (20280)
 *   yy → NO_LINE_NUMBERS_REGEX /\bnoLineNumbers\b/ (20281)
 *   xy → LANGUAGE_CLASS_REGEX /language-([^\s]+)/ (20289)
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/markdown/MarkdownElements.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  nodesHaveEqualPosition,
  memoPropsAreEqual,
  resolveControlFlag,
  resolveTableControl,
  resolveCodeControl,
  resolveMermaidControl,
  MarkdownOl,
  MarkdownLi,
  MarkdownUl,
  MarkdownHr,
  MarkdownStrong,
  MarkdownH1,
  MarkdownH2,
  MarkdownH3,
  MarkdownH4,
  MarkdownH5,
  MarkdownH6,
  MarkdownTable,
  MarkdownThead,
  MarkdownTbody,
  MarkdownTr,
  MarkdownTh,
  MarkdownTd,
  MarkdownBlockquote,
  MarkdownSup,
  MarkdownSub,
  MarkdownSection,
  LANGUAGE_CLASS_REGEX,
  MarkdownCode,
  MarkdownImg,
  MarkdownParagraph,
  STREAMDOWN_COMPONENTS,
  detectTextDirection,
} from '../components/markdown/MarkdownElements';
export type {
  MarkdownElementProps,
  MarkdownImgProps,
  MarkdownComponentsMap,
} from '../components/markdown/MarkdownElements';
