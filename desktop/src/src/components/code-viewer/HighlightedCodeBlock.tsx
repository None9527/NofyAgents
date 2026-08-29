// A0-S4-4c: 自 modules/HighlightedCodeBlock.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/code-viewer/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
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
 *   Sv  → cn                        clsx+twMerge 类名合并（= utils cn 语义）(18472 / 15427)
 *   Ev  → ClassNamesContext         createContext(Sv)（可注入自定义合并器）(18615 附近 / 15443)
 *   Q   → useClassNames             () => useContext(Ev) (18616 附近 / 15444)
 *   Dv  → LINE_NUMBER_CLASS         行号 CSS counter 类（before:content-[counter(line)]…）(jsx 15445)
 *   Ov  → parseInlineStyle          "k:v;k2:v2" → 对象 (jsx 15446)
 *   kv  → CodeBlockBody             memo 组件：shiki tokens → hast 风格 span 树 (18522–18614 / 15458–15482)
 *   Av  → CodeBlockShell            代码块外壳（圆角卡片 + content-visibility）(18615 / 15483)
 *   jv  → CodeBlockCodeContext      createContext({code:''})——供子组件取原始代码 (18627 / 15494)
 *   Mv  → useCodeBlockCode          () => useContext(jv) (18628 / 15497)
 *   Nv  → CodeBlockHeader           语言标签头（data-streamdown=code-block-header）(18629 / 15498)
 *   Pv  → trimTrailingNewlines      去尾部换行 (18638 / 15504)
 *   Fv  → LazyHighlightedCodeBlockBody  lazy(() => import('./highlighted-body-…')) (18650 / 15510)
 *   Iv  → HighlightedCodeBlock      代码块主组件（外壳+头+动作槽+Suspense 正文）(18660 / 15513)
 *   ty  → CodeHighlighterContext    createContext(null)（顶层注入高亮器）(19610 / 16111)
 *   ny  → useCodeHighlighterContext () => useContext(ty) (19611 / 16112)
 *   ry  → useCodeHighlighter        () => useContext(ty)?.code ?? null (19612 / 16113)
 *   Xb  → StreamdownOptionsContext  {shikiTheme, controls, isAnimating, lineNumbers,
 *                                    mode, mermaid, linkSafety} (21176 / 17235)
 *
 *  目标 chunk（highlighted-body-OFNGDK62-RS9ZmWFH.js，25 行）内：
 *   c   → HighlightedCodeBlockBody  懒加载正文组件（导出名未混淆）(1–25 / 1–43)
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

import * as React from "react";
import { ClassNamesContext, StreamdownContext as StreamdownOptionsContext, StreamdownPluginsContext as CodeHighlighterContext } from '../../modules/MarkdownContext'; // 原 Xb / ty

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于宿主 chunk；此处为重建接口）
 * ==========================================================================*/

/** 类名合并（原 Sv = (…e) => twMerge(clsx(e))；宿主 chunk 经 ClassNamesContext 可替换） */
declare type ClassNamesMerger = (...inputs: Array<unknown>) => string;

/** shiki 主题规格：主题名 | 主题对象 | {light, dark} 双主题（原 Jb 默认值，宽松建模） */
type ShikiTheme = unknown;

/** shiki 高亮 token（原 CodeBlockBody 消费面） */
interface HighlightToken {
  content: string;
  color?: string;
  bgColor?: string;
  fontStyle?: number;
  htmlStyle?: Record<string, string>;
  htmlAttrs?: Record<string, string>;
  offset?: number;
  /** 行内字符偏移（useTokenTransformer 注入，本族不消费） */
  __lineChar?: number;
}

/** shiki 高亮结果（tokens 为按行分组的 token 数组） */
export interface HighlightResult {
  bg?: string;
  fg?: string;
  rootStyle?: string | Record<string, string>;
  tokens: Array<HighlightToken[]>;
}

/** 代码高亮器（顶层经 CodeHighlighterContext 注入；原 ry 消费面） */
export interface CodeHighlighter {
  highlight: (
    args: { code: string; language: string; themes: ShikiTheme },
    onUpdate: (result: HighlightResult) => void,
  ) => HighlightResult | undefined | Promise<unknown>;
}

/** StreamdownOptionsContext 值形状（原 Xb 默认值逐字列出） */
export interface StreamdownOptions {
  shikiTheme: ShikiTheme;
  controls: boolean;
  isAnimating: boolean;
  lineNumbers: boolean;
  mode: "streaming" | "static";
  mermaid: unknown;
  linkSafety: unknown;
}

/* --- 宿主 chunk 上下文（重建；运行时从宿主 chunk 取得） --- */

/** 原 Xb：全局选项上下文（默认 shikiTheme=Jb、controls、lineNumbers=true、mode=streaming） */

/** 原 ty：代码高亮器上下文（默认 null；顶层 Streamdown 组件注入 {code, mermaid}） */
interface CodeHighlighterContextValue {
  code?: CodeHighlighter | null;
  mermaid?: unknown;
}

/** 原 ry（js 19612）：取高亮器实例 */
function useCodeHighlighter(): CodeHighlighter | null {
  return React.useContext(CodeHighlighterContext)?.code ?? null;
}

/** 原 Ev/Q：类名合并器上下文（默认 = clsx+twMerge） */
function useClassNames(): ClassNamesMerger {
  return React.useContext(ClassNamesContext) as ClassNamesMerger;
}

/* ============================================================================
 * 1. 行号类与样式解析（原 Dv/Ov，宿主 chunk jsx 15445–15457）
 * ==========================================================================*/

/** 原 Dv：行号伪元素类——CSS counter 逐行打印行号（`[counter-increment:line_0]`
 *  在 <code> 上，行 span 用 before:content-[counter(line)] 显示）。 */
const LINE_NUMBER_CLASS = [
  "block",
  "before:content-[counter(line)]",
  "before:inline-block",
  "before:[counter-increment:line]",
  "before:w-6",
  "before:mr-4",
  "before:text-[13px]",
  "before:text-right",
  "before:text-muted-foreground/50",
  "before:font-mono",
  "before:select-none",
].join(" ");

/** 原 Ov：把 shiki rootStyle 内联样式串解析为对象（"k: v; k2: v2"）。 */
function parseInlineStyle(style: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const declaration of style.split(";")) {
    const colonIndex = declaration.indexOf(":");
    if (colonIndex > 0) {
      const key = declaration.slice(0, colonIndex).trim();
      const value = declaration.slice(colonIndex + 1).trim();
      if (key && value) result[key] = value;
    }
  }
  return result;
}

/* ============================================================================
 * 2. CodeBlockBody（原 kv，宿主 chunk js 18522–18614 / jsx 15458–15482）
 * ----------------------------------------------------------------------------
 * memo 组件：把 shiki 结果渲染为 div>pre>code>行span>token span 树。
 *  - 颜色走 CSS 变量：--sdm-c（token 色）、--sdm-tbg（token 背景）、
 *    --sdm-bg/--sdm-fg（根部），dark 变体经 --shiki-dark/--shiki-dark-bg；
 *  - htmlStyle 的 color/background-color 键并入变量（背景键置位才挂 bg 类）；
 *  - 空行渲染 "\n" 保持行高；
 *  - 行号：lineNumbers 时行 span 挂 LINE_NUMBER_CLASS，startLine>1 用
 *    counter-reset 偏移；
 *  - memo 比较：result/language/className/startLine/lineNumbers 五字段。
 * ==========================================================================*/

export interface CodeBlockBodyProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  result: HighlightResult;
  language: string;
  className?: string;
  startLine?: number;
  lineNumbers?: boolean;
  children?: React.ReactNode;
}

export const CodeBlockBody = React.memo(
  ({ children, result, language, className, startLine, lineNumbers = true, ...rest }: CodeBlockBodyProps) => {
    const mergeClassNames = useClassNames();
    const lineNumberClass = React.useMemo(() => mergeClassNames(LINE_NUMBER_CLASS), [mergeClassNames]);
    const rootStyleVars = React.useMemo(() => {
      const style: Record<string, string> = {};
      if (result.bg) style["--sdm-bg"] = result.bg;
      if (result.fg) style["--sdm-fg"] = result.fg;
      if (result.rootStyle) Object.assign(style, typeof result.rootStyle === "string" ? parseInlineStyle(result.rootStyle) : result.rootStyle);
      return style;
    }, [result.bg, result.fg, result.rootStyle]);

    return (
      <div
        className={mergeClassNames(className, "overflow-x-auto rounded-md border border-border bg-background p-4 text-sm")}
        data-language={language}
        data-streamdown="code-block-body"
        {...rest}
      >
        <pre
          className={mergeClassNames(className, "bg-[var(--sdm-bg,inherit]", "dark:bg-[var(--shiki-dark-bg,var(--sdm-bg,inherit)]")}
          style={rootStyleVars}
        >
          <code
            className={lineNumbers ? mergeClassNames("[counter-increment:line_0] [counter-reset:line]") : undefined}
            style={lineNumbers && startLine && startLine > 1 ? { counterReset: `line ${startLine - 1}` } : undefined}
          >
            {result.tokens.map((lineTokens, lineIndex) => (
              <span key={lineIndex} className={lineNumbers ? lineNumberClass : undefined}>
                {lineTokens.length === 0 || (lineTokens.length === 1 && lineTokens[0].content === "")
                  ? "\n"
                  : lineTokens.map((token, tokenIndex) => {
                      const tokenStyle: Record<string, string> = {};
                      let hasBackground = !!token.bgColor;
                      if (token.color) tokenStyle["--sdm-c"] = token.color;
                      if (token.bgColor) tokenStyle["--sdm-tbg"] = token.bgColor;
                      if (token.htmlStyle)
                        for (const [key, value] of Object.entries(token.htmlStyle))
                          if (key === "color") tokenStyle["--sdm-c"] = value;
                          else if (key === "background-color") {
                            tokenStyle["--sdm-tbg"] = value;
                            hasBackground = true;
                          } else tokenStyle[key] = value;
                      return (
                        <span
                          key={tokenIndex}
                          className={mergeClassNames(
                            "text-[var(--sdm-c,inherit)]",
                            "dark:text-[var(--shiki-dark,var(--sdm-c,inherit))]",
                            hasBackground && "bg-[var(--sdm-tbg)]",
                            hasBackground && "dark:bg-[var(--shiki-dark-bg,var(--sdm-tbg))]",
                          )}
                          style={tokenStyle}
                          {...token.htmlAttrs}
                        >
                          {token.content}
                        </span>
                      );
                    })}
              </span>
            ))}
          </code>
        </pre>
      </div>
    );
  },
  (prev, next) =>
    prev.result === next.result &&
    prev.language === next.language &&
    prev.className === next.className &&
    prev.startLine === next.startLine &&
    prev.lineNumbers === next.lineNumbers,
);

/* ============================================================================
 * 3. 外壳族（原 Av/jv/Mv/Nv/Pv，宿主 chunk js 18615–18649 / jsx 15483–15512）
 * ==========================================================================*/

/** 原 Av：代码块外壳卡片——圆角边框 + content-visibility:auto 渲染节流。 */
export function CodeBlockShell({
  className,
  language,
  style,
  isIncomplete,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { language?: string; isIncomplete?: boolean }) {
  const mergeClassNames = useClassNames();
  return (
    <div
      className={mergeClassNames("my-4 flex w-full flex-col gap-2 rounded-xl border border-border bg-sidebar p-2", className)}
      data-incomplete={isIncomplete || undefined}
      data-language={language}
      data-streamdown="code-block"
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 200px", ...style }}
      {...rest}
    />
  );
}

/** 原 jv：代码原文上下文（动作按钮如「复制」经此取 code）。 */
const CodeBlockCodeContext = React.createContext<{ code: string }>({ code: "" });

/** 原 Mv */
export function useCodeBlockCode(): { code: string } {
  return React.useContext(CodeBlockCodeContext);
}

/** 原 Nv：语言标签头（左对齐 mono 小字）。 */
function CodeBlockHeader({ language }: { language: string }) {
  const mergeClassNames = useClassNames();
  return (
    <div className={mergeClassNames("flex h-8 items-center text-muted-foreground text-xs")} data-language={language} data-streamdown="code-block-header">
      <span className={mergeClassNames("ml-1 font-mono lowercase")}>{language}</span>
    </div>
  );
}

/** 原 Pv：去尾部换行（高亮输入先裁剪）。 */
function trimTrailingNewlines(code: string): string {
  let length = code.length;
  while (length > 0 && code[length - 1] === "\n") length--;
  return code.slice(0, length);
}

/* ============================================================================
 * 4. HighlightedCodeBlockBody（目标 chunk 全量重建，原 c，js 1–25 / jsx 1–43）
 * ----------------------------------------------------------------------------
 * 懒加载正文：把 code 交给高亮器异步着色——
 *  - 无高亮器：直接渲染 raw（纯文本降级结果）；
 *  - 有高亮器：highlight({code, language, themes}) 的同步返回值与回调双通道更新；
 *  - useEffect 依赖数组 [code, language, shikiTheme, highlighter, raw] 逐字保留。
 * 行为等价声明：与 highlightedCodeBlockBody.tsx（B1 阶段单体重建）一致。
 * ==========================================================================*/

export interface HighlightedCodeBlockBodyProps {
  /** 原始代码文本（高亮输入，已去尾部换行）。 */
  code: string;
  /** 语言 id（shiki bundledLanguages 或别名）。 */
  language: string;
  /** 兜底结果：无高亮器/高亮未完成时直接渲染。 */
  raw: HighlightResult;
  className?: string;
  /** 起始行号（>1 时用 CSS counter-reset 偏移）。 */
  startLine?: number;
  /** 是否显示行号。 */
  lineNumbers?: boolean;
  [prop: string]: unknown;
}

export const HighlightedCodeBlockBody = ({
  code,
  language,
  raw,
  className,
  startLine,
  lineNumbers,
  ...rest
}: HighlightedCodeBlockBodyProps) => {
  const { shikiTheme } = React.useContext(StreamdownOptionsContext);
  const highlighter = useCodeHighlighter();
  const [result, setResult] = React.useState<HighlightResult>(raw);

  React.useEffect(() => {
    if (!highlighter) {
      setResult(raw);
      return;
    }
    const sync = highlighter.highlight({ code, language, themes: shikiTheme }, (updated) => {
      setResult(updated);
    });
    if (sync) setResult(sync as HighlightResult);
  }, [code, language, shikiTheme, highlighter, raw]);

  return <CodeBlockBody className={className} language={language} lineNumbers={lineNumbers} result={result} startLine={startLine} {...rest} />;
};

/* ============================================================================
 * 5. HighlightedCodeBlock（原 Iv，宿主 chunk js 18660 / jsx 15513–15547）
 * ----------------------------------------------------------------------------
 * 代码块主组件（=上游 st，导出别名 g）：
 *  - CodeBlockCodeContext.Provider 暴露原始 code（供复制等动作）；
 *  - CodeBlockShell（外壳）> CodeBlockHeader（语言头）> 动作槽（children，
 *    sticky 悬浮在代码区右上角，毛玻璃背景）> Suspense 正文；
 *  - Suspense fallback = 纯文本降级结果（raw：逐行单 token、inherit 色）——
 *    懒加载的 HighlightedCodeBlockBody 就绪后替换；
 *  - 原始代码先经 trimTrailingNewlines 裁剪（useMemo）。
 * ==========================================================================*/

export interface HighlightedCodeBlockProps {
  code: string;
  language: string;
  className?: string;
  /** 动作槽（复制/下载等按钮；渲染为右上角悬浮条）。 */
  children?: React.ReactNode;
  /** 流式未结束标记（外壳 data-incomplete）。 */
  isIncomplete?: boolean;
  startLine?: number;
  lineNumbers?: boolean;
  [prop: string]: unknown;
}

/** 原 Fv：正文懒加载（原实现为宿主 chunk 内
 *  `lazy(() => import('./highlighted-body-OFNGDK62-RS9ZmWFH.js')
 *     .then(e => ({ default: e.HighlightedCodeBlockBody })))`，
 *  经 __vite__mapDeps[0..3] 预载共享依赖。重建版直接引用同模块组件，
 *  懒加载语义由构建层保留（见报告 §2）。 */
const LazyHighlightedCodeBlockBody = React.lazy(async () => ({ default: HighlightedCodeBlockBody }));

export function HighlightedCodeBlock({
  code,
  language,
  className,
  children,
  isIncomplete = false,
  startLine,
  lineNumbers,
  ...rest
}: HighlightedCodeBlockProps) {
  const mergeClassNames = useClassNames();
  const trimmedCode = React.useMemo(() => trimTrailingNewlines(code), [code]);
  // 纯文本降级结果：逐行一个 inherit 色 token（Suspense fallback 与无高亮器兜底共用）
  const rawResult = React.useMemo<HighlightResult>(
    () => ({
      bg: "transparent",
      fg: "inherit",
      tokens: trimmedCode
        .split("\n")
        .map((line) => [{ content: line, color: "inherit", bgColor: "transparent", htmlStyle: {}, offset: 0 }]),
    }),
    [trimmedCode],
  );

  return (
    <CodeBlockCodeContext.Provider value={{ code }}>
      <CodeBlockShell isIncomplete={isIncomplete} language={language}>
        <CodeBlockHeader language={language} />
        {children ? (
          <div className={mergeClassNames("pointer-events-none sticky top-2 z-10 -mt-10 flex h-8 items-center justify-end")}>
            <div
              className={mergeClassNames(
                "pointer-events-auto flex shrink-0 items-center gap-2 rounded-md border border-sidebar bg-sidebar/80 px-1.5 py-1 supports-[backdrop-filter]:bg-sidebar/70 supports-[backdrop-filter]:backdrop-blur",
              )}
              data-streamdown="code-block-actions"
            >
              {children}
            </div>
          </div>
        ) : null}
        <React.Suspense
          fallback={<CodeBlockBody className={className} language={language} lineNumbers={lineNumbers} result={rawResult} startLine={startLine} {...rest} />}
        >
          <LazyHighlightedCodeBlockBody className={className} code={trimmedCode} language={language} lineNumbers={lineNumbers} raw={rawResult} startLine={startLine} {...rest} />
        </React.Suspense>
      </CodeBlockShell>
    </CodeBlockCodeContext.Provider>
  );
}

/* ============================================================================
 * SYMBOLS: exportName -> 原名(minified) -> 语义名（=上游名）
 * ============================================================================
 * 目标 chunk 导出（1 个）：
 *   HighlightedCodeBlockBody -> c -> HighlightedCodeBlockBody（未混淆）
 * 宿主 chunk 代码块段（本文件重建 10 个 + 登记 4 个上下文/助手）：
 *   CodeBlockBody -> kv -> CodeBlockBody（上游 At）
 *   CodeBlockShell -> Av -> CodeBlockShell（上游 ot）
 *   CodeBlockHeader -> Nv -> CodeBlockHeader（上游 rt）
 *   HighlightedCodeBlock -> Iv -> HighlightedCodeBlock（上游 st）
 *   trimTrailingNewlines -> Pv -> trimTrailingNewlines（上游 lr）
 *   LazyHighlightedCodeBlockBody -> Fv -> lazy(cr)（上游 cr）
 *   useCodeBlockCode -> Mv -> useCodeBlockCode（上游 He）
 *   CodeBlockCodeContext -> jv -> （上游 nt）
 *   parseInlineStyle -> Ov -> parseInlineStyle（上游内联助手）
 *   LINE_NUMBER_CLASS -> Dv -> （上游常量）
 *   登记（跨族，未在本文件展开）：
 *   cn -> Sv（上游 cn）| ClassNamesContext -> Ev | useClassNames -> Q（上游 y）
 *   StreamdownOptionsContext -> Xb（上游 R）| CodeHighlighterContext -> ty（上游 Ve）
 *   useCodeHighlighter -> ry（上游 Li）
 * ============================================================================ */
