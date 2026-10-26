import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { useEffect, useRef, useState } from "react";
import { Btn } from "../../ui/primitives.tsx";

/** One-shot session/cancel _meta.cancelSubagents choice; persistence belongs to the kernel. */
export function CancelTurnCard({ runningCount, onChoose, onClose }: { runningCount: number; onChoose: (cancelSubagents: boolean) => void; onClose: () => void }) {
  useLocale();
  const submitted = useRef(false);
  const [sent, setSent] = useState(false);
  const root = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const previous = root.current?.ownerDocument.activeElement instanceof HTMLElement ? root.current.ownerDocument.activeElement : null;
    root.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => previous?.focus();
  }, []);
  const choose = (cancelSubagents: boolean) => {
    if (submitted.current) return;
    submitted.current = true;
    setSent(true);
    onChoose(cancelSubagents);
  };
  return <section ref={root} className="approval" role="dialog" aria-modal="true" aria-label={tr("停止当前轮次")} onKeyDown={(e) => {
    if (e.key === "Escape" && !sent) { e.preventDefault(); onClose(); }
    if (e.key === "Tab") {
      const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
      const first = buttons[0]; const last = buttons.at(-1);
      if (e.shiftKey && root.current?.ownerDocument.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && root.current?.ownerDocument.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  }}>
    <div className="approval__head"><span className="approval__title">{tr("停止当前轮次")}</span></div>
    <p className="approval__note">{tr("当前会话还有")}{String(runningCount)}{tr("个运行中的子代理。请选择停止范围。")}</p>
    <div className="approval__options">
      <Btn variant="danger" disabled={sent} onClick={() => choose(true)}>{tr("停止轮次和子代理")}</Btn>
      <Btn disabled={sent} onClick={() => choose(false)}>{tr("只停止轮次，保留子代理")}</Btn>
      <Btn disabled={sent} onClick={onClose}>{tr("继续当前轮次")}</Btn>
    </div>
  </section>;
}
