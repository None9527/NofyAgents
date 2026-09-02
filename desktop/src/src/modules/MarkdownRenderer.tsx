/* eslint-disable */
/**
 * ============================================================================
 * MarkdownRenderer.tsx — ZCode 3.7.6 markdown 渲染层 · 渲染器主体子模块
 * （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（21,756 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js
 * 对照 jsx：src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx
 * 定性：streamdown@2.5.0 first-party 层 —— Streamdown 主组件（上游导出 C）
 *      + Block + 块级切分 + unified 处理器缓存 + 默认插件表。
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名（js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  块切分：
 *   nb → CODE_FENCE_REGEX /^[ \t]{0,3}(`{3,}|~{3,})/ (20822)
 *   rb → TABLE_DIVIDER_REGEX (30756)
 *   ib → isCodeFenceIncomplete  栅栏未闭合判定（上游导出 b 的等价内联版）(30763)
 *   ab → hasIncompleteTableDivider 分隔行未打完判定 (30812)
 *   ob → htmlToTextPlugin       html 节点 → 文本（无 rehype-raw 时防崩溃）(30822)
 *   jb → parseMarkdownIntoBlocks marked.lex 块切分 + 未闭合 HTML/数学合并
 *                                （上游导出 w）(21039)
 *   Mb → preserveHtmlBlocks     块内空行插 <!----> 防拆段 (21101)
 *   Nb/Pb → 转义正则/函数 (21119)
 *   Fb → escapeLiteralTagContent 字面标签内容转义 (31948)
 *   Ib → getTextContent (21132)
 *   Lb → literalTagContentPlugin (31981)
 *   Rb → codeMetaPlugin         code.meta → hProperties.metastring (31984)
 *   zb/Bb/Vb → normalizeHtmlIndentation（上游导出 x）(21154)
 *  处理器：
 *   sb → EMPTY_PLUGINS [] (20862)
 *   cb → DEFAULT_REMARK_REHYPE_OPTIONS {allowDangerousHtml:true} (20863)
 *   lb → pluginNamesCache WeakMap (20864)
 *   ub → ProcessorCache（LRU 100，按插件名+选项序列化键）(20865)
 *   db → MarkdownProcessor      parse→runSync→toJsxRuntime 一步渲染 (20929)
 *   fb → getProcessor (20935)
 *   pb → hasRehypeRaw (31035)
 *   mb → createProcessor        unified().use(parse).use(remark*).use(rehype,opts).use(rehype*) (20942)
 *   hb/gb/_b/vb/yb → identity / removeRawNode / transformElementUrls /
 *                    shouldSkipElement / renderHast (20949-21000)
 *  默认插件表：
 *   Hb → STREAMDOWN_SANITIZE_SCHEMA（defaultSchema + tel 协议 + code[metastring]）(21146)
 *   Ub → DEFAULT_REHYPE_PLUGINS {raw, sanitize:[…], harden:[…]}（上游导出 y；
 *        构建导出别名 o，被 styles-CdEGpc2x.js 消费）(21156)
 *   Wb → DEFAULT_REMARK_PLUGINS {gfm:[…], codeMeta}（上游导出 z）(21170)
 *   Gb/Kb → Object.values 数组（默认 props 值）(21171)
 *  组件：
 *   Zb → Block                  单块渲染（memo；dir 包裹；IsStreaming 注入）
 *                               （上游导出 Block=B）(21185)
 *   Qb → Streamdown             主组件（上游导出 Streamdown=C；构建导出别名 r，
 *                               被 styles-CdEGpc2x.js 的 cj MarkdownRenderer
 *                               消费 —— ZCode 会话消息流的 markdown 渲染入口）
 *                               (21228)
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/markdown/MarkdownRenderer.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  isCodeFenceIncomplete,
  hasIncompleteTableDivider,
  parseMarkdownIntoBlocks,
  DEFAULT_REHYPE_PLUGINS,
  DEFAULT_REMARK_PLUGINS,
  Block,
  Streamdown,
} from '../components/markdown/MarkdownRenderer';
export type {
  MarkdownProcessorOptions,
  BlockProps,
  StreamdownProps,
} from '../components/markdown/MarkdownRenderer';
