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
 *   lv → WHITESPACE_REGEX /\s/ (18380 / 15300)
 *   uv → ONLY_WHITESPACE_REGEX /^\s+$/ (18381 / 15301)
 *   dv → ANIMATE_SKIP_TAGS {code,pre,svg,math,annotation} (18382 / 15302)
 *   fv → isHastElement (18383 / 15303)
 *   pv → containsSkipTag (18384 / 15304)
 *   mv → splitByWhitespace    按空白切词（保留空白段）(18385 / 15305)
 *   hv → splitByCharacter     逐字符切（保留空白段）(18398 / 15318)
 *   gv → buildAnimatedSpan    造 <span data-sd-animate style=--sd-*> (18408 / 15328)
 *   _v → animateTextChildren  把文本子节点替换成动画 span（旧内容不重播）(18422 / 15342)
 *   vv → animatePluginCounter 插件实例计数（唯一化插件名）(18436 / 15388)
 *   yv → createAnimatePlugin  工厂：返回 {name:'animate', type:'animate',
 *                             rehypePlugin, setPrevContentLength,
 *                             getLastRenderCharCount}（上游导出 a）(18437 / 15389)
 *
 * 机制：rehype 插件遍历（visitParents）文本节点，按 word/char 切成
 * `<span data-sd-animate style="--sd-animation:sd-<anim>;--sd-duration:<ms>;
 * --sd-easing:<ease>[;--sd-delay:<ms>]">`；已渲染过的字符数
 * （prevContentLength）内的片段 delay=0 不重播。streamdown 的 styles.css
 * 提供 sd-fadeIn 等关键帧。
 * ============================================================================
 */

import { visitParents } from "./MarkdownVendored";

/* ============================================================================
 * 类型
 * ==========================================================================*/

/** hast 文本/元素节点（动画遍历用的最小子集） */
export interface AnimateHastNode {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: AnimateHastNode[];
  [key: string]: unknown;
}

export interface AnimatePluginOptions {
  /** 动画名（对应 styles.css 的 sd-<name> 关键帧），默认 fadeIn */
  animation?: string;
  /** 单片段时长 ms，默认 150 */
  duration?: number;
  /** CSS timing-function，默认 ease */
  easing?: string;
  /** 切分粒度：word（按空白）或 char（逐字符），默认 word */
  sep?: "word" | "char";
  /** 相邻片段延迟步进 ms，默认 40 */
  stagger?: number;
}

export interface AnimatePlugin {
  name: "animate";
  type: "animate";
  rehypePlugin: () => (tree: AnimateHastNode) => void;
  setPrevContentLength: (length: number) => void;
  getLastRenderCharCount: () => number;
}

/* ============================================================================
 * 实现（原 lv…yv，js 18380-18469）
 * ==========================================================================*/

const WHITESPACE_REGEX = /\s/; // 原 lv
const ONLY_WHITESPACE_REGEX = /^\s+$/; // 原 uv
/** 这些标签内的文本不做动画（代码/数学等逐字内容动画会破坏阅读） */
const ANIMATE_SKIP_TAGS = new Set([`code`, `pre`, `svg`, `math`, `annotation`]); // 原 dv

const isHastElement = (node: unknown): node is AnimateHastNode =>
  typeof node === `object` && !!node && `type` in node && (node as AnimateHastNode).type === `element`; // 原 fv

/** 原 pv：祖先链里含跳过标签 ⇒ 不动画 */
const containsSkipTag = (ancestors: AnimateHastNode[]): boolean =>
  ancestors.some((ancestor) => isHastElement(ancestor) && ANIMATE_SKIP_TAGS.has(ancestor.tagName as string));

/** 原 mv：按空白/非空白交替切段 */
const splitByWhitespace = (value: string): string[] => {
  const segments: string[] = [];
  let current = ``;
  let lastWasWhitespace = false;
  for (const char of value) {
    const isWhitespace = WHITESPACE_REGEX.test(char);
    if (isWhitespace !== lastWasWhitespace && current) {
      segments.push(current);
      current = ``;
    }
    current += char;
    lastWasWhitespace = isWhitespace;
  }
  if (current) segments.push(current);
  return segments;
};

/** 原 hv：逐字符切段（连续空白合并为一段） */
const splitByCharacter = (value: string): string[] => {
  const segments: string[] = [];
  let whitespaceRun = ``;
  for (const char of value)
    if (WHITESPACE_REGEX.test(char)) whitespaceRun += char;
    else {
      if (whitespaceRun) {
        segments.push(whitespaceRun);
        whitespaceRun = ``;
      }
      segments.push(char);
    }
  if (whitespaceRun) segments.push(whitespaceRun);
  return segments;
};

/** 原 gv：构造动画 span（CSS 变量驱动，关键帧在 streamdown styles.css） */
const buildAnimatedSpan = (
  value: string,
  animation: string,
  duration: number,
  easing: string,
  isPreviouslyRendered: boolean,
  delay?: number,
): AnimateHastNode => {
  let style = `--sd-animation:sd-${animation};--sd-duration:${isPreviouslyRendered ? 0 : duration}ms;--sd-easing:${easing}`;
  if (delay) style += `;--sd-delay:${delay}ms`;
  return {
    type: `element`,
    tagName: `span`,
    properties: { "data-sd-animate": true, style },
    children: [{ type: `text`, value }],
  };
};

interface AnimateCounters {
  count: number;
  newIndex: number;
}

/** 原 _v：对单个文本节点做切分替换（返回插入位置；跳过标签/空文本累计字符数） */
const animateTextChildren = (
  node: AnimateHastNode,
  ancestors: AnimateHastNode[],
  options: Required<AnimatePluginOptions>,
  state: { prevContentLength: number; lastRenderCharCount: number },
  counters: AnimateCounters,
): number | undefined => {
  const parent = ancestors.at(-1);
  if (!(parent && `children` in parent)) return;
  if (containsSkipTag(ancestors)) return;
  const parentWithChildren = parent as AnimateHastNode;
  const index = parentWithChildren.children!.indexOf(node);
  if (index === -1) return;
  const value = node.value;
  if (!value?.trim()) {
    counters.count += value!.length;
    return;
  }
  const segments = options.sep === `char` ? splitByCharacter(value) : splitByWhitespace(value);
  const previousContentLength = state.prevContentLength;
  const replacements = segments.map((segment) => {
    const segmentStart = counters.count;
    counters.count += segment.length;
    if (ONLY_WHITESPACE_REGEX.test(segment)) return { type: `text`, value: segment } as AnimateHastNode;
    const alreadyRendered = previousContentLength > 0 && segmentStart < previousContentLength;
    const delay = alreadyRendered ? 0 : counters.newIndex++ * options.stagger;
    return buildAnimatedSpan(segment, options.animation, options.duration, options.easing, alreadyRendered, delay);
  });
  parentWithChildren.children!.splice(index, 1, ...replacements);
  return index + replacements.length;
};

let animatePluginCounter = 0; // 原 vv

/**
 * 原 yv（上游导出 createAnimatePlugin）：工厂。
 * 每次调用生成独立计数状态；rehypePlugin 函数名唯一化（`rehypeAnimate$<n>`），
 * 避免 unified 按函数引用去重/缓存时串台。
 */
export function createAnimatePlugin(options?: AnimatePluginOptions): AnimatePlugin {
  const resolvedOptions: Required<AnimatePluginOptions> = {
    animation: options?.animation ?? `fadeIn`,
    duration: options?.duration ?? 150,
    easing: options?.easing ?? `ease`,
    sep: options?.sep ?? `word`,
    stagger: options?.stagger ?? 40,
  };
  const state = { prevContentLength: 0, lastRenderCharCount: 0 };
  const instanceId = animatePluginCounter++;
  const rehypePlugin = () => (tree: AnimateHastNode) => {
    const counters: AnimateCounters = { count: 0, newIndex: 0 };
    visitParents(tree, `text`, (node, ancestors) => {
      animateTextChildren(node as AnimateHastNode, ancestors as AnimateHastNode[], resolvedOptions, state, counters);
    });
    state.lastRenderCharCount = counters.count;
    state.prevContentLength = 0;
  };
  Object.defineProperty(rehypePlugin, `name`, { value: `rehypeAnimate$${instanceId}` });
  return {
    name: `animate`,
    type: `animate`,
    rehypePlugin,
    setPrevContentLength(length: number) {
      state.prevContentLength = length;
    },
    getLastRenderCharCount() {
      const count = state.lastRenderCharCount;
      state.lastRenderCharCount = 0;
      return count;
    },
  };
}
