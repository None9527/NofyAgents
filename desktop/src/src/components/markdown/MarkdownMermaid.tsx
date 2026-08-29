// A0-S4-4c: 自 modules/MarkdownMermaid.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/markdown/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * MarkdownMermaid.tsx — ZCode 3.7.6 markdown 渲染层 · Mermaid 图表子模块
 * （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（21,756 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js
 * 伴随 shim（3 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/mermaid-GHXKKRXX-BUw9cQJG.js
 *     内容：`import { a as e } from "./chunk-BO2N2NFS-CSNAeaxF.js"; export { e as Mermaid };`
 *     —— 即本文件 Mermaid 组件的具名再导出（懒加载目标）。
 * 对照 jsx：src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名（js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *   av/ov/sv → LAZY_RENDER_DEBOUNCE_MS=300 / ROOT_MARGIN='300px' /
 *              IDLE_TIMEOUT_MS=500 (18292 / —)
 *   cv → useLazyRender          IntersectionObserver+requestIdleCallback 懒渲染钩子
 *                               （返回 {shouldRender, containerRef}）(18295 / 15256)
 *   oy → downloadSvgAsPng       SVG→base64→Image→canvas(5x)→PNG blob (19626 / 16120)
 *   sy → MermaidDownloadDropdown 下载下拉（SVG/PNG/MMD 三档）(19653 / 16142)
 *   cy → MermaidFullscreenButton 全屏按钮（portal 覆盖层 + 内嵌 Mermaid）(19759 / 16201)
 *   $b → ZoomableContent        缩放/平移容器（滚轮缩放、指针拖拽、控制钮）(21463 / 17421)
 *   ex → Mermaid                Mermaid React 组件（导出别名 a；data-streamdown=mermaid）
 *                               (21620 / 17524)
 *   by → LazyMermaid            lazy(() => import('./mermaid-GHXKKRXX-…').Mermaid)
 *                               —— MarkdownCode 渲染 ```mermaid 块时的入口 (20282 / 16517)
 *
 * 外部依赖：
 *   - MarkdownContext.tsx（StreamdownContext/useMermaidPlugin/图标/文案/滚动锁/下载）
 *   - mermaid 运行时本体不在本 chunk：经 plugins.mermaid（@streamdown/mermaid，
 *     由宿主 styles-CdEGpc2x.js 注入）的 getMermaid(config).render(id, text) 调用；
 *     mermaid 11.14.0 库 chunk 见 VENDOR-MANIFEST-LIBS.md（chunk-ICPOFSXX 系）。
 * ============================================================================
 */

import * as React from "react";
import { createPortal } from "react-dom";
import {
  StreamdownContext,
  useClassNames,
  useMermaidPlugin,
  useStreamdownIcons,
  useStreamdownTranslations,
  downloadFile,
  lockBodyScroll,
  unlockBodyScroll,
  type MermaidErrorProps,
  type MermaidPlugin,
} from "../../modules/MarkdownContext";

/* ============================================================================
 * 1. useLazyRender（原 cv，js 18292-18379 / jsx 15256）
 * ----------------------------------------------------------------------------
 * 视口内 + 浏览器空闲才渲染（图表/重组件性能优化）：
 *  - immediate=true 直通（全屏态使用）；
 *  - IntersectionObserver（rootMargin 300px）命中后 debounce 300ms，
 *    再等 requestIdleCallback（idle 超时 500ms，无 API 时 setTimeout 1ms 兜底）；
 *  - 命中即断开观察，shouldRender 置 true。
 * ==========================================================================*/

const LAZY_RENDER_DEBOUNCE_MS = 300; // 原 av
const LAZY_RENDER_ROOT_MARGIN = `300px`; // 原 ov
const LAZY_RENDER_IDLE_TIMEOUT_MS = 500; // 原 sv

export interface UseLazyRenderOptions {
  immediate?: boolean;
  debounceDelay?: number;
  rootMargin?: string;
  idleTimeout?: number;
}

export function useLazyRender(options: UseLazyRenderOptions = {}): {
  shouldRender: boolean;
  /* A0-CLEANUP4：React19 useRef<T>(null) 产 RefObject<T | null>（ref 属性消费兼容） */
  containerRef: React.RefObject<HTMLDivElement | null>;
} {
  const {
    immediate = false,
    debounceDelay = LAZY_RENDER_DEBOUNCE_MS,
    rootMargin = LAZY_RENDER_ROOT_MARGIN,
    idleTimeout = LAZY_RENDER_IDLE_TIMEOUT_MS,
  } = options;
  const [shouldRender, setShouldRender] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const debounceTimer = React.useRef<number | null>(null);
  const idleHandle = React.useRef<number | null>(null);
  // requestIdleCallback 兜底：1ms 后回调，timeRemaining 按 50ms 帧预算伪造
  const idleFallback = React.useMemo(
    () => (callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void) => {
      const startedAt = Date.now();
      return window.setTimeout(() => {
        callback({ didTimeout: false, timeRemaining: () => Math.max(0, 50 - (Date.now() - startedAt)) });
      }, 1);
    },
    [],
  );
  // 原实现条件为 `typeof window < 'u'`（= typeof window !== 'undefined' 的压缩写法）
  const requestIdle = React.useMemo(
    () =>
      typeof window !== `undefined` && window.requestIdleCallback
        ? (callback: IdleRequestCallback, opts?: IdleRequestOptions) => window.requestIdleCallback(callback, opts)
        : idleFallback,
    [idleFallback],
  );
  const cancelIdle = React.useMemo(
    () =>
      typeof window !== `undefined` && window.cancelIdleCallback
        ? (handle: number) => window.cancelIdleCallback(handle)
        : (handle: number) => {
            clearTimeout(handle);
          },
    [],
  );
  React.useEffect(() => {
    if (immediate) {
      setShouldRender(true);
      return;
    }
    const container = containerRef.current;
    if (!container) return;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (idleHandle.current) {
      cancelIdle(idleHandle.current);
      idleHandle.current = null;
    }
    const cancelPending = () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      if (idleHandle.current) {
        cancelIdle(idleHandle.current);
        idleHandle.current = null;
      }
    };
    const scheduleWhenIdle = (observer: IntersectionObserver) => {
      idleHandle.current = requestIdle(
        (deadline) => {
          if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
            setShouldRender(true);
            observer.disconnect();
          } else {
            idleHandle.current = requestIdle(
              () => {
                setShouldRender(true);
                observer.disconnect();
              },
              { timeout: idleTimeout / 2 },
            );
          }
        },
        { timeout: idleTimeout },
      );
    };
    const handleVisible = (observer: IntersectionObserver) => {
      cancelPending();
      debounceTimer.current = window.setTimeout(() => {
        const records = observer.takeRecords();
        // 原实现：records.length === 0 || records.at(-1)?.isIntersecting === true
        if (records.length === 0 || records.at(-1)?.isIntersecting === true) scheduleWhenIdle(observer);
      }, debounceDelay);
    };
    const handleEntry = (entry: IntersectionObserverEntry, observer: IntersectionObserver) => {
      if (entry.isIntersecting) handleVisible(observer);
      else cancelPending();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) handleEntry(entry, observer);
      },
      { rootMargin, threshold: 0 },
    );
    observer.observe(container);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (idleHandle.current) cancelIdle(idleHandle.current);
      observer.disconnect();
    };
  }, [immediate, debounceDelay, rootMargin, idleTimeout, cancelIdle, requestIdle]);
  return { shouldRender, containerRef };
}

/* ============================================================================
 * 2. downloadSvgAsPng（原 oy，js 19626-19652 / jsx 16120）
 *    SVG 串 → base64 data URL → Image → 5 倍尺寸 canvas → PNG blob。
 * ==========================================================================*/

export const downloadSvgAsPng = (svg: string): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const dataUrl = `data:image/svg+xml;base64,` + btoa(unescape(encodeURIComponent(svg)));
    const image = new Image();
    image.crossOrigin = `anonymous`;
    image.onload = () => {
      const canvas = document.createElement(`canvas`);
      const width = image.width * 5;
      const height = image.height * 5;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext(`2d`);
      if (!context) {
        reject(Error(`Failed to create 2D canvas context for PNG export`));
        return;
      }
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(Error(`Failed to create PNG blob`));
          return;
        }
        resolve(blob);
      }, `image/png`);
    };
    image.onerror = () => reject(Error(`Failed to load SVG image`));
    image.src = dataUrl;
  });

/* ============================================================================
 * 3. MermaidDownloadDropdown（原 sy，js 19653-19758 / jsx 16142）
 *    三档下载：mmd（原文直下）/ svg（重新 render 取 svg）/ png（svg→canvas）。
 *    点击外部关闭（mousedown composedPath 判定）。
 * ==========================================================================*/

export interface MermaidDownloadDropdownProps {
  chart: string;
  children?: React.ReactNode;
  className?: string;
  onDownload?: (format: string) => void;
  config?: unknown;
  onError?: (error: unknown) => void;
}

export const MermaidDownloadDropdown: React.FC<MermaidDownloadDropdownProps> = ({
  chart,
  children,
  className,
  onDownload,
  config,
  onError,
}) => {
  const cn = useClassNames();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { isAnimating } = React.useContext(StreamdownContext);
  const icons = useStreamdownIcons();
  const mermaidPlugin = useMermaidPlugin();
  const translations = useStreamdownTranslations();
  const handleDownload = async (format: string) => {
    try {
      if (format === `mmd`) {
        downloadFile(`diagram.mmd`, chart, `text/plain`);
        setOpen(false);
        onDownload?.(format);
        return;
      }
      if (!mermaidPlugin) {
        onError?.(Error(`Mermaid plugin not available`));
        return;
      }
      const mermaid = mermaidPlugin.getMermaid(config);
      // 与 Mermaid 组件相同的 id 生成：字符串哈希 + 时间戳 + 随机后缀
      const hash = chart.split(``).reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
      const renderId = `mermaid-${Math.abs(hash)}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const { svg } = await mermaid.render(renderId, chart);
      if (!svg) {
        onError?.(Error(`SVG not found. Please wait for the diagram to render.`));
        return;
      }
      if (format === `svg`) {
        downloadFile(`diagram.svg`, svg, `image/svg+xml`);
        setOpen(false);
        onDownload?.(format);
        return;
      }
      if (format === `png`) {
        downloadFile(`diagram.png`, await downloadSvgAsPng(svg), `image/png`);
        onDownload?.(format);
        setOpen(false);
        return;
      }
    } catch (error) {
      onError?.(error);
    }
  };
  React.useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const path = event.composedPath();
      if (containerRef.current && !path.includes(containerRef.current)) setOpen(false);
    };
    document.addEventListener(`mousedown`, handleMouseDown);
    return () => {
      document.removeEventListener(`mousedown`, handleMouseDown);
    };
  }, []);
  return (
    <div className={cn(`relative`)} ref={containerRef}>
      <button
        className={cn(
          `cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50`,
          className,
        )}
        disabled={isAnimating}
        onClick={() => setOpen(!open)}
        title={translations.downloadDiagram}
        type="button"
      >
        {children ?? <icons.DownloadIcon size={14} />}
      </button>
      {open ? (
        <div
          className={cn(
            `absolute top-full right-0 z-10 mt-1 min-w-[120px] overflow-hidden rounded-md border border-border bg-background shadow-lg`,
          )}
        >
          <button
            className={cn(`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40`)}
            onClick={() => handleDownload(`svg`)}
            title={translations.downloadDiagramAsSvg}
            type="button"
          >
            {translations.mermaidFormatSvg}
          </button>
          <button
            className={cn(`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40`)}
            onClick={() => handleDownload(`png`)}
            title={translations.downloadDiagramAsPng}
            type="button"
          >
            {translations.mermaidFormatPng}
          </button>
          <button
            className={cn(`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40`)}
            onClick={() => handleDownload(`mmd`)}
            title={translations.downloadDiagramAsMmd}
            type="button"
          >
            {translations.mermaidFormatMmd}
          </button>
        </div>
      ) : null}
    </div>
  );
};

/* ============================================================================
 * 4. MermaidFullscreenButton（原 cy，js 19759-19848 / jsx 16201）
 *    全屏按钮：点击后 createPortal 到 body 的 fixed 覆盖层，内嵌
 *    <Mermaid fullscreen> 重渲染；Escape/点击背景退出；滚动锁。
 * ==========================================================================*/

export interface MermaidFullscreenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  chart: string;
  config?: unknown;
  onFullscreen?: () => void;
  onExit?: () => void;
  className?: string;
}

export const MermaidFullscreenButton: React.FC<MermaidFullscreenButtonProps> = ({
  chart,
  config,
  onFullscreen,
  onExit,
  className,
  ...rest
}) => {
  const { Maximize2Icon, XIcon } = useStreamdownIcons();
  const cn = useClassNames();
  const [fullscreen, setFullscreen] = React.useState(false);
  const { isAnimating, controls } = React.useContext(StreamdownContext);
  const translations = useStreamdownTranslations();
  // panZoom 控件开关：布尔总开关或 mermaid.panZoom 细分
  const showControls = (() => {
    if (typeof controls === `boolean`) return controls;
    const mermaidControls = controls.mermaid;
    return mermaidControls === false ? false : mermaidControls === true || mermaidControls === void 0 ? true : mermaidControls.panZoom !== false;
  })();
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };
  React.useEffect(() => {
    if (fullscreen) {
      lockBodyScroll();
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === `Escape`) setFullscreen(false);
      };
      document.addEventListener(`keydown`, handleKeyDown);
      return () => {
        document.removeEventListener(`keydown`, handleKeyDown);
        unlockBodyScroll();
      };
    }
  }, [fullscreen]);
  React.useEffect(() => {
    if (fullscreen) onFullscreen?.();
    else onExit && onExit();
  }, [fullscreen, onFullscreen, onExit]);
  return (
    <>
      <button
        className={cn(
          `cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50`,
          className,
        )}
        disabled={isAnimating}
        onClick={toggleFullscreen}
        title={translations.viewFullscreen}
        type="button"
        {...rest}
      >
        <Maximize2Icon size={14} />
      </button>
      {fullscreen
        ? createPortal(
            <div
              className={cn(`fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm`)}
              onClick={toggleFullscreen}
              onKeyDown={(event) => {
                if (event.key === `Escape`) toggleFullscreen();
              }}
              role="button"
              tabIndex={0}
            >
              <button
                className={cn(
                  `absolute top-4 right-4 z-10 rounded-md p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground`,
                )}
                onClick={toggleFullscreen}
                title={translations.exitFullscreen}
                type="button"
              >
                <XIcon size={20} />
              </button>
              <div
                className={cn(`flex size-full items-center justify-center p-4`)}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                role="presentation"
              >
                <Mermaid
                  chart={chart}
                  className={cn(`size-full [&_svg]:h-auto [&_svg]:w-auto`)}
                  config={config}
                  fullscreen={true}
                  showControls={showControls}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};

/* ============================================================================
 * 5. ZoomableContent（原 $b，js 21463-21619 / jsx 17421）
 *    缩放/平移容器：滚轮缩放（preventDefault，非 passive）、指针拖拽
 *    （setPointerCapture）、左下控制簇（放大/缩小/重置，0.5–3 倍，步进 0.1）。
 * ==========================================================================*/

export interface ZoomableContentProps {
  children: React.ReactNode;
  className?: string;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  showControls?: boolean;
  initialZoom?: number;
  fullscreen?: boolean;
}

export const ZoomableContent: React.FC<ZoomableContentProps> = ({
  children,
  className,
  minZoom = 0.5,
  maxZoom = 3,
  zoomStep = 0.1,
  showControls = true,
  initialZoom = 1,
  fullscreen = false,
}) => {
  const { RotateCcwIcon, ZoomInIcon, ZoomOutIcon } = useStreamdownIcons();
  const cn = useClassNames();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = React.useState(initialZoom);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 });
  const adjustZoom = React.useCallback(
    (delta: number) => {
      setZoom((current) => Math.max(minZoom, Math.min(maxZoom, current + delta)));
    },
    [minZoom, maxZoom],
  );
  const zoomIn = React.useCallback(() => {
    adjustZoom(zoomStep);
  }, [adjustZoom, zoomStep]);
  const zoomOut = React.useCallback(() => {
    adjustZoom(-zoomStep);
  }, [adjustZoom, zoomStep]);
  const resetView = React.useCallback(() => {
    setZoom(initialZoom);
    setPan({ x: 0, y: 0 });
  }, [initialZoom]);
  const handleWheel = React.useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      adjustZoom(event.deltaY > 0 ? -zoomStep : zoomStep);
    },
    [adjustZoom, zoomStep],
  );
  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || event.isPrimary === false) return;
      setDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
      setPanStart(pan);
      const target = event.currentTarget;
      if (target instanceof HTMLElement) target.setPointerCapture(event.pointerId);
    },
    [pan],
  );
  const handlePointerMove = React.useCallback(
    (event: PointerEvent) => {
      if (!dragging) return;
      event.preventDefault();
      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;
      setPan({ x: panStart.x + deltaX, y: panStart.y + deltaY });
    },
    [dragging, dragStart, panStart],
  );
  const handlePointerEnd = React.useCallback((event: PointerEvent) => {
    setDragging(false);
    const target = event.currentTarget;
    if (target instanceof HTMLElement) target.releasePointerCapture(event.pointerId);
  }, []);
  // 滚轮缩放：非 passive 监听（要 preventDefault 阻止页面滚动）
  React.useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener(`wheel`, handleWheel, { passive: false });
      return () => {
        container.removeEventListener(`wheel`, handleWheel);
      };
    }
  }, [handleWheel]);
  // 拖拽期间：body 禁止选中 + 全局 pointermove/pointerup 监听
  React.useEffect(() => {
    const content = contentRef.current;
    if (content && dragging) {
      document.body.style.userSelect = `none`;
      content.addEventListener(`pointermove`, handlePointerMove, { passive: false });
      content.addEventListener(`pointerup`, handlePointerEnd);
      content.addEventListener(`pointercancel`, handlePointerEnd);
      return () => {
        document.body.style.userSelect = ``;
        content.removeEventListener(`pointermove`, handlePointerMove);
        content.removeEventListener(`pointerup`, handlePointerEnd);
        content.removeEventListener(`pointercancel`, handlePointerEnd);
      };
    }
  }, [dragging, handlePointerMove, handlePointerEnd]);
  return (
    <div
      className={cn(`relative flex flex-col`, fullscreen ? `h-full w-full` : `min-h-28 w-full`, className)}
      ref={containerRef}
      style={{ cursor: dragging ? `grabbing` : `grab` }}
    >
      {showControls ? (
        <div
          className={cn(
            `absolute z-10 flex flex-col gap-1 rounded-md border border-border bg-background/80 p-1 supports-[backdrop-filter]:bg-background/70 supports-[backdrop-filter]:backdrop-blur-sm`,
            fullscreen ? `bottom-4 left-4` : `bottom-2 left-2`,
          )}
        >
          <button
            className={cn(
              `flex items-center justify-center rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50`,
            )}
            disabled={zoom >= maxZoom}
            onClick={zoomIn}
            title="Zoom in"
            type="button"
          >
            <ZoomInIcon size={16} />
          </button>
          <button
            className={cn(
              `flex items-center justify-center rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50`,
            )}
            disabled={zoom <= minZoom}
            onClick={zoomOut}
            title="Zoom out"
            type="button"
          >
            <ZoomOutIcon size={16} />
          </button>
          <button
            className={cn(
              `flex items-center justify-center rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground`,
            )}
            onClick={resetView}
            title="Reset zoom and pan"
            type="button"
          >
            <RotateCcwIcon size={16} />
          </button>
        </div>
      ) : null}
      <div
        className={cn(
          `flex-1 origin-center transition-transform duration-150 ease-out`,
          fullscreen ? `flex h-full w-full items-center justify-center` : `flex w-full items-center justify-center`,
        )}
        onPointerDown={handlePointerDown}
        ref={contentRef}
        role="application"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: `center center`,
          touchAction: `none`,
          willChange: `transform`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ============================================================================
 * 6. Mermaid（原 ex，js 21620-21726 / jsx 17524；导出别名 a）
 * ----------------------------------------------------------------------------
 * mermaid 图表渲染组件（mermaid-GHXKKRXX shim 再导出为具名 `Mermaid`）：
 *  - useLazyRender 懒渲染（全屏态 immediate）；
 *  - 渲染：plugins.mermaid.getMermaid(config).render(id, chart)，
 *    id = `mermaid-<hash>-<ts>-<rand>`（hash = Java 风字符串哈希）；
 *  - 相位：占位（未懒渲染）→ loading（spinner + 'Loading diagram...'）
 *    → error（自定义 errorComponent 或内置红框 + Show Code 折叠）
 *    → 成功：ZoomableContent 包裹 dangerouslySetInnerHTML svg，
 *      data-streamdown="mermaid"，role=img aria-label='Mermaid chart'；
 *  - retry：内置错误态点击重试 → attempt+1 触发 useEffect 重渲染。
 * ==========================================================================*/

export interface MermaidProps {
  chart: string;
  className?: string;
  config?: unknown;
  fullscreen?: boolean;
  showControls?: boolean;
}

export const Mermaid: React.FC<MermaidProps> = ({ chart, className, config, fullscreen = false, showControls = true }) => {
  const cn = useClassNames();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [renderedSvg, setRenderedSvg] = React.useState(``);
  const [previousSvg, setPreviousSvg] = React.useState(``);
  const [attempt, setAttempt] = React.useState(0);
  const { mermaid: mermaidOptions } = React.useContext(StreamdownContext);
  const mermaidPlugin = useMermaidPlugin();
  const ErrorComponent = mermaidOptions?.errorComponent as React.ComponentType<MermaidErrorProps> | undefined;
  const { shouldRender, containerRef } = useLazyRender({ immediate: fullscreen });
  React.useEffect(() => {
    if (shouldRender) {
      if (!mermaidPlugin) {
        setError(`Mermaid plugin not available. Please add the mermaid plugin to enable diagram rendering.`);
        return;
      }
      (async () => {
        try {
          setError(null);
          setLoading(true);
          const mermaid = mermaidPlugin.getMermaid(config);
          const hash = chart.split(``).reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
          const renderId = `mermaid-${Math.abs(hash)}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          const { svg } = await mermaid.render(renderId, chart);
          setRenderedSvg(svg);
          setPreviousSvg(svg);
        } catch (renderError) {
          if (!previousSvg && !renderedSvg)
            setError(renderError instanceof Error ? renderError.message : `Failed to render Mermaid chart`);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [chart, config, attempt, shouldRender, mermaidPlugin]);
  // 相位 1：尚未懒渲染 → 占位高度 200px
  if (!(shouldRender || renderedSvg || previousSvg))
    return <div className={cn(`my-4 min-h-[200px]`, className)} ref={containerRef} />;
  // 相位 2：渲染中
  if (loading && !renderedSvg && !previousSvg)
    return (
      <div className={cn(`my-4 flex justify-center p-4`, className)} ref={containerRef}>
        <div className={cn(`flex items-center space-x-2 text-muted-foreground`)}>
          <div className={cn(`h-4 w-4 animate-spin rounded-full border-current border-b-2`)} />
          <span className={cn(`text-sm`)}>{`Loading diagram...`}</span>
        </div>
      </div>
    );
  // 相位 3：错误（且无旧图可回退）
  if (error && !renderedSvg && !previousSvg)
    return ErrorComponent ? (
      <div ref={containerRef}>
        <ErrorComponent chart={chart} error={error} retry={() => setAttempt((value) => value + 1)} />
      </div>
    ) : (
      <div className={cn(`rounded-md bg-red-50 p-4`, className)} ref={containerRef}>
        <p className={cn(`font-mono text-red-700 text-sm`)}>{`Mermaid Error: `}{error}</p>
        <details className={cn(`mt-2`)}>
          <summary className={cn(`cursor-pointer text-red-600 text-xs`)}>{`Show Code`}</summary>
          <pre className={cn(`mt-2 overflow-x-auto rounded bg-red-100 p-2 text-red-800 text-xs`)}>{chart}</pre>
        </details>
      </div>
    );
  // 相位 4：成功（或流式更新失败时回退上一帧 svg）
  const svg = renderedSvg || previousSvg;
  return (
    <div className={cn(`size-full`, className)} data-streamdown="mermaid" ref={containerRef}>
      <ZoomableContent
        className={cn(fullscreen ? `size-full overflow-hidden` : `overflow-hidden`, className)}
        fullscreen={fullscreen}
        maxZoom={3}
        minZoom={0.5}
        showControls={showControls}
        zoomStep={0.1}
      >
        <div
          aria-label="Mermaid chart"
          className={cn(`flex justify-center`, fullscreen ? `size-full items-center` : null)}
          dangerouslySetInnerHTML={{ __html: svg }}
          role="img"
        />
      </ZoomableContent>
    </div>
  );
};

/** 原 by（js 20282）：MarkdownCode 渲染 ```mermaid 块时的懒加载入口 */
export const LazyMermaid = React.lazy(async () => ({ default: Mermaid }));

/** 类型再导出（供 MarkdownElements 的 mermaid 分支使用） */
export type { MermaidPlugin };
