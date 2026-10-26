import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
/** Server-authoritative queue: actions never remove or rewrite the local snapshot. */
import { useState } from "react";
import { preview } from "../../ui/readers.ts";

export type QueueHandlers = {
  edit: (entryId: string, text: string) => void;
  remove: (entryId: string) => void;
  clear: () => void;
};

type Row = { id: string; text: string; version: number | null };
function queueRow(value: unknown): Row | null {
  if (typeof value !== "object" || value === null) return null;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && typeof row.text === "string" ? { id: row.id, text: row.text, version: typeof row.version === "number" ? row.version : null } : null;
}

export function QueueStrip({ entries, handlers, disabled = false }: { entries: unknown[]; handlers?: QueueHandlers; disabled?: boolean }) {
  useLocale();
  const [editing, setEditing] = useState<Row | null>(null);
  const [text, setText] = useState("");
  const rows = entries.map(queueRow);
  const current = editing === null ? null : rows.find((r) => r?.id === editing.id);
  const conflict = editing !== null && (!current || current.version !== editing.version || current.text !== editing.text);
  if (entries.length === 0 && editing === null) return null;
  return <section className="queue" aria-label={tr("内核排队消息")}>
    <span className="queue__label">{tr("排队")}{" "}{String(entries.length)}</span>
    {entries.map((e, i) => {
      const row = rows[i];
      return <span className="queue__chip" key={row?.id ?? String(i)} title={row?.text ?? preview(e, 400)}>
        <span>{row?.text ?? preview(e, 64)}</span>
        {handlers && row ? <>
          <button type="button" disabled={disabled} aria-label={tr("编辑排队消息 {0}",[String(i + 1)])} onClick={() => { setEditing(row); setText(row.text); }}>{tr("编辑")}</button>
          <button type="button" disabled={disabled} aria-label={tr("取消排队消息 {0}",[String(i + 1)])} onClick={() => handlers.remove(row.id)}>{tr("取消")}</button>
        </> : null}
      </span>;
    })}
    {handlers && entries.length ? <button type="button" disabled={disabled} onClick={handlers.clear}>{tr("清空队列")}</button> : null}
    {editing && handlers ? <div className="queue__editor">
      <label>{tr("编辑排队输入")}<textarea className="question__input" value={text} disabled={disabled || conflict} onChange={(e) => setText(e.target.value)} /></label>
      {conflict ? <p role="alert">{tr("条目已执行、删除或被其他客户端修改。请关闭后重新选择。")}</p> : null}
      <button type="button" disabled={disabled || conflict || !text.trim()} onClick={() => { handlers.edit(editing.id, text); setEditing(null); }}>{tr("提交修改")}</button>
      <button type="button" onClick={() => setEditing(null)}>{tr("关闭编辑")}</button>
    </div> : null}
  </section>;
}
