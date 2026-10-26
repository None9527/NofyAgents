import { useLocale } from "./useLocale.ts";
import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { CopyButton, SaveButton } from "./contentActions.tsx";
import { Btn } from "./primitives.tsx";
import { IconExpand } from "./icons.tsx";
import { Dialog } from "./dialog.tsx";
import { tr } from "./i18n.ts";
export function MarkdownTable({ children, onSaveText }: { children: ReactNode; onSaveText?: (text: string, filename: string) => Promise<boolean> }) {
  useLocale();
  const ref = useRef<HTMLTableElement>(null);
  const [expanded, setExpanded] = useState(false);
  const rows = () => {
    return Array.from(ref.current?.rows ?? []).map(row => Array.from(row.cells).map(cell => cell.textContent ?? ""));
  };
  return <div className="md-table">
    <div className="md-table__actions"><CopyButton text={() => rows().map(row => row.join("\t")).join("\n")} label="复制表格" /><SaveButton text={() => "\ufeff" + rows().map(row => row.map(cell => '"' + cell.replaceAll('"', '""') + '"').join(",")).join("\r\n")} filename="table.csv" onSave={onSaveText} /><Btn variant="ghost" size="icon" aria-label={tr("展开表格")} title={tr("展开表格")} onClick={() => setExpanded(true)}><IconExpand size={15} /></Btn></div>
    <div className="md-table__scroll"><table ref={ref} className="md__table">{children}</table></div>
    <Dialog open={expanded} title={tr("表格")} className="content-expanded" onClose={() => setExpanded(false)}><div className="md-table__scroll"><table className="md__table">{children}</table></div></Dialog>
  </div>;
}
