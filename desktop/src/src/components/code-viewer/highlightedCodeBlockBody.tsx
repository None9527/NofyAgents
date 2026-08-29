// A0-S4-4c: 自 modules/highlightedCodeBlockBody.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/code-viewer/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
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

import { useContext, useState, useEffect } from 'react';
// chunk-BO2N2NFS-CSNAeaxF.js = first-party markdown/streamdown 渲染 mega-chunk
// （VENDOR-MANIFEST-LIBS.md 定性；三个符号的重建落点如下）。
// 重建模块 MarkdownContext.tsx 中该上下文名为 StreamdownContext（原上游名
// StreamdownOptionsContext），此处以 `as` 保留本文件既有局部名。
import { StreamdownContext as StreamdownOptionsContext, useCodeHighlighter } from '../../modules/MarkdownContext'; // 原 chunk-BO2N2NFS i (Xb), n (ry)
import { CodeBlockBody } from '../../modules/MarkdownCodeBlock'; // 原 chunk-BO2N2NFS t (kv)

/* ─────────────────────────── 类型声明（推断） ─────────────────────────── */

/**
 * shiki 主题规格。
 * // TODO(infer): streamdown 允许主题名/对象/双主题（light/dark），
 * // 此处按上下文默认值（上游 `Jb` 常量）宽松建模。
 */
type ShikiTheme = unknown;

/** shiki 高亮结果（tokens/bg/fg/rootStyle），由 CodeBlockBody 消费。 */
interface HighlightResult {
  bg?: string;
  fg?: string;
  rootStyle?: string | Record<string, string>;
  tokens: Array<Array<{ content: string; color?: string; bgColor?: string; htmlStyle?: Record<string, string>; htmlAttrs?: Record<string, string>; offset?: number }>>;
}

/**
 * 代码高亮器（由 streamdown 顶层组件经 CodeHighlighterContext 提供）。
 * `highlight(args, onUpdate)` 返回同步结果或 undefined（异步经回调更新）。
 * // TODO(infer): 完整签名以上游 @streamdown/code 的 createHighlighter 为准。
 */
interface CodeHighlighter {
  highlight: (
    args: { code: string; language: string; themes: ShikiTheme },
    onUpdate: (result: HighlightResult) => void,
  ) => HighlightResult | undefined | Promise<unknown>;
}

/** StreamdownOptionsContext 的值形状（上游默认值逐字列出）。 */
interface StreamdownOptions {
  shikiTheme: ShikiTheme;
  controls: boolean;
  isAnimating: boolean;
  lineNumbers: boolean;
  mode: 'streaming' | 'static';
  mermaid: unknown;
  linkSafety: unknown;
}

/** 本组件 props（与上游 R 组件解构一致）。 */
export interface HighlightedCodeBlockBodyProps {
  /** 原始代码文本（高亮输入）。 */
  code: string;
  /** 语言 id（shiki bundledLanguages 或别名）。 */
  language: string;
  /** 兜底结果：无高亮器/高亮未完成时直接渲染它。 */
  raw: HighlightResult;
  className?: string;
  /** 起始行号（>1 时用 CSS counter-reset 偏移）。 */
  startLine?: number;
  /** 是否显示行号。 */
  lineNumbers?: boolean;
  [prop: string]: unknown;
}

/* ─────────────────────────── HighlightedCodeBlockBody ─────────────────────────── */

/**
 * 代码块「正文」懒加载组件：把 `code` 交给 shiki 高亮器异步着色，
 * 完成后经 CodeBlockBody 渲染 token 序列；无高亮器时直接渲染 `raw`
 * （纯文本降级结果）。上游导出名即 `HighlightedCodeBlockBody`（未混淆）。
 */
const HighlightedCodeBlockBody = ({
  code,
  language,
  raw,
  className,
  startLine,
  lineNumbers,
  ...rest
}: HighlightedCodeBlockBodyProps) => {
  const { shikiTheme } = useContext(StreamdownOptionsContext as unknown as React.Context<StreamdownOptions>);
  const highlighter = (useCodeHighlighter as () => CodeHighlighter | null)();
  const [result, setResult] = useState<HighlightResult>(raw);

  useEffect(() => {
    if (!highlighter) {
      setResult(raw);
      return;
    }
    const sync = highlighter.highlight({ code, language, themes: shikiTheme }, (updated) => {
      setResult(updated);
    });
    if (sync) setResult(sync as HighlightResult);
  }, [code, language, shikiTheme, highlighter, raw]);

  // 局部名原为 `jsx`（与 jsx-runtime 同名导致 JSX 解析歧义），改名不改行为。
  const CodeBlockBodyView = (CodeBlockBody as unknown as React.ComponentType<{
    className?: string;
    language: string;
    lineNumbers?: boolean;
    result: HighlightResult;
    startLine?: number;
    [prop: string]: unknown;
  }>);
  return (
    <CodeBlockBodyView
      className={className}
      language={language}
      lineNumbers={lineNumbers}
      result={result}
      startLine={startLine}
      {...rest}
    />
  );
};

export { HighlightedCodeBlockBody };

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: exportName -> 原名(minified) -> 语义名（=上游名）
 * ════════════════════════════════════════════════════════════════════════
 * 导出符号（1 个）：
 *   HighlightedCodeBlockBody -> c -> HighlightedCodeBlockBody
 *     （原 chunk 导出即 `export { c as HighlightedCodeBlockBody }`，未混淆）
 * 模块内局部符号（2 个，互操作包装）：
 *   - -> o -> ReactInterop        （`e(t(), 1)`，取 react 默认导出）
 *   - -> s -> jsxRuntime          （`n()`，取 jsx-runtime 命名空间）
 * 导入符号（3 个，来自 ./chunk-BO2N2NFS-CSNAeaxF.js，
 *           格式：构建导出别名 -> 构建内部名 -> 上游内部名 -> 上游语义名）：
 *   i -> Xb -> R  -> StreamdownOptionsContext   （shikiTheme 等全局选项上下文）
 *   n -> ry -> Li -> useCodeHighlighter         （取上下文中的 .code 高亮器）
 *   t -> kv -> At -> CodeBlockBody              （shiki token 渲染 memo 组件）
 *
 * 上游登记：streamdown@2.5.0（vercel/streamdown，Apache-2.0）
 *   dist/highlighted-body-OFNGDK62.js  +  dist/chunk-BO2N2NFS.js
 * ════════════════════════════════════════════════════════════════════════ */
