// A0-S4-4c: 自 modules/MarkdownContext.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/markdown/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * MarkdownContext.tsx — ZCode 3.7.6 markdown 渲染层 · 上下文/图标/文案 子模块
 * （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（融合 chunk，21,756 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js
 * 对照文件（同一 chunk 的 JSX 还原版，双行号格式：js 行 / jsx 行）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx
 *
 * ── 定性（把握度：高）──────────────────────────────────────────────────────
 * 本 chunk = **streamdown@2.5.0**（vercel/streamdown，Apache-2.0）的
 * dist/chunk-BO2N2NFS.js 经 Vite 重打包后的产物（文件名哈希前缀 `BO2N2NFS`
 * 与上游 dist 逐字一致；上游包见 node_modules/streamdown）。
 * 本文件重建的是 streamdown 的 **first-party 组件层**（相对 ZCode 即
 * 「markdown 渲染自研层」的上游本体），本子模块 = 全部 React context、
 * 默认图标、默认文案与共享工具。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（本文件覆盖；行号 = js / jsx）
 * ----------------------------------------------------------------------------
 *  上下文（context）：
 *   Xb → StreamdownContext        全局选项上下文（shikiTheme/controls/isAnimating/
 *                                 lineNumbers/mode/mermaid/linkSafety）(21176)
 *   ty → StreamdownPluginsContext 插件上下文（code/mermaid/cjk/math/renderers）(28218)
 *   bv → IsStreamingContext       「末块是否未完成」上下文（布尔）(18470)
 *   Ev → ClassNamesContext        类名合并函数上下文（cn，带 prefix 能力）(18495)
 *   Rv → StreamdownIconsContext   图标表上下文 (18934)
 *   Uv → StreamdownTranslationsContext 文案上下文 (18950)
 *
 *  钩子：
 *   ny → useStreamdownPlugins     useContext(ty) (19611)
 *   ry → useCodeHighlighter       plugins?.code ?? null（导出别名 n，被
 *                                 highlighted-body chunk 消费）(19612)
 *   iy → useMermaidPlugin         plugins?.mermaid ?? null (28349)
 *   ay → useCustomBlockRenderer   按语言查 plugins.renderers (28434)
 *   xv → useIsStreaming           useContext(bv) (18471)
 *   Q  → useClassNames            useContext(Ev) (18496)
 *   Vv → useStreamdownIcons       useContext(Rv) (18949)
 *   Wv → useStreamdownTranslations useContext(Uv) (18982)
 *
 *  默认值 / 常量：
 *   Jb → DEFAULT_SHIKI_THEME      ['github-light','github-dark'] (21174)
 *   Yb → DEFAULT_LINK_SAFETY      { enabled: true } (21175)
 *   Lv → DEFAULT_STREAMDOWN_ICONS 10 个内联 SVG 图标 (18731)
 *   Hv → DEFAULT_STREAMDOWN_TRANSLATIONS 30 条英文文案 (18950)
 *   qb → STREAMDOWN_CARET_SYMBOLS { block:' ▋', circle:' ●' } (21173)
 *   Dv → STREAMDOWN_LINE_NUMBER_CLASS 行号 CSS counter 类 (18497)
 *
 *  工具：
 *   Sv → streamdownCn             twMerge(clsx(...))（s/c 来自 bundle-mjs chunk）(18472)
 *   Cv → prefixClasses            给类名批量加 `prefix:` (18473)
 *   wv → createPrefixedCn         按 prefix 造 cn (18481)
 *   Tv → downloadFile             Blob→a[download] 触发下载（CSV 加 BOM）(18484)
 *   Ov → parseInlineStyle         'k:v;k2:v2' → 对象 (18510)
 *   zv → iconsAreEqual            图标表浅比较 (18935)
 *   Bv → StreamdownIconsProvider  合并默认图标 (18941)
 *   Zv/Qv/$v → 滚动锁计数/加锁/解锁 (19481)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖（跨 chunk）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime      react-BQLj9xdT.js（F→React）、jsx-runtime-B5yMD3-t.js（Y→jsx）
 *  2. tailwind-merge + clsx    bundle-mjs-D8tLE0rB.js（s=twMerge、c=clsx；
 *                              streamdown 声明依赖 tailwind-merge ^3.4.0 / clsx ^2.1.1，
 *                              ZCode 构建中去重为独立 chunk）
 *  3. 本族其余子模块           Markdown*.tsx（同目录）
 * ============================================================================
 */

import * as React from "react";

/* ============================================================================
 * 0. 外部依赖声明（真实实现见上清单）
 * ==========================================================================*/

/** tailwind-merge(clsx(...))：streamdown 的 cn（原 Sv，18472） */
declare function streamdownCn(...inputs: Array<string | false | null | undefined>): string;

/* ============================================================================
 * 1. 类型（由上下文默认值与消费面归纳；上游 streamdown 2.5.0 dist/index.d.ts
 *    的运行时形状逐字对应）
 * ==========================================================================*/

/** shiki 主题：主题名 / 主题对象 / [light, dark] 双主题（原实现宽松接受） */
export type ShikiTheme = unknown;

/** shiki 高亮结果（由 @streamdown/code 高亮器产出，CodeBlockBody 消费） */
export interface HighlightResult {
  bg?: string;
  fg?: string;
  rootStyle?: string | Record<string, string>;
  tokens: Array<
    Array<{
      content: string;
      color?: string;
      bgColor?: string;
      htmlStyle?: Record<string, string>;
      htmlAttrs?: Record<string, string>;
      offset?: number;
    }>
  >;
}

/** 代码高亮器插件（@streamdown/code 的 createHighlighter 产物） */
export interface CodeHighlighterPlugin {
  highlight: (
    args: { code: string; language: string; themes: ShikiTheme },
    onUpdate: (result: HighlightResult) => void,
  ) => HighlightResult | undefined | Promise<unknown>;
  getThemes: () => ShikiTheme;
}

/** mermaid 插件（@streamdown/mermaid 产物；getMermaid 返回 mermaid 实例） */
export interface MermaidPlugin {
  getMermaid: (config?: unknown) => {
    render: (id: string, text: string) => Promise<{ svg: string }>;
  };
}

/** 自定义代码块渲染器（plugins.renderers 项；language 可为单值或数组） */
export interface CustomBlockRenderer {
  language: string | string[];
  component: React.ComponentType<{
    code: string;
    isIncomplete: boolean;
    language: string;
    meta?: string;
  }>;
}

/** CJK / math 插件（@streamdown/cjk、@streamdown/math 产物） */
export interface CjkPlugin {
  remarkPluginsBefore: unknown[];
  remarkPluginsAfter: unknown[];
}
export interface MathPlugin {
  remarkPlugin: unknown;
  rehypePlugin: unknown;
}

/** Streamdown 插件集合（经 StreamdownPluginsContext 下发） */
export interface StreamdownPlugins {
  code?: CodeHighlighterPlugin | null;
  mermaid?: MermaidPlugin | null;
  cjk?: CjkPlugin;
  math?: MathPlugin;
  renderers?: CustomBlockRenderer[];
}

/** 链接安全选项（原 Yb 默认 { enabled: true }） */
export interface LinkSafetyOptions {
  enabled?: boolean;
  /** 返回 true 表示链接已通过检查，可直接打开 */
  onLinkCheck?: (url: string) => Promise<boolean> | boolean;
  /** 自定义确认弹层；缺省用内置 LinkSafetyModal */
  renderModal?: (props: LinkSafetyModalProps) => React.ReactNode;
}
export interface LinkSafetyModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** 控件开关：布尔总开关或按族细分（table/code/mermaid × copy/download/…） */
export type ControlSwitch = boolean | undefined;
export interface ControlsOptions {
  table?: ControlSwitch | { copy?: ControlSwitch; download?: ControlSwitch; fullscreen?: ControlSwitch };
  code?: ControlSwitch | { copy?: ControlSwitch; download?: ControlSwitch };
  mermaid?:
    | ControlSwitch
    | { copy?: ControlSwitch; download?: ControlSwitch; fullscreen?: ControlSwitch; panZoom?: ControlSwitch };
}

export type StreamdownMode = "streaming" | "static";

/** StreamdownContext 值（原 Xb 默认值逐字） */
export interface StreamdownOptions {
  shikiTheme: ShikiTheme;
  controls: ControlsOptions | boolean;
  isAnimating: boolean;
  lineNumbers: boolean;
  mode: StreamdownMode;
  mermaid?: { config?: unknown; errorComponent?: React.ComponentType<MermaidErrorProps> } | undefined;
  linkSafety: LinkSafetyOptions;
}
export interface MermaidErrorProps {
  chart: string;
  error: string;
  retry: () => void;
}

/* ============================================================================
 * 1.1 hast/mdast 节点位置类型（元素组件 memo 比较器共用）
 * ==========================================================================*/

/** hast 节点位置（mdast/hast position 的最小子集） */
export interface HastNodePosition {
  start?: { line?: number; column?: number };
  end?: { line?: number; column?: number };
}
export interface HastNodeLike {
  position?: HastNodePosition;
}

/* ============================================================================
 * 2. StreamdownContext（原 Xb，js 21176 / jsx 17235）
 *    全局选项上下文。Streamdown 组件在 Provider 中注入；CodeBlockBody、
 *    MarkdownA、MarkdownCode、MarkdownTable、各控制按钮均消费。
 * ==========================================================================*/

/** 原 Jb：默认双主题（亮/暗） */
export const DEFAULT_SHIKI_THEME: [string, string] = [`github-light`, `github-dark`];
/** 原 Yb：链接安全默认开启 */
export const DEFAULT_LINK_SAFETY: LinkSafetyOptions = { enabled: true };

export const StreamdownContext = React.createContext<StreamdownOptions>({
  shikiTheme: DEFAULT_SHIKI_THEME,
  controls: true,
  isAnimating: false,
  lineNumbers: true,
  mode: `streaming`,
  mermaid: void 0,
  linkSafety: DEFAULT_LINK_SAFETY,
});

/* ============================================================================
 * 3. StreamdownPluginsContext 与插件钩子（原 ty/ny/ry/iy/ay，js 19610-19625）
 *    Streamdown 把 props.plugins 原样放入上下文；代码块/mermaid/自定义块
 *    渲染器各自按需取用。
 * ==========================================================================*/

export const StreamdownPluginsContext = React.createContext<StreamdownPlugins | null>(null);

export const useStreamdownPlugins = (): StreamdownPlugins | null => React.useContext(StreamdownPluginsContext);

/** 原 ry（导出别名 n，highlighted-body chunk 消费）：代码高亮器 */
export const useCodeHighlighter = (): CodeHighlighterPlugin | null => useStreamdownPlugins()?.code ?? null;

/** 原 iy：mermaid 插件 */
export const useMermaidPlugin = (): MermaidPlugin | null => useStreamdownPlugins()?.mermaid ?? null;

/** 原 ay：按语言找自定义代码块渲染器（language 支持字符串或数组） */
export const useCustomBlockRenderer = (language: string): CustomBlockRenderer | null => {
  const plugins = useStreamdownPlugins();
  return (
    plugins?.renderers?.find((renderer) =>
      Array.isArray(renderer.language) ? renderer.language.includes(language) : renderer.language === language,
    ) ?? null
  );
};

/* ============================================================================
 * 4. IsStreamingContext（原 bv/xv，js 18470-18471）
 *    「当前块是否为流式未完成块」——由 Block 组件的 Provider 注入，
 *    MarkdownCode 用它给代码块打 isIncomplete 标记（显示流式光标等）。
 * ==========================================================================*/

export const IsStreamingContext = React.createContext<boolean>(false);
export const useIsStreaming = (): boolean => React.useContext(IsStreamingContext);

/* ============================================================================
 * 5. ClassNamesContext 与 cn 工具（原 Ev/Q/Sv/Cv/wv，js 18472-18496）
 *    cn 函数本身（twMerge+clsx）也走上下文，允许宿主经 Streamdown 的
 *    `prefix` prop 给所有内置类名加前缀（如 `dark:`/容器查询前缀）。
 * ==========================================================================*/

/** 原 Cv：把一组类名统一加上 `prefix:`（已有前缀的不重复加） */
export const prefixClasses = (prefix: string | undefined, classes: string): string => {
  if (!prefix || !classes) return classes;
  const withColon = `${prefix}:`;
  return classes
    .split(/\s+/)
    .filter(Boolean)
    .map((cls) => (cls.startsWith(withColon) ? cls : `${withColon}${cls}`))
    .join(` `);
};

/** 原 wv：prefix 存在 → 返回带前缀的 cn；否则普通 cn */
export const createPrefixedCn = (
  prefix?: string,
): ((...inputs: Array<string | false | null | undefined>) => string) =>
  prefix ? (...inputs) => prefixClasses(prefix, streamdownCn(...inputs)) : streamdownCn;

export type ClassNamesFn = (...inputs: Array<string | false | null | undefined>) => string;

export const ClassNamesContext = React.createContext<ClassNamesFn>(streamdownCn);
export const useClassNames = (): ClassNamesFn => React.useContext(ClassNamesContext);

/* ============================================================================
 * 6. 共享小工具
 * ==========================================================================*/

/** 原 Tv（js 18484）：浏览器下载。字符串内容且 MIME 为 text/csv 时前置 BOM（Excel 兼容） */
export const downloadFile = (filename: string, content: string | Blob, mimeType: string): void => {
  const bom = typeof content === `string` && mimeType.startsWith(`text/csv`) ? `\uFEFF` : ``;
  const blob = typeof content === `string` ? new Blob([bom + content], { type: mimeType }) : content;
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement(`a`);
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
};

/** 原 Ov（js 18510）：解析 shiki rootStyle 内联样式串 `k: v; k2: v2` → 对象 */
export const parseInlineStyle = (style: string): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const declaration of style.split(`;`)) {
    const colonIndex = declaration.indexOf(`:`);
    if (colonIndex > 0) {
      const key = declaration.slice(0, colonIndex).trim();
      const value = declaration.slice(colonIndex + 1).trim();
      if (key && value) result[key] = value;
    }
  }
  return result;
};

/** 原 Dv（js 18497）：代码行号的 CSS counter 类（::before 显示行号） */
export const STREAMDOWN_LINE_NUMBER_CLASS = streamdownCn(
  `block`,
  `before:content-[counter(line)]`,
  `before:inline-block`,
  `before:[counter-increment:line]`,
  `before:w-6`,
  `before:mr-4`,
  `before:text-[13px]`,
  `before:text-right`,
  `before:text-muted-foreground/50`,
  `before:font-mono`,
  `before:select-none`,
);

/* ============================================================================
 * 7. 滚动锁（原 Zv/Qv/$v，js 19481-19487）
 *    全屏/模态打开时禁止 body 滚动；计数式，支持多个叠加。
 * ==========================================================================*/

let scrollLockCount = 0;
export const lockBodyScroll = (): void => {
  scrollLockCount += 1;
  if (scrollLockCount === 1) document.body.style.overflow = `hidden`;
};
export const unlockBodyScroll = (): void => {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) document.body.style.overflow = ``;
};

/* ============================================================================
 * 8. 默认图标表（原 Lv，js 18731-18933 / jsx 15548）
 *    10 个 16×16 内联 SVG（GitHub octicons 风格 path）。逐字转录。
 * ==========================================================================*/

export type StreamdownIcon = React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>;

const iconSvgProps = (props: React.SVGProps<SVGSVGElement> & { size?: number }) => ({
  color: `currentColor`,
  height: 16,
  strokeLinejoin: `round` as const,
  viewBox: `0 0 16 16`,
  width: 16,
  ...props,
});

export const DEFAULT_STREAMDOWN_ICONS: Record<string, StreamdownIcon> = {
  CheckIcon: (props) => (
    <svg {...iconSvgProps(props)}>
      <path
        clipRule="evenodd"
        d="M15.5607 3.99999L15.0303 4.53032L6.23744 13.3232C5.55403 14.0066 4.44599 14.0066 3.76257 13.3232L4.2929 12.7929L3.76257 13.3232L0.969676 10.5303L0.439346 9.99999L1.50001 8.93933L2.03034 9.46966L4.82323 12.2626C4.92086 12.3602 5.07915 12.3602 5.17678 12.2626L13.9697 3.46966L14.5 2.93933L15.5607 3.99999Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),
  CopyIcon: (props) => (
    <svg {...iconSvgProps(props)}>
      <path
        clipRule="evenodd"
        d="M2.75 0.5C1.7835 0.5 1 1.2835 1 2.25V9.75C1 10.7165 1.7835 11.5 2.75 11.5H3.75H4.5V10H3.75H2.75C2.61193 10 2.5 9.88807 2.5 9.75V2.25C2.5 2.11193 2.61193 2 2.75 2H8.25C8.38807 2 8.5 2.11193 8.5 2.25V3H10V2.25C10 1.2835 9.2165 0.5 8.25 0.5H2.75ZM7.75 4.5C6.7835 4.5 6 5.2835 6 6.25V13.75C6 14.7165 6.7835 15.5 7.75 15.5H13.25C14.2165 15.5 15 14.7165 15 13.75V6.25C15 5.2835 14.2165 4.5 13.25 4.5H7.75ZM7.5 6.25C7.5 6.11193 7.61193 6 7.75 6H13.25C13.3881 6 13.5 6.11193 13.5 6.25V13.75C13.5 13.8881 13.3881 14 13.25 14H7.75C7.61193 14 7.5 13.8881 7.5 13.75V6.25Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),
  DownloadIcon: (props) => (
    <svg {...iconSvgProps(props)}>
      <path
        clipRule="evenodd"
        d="M8.75 1V1.75V8.68934L10.7197 6.71967L11.25 6.18934L12.3107 7.25L11.7803 7.78033L8.70711 10.8536C8.31658 11.2441 7.68342 11.2441 7.29289 10.8536L4.21967 7.78033L3.68934 7.25L4.75 6.18934L5.28033 6.71967L7.25 8.68934V1.75V1H8.75ZM13.5 9.25V13.5H2.5V9.25V8.5H1V9.25V14C1 14.5523 1.44771 15 2 15H14C14.5523 15 15 14.5523 15 14V9.25V8.5H13.5V9.25Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),
  ExternalLinkIcon: (props) => (
    <svg {...iconSvgProps(props)}>
      <path
        clipRule="evenodd"
        d="M13.5 10.25V13.25C13.5 13.3881 13.3881 13.5 13.25 13.5H2.75C2.61193 13.5 2.5 13.3881 2.5 13.25L2.5 2.75C2.5 2.61193 2.61193 2.5 2.75 2.5H5.75H6.5V1H5.75H2.75C1.7835 1 1 1.7835 1 2.75V13.25C1 14.2165 1.7835 15 2.75 15H13.25C14.2165 15 15 14.2165 15 13.25V10.25V9.5H13.5V10.25ZM9 1H9.75H14.2495C14.6637 1 14.9995 1.33579 14.9995 1.75V6.25V7H13.4995V6.25V3.56066L8.53033 8.52978L8 9.06011L6.93934 7.99945L7.46967 7.46912L12.4388 2.5H9.75H9V1Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),
  Loader2Icon: (props) => (
    <svg {...iconSvgProps(props)}>
      <path d="M8 0V4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 16V12" opacity="0.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.29773 1.52783L5.64887 4.7639" opacity="0.9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12.7023 1.52783L10.3511 4.7639" opacity="0.1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12.7023 14.472L10.3511 11.236" opacity="0.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.29773 14.472L5.64887 11.236" opacity="0.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15.6085 5.52783L11.8043 6.7639" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M0.391602 10.472L4.19583 9.23598" opacity="0.7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15.6085 10.4722L11.8043 9.2361" opacity="0.3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M0.391602 5.52783L4.19583 6.7639" opacity="0.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Maximize2Icon: (props) => (
    <svg {...iconSvgProps(props)}>
      <path
        clipRule="evenodd"
        d="M1 5.25V6H2.5V5.25V2.5H5.25H6V1H5.25H2C1.44772 1 1 1.44772 1 2V5.25ZM5.25 14.9994H6V13.4994H5.25H2.5V10.7494V9.99939H1V10.7494V13.9994C1 14.5517 1.44772 14.9994 2 14.9994H5.25ZM15 10V10.75V14C15 14.5523 14.5523 15 14 15H10.75H10V13.5H10.75H13.5V10.75V10H15ZM10.75 1H10V2.5H10.75H13.5V5.25V6H15V5.25V2C15 1.44772 14.5523 1 14 1H10.75Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),
  RotateCcwIcon: (props) => (
    <svg {...iconSvgProps(props)}>
      <path
        clipRule="evenodd"
        d="M13.5 8C13.5 4.96643 11.0257 2.5 7.96452 2.5C5.42843 2.5 3.29365 4.19393 2.63724 6.5H5.25H6V8H5.25H0.75C0.335787 8 0 7.66421 0 7.25V2.75V2H1.5V2.75V5.23347C2.57851 2.74164 5.06835 1 7.96452 1C11.8461 1 15 4.13001 15 8C15 11.87 11.8461 15 7.96452 15C5.62368 15 3.54872 13.8617 2.27046 12.1122L1.828 11.5066L3.03915 10.6217L3.48161 11.2273C4.48831 12.6051 6.12055 13.5 7.96452 13.5C11.0257 13.5 13.5 11.0336 13.5 8Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),
  XIcon: (props) => (
    <svg {...iconSvgProps(props)}>
      <path
        clipRule="evenodd"
        d="M12.4697 13.5303L13 14.0607L14.0607 13L13.5303 12.4697L9.06065 7.99999L13.5303 3.53032L14.0607 2.99999L13 1.93933L12.4697 2.46966L7.99999 6.93933L3.53032 2.46966L2.99999 1.93933L1.93933 2.99999L2.46966 3.53032L6.93933 7.99999L2.46966 12.4697L1.93933 13L2.99999 14.0607L3.53032 13.5303L7.99999 9.06065L12.4697 13.5303Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),
  ZoomInIcon: (props) => (
    <svg {...iconSvgProps(props)}>
      <path
        clipRule="evenodd"
        d="M1.5 6.5C1.5 3.73858 3.73858 1.5 6.5 1.5C9.26142 1.5 11.5 3.73858 11.5 6.5C11.5 9.26142 9.26142 11.5 6.5 11.5C3.73858 11.5 1.5 9.26142 1.5 6.5ZM6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13C8.02469 13 9.42677 12.475 10.5353 11.596L13.9697 15.0303L14.5 15.5607L15.5607 14.5L15.0303 13.9697L11.596 10.5353C12.475 9.42677 13 8.02469 13 6.5C13 2.91015 10.0899 0 6.5 0ZM4.125 5.875H4.75H5.875V4.75V4.125H7.125V4.75V5.875H8.25H8.875V7.125H8.25H7.125V8.25V8.875H5.875V8.25V7.125H4.75H4.125V5.875Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),
  ZoomOutIcon: (props) => (
    <svg {...iconSvgProps(props)}>
      <path
        clipRule="evenodd"
        d="M1.5 6.5C1.5 3.73858 3.73858 1.5 6.5 1.5C9.26142 1.5 11.5 3.73858 11.5 6.5C11.5 9.26142 9.26142 11.5 6.5 11.5C3.73858 11.5 1.5 9.26142 1.5 6.5ZM6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13C8.02469 13 9.42677 12.475 10.5353 11.596L13.9697 15.0303L14.5 15.5607L15.5607 14.5L15.0303 13.9697L11.596 10.5353C12.475 9.42677 13 8.02469 13 6.5C13 2.91015 10.0899 0 6.5 0ZM4.125 5.875H4.75H8.25H8.875V7.125H8.25H4.75V5.875Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),
};

/* ============================================================================
 * 9. 图标上下文（原 Rv/zv/Bv/Vv，js 18934-18949）
 * ==========================================================================*/

export const StreamdownIconsContext = React.createContext<Record<string, StreamdownIcon>>(DEFAULT_STREAMDOWN_ICONS);

/** 原 zv：图标表浅比较（provider 用来决定是否重建合并表） */
const iconsAreEqual = (
  a: Record<string, StreamdownIcon> | undefined,
  b: Record<string, StreamdownIcon> | undefined,
): boolean => {
  if (a === b) return true;
  if (!a || !b) return a === b;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  return keysA.length === keysB.length ? keysA.every((key) => a[key] === b[key]) : false;
};

/** 原 Bv：图标 Provider —— 用户图标与默认图标合并 */
export const StreamdownIconsProvider: React.FC<{
  icons?: Record<string, StreamdownIcon>;
  children: React.ReactNode;
}> = ({ icons, children }) => {
  const previousIcons = React.useRef(icons);
  const mergedIcons = React.useRef(icons ? { ...DEFAULT_STREAMDOWN_ICONS, ...icons } : DEFAULT_STREAMDOWN_ICONS);
  if (!iconsAreEqual(previousIcons.current, icons)) {
    previousIcons.current = icons;
    mergedIcons.current = icons ? { ...DEFAULT_STREAMDOWN_ICONS, ...icons } : DEFAULT_STREAMDOWN_ICONS;
  }
  return <StreamdownIconsContext.Provider value={mergedIcons.current}>{children}</StreamdownIconsContext.Provider>;
};

export const useStreamdownIcons = (): Record<string, StreamdownIcon> => React.useContext(StreamdownIconsContext);

/* ============================================================================
 * 10. 默认文案（原 Hv，js 18950-18981）与文案上下文（Uv/Wv，18950/18982）
 *     30 条，英文原文逐字保留；ZCode 侧可经 Streamdown 的 translations
 *     prop 覆盖（Streamdown 组件内做 {...默认, ...覆盖} 合并）。
 * ==========================================================================*/

export interface StreamdownTranslations {
  copyCode: string;
  downloadFile: string;
  downloadDiagram: string;
  downloadDiagramAsSvg: string;
  downloadDiagramAsPng: string;
  downloadDiagramAsMmd: string;
  viewFullscreen: string;
  exitFullscreen: string;
  mermaidFormatSvg: string;
  mermaidFormatPng: string;
  mermaidFormatMmd: string;
  copyTable: string;
  copyTableAsMarkdown: string;
  copyTableAsCsv: string;
  copyTableAsTsv: string;
  downloadTable: string;
  downloadTableAsCsv: string;
  downloadTableAsMarkdown: string;
  tableFormatMarkdown: string;
  tableFormatCsv: string;
  tableFormatTsv: string;
  imageNotAvailable: string;
  downloadImage: string;
  openExternalLink: string;
  externalLinkWarning: string;
  close: string;
  copyLink: string;
  copied: string;
  openLink: string;
}

export const DEFAULT_STREAMDOWN_TRANSLATIONS: StreamdownTranslations = {
  copyCode: `Copy Code`,
  downloadFile: `Download file`,
  downloadDiagram: `Download diagram`,
  downloadDiagramAsSvg: `Download diagram as SVG`,
  downloadDiagramAsPng: `Download diagram as PNG`,
  downloadDiagramAsMmd: `Download diagram as MMD`,
  viewFullscreen: `View fullscreen`,
  exitFullscreen: `Exit fullscreen`,
  mermaidFormatSvg: `SVG`,
  mermaidFormatPng: `PNG`,
  mermaidFormatMmd: `MMD`,
  copyTable: `Copy table`,
  copyTableAsMarkdown: `Copy table as Markdown`,
  copyTableAsCsv: `Copy table as CSV`,
  copyTableAsTsv: `Copy table as TSV`,
  downloadTable: `Download table`,
  downloadTableAsCsv: `Download table as CSV`,
  downloadTableAsMarkdown: `Download table as Markdown`,
  tableFormatMarkdown: `Markdown`,
  tableFormatCsv: `CSV`,
  tableFormatTsv: `TSV`,
  imageNotAvailable: `Image not available`,
  downloadImage: `Download image`,
  openExternalLink: `Open external link?`,
  externalLinkWarning: `You're about to visit an external website.`,
  close: `Close`,
  copyLink: `Copy link`,
  copied: `Copied`,
  openLink: `Open link`,
};

export const StreamdownTranslationsContext = React.createContext<StreamdownTranslations>(DEFAULT_STREAMDOWN_TRANSLATIONS);
export const useStreamdownTranslations = (): StreamdownTranslations => React.useContext(StreamdownTranslationsContext);

/* ============================================================================
 * 11. 流式光标符号（原 qb，js 21173）
 *     Streamdown 的 caret prop 选 `block`/`circle`，经 CSS 变量
 *     --streamdown-caret 追加到末块之后。
 * ==========================================================================*/

export const STREAMDOWN_CARET_SYMBOLS: Record<"block" | "circle", string> = { block: ` ▋`, circle: ` ●` };
