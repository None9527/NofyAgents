/* eslint-disable */
/**
 * ============================================================================
 * MarkdownCodeBlock.tsx — ZCode 3.7.6 markdown 渲染层 · 代码块子模块
 * （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（21,756 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js
 * 对照 jsx：src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx
 * 定性：streamdown@2.5.0 first-party 层 —— 代码块组件族。
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名（js 行 / jsx 行；上游 streamdown 导出名见括注）
 * ----------------------------------------------------------------------------
 *   kv → CodeBlockBody          shiki token 渲染（导出别名 t，被
 *                               highlighted-body chunk 消费）(18522)
 *   Av → CodeBlockContainer     代码块外壳（data-streamdown=code-block）(18615)
 *   jv → CodeBlockContext       { code }（复制/下载按钮取码用）(18629)
 *   Mv → useCodeBlockContext    (18630)
 *   Nv → CodeBlockHeader        语言名条（data-streamdown=code-block-header）(18629)
 *   Pv → trimTrailingNewlines   (18650)
 *   Fv → LazyHighlightedBody    lazy(() => import('./highlighted-body-…')) (18650)
 *   Iv → CodeBlock              组装：头+动作条+正文（上游导出 CodeBlock=g）(18660)
 *   Gv → CodeBlockCopyButton    复制按钮（导出别名? 上游 i）(18983)
 *   Kv → LANGUAGE_FILE_EXTENSIONS 语言→扩展名表（~300 项）(19032)
 *   qv → CodeBlockDownloadButton 下载按钮（上游 j）(19340)
 *   Jv → CodeBlockSkeleton      mermaid/自定义块加载骨架（上游 k）(19368)
 *
 * 外部依赖：
 *   - MarkdownContext.tsx（上下文/钩子/cn/图标/文案/下载工具）
 *   - highlighted-body-OFNGDK62-RS9ZmWFH.js（懒加载的 shiki 高亮正文组件，
 *     已重建为 modules/highlightedCodeBlockBody.tsx）
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/markdown/MarkdownCodeBlock.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  CodeBlockBody,
  CodeBlockContainer,
  CodeBlockContext,
  useCodeBlockContext,
  CodeBlockHeader,
  trimTrailingNewlines,
  CodeBlock,
  CodeBlockCopyButton,
  LANGUAGE_FILE_EXTENSIONS,
  CodeBlockDownloadButton,
  CodeBlockSkeleton,
  IsStreamingContext,
  useIsStreaming,
  useCodeHighlighter,
} from '../components/markdown/MarkdownCodeBlock';
export type {
  HighlightedCodeBlockBodyProps,
  CodeBlockBodyProps,
  CodeBlockProps,
  CodeBlockCopyButtonProps,
  CodeBlockDownloadButtonProps,
  ShikiTheme,
} from '../components/markdown/MarkdownCodeBlock';
