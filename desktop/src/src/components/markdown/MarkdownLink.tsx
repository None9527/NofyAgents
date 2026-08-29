// A0-S4-4c: 自 modules/MarkdownLink.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/markdown/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * MarkdownLink.tsx — ZCode 3.7.6 markdown 渲染层 · 链接渲染 + 链接安全子模块
 * （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（21,756 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js
 * 对照 jsx：src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx
 * 定性：streamdown@2.5.0 first-party 层 —— 链接元素渲染与安全确认弹层。
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名（js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *   ey → LinkSafetyModal   外链确认弹层（复制链接/打开；Escape/点击背景关闭）
 *                          (19488 / 16064)
 *   My → MarkdownA         <a> 元素组件（memo；linkSafety 开启时改渲染为
 *                          <button> + 确认流；上游 displayName=MarkdownA）
 *                          (20374 / 16583)
 *
 * 行为要点：
 *  - `streamdown:incomplete-link` 是流式占位 href（链接目标还没打完），
 *    打 data-incomplete 标记，安全确认流对其跳过；
 *  - linkSafety.enabled 且 onLinkCheck 返回 true → 直接开窗；
 *    否则弹确认层（可用 linkSafety.renderModal 替换内置弹层）；
 *  - 未开启安全时：普通 <a target=_blank rel=noreferrer>。
 *
 * 外部依赖：MarkdownContext.tsx（StreamdownContext/图标/文案/滚动锁）
 * ============================================================================
 */

import * as React from "react";
import {
  StreamdownContext,
  useClassNames,
  useStreamdownIcons,
  useStreamdownTranslations,
  lockBodyScroll,
  unlockBodyScroll,
  type LinkSafetyModalProps,
  type HastNodeLike,
  type HastNodePosition,
} from "../../modules/MarkdownContext";

export type { HastNodeLike, HastNodePosition };

/* ============================================================================
 * 1. LinkSafetyModal（原 ey，js 19488-19609 / jsx 16064）
 *    「Open external link?」确认弹层：外链警示文案 + URL 展示
 *    （>100 字符时限高滚动）+ [复制链接 | 打开链接] 两按钮。
 * ==========================================================================*/

export const LinkSafetyModal: React.FC<LinkSafetyModalProps> = ({ url, isOpen, onClose, onConfirm }) => {
  const { CheckIcon, CopyIcon, ExternalLinkIcon, XIcon } = useStreamdownIcons();
  const cn = useClassNames();
  const [copied, setCopied] = React.useState(false);
  const translations = useStreamdownTranslations();
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 剪贴板不可用时静默 */
    }
  }, [url]);
  const handleConfirm = React.useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);
  React.useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === `Escape`) onClose();
      };
      document.addEventListener(`keydown`, handleKeyDown);
      return () => {
        document.removeEventListener(`keydown`, handleKeyDown);
        unlockBodyScroll();
      };
    }
  }, [isOpen, onClose]);
  return isOpen ? (
    <div
      className={cn(`fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm`)}
      data-streamdown="link-safety-modal"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === `Escape`) onClose();
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className={cn(`relative mx-4 flex w-full max-w-md flex-col gap-4 rounded-xl border bg-background p-6 shadow-lg`)}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        role="presentation"
      >
        <button
          className={cn(`absolute top-4 right-4 rounded-md p-1 text-muted-foreground transition-all hover:bg-muted hover:text-foreground`)}
          onClick={onClose}
          title={translations.close}
          type="button"
        >
          <XIcon size={16} />
        </button>
        <div className={cn(`flex flex-col gap-2`)}>
          <div className={cn(`flex items-center gap-2 font-semibold text-lg`)}>
            <ExternalLinkIcon size={20} />
            <span>{translations.openExternalLink}</span>
          </div>
          <p className={cn(`text-muted-foreground text-sm`)}>{translations.externalLinkWarning}</p>
        </div>
        <div className={cn(`break-all rounded-md bg-muted p-3 font-mono text-sm`, url.length > 100 && `max-h-32 overflow-y-auto`)}>
          {url}
        </div>
        <div className={cn(`flex gap-2`)}>
          <button
            className={cn(
              `flex flex-1 items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 font-medium text-sm transition-all hover:bg-muted`,
            )}
            onClick={handleCopy}
            type="button"
          >
            {copied ? (
              <>
                <CheckIcon size={14} />
                <span>{translations.copied}</span>
              </>
            ) : (
              <>
                <CopyIcon size={14} />
                <span>{translations.copyLink}</span>
              </>
            )}
          </button>
          <button
            className={cn(
              `flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-all hover:bg-primary/90`,
            )}
            onClick={handleConfirm}
            type="button"
          >
            <ExternalLinkIcon size={14} />
            <span>{translations.openLink}</span>
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

/* ============================================================================
 * 2. MarkdownA（原 My，js 20374-20429 / jsx 16583；displayName=MarkdownA）
 *    memo 比较 = 节点位置相等 + className + href。
 * ==========================================================================*/

export interface MarkdownAProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  children?: React.ReactNode;
  className?: string;
  href?: string;
  node?: HastNodeLike;
}

export const MarkdownA = React.memo(
  ({ children, className, href, node, ...rest }: MarkdownAProps) => {
    const cn = useClassNames();
    const { linkSafety } = React.useContext(StreamdownContext);
    const [modalOpen, setModalOpen] = React.useState(false);
    const isIncompleteLink = href === `streamdown:incomplete-link`;
    // 安全流：占位链接跳过；onLinkCheck 通过 → 直接打开；否则弹确认层
    const handleClick = React.useCallback(
      async (event: React.MouseEvent) => {
        if (!linkSafety?.enabled || !href || isIncompleteLink) return;
        event.preventDefault();
        if (linkSafety.onLinkCheck && (await linkSafety.onLinkCheck(href))) {
          window.open(href, `_blank`, `noreferrer`);
          return;
        }
        setModalOpen(true);
      },
      [linkSafety, href, isIncompleteLink],
    );
    const handleConfirm = React.useCallback(() => {
      if (href) window.open(href, `_blank`, `noreferrer`);
    }, [href]);
    const handleClose = React.useCallback(() => {
      setModalOpen(false);
    }, []);
    const modalProps: LinkSafetyModalProps = { url: href ?? ``, isOpen: modalOpen, onClose: handleClose, onConfirm: handleConfirm };
    return linkSafety?.enabled && href ? (
      <>
        <button
          className={cn(`wrap-anywhere appearance-none text-left font-medium text-primary underline`, className)}
          data-incomplete={isIncompleteLink}
          data-streamdown="link"
          onClick={handleClick}
          type="button"
        >
          {children}
        </button>
        {linkSafety.renderModal ? linkSafety.renderModal(modalProps) : <LinkSafetyModal {...modalProps} />}
      </>
    ) : (
      <a
        className={cn(`wrap-anywhere font-medium text-primary underline`, className)}
        data-incomplete={isIncompleteLink}
        data-streamdown="link"
        href={href}
        rel="noreferrer"
        target="_blank"
        {...rest}
      >
        {children}
      </a>
    );
  },
  (prev, next) => {
    // 与 MarkdownElements 的 nodeEquals + href 比较一致（原 $(e,t) && e.href===t.href）
    const samePosition = nodesHaveEqualPosition(prev.node, next.node);
    return prev.className === next.className && samePosition && prev.href === next.href;
  },
);
MarkdownA.displayName = `MarkdownA`;

/** 节点位置相等判定（与 MarkdownElements.tsx 的 nodesHaveEqualPosition 同逻辑；
 *  此处内联以避免循环依赖） */
function nodesHaveEqualPosition(a?: HastNodeLike, b?: HastNodeLike): boolean {
  if (!(a?.position || b?.position)) return true;
  if (!a?.position || !b?.position) return false;
  const startA = a.position.start;
  const startB = b.position.start;
  const endA = a.position.end;
  const endB = b.position.end;
  return startA?.line === startB?.line && startA?.column === startB?.column && endA?.line === endB?.line && endA?.column === endB?.column;
}
