/* eslint-disable */
/**
 * ============================================================================
 * MarkdownAnimate.tsx — ZCode 3.7.6 markdown 渲染层 · 流式动画插件子模块
 * （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（21,756 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js
 * 对照 jsx：src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx
 * 定性：streamdown@2.5.0 first-party 层 —— `animated` prop 的增量渲染动画
 *      （上游导出 createAnimatePlugin = a）。
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名（js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *   lv → WHITESPACE_REGEX /\s/ (18380)
 *   uv → ONLY_WHITESPACE_REGEX /^\s+$/ (18381)
 *   dv → ANIMATE_SKIP_TAGS {code,pre,svg,math,annotation} (18382)
 *   fv → isHastElement (18383)
 *   pv → containsSkipTag (18384)
 *   mv → splitByWhitespace    按空白切词（保留空白段）(18385)
 *   hv → splitByCharacter     逐字符切（保留空白段）(18398)
 *   gv → buildAnimatedSpan    造 <span data-sd-animate style=--sd-*> (18408)
 *   _v → animateTextChildren  把文本子节点替换成动画 span（旧内容不重播）(18422)
 *   vv → animatePluginCounter 插件实例计数（唯一化插件名）(18436)
 *   yv → createAnimatePlugin  工厂：返回 {name:'animate', type:'animate',
 *                             rehypePlugin, setPrevContentLength,
 *                             getLastRenderCharCount}（上游导出 a）(18437)
 *
 * 机制：rehype 插件遍历（visitParents）文本节点，按 word/char 切成
 * `<span data-sd-animate style="--sd-animation:sd-<anim>;--sd-duration:<ms>;
 * --sd-easing:<ease>[;--sd-delay:<ms>]">`；已渲染过的字符数
 * （prevContentLength）内的片段 delay=0 不重播。streamdown 的 styles.css
 * 提供 sd-fadeIn 等关键帧。
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/markdown/MarkdownAnimate.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  createAnimatePlugin,
} from '../components/markdown/MarkdownAnimate';
export type {
  AnimateHastNode,
  AnimatePluginOptions,
  AnimatePlugin,
} from '../components/markdown/MarkdownAnimate';
