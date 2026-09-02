/* eslint-disable */
/**
 * ============================================================================
 * MarkdownMermaid.tsx — ZCode 3.7.6 markdown 渲染层 · Mermaid 图表子模块
 * （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（21,756 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js
 * 伴随 shim（3 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/mermaid-GHXKKRXX-BUw9cQJG.js
 *     内容：`import { a as e } from "./chunk-BO2N2NFS-CSNAeaxF.js"; export { e as Mermaid };`
 *     —— 即本文件 Mermaid 组件的具名再导出（懒加载目标）。
 * 对照 jsx：src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名（js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *   av/ov/sv → LAZY_RENDER_DEBOUNCE_MS=300 / ROOT_MARGIN='300px' /
 *              IDLE_TIMEOUT_MS=500 (18292)
 *   cv → useLazyRender          IntersectionObserver+requestIdleCallback 懒渲染钩子
 *                               （返回 {shouldRender, containerRef}）(18295)
 *   oy → downloadSvgAsPng       SVG→base64→Image→canvas(5x)→PNG blob (19626)
 *   sy → MermaidDownloadDropdown 下载下拉（SVG/PNG/MMD 三档）(19653)
 *   cy → MermaidFullscreenButton 全屏按钮（portal 覆盖层 + 内嵌 Mermaid）(28636)
 *   $b → ZoomableContent        缩放/平移容器（滚轮缩放、指针拖拽、控制钮）(21463)
 *   ex → Mermaid                Mermaid React 组件（导出别名 a；data-streamdown=mermaid）
 *                               (21620)
 *   by → LazyMermaid            lazy(() => import('./mermaid-GHXKKRXX-…').Mermaid)
 *                               —— MarkdownCode 渲染 ```mermaid 块时的入口 (20282)
 *
 * 外部依赖：
 *   - MarkdownContext.tsx（StreamdownContext/useMermaidPlugin/图标/文案/滚动锁/下载）
 *   - mermaid 运行时本体不在本 chunk：经 plugins.mermaid（@streamdown/mermaid，
 *     由宿主 styles-CdEGpc2x.js 注入）的 getMermaid(config).render(id, text) 调用；
 *     mermaid 11.14.0 库 chunk 见 VENDOR-MANIFEST-LIBS.md（chunk-ICPOFSXX 系）。
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/markdown/MarkdownMermaid.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  useLazyRender,
  downloadSvgAsPng,
  MermaidDownloadDropdown,
  MermaidFullscreenButton,
  ZoomableContent,
  Mermaid,
  LazyMermaid,
} from '../components/markdown/MarkdownMermaid';
export type {
  UseLazyRenderOptions,
  MermaidDownloadDropdownProps,
  MermaidFullscreenButtonProps,
  ZoomableContentProps,
  MermaidProps,
  MermaidPlugin,
} from '../components/markdown/MarkdownMermaid';
