/* eslint-disable */
/**
 * ============================================================================
 * MarkdownVendored.tsx — ZCode 3.7.6 markdown 渲染层 · vendor 段接口登记
 * （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 本文件不含重建实现：它把 chunk-BO2N2NFS-CSNAeaxF.js 内 **vendored 第三方
 * 管线** 中被自研层（Markdown*.tsx）直接调用的符号登记为类型接口，作用等同
 * TopBar.tsx 头部的「外部依赖声明」。行号 = 融合 chunk js 行 / jsx 行。
 *
 * ── 定性结论（详见 Markdown.report.md §2 vendor 段登记表）─────────────────
 * 整个 chunk = streamdown@2.5.0（vercel/streamdown）dist/chunk-BO2N2NFS.js 的
 * Vite 重打包；其中 js 18–18291 行（84%）为 streamdown 自身依赖树的
 * vendored 段（property-information / hast-util-* / mdast-util-* / micromark /
 * unified / vfile / remark-* / rehype-* / remend / marked / parse5 …），
 * js 18292–21756（16%）为 streamdown first-party 组件层（= 本族重建对象）。
 *
 * ⚠ 任务勘误：本 chunk **不含** Lexical 0.42.0 / @stripe/stripe-js 9.6.0 /
 *   shiki 本体（证据与出处见 Markdown.report.md §0）。
 *
 * ----------------------------------------------------------------------------
 * 登记的 vendor 符号（混淆名 → 上游库 → 版本 → chunk 行号）
 * ----------------------------------------------------------------------------
 *   Xe → unist-util-visit `visit`            5.1.0   (js 1316 / jsx 1230)
 *   Je → unist-util-visit-parents `visitParents` 6.0.2 (js 1275 / jsx 1192)
 *   qe → unist-util-visit `SKIP`             5.1.0   (js 1274 / jsx 1191)
 *   Op → remend `parseIncompleteMarkdown`    1.3.0   (js 13285 / jsx 10721)
 *   $_ → marked `Lexer`（$.lex 静态）        17.x    (js 17333 / jsx 13923+)
 *   bg → unified `unified()` 处理器工厂      11.0.5  (js 16029 / jsx 13440)
 *   nh → remark-parse 插件                   11.0.0  (js 15006 / jsx 12373)
 *   Jd → remark-gfm 插件                     4.0.1   (js 12538 / jsx 10063)
 *   qh → remark-rehype 插件                  11.1.2  (js 15598 / jsx 13087)
 *   jo → rehype-raw 插件                     7.0.0   (js 8230 / jsx 6643)
 *   Xo → rehype-sanitize 插件                6.0.0   (js 8460 / jsx 6883)
 *   ft → rehype-harden 插件                  1.1.8   (js 1487 / jsx 1414)
 *   No → hast-util-sanitize `defaultSchema`  6.x     (js 8236 / jsx 6652)
 *   Yp → hast-util-to-jsx-runtime `toJsxRuntime` 2.3.6 (js 13560 / jsx 10953)
 *   s/c → tailwind-merge `twMerge` / clsx    3.5.0/2.1.1（独立 chunk
 *        bundle-mjs-D8tLE0rB.js，MarkdownContext 的 streamdownCn 登记）
 * ============================================================================
 */

/* ============================================================================
 * 1. unist 遍历（unist-util-visit 5.1.0 / unist-util-visit-parents 6.0.2）
 *    原 Xe/Je/qe。自研层用法：
 *     - MarkdownAnimate：visitParents(tree, 'text', visitor)
 *     - MarkdownRenderer：visit(tree, test?, visitor)（raw 清理/元素过滤/
 *       literalTagContent/codeMeta 插件）
 * ==========================================================================*/

export interface UnistNode {
  type: string;
  children?: UnistNode[];
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  position?: {
    start?: { line?: number; column?: number; offset?: number };
    end?: { line?: number; column?: number; offset?: number };
  };
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export type VisitTest = string | ((node: UnistNode) => boolean) | undefined;
export type VisitorResult = void | boolean | "skip" | number | [boolean | "skip" | number, number?];

/** 原 Je：visitParents(tree, [test], visitor(node, ancestors)) */
export declare function visitParents(
  tree: UnistNode,
  test: VisitTest,
  visitor: (node: UnistNode, ancestors: UnistNode[]) => VisitorResult,
): void;
export declare function visitParents(tree: UnistNode, visitor: (node: UnistNode, ancestors: UnistNode[]) => VisitorResult): void;

/** 原 Xe：visit(tree, [test], visitor(node, index, parent)) */
export declare function visit(
  tree: UnistNode,
  test: VisitTest,
  visitor: (node: UnistNode, index: number | undefined, parent: UnistNode | undefined) => VisitorResult,
): void;
export declare function visit(tree: UnistNode, visitor: (node: UnistNode, index: number | undefined, parent: UnistNode | undefined) => VisitorResult): void;

/** 原 qe：SKIP 动作常量 */
export declare const SKIP: "skip";

/* ============================================================================
 * 2. remend（remend@1.3.0，streamdown 固定依赖）
 *    原 Op（js 13285）：修复流式半截 markdown（粗体/斜体/行内代码/删除线/
 *    链接/KaTeX 未闭合等），供 Streamdown 在 streaming 模式渲染前调用。
 * ==========================================================================*/

export interface RemendHandler {
  name: string;
  handle: (markdown: string) => string;
  priority?: number;
}

export interface RemendOptions {
  bold?: boolean;
  italic?: boolean;
  inlineCode?: boolean;
  strikethrough?: boolean;
  katex?: boolean;
  inlineKatex?: boolean;
  links?: boolean;
  images?: boolean;
  /** 'protocol'（默认）或 'origin' 等链接补全模式 */
  linkMode?: string;
  handlers?: RemendHandler[];
}

export declare function parseIncompleteMarkdown(markdown: string, options?: RemendOptions): string;

/* ============================================================================
 * 3. marked（marked@17.x，streamdown 依赖 ^17.0.1）
 *    原 $_（Lexer，js 17333）。自研层只用 `Lexer.lex(markdown, {gfm:true})`
 *    做 parseMarkdownIntoBlocks 的块级切分（不渲染）。
 * ==========================================================================*/

export interface MarkedToken {
  type: string;
  raw: string;
  block?: boolean;
  [key: string]: unknown;
}

export declare const markedLexer: {
  lex: (markdown: string, options?: { gfm?: boolean }) => MarkedToken[];
};

/* ============================================================================
 * 4. unified 管线（unified 11.0.5 / remark-parse 11 / remark-gfm 4.0.1 /
 *    remark-rehype 11.1.2 / rehype-raw 7 / rehype-sanitize 6 / rehype-harden 1.1.8）
 *    原 bg/nh/Jd/qh/jo/Xo/ft。自研层在 createProcessor 中组装：
 *      unified().use(remarkParse).use(remarkPlugins).use(remarkRehype, opts).use(rehypePlugins)
 * ==========================================================================*/

export type UnifiedPlugin = ((options?: unknown) => unknown) | { (...args: unknown[]): unknown };

export interface UnifiedProcessor {
  use: (plugin: UnifiedPlugin | [UnifiedPlugin, unknown], ...rest: unknown[]) => UnifiedProcessor;
  parse: (markdown: string) => UnistNode;
  runSync: (tree: UnistNode, markdown: string) => UnistNode;
}

/** 原 bg：unified() 处理器工厂 */
export declare function createUnifiedProcessor(): UnifiedProcessor;
/** 原 nh：remark-parse */
export declare const remarkParse: UnifiedPlugin;
/** 原 Jd：remark-gfm */
export declare const remarkGfm: UnifiedPlugin;
/** 原 qh：remark-rehype */
export declare const remarkRehype: UnifiedPlugin;
/** 原 jo：rehype-raw */
export declare const rehypeRaw: UnifiedPlugin;
/** 原 Xo：rehype-sanitize */
export declare const rehypeSanitize: UnifiedPlugin;
/** 原 ft：rehype-harden */
export declare const rehypeHarden: UnifiedPlugin;

/** 原 No：hast-util-sanitize 默认（GitHub 风格）schema；自研层扩展出 Hb */
export interface SanitizeSchema {
  ancestors?: Record<string, string[]>;
  attributes?: Record<string, unknown[]>;
  clobber?: string[];
  clobberPrefix?: string;
  protocols?: Record<string, string[]>;
  required?: Record<string, Record<string, unknown>>;
  strip?: string[];
  tagNames?: string[];
}
export declare const defaultSanitizeSchema: SanitizeSchema;

/* ============================================================================
 * 5. hast-util-to-jsx-runtime（2.3.6）
 *    原 Yp（js 13560）：把 rehype 产出的 hast 树转成 React 元素；
 *    自研层传入 components 映射（STREAMDOWN_COMPONENTS）+ passNode/passKeys。
 * ==========================================================================*/

export interface ToJsxRuntimeOptions {
  Fragment: unknown;
  components: Record<string, unknown>;
  ignoreInvalidStyle?: boolean;
  jsx: unknown;
  jsxs: unknown;
  passKeys?: boolean;
  passNode?: boolean;
}

export declare function toJsxRuntime(tree: UnistNode, options: ToJsxRuntimeOptions): unknown;
