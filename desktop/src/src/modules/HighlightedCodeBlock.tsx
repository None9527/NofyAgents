/* eslint-disable */
/**
 * ============================================================================
 * HighlightedCodeBlock.tsx — ZCode 3.7.6 代码块高亮族（解混淆重建 · D8 Stage B2 / PreviewMisc 族）
 * ============================================================================
 *
 * 目标 chunk（25 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/highlighted-body-OFNGDK62-RS9ZmWFH.js
 * 对照 jsx（43 行）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/highlighted-body-OFNGDK62-RS9ZmWFH.jsx
 * 宿主 chunk（代码块外壳/头部/懒加载方，21,756 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js
 *   （jsx 对照：src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx）
 *
 * ----------------------------------------------------------------------------
 * 一、定性：vendor —— streamdown@2.5.0（vercel/streamdown，Apache-2.0）
 * ----------------------------------------------------------------------------
 * 本族整体为上游 streamdown 的打包产物（VENDOR-MANIFEST-LIBS.md 曾标 first-party，
 * 经 B1 阶段逐行对照 node_modules/streamdown/dist 修正为 vendor）：
 *  1) highlighted-body-OFNGDK62-RS9ZmWFH.js 与上游
 *     node_modules/streamdown/dist/highlighted-body-OFNGDK62.js 逐语句一致
 *     （hash 前缀 OFNGDK62 来自上游 rollup 构建，ZCode Vite 仅追加 -RS9ZmWFH）；
 *  2) 外壳族（CodeBlockShell/CodeBlockHeader/HighlightedCodeBlock/CodeBlockBody）
 *     与上游 dist/chunk-BO2N2NFS.js 的 ot/rt/st/At 组件逐字对应，仅互操作包装
 *     与混淆名不同。
 * 按任务策略「vendor 段登记 + 包装层全量语义重建」，本文件把整族（目标 chunk +
 * 宿主 chunk 中的代码块段）完整重建为可读源码，供后续 ZCode 化改造直接编辑。
 *
 * ----------------------------------------------------------------------------
 * 二、混淆名 → 语义名 映射表（行号格式：宿主 chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  宿主 chunk（chunk-BO2N2NFS-CSNAeaxF.js）内：
 *   Sv  → cn                        clsx+twMerge 类名合并（= utils cn 语义）(18472)
 *   Ev  → ClassNamesContext         createContext(Sv)（可注入自定义合并器）(18615 附近 / 15443)
 *   Q   → useClassNames             () => useContext(Ev) (18616 附近 / 15444)
 *   Dv  → LINE_NUMBER_CLASS         行号 CSS counter 类（before:content-[counter(line)]…）(jsx 15445)
 *   Ov  → parseInlineStyle          "k:v;k2:v2" → 对象 (jsx 15446)
 *   kv  → CodeBlockBody             memo 组件：shiki tokens → hast 风格 span 树 (18522–18614)
 *   Av  → CodeBlockShell            代码块外壳（圆角卡片 + content-visibility）(18615)
 *   jv  → CodeBlockCodeContext      createContext({code:''})——供子组件取原始代码 (18627)
 *   Mv  → useCodeBlockCode          () => useContext(jv) (18628)
 *   Nv  → CodeBlockHeader           语言标签头（data-streamdown=code-block-header）(18629)
 *   Pv  → trimTrailingNewlines      去尾部换行 (18638)
 *   Fv  → LazyHighlightedCodeBlockBody  lazy(() => import('./highlighted-body-…')) (18650)
 *   Iv  → HighlightedCodeBlock      代码块主组件（外壳+头+动作槽+Suspense 正文）(18660)
 *   ty  → CodeHighlighterContext    createContext(null)（顶层注入高亮器）(19610)
 *   ny  → useCodeHighlighterContext () => useContext(ty) (19611)
 *   ry  → useCodeHighlighter        () => useContext(ty)?.code ?? null (19612)
 *   Xb  → StreamdownOptionsContext  {shikiTheme, controls, isAnimating, lineNumbers,
 *                                    mode, mermaid, linkSafety} (21176)
 *
 *  目标 chunk（highlighted-body-OFNGDK62-RS9ZmWFH.js，25 行）内：
 *   c   → HighlightedCodeBlockBody  懒加载正文组件（导出名未混淆）(1–25)
 *   o   → ReactInterop              e(t(),1)（react 默认导出互操作）
 *   s   → jsxRuntime                n()（jsx-runtime 命名空间互操作）
 *   导入（./chunk-BO2N2NFS-CSNAeaxF.js）：
 *     i -> Xb -> StreamdownOptionsContext
 *     n -> ry -> useCodeHighlighter
 *     t -> kv -> CodeBlockBody
 *
 * 上游登记：streamdown@2.5.0 —— dist/highlighted-body-OFNGDK62.js（=本族目标
 * chunk）、dist/chunk-BO2N2NFS.js（=宿主 chunk 上游对应物；上游导出表
 * `At as c`=CodeBlockBody、`Li as f`=useCodeHighlighter、`R as A`=
 * StreamdownOptionsContext、`st as g`=HighlightedCodeBlock、`ot as d`=
 * CodeBlockShell、`rt as e`=CodeBlockHeader，与本构建一一对应）。
 *
 * 懒加载方：宿主 chunk `Fv = lazy(() => import('./highlighted-body-…').then(e =>
 * ({default: e.HighlightedCodeBlockBody})))`（js 18650），经 __vite__mapDeps[0..3]
 * 预载 4 个共享 chunk——此即目标 chunk 独立成文件的原因。
 * 消费方：宿主 chunk 的 MarkdownCode 组件（jsx 16835 处 `<Iv …>`）；ZCode 的
 * Markdown 渲染器 cj（styles-CdEGpc2x.js，MODULE-MAP F19）经宿主 chunk 复用本族。
 *
 * 与本目录既有 `highlightedCodeBlockBody.tsx` 的关系：该文件是更早阶段对目标
 * chunk 的单体重建（仅 Body）；本文件为 B2 族级交付物，含完整外壳族 + Body，
 * 两者对 Body 的语义结论一致（本文件 §4 与之一致）。
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/code-viewer/HighlightedCodeBlock.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  CodeBlockBody,
  CodeBlockShell,
  useCodeBlockCode,
  HighlightedCodeBlockBody,
  HighlightedCodeBlock,
} from '../components/code-viewer/HighlightedCodeBlock';
export type {
  HighlightResult,
  CodeHighlighter,
  StreamdownOptions,
  CodeBlockBodyProps,
  HighlightedCodeBlockBodyProps,
  HighlightedCodeBlockProps,
} from '../components/code-viewer/HighlightedCodeBlock';
