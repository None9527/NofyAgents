/* eslint-disable */
/**
 * ============================================================================
 * previewPaneOfficeDocxContent.tsx — ZCode 3.7.6 DOCX 预览面板
 * （解混淆重建 · D8 Stage B2 · Office 预览族）
 * ============================================================================
 *
 * 来源文件（9,354 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/previewPaneOfficeDocxContent-3JqWt7cf.js
 * 对照文件（同一 chunk 的 pretty-print 版，6,776 行）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/previewPaneOfficeDocxContent-3JqWt7cf.jsx
 *
 * ----------------------------------------------------------------------------
 * 〇、chunk 分段（vendor 段登记；行号 = jsx 行）
 * ----------------------------------------------------------------------------
 *  [V1] JSZip 3.10.1（vendor，CJS/UMD 包装）        jsx 6–3253
 *       `var s = n((t, n) => { … window.JSZip = e() … })`；版本证据
 *       `r.version = "3.10.1"`（jsx 373）。docx-preview 0.4.0 的上游依赖；
 *       内部为 browserify 风格模块图（入口 [10]）。与上游 jszip 3.10.1
 *       dist 等价，本重建不转录。
 *  [V2] docx-preview 0.4.0（vendor）                 jsx 3255–6677
 *       自 `u` RelationshipTypes 枚举（3255）起，经 XML 解析/样式继承/分页/
 *       渲染全部内部实现（单字母混淆函数群），至公开入口：
 *         xt → defaultOptions   (jsx 6636)
 *         St → parseAsync       (jsx 6655)  Je.load(data, new ut(opts), opts)
 *         Ct → render           (jsx 6666)  new yt().render(docx, opts)
 *         wt → renderAsync      (jsx 6671)  parse+render：STYLE 节点入
 *                                           styleContainer，其余入 bodyContainer
 *       版本证据：renderAsync 选项对象（renderChanges/renderComments/
 *       renderEndnotes/renderFooters/renderFootnotes/renderHeaders/
 *       useBase64URL）与上游 0.4.0 一致；参照安装 docx-preview=0.4.0。
 *       与上游 dist 等价，本重建不转录。
 *  [F1] first-party 包装层（本文件全量重建）          jsx 6679–6776
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（[F1] 段）
 * ----------------------------------------------------------------------------
 *   $  → jsxRuntime（jsx-runtime 的 t 导入别名）              (jsx 6679)
 *   Tt → DOCX_PREVIEW_OPTIONS   renderAsync 固定选项          (jsx 6680-6697)
 *   Et → DOCX_PAGE_SHADOW       页面卡片阴影                  (jsx 6698)
 *   Dt → docxPreviewClassCounter 唯一类名计数器               (jsx 6699)
 *   Ot → createDocxPreviewClassName `zcode-docx-preview-N`   (jsx 6700-6702)
 *   kt → isSameDocxFitMetrics   fit 结果防抖比较              (jsx 6703-6707)
 *   At → PreviewPaneOfficeDocxContent 根组件（导出名同名）    (jsx 6708-6776)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk）
 * ----------------------------------------------------------------------------
 *   1. react / jsx-runtime   react-BQLj9xdT.js (t→c) / jsx-runtime-B5yMD3-t.js (t→i)
 *   2. logger (a)            logger-PFDwl5Yq.js (t)
 *   3. computeOfficeFitMetrics (o)
 *                            officeFilePreview-DDCn9-xI.js (t 导出)：
 *                            {availableWidth, naturalHeight, naturalWidth} →
 *                            {scale: min(1, avail/naturalW), width, height} | null
 *   4. renderDocxAsync (wt)  本 chunk [V2] 段 docx-preview 0.4.0
 * ============================================================================
 */

import * as React from "react";
import { logger } from './SkillStore';

/* ============================================================================
 * 0. 外部依赖类型声明（真实实现位于上述 chunk；此处为重建接口）
 * ==========================================================================*/

/** 日志器（原 a，logger-PFDwl5Yq.js） */

/**
 * 办公室预览缩放计算（原 o，officeFilePreview-DDCn9-xI.js 的 t 导出）。
 * 保持宽高比缩到可用宽度，scale ≤ 1；任一输入非有限或 ≤0 → null。
 */
declare function computeOfficeFitMetrics(input: {
  availableWidth: number;
  naturalHeight: number;
  naturalWidth: number;
}): { scale: number; width: number; height: number } | null;

/** docx-preview 选项（原 xt 默认值 + Tt 覆盖项的并集类型） */
interface DocxPreviewOptions {
  breakPages?: boolean;
  debug?: boolean;
  experimental?: boolean;
  ignoreFonts?: boolean;
  ignoreHeight?: boolean;
  ignoreLastRenderedPageBreak?: boolean;
  ignoreWidth?: boolean;
  inWrapper?: boolean;
  renderAltChunks?: boolean;
  renderChanges?: boolean;
  renderComments?: boolean;
  renderEndnotes?: boolean;
  renderFooters?: boolean;
  renderFootnotes?: boolean;
  renderHeaders?: boolean;
  useBase64URL?: boolean;
  className?: string;
}

/**
 * docx-preview 0.4.0 renderAsync（原 wt，[V2] 段）。
 * STYLE 节点 → styleContainer，页面 DOM → bodyContainer。
 */
declare function renderDocxAsync(
  data: ArrayBuffer,
  bodyContainer: HTMLElement,
  styleContainer: HTMLElement | undefined,
  options: DocxPreviewOptions,
): Promise<unknown>;

/* ============================================================================
 * 1. 常量与助手（原 Tt/Et/Dt/Ot/kt）
 * ==========================================================================*/

/**
 * 传给 renderAsync 的固定选项（原 Tt）。
 * 要点：experimental 开、renderAltChunks 关、useBase64URL 开、
 * 页眉/页脚/脚注/尾注全渲染。
 */
const DOCX_PREVIEW_OPTIONS: DocxPreviewOptions = {
  breakPages: true,
  debug: false,
  experimental: true,
  ignoreFonts: false,
  ignoreHeight: false,
  ignoreLastRenderedPageBreak: true,
  ignoreWidth: false,
  inWrapper: true,
  renderAltChunks: false,
  renderChanges: false,
  renderComments: false,
  renderEndnotes: true,
  renderFooters: true,
  renderFootnotes: true,
  renderHeaders: true,
  useBase64URL: true,
};

/** 页面卡片阴影（原 Et） */
const DOCX_PAGE_SHADOW = `0 2px 10px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.05)`;

/** 唯一类名计数器（原 Dt） */
let docxPreviewClassCounter = 0;

/** 生成唯一预览类名（原 Ot）：`zcode-docx-preview-1`、`-2`…（隔离多实例样式） */
function createDocxPreviewClassName(): string {
  docxPreviewClassCounter += 1;
  return `zcode-docx-preview-${docxPreviewClassCounter}`;
}

/** fit 结果防抖比较（原 kt）：scale 差 <0.001 且宽高差 <0.5px 视为相同 */
function isSameDocxFitMetrics(
  prev: { scale: number; width: number; height: number } | null,
  next: { scale: number; width: number; height: number },
): boolean {
  return (
    prev !== null &&
    Math.abs(prev.scale - next.scale) < 0.001 &&
    Math.abs(prev.width - next.width) < 0.5 &&
    Math.abs(prev.height - next.height) < 0.5
  );
}

type DocxPreviewStatus = `loading` | `ready` | `error`;

/* ============================================================================
 * 2. PreviewPaneOfficeDocxContent（原 At，jsx 6708-6776；chunk 唯一导出）
 * ==========================================================================*/

export function PreviewPaneOfficeDocxContent({
  buffer,
  errorMessage,
  sourcePath,
}: {
  buffer: ArrayBuffer;
  errorMessage: string;
  sourcePath: string;
}) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const mountRef = React.useRef<HTMLDivElement>(null);
  const [previewClassName] = React.useState(createDocxPreviewClassName);
  const [fit, setFit] = React.useState<{ scale: number; width: number; height: number } | null>(null);
  const [status, setStatus] = React.useState<DocxPreviewStatus>(`loading`);

  /** 测量自然尺寸 → 计算 fit（原 m，jsx 6716-6731） */
  const syncFit = React.useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content || status !== `ready`) return;
    const next = computeOfficeFitMetrics({
      availableWidth: viewport.clientWidth,
      naturalHeight: content.offsetHeight,
      naturalWidth: content.offsetWidth,
    });
    next &&
      setFit((prev) =>
        isSameDocxFitMetrics(prev, next)
          ? prev
          : (logger.debug(`[PreviewPane] DOCX 预览宽度已同步`, {
              path: sourcePath,
              availableWidth: viewport.clientWidth,
              naturalWidth: content.offsetWidth,
              scale: next.scale,
            }),
            next),
      );
  }, [status, sourcePath]);

  /* --- docx-preview 渲染管线（原 useEffect，jsx 6732-6758） --- */
  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let active = true;
    const className = previewClassName;
    const rootHost = document.createElement(`div`);
    const stylesHost = document.createElement(`div`);
    const bodyHost = document.createElement(`div`);
    rootHost.dataset.docxRenderRoot = ``;
    stylesHost.dataset.docxRenderStyles = ``;
    bodyHost.dataset.docxRenderBody = ``;
    rootHost.append(stylesHost, bodyHost);
    setStatus(`loading`);
    setFit(null);
    mount.replaceChildren();
    renderDocxAsync(buffer, bodyHost, stylesHost, {
      ...DOCX_PREVIEW_OPTIONS,
      className,
    })
      .then(() => {
        if (!active) return;
        // docx-preview 的包装层默认带背景/内边距/宽度约束，预览面板需要
        // 让页面按内容宽度展开，再由外层 fit 缩放。
        const wrapper = bodyHost.querySelector(`.${className}-wrapper`);
        wrapper &&
          ((wrapper as HTMLElement).style.background = `transparent`),
          wrapper && ((wrapper as HTMLElement).style.padding = `0`),
          wrapper && ((wrapper as HTMLElement).style.width = `max-content`);
        // 页面卡片阴影：注入到 styles 容器，随渲染产物一起清理。
        const pageSurfaceStyle = document.createElement(`style`);
        pageSurfaceStyle.dataset.docxPageSurfaceStyle = ``;
        pageSurfaceStyle.textContent = `.${className}-wrapper>section.${className} { box-shadow: ${DOCX_PAGE_SHADOW}; }`;
        stylesHost.append(pageSurfaceStyle);
        mount.replaceChildren(rootHost);
        setStatus(`ready`);
      })
      .catch((error) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`[PreviewPane] DOCX 文件解析失败`, {
          path: sourcePath,
          error: message,
        });
        mount.replaceChildren();
        setStatus(`error`);
      });
    return () => {
      active = false;
      mount.replaceChildren();
    };
  }, [buffer, previewClassName, sourcePath]);

  /* --- ready 后挂 ResizeObserver 持续同步 fit（原 useLayoutEffect，jsx 6759-6766） --- */
  React.useLayoutEffect(() => {
    if (status !== `ready`) return;
    syncFit();
    if (typeof ResizeObserver > `u`) return;
    const observer = new ResizeObserver(syncFit);
    viewportRef.current && observer.observe(viewportRef.current);
    contentRef.current && observer.observe(contentRef.current);
    return () => {
      observer.disconnect();
    };
  }, [status, syncFit]);

  /* --- 视图（原 jsx 6766-6776；data-office-preview-kind="docx"） ---
   * 结构：外层容器（加载时 aria-busy + data-office-preview-pending）
   *   ├─ error 态：role=alert 红色文案
   *   └─ 滚动区 > fit 视口[data-docx-fit-viewport]
   *        > 定宽 frame[data-docx-fit-frame]（fit 后的宽高）
   *          > 缩放层[data-docx-fit-content]（scale 变换，原点左上）
   *            > docx-preview 挂载点
   */
  return (
    <div
      aria-busy={status === `loading` ? `true` : void 0}
      className="h-full min-h-0 w-full min-w-0 bg-background"
      data-office-preview-kind="docx"
      data-office-preview-pending={status === `loading` ? `` : void 0}
    >
      {status === `error` ? (
        <div className="p-3 text-ui-base text-destructive" role="alert">{errorMessage}</div>
      ) : null}
      <div className={status === `error` ? `hidden` : `h-full min-h-0 w-full min-w-0 overflow-auto p-4 max-sm:p-2`}>
        <div ref={viewportRef} className="w-full min-w-0" data-docx-fit-viewport>
          <div
            className="relative mx-auto"
            data-docx-fit-frame
            style={fit ? { width: fit.width, height: fit.height } : void 0}
          >
            <div
              ref={contentRef}
              className="w-max"
              data-docx-fit-content
              style={
                fit
                  ? {
                      position: `absolute`,
                      left: 0,
                      top: 0,
                      transform: `scale(${fit.scale})`,
                      transformOrigin: `top left`,
                    }
                  : void 0
              }
            >
              <div ref={mountRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewPaneOfficeDocxContent;
