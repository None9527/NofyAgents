// A0-S4-4c: 自 modules/MarkdownRenderer.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/markdown/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
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

import * as React from "react";
import {
  StreamdownContext,
  StreamdownPluginsContext,
  StreamdownTranslationsContext,
  ClassNamesContext,
  StreamdownIconsProvider,
  IsStreamingContext,
  DEFAULT_SHIKI_THEME,
  DEFAULT_LINK_SAFETY,
  DEFAULT_STREAMDOWN_TRANSLATIONS,
  STREAMDOWN_CARET_SYMBOLS,
  createPrefixedCn,
  type StreamdownOptions,
  type StreamdownPlugins,
  type StreamdownTranslations,
  type StreamdownMode,
  type ShikiTheme,
  type ControlsOptions,
  type LinkSafetyOptions,
  type StreamdownIcon,
} from "../../modules/MarkdownContext";
import {
  STREAMDOWN_COMPONENTS,
  detectTextDirection,
  type MarkdownComponentsMap,
  type MarkdownElementProps,
} from "../../modules/MarkdownElements";
import { createAnimatePlugin, type AnimatePlugin } from "../../modules/MarkdownAnimate";
import {
  visit,
  parseIncompleteMarkdown as remendParseIncompleteMarkdown,
  markedLexer,
  createUnifiedProcessor,
  remarkParse,
  remarkGfm,
  remarkRehype,
  rehypeRaw,
  rehypeSanitize,
  rehypeHarden,
  toJsxRuntime,
  defaultSanitizeSchema,
  type UnistNode,
  type UnifiedPlugin,
  type UnifiedProcessor,
  type RemendOptions,
  type SanitizeSchema,
} from "../../modules/MarkdownVendored";

/* ============================================================================
 * 1. 块级切分（原 nb…jb，js 20822-21100）
 * ==========================================================================*/

const CODE_FENCE_REGEX = /^[ \t]{0,3}(`{3,}|~{3,})/; // 原 nb
const TABLE_DIVIDER_REGEX = /^\|?[ \t]*:?-{1,}:?[ \t]*(\|[ \t]*:?-{1,}:?[ \t]*)*\|?$/; // 原 rb

/** 原 ib：代码栅栏未闭合（流式半截代码块）判定 */
export const isCodeFenceIncomplete = (markdown: string): boolean => {
  const lines = markdown.split(`\n`);
  let fenceChar: string | null = null;
  let fenceLength = 0;
  for (const line of lines) {
    const match = CODE_FENCE_REGEX.exec(line);
    if (fenceChar === null) {
      if (match) {
        const fence = match[1];
        fenceChar = fence[0];
        fenceLength = fence.length;
      }
    } else if (match) {
      const fence = match[1];
      const char = fence[0];
      const length = fence.length;
      // 同字符且长度 ≥ 开栅栏的闭栅栏 ⇒ 配对完成
      if (char === fenceChar && length >= fenceLength) {
        fenceChar = null;
        fenceLength = 0;
      }
    }
  }
  return fenceChar !== null;
};

/** 原 ab：表格分隔行（| --- | --- |）未打完判定 */
export const hasIncompleteTableDivider = (markdown: string): boolean => {
  const lines = markdown.split(`\n`);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed.includes(`|`) && TABLE_DIVIDER_REGEX.test(trimmed)) return true;
  }
  return false;
};

/** 原 ob：未启用 rehype-raw 时，把 html 节点降级为文本（否则 toJsxRuntime 抛错） */
const htmlToTextPlugin = () => (tree: UnistNode) => {
  visit(tree, `html`, (node, index, parent) => {
    if (!parent || typeof index !== `number`) return;
    parent.children![index] = { type: `text`, value: (node as UnistNode).value };
  });
};

/* ============================================================================
 * 2. unified 处理器缓存与渲染（原 sb…yb，js 20862-21000）
 * ==========================================================================*/

const EMPTY_PLUGINS: unknown[] = []; // 原 sb
const DEFAULT_REMARK_REHYPE_OPTIONS = { allowDangerousHtml: true }; // 原 cb
const pluginNamesCache = new WeakMap<object, string>(); // 原 lb

/** 原 ub：处理器 LRU 缓存（键 = remark::rehype::remarkRehypeOptions 序列化） */
class ProcessorCache {
  private cache = new Map<string, UnifiedProcessor>();
  private keyCache = new WeakMap<object, string>();
  private maxSize = 100;
  generateCacheKey(options: MarkdownProcessorOptions): string {
    const cachedKey = this.keyCache.get(options);
    if (cachedKey) return cachedKey;
    const { rehypePlugins, remarkPlugins, remarkRehypeOptions } = options;
    if (!(rehypePlugins || remarkPlugins || remarkRehypeOptions)) {
      const key = `default`;
      this.keyCache.set(options, key);
      return key;
    }
    const serializePlugins = (plugins?: unknown[]): string => {
      if (!plugins || plugins.length === 0) return ``;
      let result = ``;
      for (let index = 0; index < plugins.length; index += 1) {
        const plugin = plugins[index];
        if (index > 0) result += `,`;
        if (Array.isArray(plugin)) {
          const [pluginFn, pluginOptions] = plugin as [unknown, unknown];
          if (typeof pluginFn === `function`) {
            let name = pluginNamesCache.get(pluginFn);
            if (!name) {
              name = pluginFn.name;
              pluginNamesCache.set(pluginFn, name);
            }
            result += name;
          } else result += String(pluginFn);
          result += `:`;
          result += JSON.stringify(pluginOptions);
        } else if (typeof plugin === `function`) {
          let name = pluginNamesCache.get(plugin);
          if (!name) {
            name = plugin.name;
            pluginNamesCache.set(plugin, name);
          }
          result += name;
        } else result += String(plugin);
      }
      return result;
    };
    const rehypeKey = serializePlugins(rehypePlugins);
    const key = `${serializePlugins(remarkPlugins)}::${rehypeKey}::${remarkRehypeOptions ? JSON.stringify(remarkRehypeOptions) : ``}`;
    this.keyCache.set(options, key);
    return key;
  }
  get(options: MarkdownProcessorOptions): UnifiedProcessor | undefined {
    const key = this.generateCacheKey(options);
    const processor = this.cache.get(key);
    if (processor) {
      // LRU：命中即刷新到最新
      this.cache.delete(key);
      this.cache.set(key, processor);
    }
    return processor;
  }
  set(options: MarkdownProcessorOptions, processor: UnifiedProcessor): void {
    const key = this.generateCacheKey(options);
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, processor);
  }
  clear(): void {
    this.cache.clear();
  }
}

const processorCache = new ProcessorCache();

export interface MarkdownProcessorOptions {
  children?: string;
  components?: MarkdownComponentsMap;
  rehypePlugins?: unknown[];
  remarkPlugins?: unknown[];
  remarkRehypeOptions?: Record<string, unknown>;
  allowElement?: (node: UnistNode, index: number | undefined, parent: UnistNode | undefined) => boolean;
  allowedElements?: string[];
  disallowedElements?: string[];
  skipHtml?: boolean;
  unwrapDisallowed?: boolean;
  urlTransform?: (url: string, key: string, node: UnistNode) => string | undefined;
  [key: string]: unknown;
}

/** 原 mb：组装 unified 管线。无 rehype-raw 时追加 htmlToTextPlugin */
const createProcessor = (options: MarkdownProcessorOptions): UnifiedProcessor => {
  const rehypePlugins = options.rehypePlugins || EMPTY_PLUGINS;
  const remarkPlugins = options.remarkPlugins || EMPTY_PLUGINS;
  const finalRemarkPlugins = hasRehypeRaw(rehypePlugins) ? remarkPlugins : [...remarkPlugins, htmlToTextPlugin];
  const remarkRehypeOptions = options.remarkRehypeOptions ? { ...DEFAULT_REMARK_REHYPE_OPTIONS, ...options.remarkRehypeOptions } : DEFAULT_REMARK_REHYPE_OPTIONS;
  return createUnifiedProcessor()
    .use(remarkParse)
    .use(finalRemarkPlugins as unknown as UnifiedPlugin)
    .use(remarkRehype, remarkRehypeOptions)
    .use(rehypePlugins as unknown as UnifiedPlugin);
};

/** 原 fb：缓存取处理器 */
const getProcessor = (options: MarkdownProcessorOptions): UnifiedProcessor => {
  const cached = processorCache.get(options);
  if (cached) return cached;
  const processor = createProcessor(options);
  processorCache.set(options, processor);
  return processor;
};

/** 原 pb：rehype-raw 是否在管线中（裸用或 [插件, 选项] 元组） */
const hasRehypeRaw = (plugins: unknown[]): boolean =>
  plugins.some((plugin) => (Array.isArray(plugin) ? plugin[0] === rehypeRaw : plugin === rehypeRaw));

/* --- renderHast 辅助（原 hb/gb/_b/vb/yb，js 20949-21000） --- */

const identity = (url: string): string => url; // 原 hb

/** 原 gb：skipHtml 时删除 raw 节点，否则替换为文本 */
const removeRawNode = (parent: UnistNode, index: number, skipHtml: boolean | undefined, value: string): void => {
  if (skipHtml) parent.children!.splice(index, 1);
  else parent.children![index] = { type: `text`, value };
};

/** 原 _b：对 html-url-attributes 登记的 URL 属性应用 urlTransform */
const transformElementUrls = (element: UnistNode, transform: (url: string, key: string, node: UnistNode) => string | undefined): void => {
  // 上游遍历 html-url-attributes 的 urlAttributes 表（vendor，MarkdownVendored 登记）
  for (const key of URL_ATTRIBUTE_KEYS)
    if (Object.prototype.hasOwnProperty.call(element.properties, key)) {
      const value = element.properties![key];
      const allowedTags = URL_ATTRIBUTE_TAGS[key];
      if ((allowedTags === null || allowedTags.includes(element.tagName!)))
        element.properties![key] = transform(String(value || ``), key, element) ?? undefined;
    }
};

/** 原 vb：allowed/disallowed/allowElement 过滤判定 */
const shouldSkipElement = (
  element: UnistNode,
  index: number | undefined,
  parent: UnistNode | undefined,
  allowedElements: string[] | undefined,
  disallowedElements: string[] | undefined,
  allowElement: MarkdownProcessorOptions["allowElement"],
): boolean => {
  let skip = false;
  if (allowedElements) skip = !allowedElements.includes(element.tagName!);
  else if (disallowedElements) skip = disallowedElements.includes(element.tagName!);
  if (!skip && allowElement && typeof index === `number`) skip = !allowElement(element, index, parent);
  return skip;
};

/** html-url-attributes（vendor，3.0.1）的登记表压缩表示：键 → 允许标签（null=全部） */
const URL_ATTRIBUTE_TAGS: Record<string, string[] | null> = {
  action: [`form`],
  cite: [`blockquote`, `del`, `ins`, `q`],
  data: [`object`],
  formAction: [`button`, `input`],
  href: [`a`, `area`, `base`, `link`],
  icon: [`menuitem`],
  itemId: null,
  manifest: [`html`],
  ping: [`a`, `area`],
  poster: [`video`],
  src: [`audio`, `embed`, `iframe`, `img`, `input`, `script`, `source`, `track`, `video`],
};
const URL_ATTRIBUTE_KEYS = Object.keys(URL_ATTRIBUTE_TAGS);

/** 原 yb：hast → React 元素（过滤 + toJsxRuntime） */
const renderHast = (tree: UnistNode, options: MarkdownProcessorOptions): React.ReactNode => {
  const { allowElement, allowedElements, disallowedElements, skipHtml, unwrapDisallowed, urlTransform } = options;
  if (allowElement || allowedElements || disallowedElements || skipHtml || urlTransform) {
    const transform = urlTransform || identity;
    visit(tree, (node, index, parent) => {
      if (node.type === `raw` && parent && typeof index === `number`) {
        removeRawNode(parent, index, skipHtml, node.value as string);
        return index;
      }
      if (node.type === `element`) {
        transformElementUrls(node, transform);
        if (shouldSkipElement(node, index, parent, allowedElements, disallowedElements, allowElement) && parent && typeof index === `number`) {
          if (unwrapDisallowed && node.children) parent.children!.splice(index, 1, ...node.children);
          else parent.children!.splice(index, 1);
          return index;
        }
      }
    });
  }
  return toJsxRuntime(tree, {
    Fragment: React.Fragment,
    components: (options.components ?? {}) as Record<string, unknown>,
    ignoreInvalidStyle: true,
    jsx: React.createElement as unknown,
    jsxs: React.createElement as unknown,
    passKeys: true,
    passNode: true,
  }) as React.ReactNode;
};

/**
 * 原 db：MarkdownProcessor —— 「取处理器 → parse → runSync → renderHast」
 * 一步完成。注意：runSync 同步执行（流式渲染要求同步出结果）。
 */
const MarkdownProcessor: React.FC<MarkdownProcessorOptions> = (options) => {
  const processor = getProcessor(options);
  const markdown = options.children || ``;
  return renderHast(processor.runSync(processor.parse(markdown), markdown), options) as React.ReactElement;
};

/* ============================================================================
 * 3. parseMarkdownIntoBlocks（原 bb…jb，js 21001-21100 / jsx 17100）
 * ----------------------------------------------------------------------------
 * marked.lex（gfm）块级切分 + 三条合并规则：
 *  1) 未闭合 HTML 块：开标签多于闭标签时，后续 token 并入当前块直至配平；
 *  2) 未闭合数学块：上一块 `$$` 计数为奇数 ⇒ 当前 token 并入；
 *  3) 脚注语法（[^x] / [^x]:）出现 ⇒ 整篇单块（脚注定义跨块会断）。
 * ==========================================================================*/

const FOOTNOTE_REF_REGEX = /\[\^[\w-]{1,200}\](?!:)/; // 原 bb
const FOOTNOTE_DEF_REGEX = /\[\^[\w-]{1,200}\]:/; // 原 xb
const HTML_TAG_START_REGEX = /<(\w+)[\s>]/; // 原 Sb
const VOID_HTML_TAGS = new Set([
  `area`, `base`, `br`, `col`, `embed`, `hr`, `img`, `input`, `link`, `meta`, `param`, `source`, `track`, `wbr`,
]); // 原 Cb

const openTagRegexCache = new Map<string, RegExp>(); // 原 wb
const closeTagRegexCache = new Map<string, RegExp>(); // 原 Tb

const getOpenTagRegex = (tag: string): RegExp => {
  const lowered = tag.toLowerCase();
  const cached = openTagRegexCache.get(lowered);
  if (cached) return cached;
  const regex = RegExp(`<${lowered}(?=[\\s>/])[^>]*>`, `gi`);
  openTagRegexCache.set(lowered, regex);
  return regex;
}; // 原 Eb

const getCloseTagRegex = (tag: string): RegExp => {
  const lowered = tag.toLowerCase();
  const cached = closeTagRegexCache.get(lowered);
  if (cached) return cached;
  const regex = RegExp(`</${lowered}(?=[\\s>])[^>]*>`, `gi`);
  closeTagRegexCache.set(lowered, regex);
  return regex;
}; // 原 Db

const countOpenTags = (markdown: string, tag: string): number => {
  if (VOID_HTML_TAGS.has(tag.toLowerCase())) return 0;
  const matches = markdown.match(getOpenTagRegex(tag));
  if (!matches) return 0;
  let count = 0;
  for (const match of matches) if (!match.trimEnd().endsWith(`/>`)) count += 1;
  return count;
}; // 原 Ob

const countCloseTags = (markdown: string, tag: string): number => {
  const matches = markdown.match(getCloseTagRegex(tag));
  return matches ? matches.length : 0;
}; // 原 kb

const countMathDelimiters = (markdown: string): number => {
  let count = 0;
  for (let index = 0; index < markdown.length - 1; index += 1)
    if (markdown[index] === `$` && markdown[index + 1] === `$`) {
      count += 1;
      index += 1;
    }
  return count;
}; // 原 Ab

export const parseMarkdownIntoBlocks = (markdown: string): string[] => {
  // 脚注语法存在 ⇒ 整篇单块
  const hasFootnoteRef = FOOTNOTE_REF_REGEX.test(markdown);
  const hasFootnoteDef = FOOTNOTE_DEF_REGEX.test(markdown);
  if (hasFootnoteRef || hasFootnoteDef) return [markdown];
  const tokens = markedLexer.lex(markdown, { gfm: true });
  const blocks: string[] = [];
  const openHtmlTags: string[] = [];
  let previousBlockWasCode = false;
  for (const token of tokens) {
    const raw = token.raw;
    const blockIndex = blocks.length;
    // 规则 1：未闭合 HTML 块吸收后续 token
    if (openHtmlTags.length > 0) {
      blocks[blockIndex - 1] += raw;
      const openTag = openHtmlTags.at(-1)!;
      const opens = countOpenTags(raw, openTag);
      const closes = countCloseTags(raw, openTag);
      for (let i = 0; i < opens; i += 1) openHtmlTags.push(openTag);
      for (let i = 0; i < closes; i += 1) if (openHtmlTags.length > 0 && openHtmlTags.at(-1) === openTag) openHtmlTags.pop();
      continue;
    }
    if (token.type === `html` && token.block) {
      const tagMatch = raw.match(HTML_TAG_START_REGEX);
      if (tagMatch) {
        const tag = tagMatch[1];
        if (countOpenTags(raw, tag) > countCloseTags(raw, tag)) openHtmlTags.push(tag);
      }
    }
    // 规则 2：未闭合 $$ 数学块吸收下一 token
    if (blockIndex > 0 && !previousBlockWasCode) {
      const previousBlock = blocks[blockIndex - 1];
      if (countMathDelimiters(previousBlock) % 2 === 1) {
        blocks[blockIndex - 1] = previousBlock + raw;
        continue;
      }
    }
    blocks.push(raw);
    if (token.type !== `space`) previousBlockWasCode = token.type === `code`;
  }
  return blocks;
};

/* ============================================================================
 * 4. HTML 块保护与字面标签（原 Mb…Vb，js 21101-21156）
 * ==========================================================================*/

/** 原 Mb：自定义 HTML 块内的空行插 <!---->，防止 markdown 把块拆成段落 */
const preserveHtmlBlocks = (markdown: string, tagNames: string[]): string => {
  if (!tagNames.length) return markdown;
  let result = markdown;
  for (const tag of tagNames) {
    const regex = RegExp(`(<${tag}(?=[\\s>/])[^>]*>)([\\s\\S]*?)(</${tag}\\s*>)`, `gi`);
    result = result.replace(regex, (match, open: string, inner: string, close: string) => {
      if (!inner.includes(`\n\n`)) return open + inner + close;
      const patched = inner.replace(/\n\n/g, `\n<!---->\n`);
      return `${open}${patched.startsWith(`\n`) ? `` : `\n`}${patched}${patched.endsWith(`\n`) ? `` : `\n`}${close}\n\n`;
    });
  }
  return result;
};

const MARKDOWN_SPECIAL_CHARS_REGEX = /([\\`*_~[\]|])/g; // 原 Nb
const escapeMarkdownSpecialChars = (value: string): string => value.replace(MARKDOWN_SPECIAL_CHARS_REGEX, `\\$1`); // 原 Pb

/** 原 Fb：literalTagContent 标签内的内容彻底字面化（转义 + 空行实体化） */
const escapeLiteralTagContent = (markdown: string, tagNames: string[]): string => {
  if (!tagNames.length) return markdown;
  let result = markdown;
  for (const tag of tagNames) {
    const regex = RegExp(`(<${tag}(?=[\\s>/])[^>]*>)([\\s\\S]*?)(</${tag}\\s*>)`, `gi`);
    result = result.replace(regex, (match, open: string, inner: string, close: string) => open + escapeMarkdownSpecialChars(inner).replace(/\n\n/g, `&#10;&#10;`) + close);
  }
  return result;
};

/** 原 Ib：递归提取节点文本 */
const getTextContent = (node: UnistNode): string =>
  node.type === `text`
    ? (node.value as string)
    : `children` in node && Array.isArray(node.children)
      ? node.children.map((child) => getTextContent(child as UnistNode)).join(``)
      : ``;

/** 原 Lb：literalTagContent rehype 插件 —— 指定标签内容只留纯文本 */
const literalTagContentPlugin = (tagNames?: string[]) => (tree: UnistNode) => {
  if (!tagNames || tagNames.length === 0) return;
  const loweredTags = new Set(tagNames.map((tag) => tag.toLowerCase()));
  visit(tree, `element`, (node) => {
    const element = node as UnistNode;
    if (loweredTags.has(element.tagName!.toLowerCase())) {
      const text = getTextContent(element);
      element.children = text ? [{ type: `text`, value: text }] : [];
    }
  });
};

/** 原 Rb：code 节点 meta → hProperties.metastring（供 MarkdownCode 解析 startLine 等） */
const codeMetaPlugin = () => (tree: UnistNode) => {
  visit(tree, `code`, (node) => {
    const codeNode = node as UnistNode & { meta?: string };
    if (codeNode.meta) {
      codeNode.data = codeNode.data ?? {};
      codeNode.data.hProperties = { ...((codeNode.data.hProperties as Record<string, unknown>) ?? {}), metastring: codeNode.meta };
    }
  });
};

const HTML_START_REGEX = /^[ \t]*<[\w!/?-]/; // 原 zb
const HTML_INDENT_REGEX = /(^|\n)[ \t]{4,}(?=<[\w!/?-])/g; // 原 Bb

/** 原 Vb（上游导出 normalizeHtmlIndentation=x）：
 *  以 HTML 开头的 markdown，4 空格缩进会被解析成代码块 —— 去掉缩进。 */
const normalizeHtmlIndentation = (markdown: string): string =>
  typeof markdown !== `string` || markdown.length === 0 || !HTML_START_REGEX.test(markdown)
    ? markdown
    : markdown.replace(HTML_INDENT_REGEX, `$1`);

/* ============================================================================
 * 5. 默认插件表（原 Hb/Ub/Wb/Gb/Kb，js 21146-21172）
 * ==========================================================================*/

/** 原 Hb：streamdown 的 sanitize schema = 默认 GitHub schema
 *  + href 允许 tel: + code 允许 metastring 属性 */
const STREAMDOWN_SANITIZE_SCHEMA: SanitizeSchema = {
  ...defaultSanitizeSchema,
  protocols: { ...defaultSanitizeSchema.protocols, href: [...(defaultSanitizeSchema.protocols?.href ?? []), `tel`] },
  attributes: { ...defaultSanitizeSchema.attributes, code: [...((defaultSanitizeSchema.attributes?.code as unknown[]) ?? []), `metastring`] },
};

/** 原 Ub（上游导出 defaultRehypePlugins=y；构建导出别名 o） */
export const DEFAULT_REHYPE_PLUGINS = {
  raw: rehypeRaw,
  sanitize: [rehypeSanitize, STREAMDOWN_SANITIZE_SCHEMA],
  harden: [
    rehypeHarden,
    {
      allowedImagePrefixes: [`*`],
      allowedLinkPrefixes: [`*`],
      allowedProtocols: [`*`],
      defaultOrigin: undefined,
      allowDataImages: true,
    },
  ],
};

/** 原 Wb（上游导出 defaultRemarkPlugins=z） */
export const DEFAULT_REMARK_PLUGINS = { gfm: [remarkGfm, {}], codeMeta: codeMetaPlugin };

const DEFAULT_REHYPE_PLUGIN_LIST = Object.values(DEFAULT_REHYPE_PLUGINS); // 原 Gb
const DEFAULT_REMARK_PLUGIN_LIST = Object.values(DEFAULT_REMARK_PLUGINS); // 原 Kb

/* ============================================================================
 * 6. Block（原 Zb，js 21185-21227 / jsx 17244；上游导出 Block）
 *    单块渲染单元：动画插件内容长度记账 → 可选 HTML 缩进归一 →
 *    MarkdownProcessor → IsStreamingContext 注入（末块未完成标记）→
 *    可选 dir 包裹（display:contents 不破坏布局）。
 * ==========================================================================*/

export interface BlockProps extends MarkdownProcessorOptions {
  content: string;
  shouldParseIncompleteMarkdown: boolean;
  shouldNormalizeHtmlIndentation: boolean;
  index: number;
  isIncomplete: boolean;
  dir?: "ltr" | "rtl";
  animatePlugin: AnimatePlugin | null;
}

export const Block = React.memo(
  ({ content, shouldParseIncompleteMarkdown, shouldNormalizeHtmlIndentation, index, isIncomplete, dir, animatePlugin, ...rest }: BlockProps) => {
    // 动画记账：上一轮渲染的字符数 → 本轮「已渲染过」基线（不重播）
    if (animatePlugin) {
      const lastRenderCharCount = animatePlugin.getLastRenderCharCount();
      animatePlugin.setPrevContentLength(lastRenderCharCount);
    }
    const normalizedContent = typeof content === `string` && shouldNormalizeHtmlIndentation ? normalizeHtmlIndentation(content) : content;
    const rendered = <MarkdownProcessor {...rest}>{normalizedContent}</MarkdownProcessor>;
    return (
      <IsStreamingContext.Provider value={isIncomplete}>
        {dir ? (
          <div dir={dir} style={{ display: `contents` }}>
            {rendered}
          </div>
        ) : (
          rendered
        )}
      </IsStreamingContext.Provider>
    );
  },
  (prev, next) => {
    if (
      prev.content !== next.content ||
      prev.shouldNormalizeHtmlIndentation !== next.shouldNormalizeHtmlIndentation ||
      prev.index !== next.index ||
      prev.isIncomplete !== next.isIncomplete ||
      prev.dir !== next.dir
    )
      return false;
    // components 按键逐一比较（引用相等）
    if (prev.components !== next.components) {
      const prevKeys = Object.keys(prev.components || {});
      const nextKeys = Object.keys(next.components || {});
      if (prevKeys.length !== nextKeys.length || prevKeys.some((key) => prev.components?.[key] !== next.components?.[key])) return false;
    }
    return !(prev.rehypePlugins !== next.rehypePlugins || prev.remarkPlugins !== next.remarkPlugins);
  },
);
Block.displayName = `Block`;

/* ============================================================================
 * 7. Streamdown（原 Qb，js 21228-21462 / jsx 17276；上游导出 Streamdown）
 * ----------------------------------------------------------------------------
 * 主组件。两种模式：
 *  - static：整篇一次渲染（MarkdownProcessor 直出）；
 *  - streaming：remend 修复半截语法 → parseMarkdownIntoBlocks 切块 →
 *    每块一个 Block（末块打 isIncomplete），块更新走 useTransition 降优先级
 *    （无动画插件时），支持 caret 光标、逐块 dir=auto、animate 增量动画。
 * Provider 树：Translations → Plugins → StreamdownContext → Icons → ClassNames。
 * ==========================================================================*/

export interface StreamdownProps extends Omit<MarkdownProcessorOptions, "children"> {
  children: string;
  mode?: StreamdownMode;
  /** 'ltr' | 'rtl' | 'auto'（auto = 逐块/整篇探测） */
  dir?: "ltr" | "rtl" | "auto";
  /** streaming 模式下是否先经 remend 修复半截语法（默认 true） */
  parseIncompleteMarkdown?: boolean;
  normalizeHtmlIndentation?: boolean;
  components?: MarkdownComponentsMap & { inlineCode?: React.ComponentType<MarkdownElementProps> };
  rehypePlugins?: unknown[];
  remarkPlugins?: unknown[];
  className?: string;
  shikiTheme?: ShikiTheme;
  mermaid?: StreamdownOptions["mermaid"];
  controls?: ControlsOptions | boolean;
  /** 流式动画进行中（禁用复制/下载等 + 驱动 animate 插件） */
  isAnimating?: boolean;
  /** true 或 AnimatePluginOptions → 启用增量动画 */
  animated?: boolean | import("../../modules/MarkdownAnimate").AnimatePluginOptions;
  BlockComponent?: React.ComponentType<BlockProps>;
  parseMarkdownIntoBlocksFn?: (markdown: string) => string[];
  /** 'block' | 'circle'：流式光标符号 */
  caret?: keyof typeof STREAMDOWN_CARET_SYMBOLS;
  plugins?: StreamdownPlugins;
  /** remend 选项 */
  remend?: RemendOptions;
  linkSafety?: LinkSafetyOptions;
  lineNumbers?: boolean;
  /** 追加允许的 HTML 标签（会重建 sanitize 管线） */
  allowedTags?: Record<string, unknown[]>;
  /** 内容按字面文本渲染的标签 */
  literalTagContent?: string[];
  translations?: Partial<StreamdownTranslations>;
  icons?: Record<string, StreamdownIcon>;
  /** 类名前缀（所有内置类名加 `<prefix>:`） */
  prefix?: string;
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
}

export const Streamdown = React.memo(
  ({
    children,
    mode = `streaming`,
    dir,
    parseIncompleteMarkdown: shouldParseIncompleteMarkdown = true,
    normalizeHtmlIndentation: shouldNormalizeHtmlIndentation = false,
    components,
    rehypePlugins = DEFAULT_REHYPE_PLUGIN_LIST,
    remarkPlugins = DEFAULT_REMARK_PLUGIN_LIST,
    className,
    shikiTheme = DEFAULT_SHIKI_THEME,
    mermaid,
    controls = true,
    isAnimating = false,
    animated,
    BlockComponent = Block,
    parseMarkdownIntoBlocksFn = parseMarkdownIntoBlocks,
    caret,
    plugins,
    remend,
    linkSafety = DEFAULT_LINK_SAFETY,
    lineNumbers = true,
    allowedTags,
    literalTagContent,
    translations,
    icons,
    prefix,
    onAnimationStart,
    onAnimationEnd,
    ...rest
  }: StreamdownProps) => {
    const instanceId = React.useId();
    const [, startTransition] = React.useTransition();
    const cn = React.useMemo(() => createPrefixedCn(prefix), [prefix]);
    const previousIsAnimating = React.useRef<boolean | null>(null);
    const onAnimationStartRef = React.useRef(onAnimationStart);
    const onAnimationEndRef = React.useRef(onAnimationEnd);
    onAnimationStartRef.current = onAnimationStart;
    onAnimationEndRef.current = onAnimationEnd;
    // 动画生命周期回调：isAnimating 上升沿 → start；下降沿 → end（static 模式不触发）
    React.useEffect(() => {
      if (mode === `static`) return;
      const previous = previousIsAnimating.current;
      previousIsAnimating.current = isAnimating;
      if (previous === null) {
        if (isAnimating) onAnimationStartRef.current?.();
        return;
      }
      if (isAnimating && !previous) onAnimationStartRef.current?.();
      else if (!isAnimating && previous) onAnimationEndRef.current?.();
    }, [isAnimating, mode]);
    const allowedTagNames = React.useMemo(() => (allowedTags ? Object.keys(allowedTags) : []), [allowedTags]);
    // 预处理：remend 修复 → 字面标签转义 → HTML 块保护
    const processedMarkdown = React.useMemo(() => {
      if (typeof children !== `string`) return ``;
      let markdown = mode === `streaming` && shouldParseIncompleteMarkdown ? remendParseIncompleteMarkdown(children, remend) : children;
      if (literalTagContent && literalTagContent.length > 0) markdown = escapeLiteralTagContent(markdown, literalTagContent);
      if (allowedTagNames.length > 0) markdown = preserveHtmlBlocks(markdown, allowedTagNames);
      return markdown;
    }, [children, mode, shouldParseIncompleteMarkdown, remend, allowedTagNames, literalTagContent]);
    const blocks = React.useMemo(() => parseMarkdownIntoBlocksFn(processedMarkdown), [processedMarkdown, parseMarkdownIntoBlocksFn]);
    const [stableBlocks, setStableBlocks] = React.useState(blocks);
    // 动画插件存在时块更新不走 transition（动画自己节流）
    const animatePluginKey = React.useMemo(() => (animated === true ? `true` : animated ? JSON.stringify(animated) : ``), [animated]);
    const animatePlugin = React.useMemo<AnimatePlugin | null>(
      () => (animatePluginKey ? (animatePluginKey === `true` ? createAnimatePlugin() : createAnimatePlugin(animated as import("../../modules/MarkdownAnimate").AnimatePluginOptions)) : null),
      [animatePluginKey],
    );
    React.useEffect(() => {
      if (mode === `streaming` && !animatePlugin)
        startTransition(() => {
          setStableBlocks(blocks);
        });
      else setStableBlocks(blocks);
    }, [blocks, mode]);
    const visibleBlocks = mode === `streaming` ? stableBlocks : blocks;
    const perBlockDirections = React.useMemo(() => (dir === `auto` ? visibleBlocks.map((block) => detectTextDirection(block)) : undefined), [visibleBlocks, dir]);
    const blockKeys = React.useMemo(() => visibleBlocks.map((_, index) => `${instanceId}-${index}`), [visibleBlocks.length, instanceId]);
    // 上下文值：shikiTheme 优先取插件高亮器的主题
    const contextValue = React.useMemo<StreamdownOptions>(
      () => ({
        shikiTheme: plugins?.code?.getThemes() ?? shikiTheme,
        controls,
        isAnimating,
        lineNumbers,
        mode,
        mermaid,
        linkSafety,
      }),
      [shikiTheme, controls, isAnimating, lineNumbers, mode, mermaid, linkSafety, plugins?.code],
    );
    const translationsKey = React.useMemo(() => (translations ? JSON.stringify(translations) : ``), [translations]);
    const mergedTranslations = React.useMemo<StreamdownTranslations>(() => ({ ...DEFAULT_STREAMDOWN_TRANSLATIONS, ...translations }), [translationsKey]);
    // 组件合并：内置表 + 用户覆盖；inlineCode 单独处理（块级仍走内置/用户 code）
    const mergedComponents = React.useMemo<MarkdownComponentsMap>(() => {
      const { inlineCode, ...restComponents } = components ?? {};
      const result: MarkdownComponentsMap = { ...STREAMDOWN_COMPONENTS, ...restComponents };
      if (inlineCode) {
        const blockCodeComponent = result.code;
        result.code = ((props: MarkdownElementProps) =>
          `data-block` in props
            ? blockCodeComponent
              ? React.createElement(blockCodeComponent as React.ComponentType<MarkdownElementProps>, props)
              : null
            : React.createElement(inlineCode, props)) as unknown as React.ComponentType<never>;
      }
      return result;
    }, [components]);
    // remark 管线：cjk 前后置 + 用户插件 + math
    const finalRemarkPlugins = React.useMemo(() => {
      let pluginList: unknown[] = [];
      if (plugins?.cjk) pluginList = [...pluginList, ...plugins.cjk.remarkPluginsBefore];
      pluginList = [...pluginList, ...remarkPlugins];
      if (plugins?.cjk) pluginList = [...pluginList, ...plugins.cjk.remarkPluginsAfter];
      if (plugins?.math) pluginList = [...pluginList, plugins.math.remarkPlugin];
      return pluginList;
    }, [remarkPlugins, plugins?.math, plugins?.cjk]);
    // rehype 管线：allowedTags 需重建 sanitize；literalTagContent/math/animate 追加
    const finalRehypePlugins = React.useMemo(() => {
      let pluginList = rehypePlugins;
      if (allowedTags && Object.keys(allowedTags).length > 0 && rehypePlugins === DEFAULT_REHYPE_PLUGIN_LIST) {
        const extendedSchema: SanitizeSchema = {
          ...STREAMDOWN_SANITIZE_SCHEMA,
          tagNames: [...(STREAMDOWN_SANITIZE_SCHEMA.tagNames ?? []), ...Object.keys(allowedTags)],
          attributes: { ...STREAMDOWN_SANITIZE_SCHEMA.attributes, ...allowedTags },
        };
        pluginList = [DEFAULT_REHYPE_PLUGINS.raw, [rehypeSanitize, extendedSchema], DEFAULT_REHYPE_PLUGINS.harden];
      }
      if (literalTagContent && literalTagContent.length > 0) pluginList = [...pluginList, [literalTagContentPlugin, literalTagContent]];
      if (plugins?.math) pluginList = [...pluginList, plugins.math.rehypePlugin];
      if (animatePlugin && isAnimating) pluginList = [...pluginList, animatePlugin.rehypePlugin];
      return pluginList;
    }, [rehypePlugins, plugins?.math, animatePlugin, isAnimating, allowedTags, literalTagContent]);
    // 末块是否「未收尾」（代码栅栏/表格分隔行半截）—— 收尾后隐藏 caret
    const isLastBlockIncomplete = React.useMemo(() => {
      if (!isAnimating || visibleBlocks.length === 0) return false;
      const lastBlock = visibleBlocks.at(-1)!;
      return isCodeFenceIncomplete(lastBlock) || hasIncompleteTableDivider(lastBlock);
    }, [isAnimating, visibleBlocks]);
    const caretStyle = React.useMemo(
      () => (caret && isAnimating && !isLastBlockIncomplete ? ({ "--streamdown-caret": `"${STREAMDOWN_CARET_SYMBOLS[caret]}"` } as React.CSSProperties) : undefined),
      [caret, isAnimating, isLastBlockIncomplete],
    );
    return mode === `static` ? (
      <StreamdownTranslationsContext.Provider value={mergedTranslations}>
        <StreamdownPluginsContext.Provider value={plugins ?? null}>
          <StreamdownContext.Provider value={contextValue}>
            <StreamdownIconsProvider icons={icons}>
              <ClassNamesContext.Provider value={cn}>
                <div
                  className={cn(`space-y-4 whitespace-normal [&>*:first-child]:mt-0 [&>*:last-child]:mb-0`, className)}
                  dir={dir === `auto` ? detectTextDirection(processedMarkdown) : dir}
                >
                  <MarkdownProcessor components={mergedComponents} rehypePlugins={finalRehypePlugins} remarkPlugins={finalRemarkPlugins} {...rest}>
                    {processedMarkdown}
                  </MarkdownProcessor>
                </div>
              </ClassNamesContext.Provider>
            </StreamdownIconsProvider>
          </StreamdownContext.Provider>
        </StreamdownPluginsContext.Provider>
      </StreamdownTranslationsContext.Provider>
    ) : (
      <StreamdownTranslationsContext.Provider value={mergedTranslations}>
        <StreamdownPluginsContext.Provider value={plugins ?? null}>
          <StreamdownContext.Provider value={contextValue}>
            <StreamdownIconsProvider icons={icons}>
              <ClassNamesContext.Provider value={cn}>
                <div
                  className={cn(
                    `space-y-4 whitespace-normal [&>*:first-child]:mt-0 [&>*:last-child]:mb-0`,
                    caret && !isLastBlockIncomplete
                      ? `[&>*:last-child]:after:inline [&>*:last-child]:after:align-baseline [&>*:last-child]:after:content-[var(--streamdown-caret)]`
                      : null,
                    className,
                  )}
                  style={caretStyle}
                >
                  {visibleBlocks.length === 0 && caret && isAnimating && <span />}
                  {visibleBlocks.map((block, index) => {
                    const isLastBlock = index === visibleBlocks.length - 1;
                    const isIncomplete = isAnimating && isLastBlock && isCodeFenceIncomplete(block);
                    return (
                      <BlockComponent
                        key={blockKeys[index]}
                        animatePlugin={animatePlugin}
                        components={mergedComponents}
                        content={block}
                        dir={perBlockDirections?.[index] ?? (dir === `auto` ? undefined : dir)}
                        index={index}
                        isIncomplete={isIncomplete}
                        rehypePlugins={finalRehypePlugins}
                        remarkPlugins={finalRemarkPlugins}
                        shouldNormalizeHtmlIndentation={shouldNormalizeHtmlIndentation}
                        shouldParseIncompleteMarkdown={shouldParseIncompleteMarkdown}
                        {...rest}
                      />
                    );
                  })}
                </div>
              </ClassNamesContext.Provider>
            </StreamdownIconsProvider>
          </StreamdownContext.Provider>
        </StreamdownPluginsContext.Provider>
      </StreamdownTranslationsContext.Provider>
    );
  },
  (prev, next) =>
    prev.children === next.children &&
    prev.shikiTheme === next.shikiTheme &&
    prev.isAnimating === next.isAnimating &&
    prev.animated === next.animated &&
    prev.mode === next.mode &&
    prev.plugins === next.plugins &&
    prev.className === next.className &&
    prev.linkSafety === next.linkSafety &&
    prev.lineNumbers === next.lineNumbers &&
    prev.normalizeHtmlIndentation === next.normalizeHtmlIndentation &&
    prev.literalTagContent === next.literalTagContent &&
    JSON.stringify(prev.translations) === JSON.stringify(next.translations) &&
    prev.prefix === next.prefix &&
    prev.dir === next.dir,
);
Streamdown.displayName = `Streamdown`;
