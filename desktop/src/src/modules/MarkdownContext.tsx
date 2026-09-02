/* eslint-disable */
/**
 * ============================================================================
 * MarkdownContext.tsx — ZCode 3.7.6 markdown 渲染层 · 上下文/图标/文案 子模块
 * （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（融合 chunk，21,756 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js
 * 对照文件（同一 chunk 的 JSX 还原版，双行号格式：js 行 / jsx 行）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx
 *
 * ── 定性（把握度：高）──────────────────────────────────────────────────────
 * 本 chunk = **streamdown@2.5.0**（vercel/streamdown，Apache-2.0）的
 * dist/chunk-BO2N2NFS.js 经 Vite 重打包后的产物（文件名哈希前缀 `BO2N2NFS`
 * 与上游 dist 逐字一致；上游包见 node_modules/streamdown）。
 * 本文件重建的是 streamdown 的 **first-party 组件层**（相对 ZCode 即
 * 「markdown 渲染自研层」的上游本体），本子模块 = 全部 React context、
 * 默认图标、默认文案与共享工具。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（本文件覆盖；行号 = js / jsx）
 * ----------------------------------------------------------------------------
 *  上下文（context）：
 *   Xb → StreamdownContext        全局选项上下文（shikiTheme/controls/isAnimating/
 *                                 lineNumbers/mode/mermaid/linkSafety）(21176)
 *   ty → StreamdownPluginsContext 插件上下文（code/mermaid/cjk/math/renderers）(28218)
 *   bv → IsStreamingContext       「末块是否未完成」上下文（布尔）(18470)
 *   Ev → ClassNamesContext        类名合并函数上下文（cn，带 prefix 能力）(18495)
 *   Rv → StreamdownIconsContext   图标表上下文 (18934)
 *   Uv → StreamdownTranslationsContext 文案上下文 (18950)
 *
 *  钩子：
 *   ny → useStreamdownPlugins     useContext(ty) (19611)
 *   ry → useCodeHighlighter       plugins?.code ?? null（导出别名 n，被
 *                                 highlighted-body chunk 消费）(19612)
 *   iy → useMermaidPlugin         plugins?.mermaid ?? null (28349)
 *   ay → useCustomBlockRenderer   按语言查 plugins.renderers (28434)
 *   xv → useIsStreaming           useContext(bv) (18471)
 *   Q  → useClassNames            useContext(Ev) (18496)
 *   Vv → useStreamdownIcons       useContext(Rv) (18949)
 *   Wv → useStreamdownTranslations useContext(Uv) (18982)
 *
 *  默认值 / 常量：
 *   Jb → DEFAULT_SHIKI_THEME      ['github-light','github-dark'] (21174)
 *   Yb → DEFAULT_LINK_SAFETY      { enabled: true } (21175)
 *   Lv → DEFAULT_STREAMDOWN_ICONS 10 个内联 SVG 图标 (18731)
 *   Hv → DEFAULT_STREAMDOWN_TRANSLATIONS 30 条英文文案 (18950)
 *   qb → STREAMDOWN_CARET_SYMBOLS { block:' ▋', circle:' ●' } (21173)
 *   Dv → STREAMDOWN_LINE_NUMBER_CLASS 行号 CSS counter 类 (18497)
 *
 *  工具：
 *   Sv → streamdownCn             twMerge(clsx(...))（s/c 来自 bundle-mjs chunk）(18472)
 *   Cv → prefixClasses            给类名批量加 `prefix:` (18473)
 *   wv → createPrefixedCn         按 prefix 造 cn (18481)
 *   Tv → downloadFile             Blob→a[download] 触发下载（CSV 加 BOM）(18484)
 *   Ov → parseInlineStyle         'k:v;k2:v2' → 对象 (18510)
 *   zv → iconsAreEqual            图标表浅比较 (18935)
 *   Bv → StreamdownIconsProvider  合并默认图标 (18941)
 *   Zv/Qv/$v → 滚动锁计数/加锁/解锁 (19481)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖（跨 chunk）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime      react-BQLj9xdT.js（F→React）、jsx-runtime-B5yMD3-t.js（Y→jsx）
 *  2. tailwind-merge + clsx    bundle-mjs-D8tLE0rB.js（s=twMerge、c=clsx；
 *                              streamdown 声明依赖 tailwind-merge ^3.4.0 / clsx ^2.1.1，
 *                              ZCode 构建中去重为独立 chunk）
 *  3. 本族其余子模块           Markdown*.tsx（同目录）
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/markdown/MarkdownContext.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  DEFAULT_SHIKI_THEME,
  DEFAULT_LINK_SAFETY,
  StreamdownContext,
  StreamdownPluginsContext,
  useStreamdownPlugins,
  useCodeHighlighter,
  useMermaidPlugin,
  useCustomBlockRenderer,
  IsStreamingContext,
  useIsStreaming,
  prefixClasses,
  createPrefixedCn,
  ClassNamesContext,
  useClassNames,
  downloadFile,
  parseInlineStyle,
  STREAMDOWN_LINE_NUMBER_CLASS,
  lockBodyScroll,
  unlockBodyScroll,
  DEFAULT_STREAMDOWN_ICONS,
  StreamdownIconsContext,
  StreamdownIconsProvider,
  useStreamdownIcons,
  DEFAULT_STREAMDOWN_TRANSLATIONS,
  StreamdownTranslationsContext,
  useStreamdownTranslations,
  STREAMDOWN_CARET_SYMBOLS,
} from '../components/markdown/MarkdownContext';
export type {
  ShikiTheme,
  HighlightResult,
  CodeHighlighterPlugin,
  MermaidPlugin,
  CustomBlockRenderer,
  CjkPlugin,
  MathPlugin,
  StreamdownPlugins,
  LinkSafetyOptions,
  LinkSafetyModalProps,
  ControlSwitch,
  ControlsOptions,
  StreamdownMode,
  StreamdownOptions,
  MermaidErrorProps,
  HastNodePosition,
  HastNodeLike,
  ClassNamesFn,
  StreamdownIcon,
  StreamdownTranslations,
} from '../components/markdown/MarkdownContext';
