/* eslint-disable */
/**
 * ============================================================================
 * MarkdownElements.tsx — ZCode 3.7.6 markdown 渲染层 · 元素渲染器族
 * （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（21,756 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js
 * 对照 jsx：src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx
 * 定性：streamdown@2.5.0 first-party 层 —— hast-util-to-jsx-runtime 的
 *      `components` 映射表（26 个标签覆盖），全部元素组件带
 *      `data-streamdown` 标记与 memo（比较 = className + mdast 位置）。
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名（js 行 / jsx 行；displayName 为上游原名）
 * ----------------------------------------------------------------------------
 *   Sy → nodesHaveEqualPosition  mdast position 相等 (20290 / 16521)
 *   $  → memoPropsAreEqual      className + position (20301 / 16534)
 *   Cy → resolveControlFlag     布尔或按族细分的控件开关解析 (20304 / 16537)
 *   wy → resolveTableControl    controls.table.{copy|download|fullscreen} (20305 / 16538)
 *   Ty → resolveCodeControl     controls.code.{download|copy} (20310 / 16543)
 *   Ey → resolveMermaidControl  controls.mermaid.{download|copy|fullscreen|panZoom} (20315 / 16548)
 *   Dy → MarkdownOl    (20320 / 16549)   Oy → MarkdownLi (20331 / 16556)
 *   ky → MarkdownUl    (20342 / 16562)   Ay → MarkdownHr (20353 / 16568)
 *   jy → MarkdownStrong(20363 / 16574)   My → MarkdownA  → 见 MarkdownLink.tsx
 *   Ny…Ry → MarkdownH1…H6 (20430-20496 / 16590-16625)
 *   zy → MarkdownTable (20512 / 16631)   By → MarkdownThead (20523 / 16643)
 *   Vy → MarkdownTbody (20534 / 16649)   Hy → MarkdownTr (20545 / 16655)
 *   Uy → MarkdownTh    (20556 / 16661)   Wy → MarkdownTd (20567 / 16667)
 *   Gy → MarkdownBlockquote (20581 / 16673)
 *   Ky → MarkdownSup (20592 / 16682)     qy → MarkdownSub (20603 / 16688)
 *   Jy → MarkdownSection（data-footnotes 空节过滤）(20653 / 16694)
 *   Yy → MarkdownCode（inline/block/mermaid/自定义渲染器 四分派）(20660 / 16780)
 *   Xy → MarkdownImg（加载失败降级 + 悬停下载）(20763 / 16833)
 *   Zy → MarkdownParagraph（单图/单代码块透传，不包 <p>）(20765 / 16843)
 *   Qy → STREAMDOWN_COMPONENTS  标签→组件映射表 (20778 / 16856)
 *   $y/eb → RTL/字母探测正则 (20809 / 16888)
 *   tb → detectTextDirection（上游导出 u）(20809 / 16890)
 *   vy → START_LINE_REGEX /startLine=(\d+)/ (20280 / 16515)
 *   yy → NO_LINE_NUMBERS_REGEX /\bnoLineNumbers\b/ (20281 / 16516)
 *   xy → LANGUAGE_CLASS_REGEX /language-([^\s]+)/ (20289 / 16520)
 * ============================================================================
 */

import * as React from "react";
import {
  StreamdownContext,
  useClassNames,
  useIsStreaming,
  useCustomBlockRenderer,
  useMermaidPlugin,
  useStreamdownIcons,
  useStreamdownTranslations,
  type ControlsOptions,
  type HastNodeLike,
} from "./MarkdownContext";
import { MarkdownA } from "./MarkdownLink";
import { TableWrapper } from "./MarkdownTable";
import {
  CodeBlock,
  CodeBlockCopyButton,
  CodeBlockDownloadButton,
  CodeBlockSkeleton,
} from "./MarkdownCodeBlock";
import { LazyMermaid, MermaidDownloadDropdown, MermaidFullscreenButton } from "./MarkdownMermaid";

/* ============================================================================
 * 0. 元素组件公共类型
 * ==========================================================================*/

export interface MarkdownElementProps {
  children?: React.ReactNode;
  className?: string;
  /** hast-util-to-jsx-runtime passNode 注入的 hast 节点 */
  node?: HastNodeLike & { properties?: Record<string, unknown>; tagName?: string };
  [prop: string]: unknown;
}

/* ============================================================================
 * 1. memo 比较器（原 Sy/$，js 20290-20303）
 *    mdast/hast 位置相同 ⇒ 同一节点（流式重解析时复用渲染）。
 * ==========================================================================*/

export function nodesHaveEqualPosition(a?: HastNodeLike, b?: HastNodeLike): boolean {
  if (!(a?.position || b?.position)) return true;
  if (!a?.position || !b?.position) return false;
  const startA = a.position.start;
  const startB = b.position.start;
  const endA = a.position.end;
  const endB = b.position.end;
  return startA?.line === startB?.line && startA?.column === startB?.column && endA?.line === endB?.line && endA?.column === endB?.column;
}

export function memoPropsAreEqual(prev: MarkdownElementProps, next: MarkdownElementProps): boolean {
  return prev.className === next.className && nodesHaveEqualPosition(prev.node, next.node);
}

/* ============================================================================
 * 2. 控件开关解析（原 Cy/wy/Ty/Ey，js 20304-20319）
 *    controls 可以是布尔总开关，也可以按 table/code/mermaid 细分到动作。
 * ==========================================================================*/

type ControlSection = boolean | Record<string, boolean | undefined> | undefined;

export const resolveControlFlag = (controls: ControlSection, key: string): boolean =>
  typeof controls === `boolean` ? controls : controls?.[key] !== false;

export const resolveTableControl = (controls: ControlsOptions | boolean, key: string): boolean => {
  if (typeof controls === `boolean`) return controls;
  const table = controls.table;
  return table === false ? false : table === true || table === void 0 ? true : (table as Record<string, boolean | undefined>)[key] !== false;
};

export const resolveCodeControl = (controls: ControlsOptions | boolean, key: string): boolean => {
  if (typeof controls === `boolean`) return controls;
  const code = controls.code;
  return code === false ? false : code === true || code === void 0 ? true : (code as Record<string, boolean | undefined>)[key] !== false;
};

export const resolveMermaidControl = (controls: ControlsOptions | boolean, key: string): boolean => {
  if (typeof controls === `boolean`) return controls;
  const mermaid = controls.mermaid;
  return mermaid === false ? false : mermaid === true || mermaid === void 0 ? true : (mermaid as Record<string, boolean | undefined>)[key] !== false;
};

/* ============================================================================
 * 3. 列表 / 分隔线 / 强调（原 Dy/Oy/ky/Ay/jy）
 * ==========================================================================*/

export const MarkdownOl = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <ol
      className={useClassNames()(`list-inside list-decimal whitespace-normal [li_&]:pl-6`, className)}
      data-streamdown="ordered-list"
      {...rest}
    >
      {children}
    </ol>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownOl.displayName = `MarkdownOl`;

export const MarkdownLi = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <li className={useClassNames()(`py-1 [&>p]:inline`, className)} data-streamdown="list-item" {...rest}>
      {children}
    </li>
  ),
  (prev, next) => prev.className === next.className && nodesHaveEqualPosition(prev.node, next.node),
);
MarkdownLi.displayName = `MarkdownLi`;

export const MarkdownUl = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <ul
      className={useClassNames()(`list-inside list-disc whitespace-normal [li_&]:pl-6`, className)}
      data-streamdown="unordered-list"
      {...rest}
    >
      {children}
    </ul>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownUl.displayName = `MarkdownUl`;

export const MarkdownHr = React.memo(
  ({ className, node, ...rest }: MarkdownElementProps) => (
    <hr className={useClassNames()(`my-6 border-border`, className)} data-streamdown="horizontal-rule" {...rest} />
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownHr.displayName = `MarkdownHr`;

export const MarkdownStrong = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <span className={useClassNames()(`font-semibold`, className)} data-streamdown="strong" {...rest}>
      {children}
    </span>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownStrong.displayName = `MarkdownStrong`;

/* ============================================================================
 * 4. 标题 H1-H6（原 Ny/Py/Fy/Iy/Ly/Ry；mt-6 mb-2 + 递减字号）
 * ==========================================================================*/

export const MarkdownH1 = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <h1 className={useClassNames()(`mt-6 mb-2 font-semibold text-3xl`, className)} data-streamdown="heading-1" {...rest}>
      {children}
    </h1>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownH1.displayName = `MarkdownH1`;

export const MarkdownH2 = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <h2 className={useClassNames()(`mt-6 mb-2 font-semibold text-2xl`, className)} data-streamdown="heading-2" {...rest}>
      {children}
    </h2>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownH2.displayName = `MarkdownH2`;

export const MarkdownH3 = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <h3 className={useClassNames()(`mt-6 mb-2 font-semibold text-xl`, className)} data-streamdown="heading-3" {...rest}>
      {children}
    </h3>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownH3.displayName = `MarkdownH3`;

export const MarkdownH4 = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <h4 className={useClassNames()(`mt-6 mb-2 font-semibold text-lg`, className)} data-streamdown="heading-4" {...rest}>
      {children}
    </h4>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownH4.displayName = `MarkdownH4`;

export const MarkdownH5 = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <h5 className={useClassNames()(`mt-6 mb-2 font-semibold text-base`, className)} data-streamdown="heading-5" {...rest}>
      {children}
    </h5>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownH5.displayName = `MarkdownH5`;

export const MarkdownH6 = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <h6 className={useClassNames()(`mt-6 mb-2 font-semibold text-sm`, className)} data-streamdown="heading-6" {...rest}>
      {children}
    </h6>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownH6.displayName = `MarkdownH6`;

/* ============================================================================
 * 5. 表格族（原 zy/By/Vy/Hy/Uy/Wy；外壳 = TableWrapper）
 * ==========================================================================*/

export const MarkdownTable = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => {
    const { controls } = React.useContext(StreamdownContext);
    return (
      <TableWrapper
        className={className}
        // 原实现：showControls = Cy(controls, 'table')（总开关或 table 段非 false）
        showControls={resolveControlFlag(controls as unknown as ControlSection, `table`)}
        showCopy={resolveTableControl(controls, `copy`)}
        showDownload={resolveTableControl(controls, `download`)}
        showFullscreen={resolveTableControl(controls, `fullscreen`)}
        {...rest}
      >
        {children}
      </TableWrapper>
    );
  },
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownTable.displayName = `MarkdownTable`;

export const MarkdownThead = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <thead className={useClassNames()(`bg-muted/80`, className)} data-streamdown="table-header" {...rest}>
      {children}
    </thead>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownThead.displayName = `MarkdownThead`;

export const MarkdownTbody = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <tbody className={useClassNames()(`divide-y divide-border`, className)} data-streamdown="table-body" {...rest}>
      {children}
    </tbody>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownTbody.displayName = `MarkdownTbody`;

export const MarkdownTr = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <tr className={useClassNames()(`border-border`, className)} data-streamdown="table-row" {...rest}>
      {children}
    </tr>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownTr.displayName = `MarkdownTr`;

export const MarkdownTh = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <th
      className={useClassNames()(`whitespace-nowrap px-4 py-2 text-left font-semibold text-sm`, className)}
      data-streamdown="table-header-cell"
      {...rest}
    >
      {children}
    </th>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownTh.displayName = `MarkdownTh`;

export const MarkdownTd = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <td className={useClassNames()(`px-4 py-2 text-sm`, className)} data-streamdown="table-cell" {...rest}>
      {children}
    </td>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownTd.displayName = `MarkdownTd`;

/* ============================================================================
 * 6. 引用 / 上下标 / section（原 Gy/Ky/qy/Jy）
 * ==========================================================================*/

export const MarkdownBlockquote = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <blockquote
      className={useClassNames()(`my-4 border-muted-foreground/30 border-l-4 pl-4 text-muted-foreground italic`, className)}
      data-streamdown="blockquote"
      {...rest}
    >
      {children}
    </blockquote>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownBlockquote.displayName = `MarkdownBlockquote`;

export const MarkdownSup = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <sup className={useClassNames()(`text-sm`, className)} data-streamdown="superscript" {...rest}>
      {children}
    </sup>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownSup.displayName = `MarkdownSup`;

export const MarkdownSub = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => (
    <sub className={useClassNames()(`text-sm`, className)} data-streamdown="subscript" {...rest}>
      {children}
    </sub>
  ),
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownSub.displayName = `MarkdownSub`;

/**
 * 原 Jy：section（脚注区）。data-footnotes 节会剔除「只剩回链箭头」的
 * 空脚注项（子元素仅含 data-footnote-backref 而无正文）；全部为空则整节不渲染。
 */
export const MarkdownSection = React.memo(
  ({ children, className, node, ...rest }: MarkdownElementProps) => {
    if (`data-footnotes` in rest) {
      // 判定一个脚注项是否「只剩回链箭头」：有 data-footnote-backref 子元素且无任何正文
      const isOnlyBackref = (candidate: React.ReactNode): boolean => {
        if (!React.isValidElement(candidate)) return false;
        const elementProps = candidate.props as { children?: React.ReactNode };
        const elementChildren = Array.isArray(elementProps.children) ? elementProps.children : [elementProps.children];
        let hasText = false;
        let hasBackref = false;
        for (const child of elementChildren)
          if (child) {
            if (typeof child === `string`) {
              if (child.trim() !== ``) hasText = true;
            } else if (React.isValidElement(child)) {
              const childProps = child.props as Record<string, unknown>;
              if (childProps?.[`data-footnote-backref`] !== undefined) hasBackref = true;
              else {
                const grandchildren = Array.isArray(childProps.children) ? (childProps.children as React.ReactNode[]) : [childProps.children as React.ReactNode];
                for (const grandchild of grandchildren) {
                  if (typeof grandchild === `string` && grandchild.trim() !== ``) {
                    hasText = true;
                    break;
                  }
                  if (React.isValidElement(grandchild) && (grandchild.props as Record<string, unknown>)?.[`data-footnote-backref`] === undefined) {
                    hasText = true;
                    break;
                  }
                }
              }
            }
          }
        return hasBackref && !hasText;
      };
      const filteredChildren = Array.isArray(children)
        ? (children as React.ReactNode[]).map((child) => {
            if (!React.isValidElement(child)) return child;
            if (child.type === MarkdownOl) {
              const listProps = child.props as { children?: React.ReactNode };
              const listChildren = (Array.isArray(listProps.children) ? listProps.children : [listProps.children]).filter(
                (item: React.ReactNode) => !isOnlyBackref(item),
              );
              return listChildren.length === 0 ? null : { ...child, props: { ...listProps, children: listChildren } };
            }
            return child;
          })
        : children;
      return (Array.isArray(filteredChildren) ? filteredChildren.some((child) => child !== null) : filteredChildren !== null) ? (
        <section className={className} {...rest}>
          {filteredChildren}
        </section>
      ) : null;
    }
    return (
      <section className={className} {...rest}>
        {children}
      </section>
    );
  },
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownSection.displayName = `MarkdownSection`;

/* ============================================================================
 * 7. MarkdownCode（原 Yy，js 20660-20762 / jsx 16780；displayName=MarkdownCode）
 * ----------------------------------------------------------------------------
 * 四分派：
 *  1) 无 data-block（pre 未标记）→ 行内代码（rounded bg-muted 小胶囊）；
 *  2) 语言命中 plugins.renderers → 自定义块渲染器（Suspense + 骨架）；
 *  3) 语言 = mermaid 且有 mermaid 插件 → mermaid 块（语言条 + 动作条
 *     [下载|复制|全屏] + LazyMermaid，data-streamdown=mermaid-block）；
 *  4) 其余 → CodeBlock（语言条 + [下载|复制] + shiki 正文）。
 * meta 解析：startLine=(\d+) 起始行；\bnoLineNumbers\b 关闭行号。
 * ==========================================================================*/

const START_LINE_REGEX = /startLine=(\d+)/; // 原 vy
const NO_LINE_NUMBERS_REGEX = /\bnoLineNumbers\b/; // 原 yy
export const LANGUAGE_CLASS_REGEX = /language-([^\s]+)/; // 原 xy

export const MarkdownCode = React.memo(
  ({ node, className, children, ...rest }: MarkdownElementProps) => {
    const cn = useClassNames();
    const isBlock = `data-block` in rest; // pre 克隆时注入的块级标记
    const { mermaid: mermaidOptions, controls, lineNumbers } = React.useContext(StreamdownContext);
    const mermaidPlugin = useMermaidPlugin();
    const isIncomplete = useIsStreaming();
    const language = className?.match(LANGUAGE_CLASS_REGEX)?.at(1) ?? ``;
    const customRenderer = useCustomBlockRenderer(language);
    // 1) 行内代码
    if (!isBlock)
      return (
        <code className={cn(`rounded bg-muted px-1.5 py-0.5 font-mono text-sm`, className)} data-streamdown="inline-code" {...rest}>
          {children}
        </code>
      );
    const metastring = node?.properties?.metastring as string | undefined;
    const startLineMatch = metastring?.match(START_LINE_REGEX);
    const parsedStartLine = startLineMatch ? Number.parseInt(startLineMatch[1], 10) : undefined;
    const startLine = parsedStartLine !== undefined && parsedStartLine >= 1 ? parsedStartLine : undefined;
    const showLineNumbers = !(metastring && NO_LINE_NUMBERS_REGEX.test(metastring)) && lineNumbers !== false;
    // 代码文本：从单个字符串子元素或 children 本身提取
    let code = ``;
    if (
      React.isValidElement(children) &&
      children.props &&
      typeof children.props === `object` &&
      `children` in children.props &&
      typeof (children.props as { children?: unknown }).children === `string`
    )
      code = (children.props as { children: string }).children;
    else if (typeof children === `string`) code = children;
    // 2) 自定义渲染器
    if (customRenderer) {
      const CustomComponent = customRenderer.component;
      return (
        <React.Suspense fallback={<CodeBlockSkeleton />}>
          <CustomComponent code={code} isIncomplete={isIncomplete} language={language} meta={metastring} />
        </React.Suspense>
      );
    }
    // 3) mermaid 块
    if (language === `mermaid` && mermaidPlugin) {
      // 原实现：Cy(controls, 'mermaid') —— 总开关或 mermaid 段非 false
      const mermaidControlsEnabled = resolveControlFlag(controls as unknown as ControlSection, `mermaid`);
      const showDownload = resolveMermaidControl(controls, `download`);
      const showCopy = resolveMermaidControl(controls, `copy`);
      const showFullscreen = resolveMermaidControl(controls, `fullscreen`);
      const showPanZoom = resolveMermaidControl(controls, `panZoom`);
      const hasActions = mermaidControlsEnabled && (showDownload || showCopy || showFullscreen);
      return (
        <React.Suspense fallback={<CodeBlockSkeleton />}>
          <div
            className={cn(`group relative my-4 flex w-full flex-col gap-2 rounded-xl border border-border bg-sidebar p-2`, className)}
            data-streamdown="mermaid-block"
          >
            <div className={cn(`flex h-8 items-center text-muted-foreground text-xs`)}>
              <span className={cn(`ml-1 font-mono lowercase`)}>{`mermaid`}</span>
            </div>
            {hasActions ? (
              <div className={cn(`pointer-events-none sticky top-2 z-10 -mt-10 flex h-8 items-center justify-end`)}>
                <div
                  className={cn(
                    `pointer-events-auto flex shrink-0 items-center gap-2 rounded-md border border-sidebar bg-sidebar/80 px-1.5 py-1 supports-[backdrop-filter]:bg-sidebar/70 supports-[backdrop-filter]:backdrop-blur`,
                  )}
                  data-streamdown="mermaid-block-actions"
                >
                  {showDownload ? <MermaidDownloadDropdown chart={code} config={mermaidOptions?.config} /> : null}
                  {showCopy ? <CodeBlockCopyButton code={code} /> : null}
                  {showFullscreen ? <MermaidFullscreenButton chart={code} config={mermaidOptions?.config} /> : null}
                </div>
              </div>
            ) : null}
            <div className={cn(`rounded-md border border-border bg-background`)}>
              <LazyMermaid chart={code} config={mermaidOptions?.config} showControls={showPanZoom} />
            </div>
          </div>
        </React.Suspense>
      );
    }
    // 4) 普通代码块（原实现：Cy(controls, 'code')）
    const codeControlsEnabled = resolveControlFlag(controls as unknown as ControlSection, `code`);
    const showCodeDownload = resolveCodeControl(controls, `download`);
    const showCodeCopy = resolveCodeControl(controls, `copy`);
    return (
      <CodeBlock
        className={className}
        code={code}
        isIncomplete={isIncomplete}
        language={language}
        lineNumbers={showLineNumbers}
        startLine={startLine}
      >
        {codeControlsEnabled ? (
          <>
            {showCodeDownload ? <CodeBlockDownloadButton code={code} language={language} /> : null}
            {showCodeCopy ? <CodeBlockCopyButton /> : null}
          </>
        ) : null}
      </CodeBlock>
    );
  },
  (prev, next) => prev.className === next.className && nodesHaveEqualPosition(prev.node, next.node),
);
MarkdownCode.displayName = `MarkdownCode`;

/* ============================================================================
 * 8. MarkdownImg（原 Xv/Xy，js 19383+20763 / jsx 16003+16833）
 *    加载失败 → 斜体占位文案；成功（或显式宽高）→ 悬停显示下载按钮
 *    （fetch→blob，按 URL 扩展名或 MIME 推断文件名；失败退化为新窗口打开）。
 * ==========================================================================*/

const IMAGE_EXTENSION_REGEX = /\.[^/.]+$/; // 原 Yv

export interface MarkdownImgProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  node?: HastNodeLike;
  className?: string;
  src?: string;
  alt?: string;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onError?: React.ReactEventHandler<HTMLImageElement>;
}

const MarkdownImgBase: React.FC<MarkdownImgProps> = ({ node, className, src, alt, onLoad, onError, ...rest }) => {
  const { DownloadIcon } = useStreamdownIcons();
  const cn = useClassNames();
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const translations = useStreamdownTranslations();
  const hasExplicitSize = rest.width != null || rest.height != null;
  const showDownloadButton = (loaded || hasExplicitSize) && !failed;
  const showFallback = failed && !hasExplicitSize;
  React.useEffect(() => {
    const image = imageRef.current;
    if (image?.complete) {
      const wasLoaded = image.naturalWidth > 0;
      setLoaded(wasLoaded);
      setFailed(!wasLoaded);
    }
  }, []);
  const handleLoad = React.useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      setLoaded(true);
      setFailed(false);
      onLoad?.(event);
    },
    [onLoad],
  );
  const handleError = React.useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      setLoaded(false);
      setFailed(true);
      onError?.(event);
    },
    [onError],
  );
  const handleDownload = async () => {
    if (!src) return;
    try {
      const blob = await (await fetch(src)).blob();
      const urlFilename = new URL(src, window.location.origin).pathname.split(`/`).pop() || ``;
      const extension = urlFilename.split(`.`).pop();
      const hasExtension = urlFilename.includes(`.`) && extension !== undefined && extension.length <= 4;
      let filename = ``;
      if (hasExtension) filename = urlFilename;
      else {
        const mimeType = blob.type;
        let inferredExtension = `png`;
        if (mimeType.includes(`jpeg`) || mimeType.includes(`jpg`)) inferredExtension = `jpg`;
        else if (mimeType.includes(`png`)) inferredExtension = `png`;
        else if (mimeType.includes(`svg`)) inferredExtension = `svg`;
        else if (mimeType.includes(`gif`)) inferredExtension = `gif`;
        else if (mimeType.includes(`webp`)) inferredExtension = `webp`;
        filename = `${(alt || urlFilename || `image`).replace(IMAGE_EXTENSION_REGEX, ``)}.${inferredExtension}`;
      }
      // 复用 MarkdownContext 的下载工具（原实现内联了同一逻辑）
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement(`a`);
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(src, `_blank`);
    }
  };
  return src ? (
    <div className={cn(`group relative my-4 inline-block`)} data-streamdown="image-wrapper">
      <img
        alt={alt}
        className={cn(`max-w-full rounded-lg`, showFallback && `hidden`, className)}
        data-streamdown="image"
        onError={handleError}
        onLoad={handleLoad}
        ref={imageRef}
        src={src}
        {...rest}
      />
      {showFallback && (
        <span className={cn(`text-muted-foreground text-xs italic`)} data-streamdown="image-fallback">
          {translations.imageNotAvailable}
        </span>
      )}
      <div className={cn(`pointer-events-none absolute inset-0 hidden rounded-lg bg-black/10 group-hover:block`)} />
      {showDownloadButton && (
        <button
          className={cn(
            `absolute right-2 bottom-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border bg-background/90 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-background`,
            `opacity-0 group-hover:opacity-100`,
          )}
          onClick={handleDownload}
          title={translations.downloadImage}
          type="button"
        >
          <DownloadIcon size={14} />
        </button>
      )}
    </div>
  ) : null;
};

export const MarkdownImg = React.memo(MarkdownImgBase, (prev, next) => prev.className === next.className && nodesHaveEqualPosition(prev.node, next.node));
MarkdownImg.displayName = `MarkdownImg`;

/* ============================================================================
 * 9. MarkdownParagraph（原 Zy，js 20765 / jsx 16843）
 *    段落唯一子元素是图片或块级代码时直接透传（避免 <p> 包块元素的非法嵌套）。
 * ==========================================================================*/

export const MarkdownParagraph = React.memo(
  ({ children, node, ...rest }: MarkdownElementProps) => {
    const nonEmptyChildren = (Array.isArray(children) ? children : [children]).filter((child) => child != null && child !== ``);
    if (nonEmptyChildren.length === 1 && React.isValidElement(nonEmptyChildren[0])) {
      const onlyChild = nonEmptyChildren[0] as React.ReactElement<{ node?: { tagName?: string } }>;
      const childTagName = onlyChild.props.node?.tagName;
      if (childTagName === `img` || (childTagName === `code` && `data-block` in onlyChild.props)) return <>{children}</>;
    }
    return <p {...rest}>{children}</p>;
  },
  (prev, next) => memoPropsAreEqual(prev, next),
);
MarkdownParagraph.displayName = `MarkdownParagraph`;

/* ============================================================================
 * 10. pre 包装器 + 组件映射表（原 Qy，js 20778-20808 / jsx 16856）
 *     pre 不渲染自身样式，只给子元素（code）克隆注入 data-block 标记。
 * ==========================================================================*/

const MarkdownPre: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
  React.isValidElement(children) ? React.cloneElement(children as React.ReactElement, { "data-block": `true` }) : children;
/** 标签 → 组件映射表。值统一收敛为 ComponentType<never>（never 入参可接纳任意
 *  具体 props 的组件）；渲染端（MarkdownRenderer）按 hast-to-jsx-runtime 的
 *  调用约定以 passNode/passKeys 注入 props。 */
export type MarkdownComponentsMap = Record<string, React.ComponentType<never>>;

export const STREAMDOWN_COMPONENTS: MarkdownComponentsMap = {
  ol: MarkdownOl,
  li: MarkdownLi,
  ul: MarkdownUl,
  hr: MarkdownHr,
  strong: MarkdownStrong,
  a: MarkdownA,
  h1: MarkdownH1,
  h2: MarkdownH2,
  h3: MarkdownH3,
  h4: MarkdownH4,
  h5: MarkdownH5,
  h6: MarkdownH6,
  table: MarkdownTable,
  thead: MarkdownThead,
  tbody: MarkdownTbody,
  tr: MarkdownTr,
  th: MarkdownTh,
  td: MarkdownTd,
  blockquote: MarkdownBlockquote,
  code: MarkdownCode,
  img: MarkdownImg,
  // MarkdownPre 的 props 面较窄（仅 children），按映射表统一类型显式收敛
  pre: MarkdownPre as unknown as React.ComponentType<never>,
  sup: MarkdownSup,
  sub: MarkdownSub,
  p: MarkdownParagraph,
  section: MarkdownSection,
};

/* ============================================================================
 * 11. detectTextDirection（原 tb，js 20809-20821 / jsx 16890；上游导出 u）
 *     先剥 markdown 语法（标题/强调/行内代码/链接/列表前缀），再逐字符：
 *     命中 RTL 区段（希伯来/阿拉伯等）→ rtl；命中任意字母 → ltr；缺省 ltr。
 * ==========================================================================*/

const RTL_CHAR_REGEX = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/; // 原 $y
const ANY_LETTER_REGEX = /\p{L}/u; // 原 eb

export function detectTextDirection(markdown: string): "ltr" | "rtl" {
  const stripped = markdown
    .replace(/^#{1,6}\s+/gm, ``)
    .replace(/(\*{1,3}|_{1,3})/g, ``)
    .replace(/`[^`]*`/g, ``)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, `$1`)
    .replace(/^[\s>*\-+\d.]+/gm, ``);
  for (const char of stripped) {
    if (RTL_CHAR_REGEX.test(char)) return `rtl`;
    if (ANY_LETTER_REGEX.test(char)) return `ltr`;
  }
  return `ltr`;
}
