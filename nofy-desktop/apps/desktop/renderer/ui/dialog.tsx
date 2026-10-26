import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { Btn } from "./primitives.tsx";
import { IconX } from "./icons.tsx";
import { tr } from "./i18n.ts";
/** Native modal supplies focus containment and makes the underlying page inert. */
export function Dialog({ open, title, onClose, busy = false, children, footer, className = "" }: {
  open: boolean; title: string; onClose: () => void; busy?: boolean; children: ReactNode; footer?: ReactNode; className?: string;
}) {
  const ref = useRef<HTMLDialogElement | null>(null);
  const labelId = useId();
  useEffect(() => {
    const node = ref.current;
    if (!node || !open) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!node.open) node.showModal();
    return () => {
      if (node.open) node.close();
      // React may remove the native dialog before close() restores focus.
      queueMicrotask(() => { if (trigger?.isConnected && !document.querySelector("dialog[open]")) trigger.focus({ preventScroll: true }); });
    };
  }, [open]);
  if (!open) return null;
  return <dialog ref={ref} className={"ui-dialog " + className} aria-labelledby={labelId}
    onKeyDown={(event) => event.stopPropagation()}
    onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <header className="ui-dialog__head"><h2 id={labelId}>{title}</h2><Btn size="icon" aria-label={tr("关闭")} disabled={busy} onClick={onClose}><IconX size={18} /></Btn></header>
    <div className="ui-dialog__body">{children}</div>{footer ? <footer className="ui-dialog__foot">{footer}</footer> : null}
  </dialog>;
}
