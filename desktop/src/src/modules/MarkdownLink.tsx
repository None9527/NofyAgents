/* eslint-disable */
/**
 * ============================================================================
 * MarkdownLink.tsx — ZCode 3.7.6 markdown 渲染层 · 链接渲染 + 链接安全子模块
 * （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（21,756 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js
 * 对照 jsx：src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx
 * 定性：streamdown@2.5.0 first-party 层 —— 链接元素渲染与安全确认弹层。
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名（js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *   ey → LinkSafetyModal   外链确认弹层（复制链接/打开；Escape/点击背景关闭）
 *                          (19488 / 16064)
 *   My → MarkdownA         <a> 元素组件（memo；linkSafety 开启时改渲染为
 *                          <button> + 确认流；上游 displayName=MarkdownA）
 *                          (20374 / 16583)
 *
 * 行为要点：
 *  - `streamdown:incomplete-link` 是流式占位 href（链接目标还没打完），
 *    打 data-incomplete 标记，安全确认流对其跳过；
 *  - linkSafety.enabled 且 onLinkCheck 返回 true → 直接开窗；
 *    否则弹确认层（可用 linkSafety.renderModal 替换内置弹层）；
 *  - 未开启安全时：普通 <a target=_blank rel=noreferrer>。
 *
 * 外部依赖：MarkdownContext.tsx（StreamdownContext/图标/文案/滚动锁）
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/markdown/MarkdownLink.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  LinkSafetyModal,
  MarkdownA,
} from '../components/markdown/MarkdownLink';
export type {
  HastNodeLike,
  HastNodePosition,
  MarkdownAProps,
} from '../components/markdown/MarkdownLink';
