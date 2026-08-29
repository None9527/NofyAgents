/* eslint-disable */
/**
 * ============================================================================
 * DiffsWorker.tsx — ZCode 3.7.6 diff/file 高亮 Web Worker（解混淆重建 · D8 Stage B2 / PreviewMisc 族）
 * ============================================================================
 *
 * 来源文件（10,697 行，自包含 IIFE worker bundle，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/diffs.worker-CAavpt0L.js
 * 对照文件（同一 chunk 的 pretty-print 版，10,142 行）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/diffs.worker-CAavpt0L.jsx
 *
 * ----------------------------------------------------------------------------
 * 一、chunk 结构总览（vendor 段登记 + 自研段全量重建）
 * ----------------------------------------------------------------------------
 * 本 chunk 是 `new Worker(new URL('diffs.worker-CAavpt0L.js'), {type:'module',
 * name:'zcode-diffs-worker'})`（styles-CdEGpc2x.js js 211091 `q6t`）加载的
 * 自研 diff 消息处理器，内含 5 组 vendor 库 + 1 段自研引擎。按任务策略，
 * vendor 段仅登记（行号 + 上游 + 锚点），自研段（9172–10697）全量语义重建。
 *
 *  | # | 行范围 (js)   | 定性   | 上游模块 / 锚点符号                                        |
 *  |---|---------------|--------|--------------------------------------------------------------|
 *  | 1 | 10–~5160      | vendor | **vscode-textmate + hast 生态 + shiki 核心**（Rollup 提升交错）：|
 *  |   |               |        | TextMate Grammar（_compilePatterns 1000、tokenizeLine 1666）、|
 *  |   |               |        | property-information 属性表（2640）、HTML 实体表（3500）、    |
 *  |   |               |        | @shikijs/core token 渲染（4600）、ShikiError(11/5168)、      |
 *  |   |               |        | codeToTokens/codeToHtml(4897/5432)、createHighlighter `Vi`(5424) |
 *  | 2 | 5460–8177     | vendor | **oniguruma-to-es + @shikijs/engine-javascript**：oniguruma  |
 *  |   |               |        | 正则 AST 解析（Ki/Ji/Yi 5465+、Subroutine `Ba` 6200、         |
 *  |   |               |        | ES2024/ES2025 目标转换 7600）、JavaScriptScanner `Xs`(8115)、 |
 *  |   |               |        | createJavaScriptRegexEngine `Qs`(8178)                        |
 *  | 3 | 8194–8545     | vendor | **@shikijs/engine-oniguruma**：ShikiError `$s`(8194)、        |
 *  |   |               |        | OnigScanner/OnigString 包装（uc/lc）、createOnigurumaEngine   |
 *  |   |               |        | `xc`(8533)                                                    |
 *  | 4 | 8546–9098     | vendor | **jsdiff（npm `diff`）**：Diff 基类 `Y`(8546)、diffChars      |
 *  |   |               |        | `Sc/Cc`(8720/8721)、extendedWordChars `Nc`(8788)、            |
 *  |   |               |        | diffWordsWithSpace `Ic/Lc`(8892/8898)、diffLines 类(8900+)、  |
 *  |   |               |        | structuredPatch/createPatch（@@ -oldStart,oldLines …，9049–9081）|
 *  | 5 | 9099–9158     | vendor | **@shikijs/transformers**：transformerStyleToClass `qc`       |
 *  |   |               |        | （name='@shikijs/transformers:style-to-class'）+ cyrb53 哈希 `Jc` |
 *  | 6 | 9159–9171     | vendor*| **vscode-oniguruma wasm base64 内联**（`Yc/Xc/Zc/Qc/$c`）：   |
 *  |   |               |        | ≈1.1MB blob 与 wasm-B4ap0Fdc.js 同源；构建期定制（上游经       |
 *  |   |               |        | fetch/URL 载入，此处 atob 内联）。重建保留接口、不转录数据     |
 *  | 7 | **9172–10697**| **自研** | **ZCode diff 引擎 + 消息处理器**（本文件全量重建）            |
 *
 * ----------------------------------------------------------------------------
 * 二、自研段 混淆名 → 语义名 映射表（行号格式：js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  基础设施：
 *   el  → initOnigurumaWasm（懒模块：强制 wasm 初始化）(9172)
 *   tl  → LINE_SPLIT_REGEX = /(?<=\n)/（保留换行的行分割）(9176)
 *   nl  → DEFAULT_DIFFS_THEMES = {dark:'pierre-dark', light:'pierre-light'}（ZCode 自研主题）(9177)
 *   （匿名）→ Object.freeze({fromStart:0,fromEnd:0}) 未引用死常量 (9178)
 *  语言/主题/扩展注册表：
 *   rl/il/al → resolvedLanguageMap / loadedLanguageNames / loadResolvedLanguages (9180–9190)
 *   ol/sl/cl → resolvedThemeMap / loadedThemeNames / loadResolvedThemes (9191–9202)
 *   Z/ll    → customExtensionMap（Map）/ customExtensionsVersion (9202 附近)
 *   ul  → EXTENSION_TO_LANGUAGE 扩展名→shiki 语言 id（343 条）(9203–9547 / 8689)
 *   dl  → resolveLanguageForFileName（自定义表→全名→复合扩展→单扩展→'text'）(9548 / 9034)
 *   fl  → setCustomExtensions（版本号单调递增才生效）(9559 / 9045)
 *  hast 工具：
 *   pl  → stripTrailingNewline (9568)      ml → hastText (9570)
 *   hl  → hastElement (9573)               gl → findCodeElement (9576)
 *   _l  → processLine（行元素→div + data-line/alt-line/line-type/line-index）(9583)
 *   vl/yl → NO_TOKEN / MULTIPLE_TOKENS 符号 (9601)
 *   bl  → groupTokensByCharPosition（data-char 归组/补包 span）(9603)
 *   xl/Sl/Cl → getCharPosition / clearCharPositions / setCharPosition (9651/9655/9661)
 *  shiki transformer 组装：
 *   wl  → createDiffTransformers（行处理 + 可选 token/样式归一）(9664 / 9163)
 *   Tl  → styleToClassTransformer = qc({classPrefix:'hl-'})（vendor §5）(9713 / 9209)
 *   El  → TOKEN_STYLE_NORMALIZER（color/bg/fontStyle→htmlStyle）(9714)
 *   Q   → cssVariablePrefix（'token'→'--diffs-token-'，其余 '--diffs-'）(9731 / 9222)
 *   Dl  → buildThemeStyles（fg/bg + 增/删/改色变量，双主题分 dark/light）(9734 / 9225)
 *   Ol  → buildThemeColorVars（gitDecoration.* → terminal.ansi* 兜底）(9756)
 *   kl  → getLineNodes（取 code 元素 children）(9770)
 *  diff 迭代器：
 *   Al  → iterateOverDiff（hunk 级窗口化迭代：context/context-expanded/change）(9779 / 9258)
 *   jl  → resolveCollapsedRange（折叠上下文展开量）(10207 / 9693 附近)
 *   Ml  → hasTrailingContext（末 hunk 后仍有未消费行）(10228)
 *   Nl  → computeChangeRanges（窗口裁剪变更区段）(10235)
 *   Pl  → buildChangeItem（单行变更项装配）(10271)
 *   Fl  → createDiffSpanDecoration（data-diff-span 装饰）(10364)
 *   Il  → appendDiffSegment（word-alt 相邻同类合并）(10374)
 *  渲染器：
 *   Ll  → DEFAULT_WINDOW_OPTIONS {forcePlainText:false} (10387)
 *   Rl  → renderDiff（diff 主渲染：按 hunk 累积→成对高亮→窗口回填）(10388 / 9669)
 *   zl  → computeLineDecorations（行内 char/word-alt diff 装饰）(10515 / 9784)
 *   Bl  → createHunkAccumulator (10555)
 *   Vl  → highlightFilePair（删/增两侧 codeToHast）(10568 / 9863)
 *   Hl  → iterateLines（行窗口迭代）(10600 / 9905)
 *   Ul  → splitLines (10622)
 *   Wl  → DEFAULT_FILE_WINDOW_OPTIONS (10624)
 *   Gl  → renderFile（单文件渲染）(10625 / 9934)
 *   Kl  → joinLineSlice (10672)
 *  消息处理器：
 *   ql/$ → highlighterSingleton / renderOptions 默认值（theme=pierre 双主题、
 *          useTokenTransformer=false、tokenizeMaxLineLength=1000、
 *          lineDiffType='word-alt'、maxLineDiffLength=1000）(10681)
 *   Jl  → handleWorkerMessage（initialize/set-render-options/file/diff 分派）(10691 / 10010)
 *   Yl  → handleInitialize (10710 / 10032)
 *   Xl  → handleSetRenderOptions (10726 / 10052)
 *   Zl  → handleFileRequest (10736 / 10065)
 *   Ql  → handleDiffRequest (10751 / 10084)
 *   $l  → getOrCreateHighlighter（shiki-wasm→oniguruma 引擎，否则 JS 正则引擎）(10761 / 10097)
 *   eu  → applyCustomExtensions（version+map 必须成对）(10771 / 10104)
 *   tu/nu/ru → postFileSuccess / postDiffSuccess / postErrorResponse (10780/10790/10800 / 10113/10123/10133)
 *
 * ----------------------------------------------------------------------------
 * 三、消息协议（与主线程 styles-CdEGpc2x.js 的 DiffsWorkerPool 对应）
 * ----------------------------------------------------------------------------
 *  请求（主线程 → worker）：
 *   {type:'initialize', id, renderOptions, preferredHighlighter,
 *    resolvedThemes, resolvedLanguages, customExtensionsVersion, customExtensionMap}
 *   {type:'set-render-options', id, renderOptions, resolvedThemes}
 *   {type:'file', id, file:{name, lang?, contents}, resolvedLanguages?,
 *    customExtensionsVersion?, customExtensionMap?}
 *   {type:'diff', id, diff:FileDiff, resolvedLanguages?, customExtensionsVersion?, customExtensionMap?}
 *  响应（worker → 主线程）：
 *   {type:'success', requestType:'initialize'|'set-render-options', id, sentAt}
 *   {type:'success', requestType:'file'|'diff', id, result, options, sentAt}
 *   {type:'error', id, error, stack?}
 *  主线程侧：worker 工厂 `q6t`（name='zcode-diffs-worker'）、池大小 `J6t`
 *  （hardwareConcurrency/2 夹取 1–4，缺省 2）、`X6t` DiffsWorkerPoolProvider
 *  （codePreviewSettings.lightTheme/darkTheme → pierre 主题对）、`XRe`
 *  useDiffsWorkerPool —— 均在 styles-CdEGpc2x.js（F14 域，另族重建）。
 * ============================================================================
 */

/* ============================================================================
 * 0. vendor 接口声明（真实实现位于 §一 登记的 vendor 段；此处为重建接口）
 * ==========================================================================*/

/** hast 文本节点（原 ml 产物） */

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/code-viewer/DiffsWorker.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export type {
  FileDiff,
  DiffHunk,
  RenderOptions,
  RenderResult,
  WorkerRequest,
  WorkerResponse,
} from '../components/code-viewer/DiffsWorker';
