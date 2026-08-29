/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ZCode 恢复版 · renderer chunk 解混淆 —— vendor 件（streamdown）
 * ════════════════════════════════════════════════════════════════════════════
 *  原始 chunk   : out/renderer/assets/highlighted-body-OFNGDK62-RS9ZmWFH.js（28 行）
 *  恢复日期     : 2026-08-26
 *  定性         : **vendor —— streamdown@2.5.0**（非 ZCode first-party）
 *  恢复方法     : 逐行对照 node_modules/streamdown/dist 上游源码确认身份
 *
 *  ── 身份证据（逐行对照，把握度：高） ──
 *  1) 文件名直接对应：上游包 dist/ 下即有同名产物
 *       node_modules/streamdown/dist/highlighted-body-OFNGDK62.js
 *     （hash 前缀 `OFNGDK62` 由 streamdown 自己的 rollup 构建决定，
 *      ZCode 的 Vite 构建仅追加了自己的内容哈希 `-RS9ZmWFH`）。
 *  2) 上游源码（全文仅一个组件）：
 *       "use client";
 *       import { A, f, c } from './chunk-BO2N2NFS.js';
 *       import { useContext, useState, useEffect } from 'react';
 *       import { jsx } from 'react/jsx-runtime';
 *       var R = ({ code, language, raw, className, startLine, lineNumbers, ...rest }) => {
 *         let { shikiTheme } = useContext(A), highlighter = f(), [result, setResult] = useState(raw);
 *         return useEffect(() => { ... highlighter.highlight({code,language,themes}, cb) ... },
 *           [code, language, shikiTheme, highlighter, raw]),
 *           jsx(c, { className, language, lineNumbers, result, startLine, ...rest });
 *       };
 *       export { R as HighlightedCodeBlockBody };
 *     与本 chunk 逐语句一致，差异仅为 Vite 互操作包装（`e(t(),1)` 取 React
 *     默认导出、`n()` 取 jsx-runtime 命名空间）与导入别名重命名。
 *  3) 三个依赖导入（./chunk-BO2N2NFS-CSNAeaxF.js 的 i/n/t 导出）与上游
 *     chunk-BO2N2NFS.js 尾部导出表 `R as A, Li as f, At as c` 一一对应：
 *       构建导入  -> 构建内部名 -> 上游内部名 -> 上游语义
 *       i (=r)    -> Xb        -> R          -> StreamdownOptionsContext
 *                                              （createContext({shikiTheme, controls,
 *                                               isAnimating, lineNumbers, mode,
 *                                               mermaid, linkSafety})，上游 jsx 17235 行）
 *       n (=i)    -> ry        -> Li         -> useCodeHighlighter
 *                                              （`() => useContext(Ve)?.code ?? null`，
 *                                               Ve=createContext(null) 即代码高亮器上下文）
 *       t (=a)    -> kv        -> At         -> CodeBlockBody
 *                                              （memo 组件，渲染 shiki tokens，
 *                                               data-streamdown="code-block-body"）
 *  4) 懒加载方：上游同 chunk 的 `Fv = lazy(() => import('./highlighted-body-….js')
 *     .then(e => ({ default: e.HighlightedCodeBlockBody })))`（构建 jsx 15520 行附近），
 *     即代码块正文的按需分包——解释本 chunk 为何独立成文件。
 *
 *  行为等价声明：恢复版与原始 chunk 运行时行为等价——组件签名、
 *  useEffect 依赖数组 [code, language, shikiTheme, highlighter, raw]、
 *  「无高亮器时回退 raw」「highlight 同步返回值与回调双通道更新」逻辑逐字保留。
 *  唯一文本级差异：`useEffect(...), jsx(...)` 逗号表达式展开为两条语句
 *  （上游源码本身即此形状的压缩写法，observable 行为一致）。
 * ════════════════════════════════════════════════════════════════════════════
 */
'use client';


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/code-viewer/highlightedCodeBlockBody.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  HighlightedCodeBlockBody,
} from '../components/code-viewer/highlightedCodeBlockBody';
export type {
  HighlightedCodeBlockBodyProps,
} from '../components/code-viewer/highlightedCodeBlockBody';
