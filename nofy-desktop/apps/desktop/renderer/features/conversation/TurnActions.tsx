import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { useEffect, useRef, useState } from "react";
import { Btn } from "../../ui/primitives.tsx";
import { CopyButton } from "../../ui/contentActions.tsx";
import { IconEdit, IconRewind } from "../../ui/icons.tsx";
import { Dialog } from "../../ui/dialog.tsx";
import { Field, SelectControl } from "../../ui/forms.tsx";
import type { Runtime } from "../../core/runtime.ts";
import type { SessionState } from "../../core/store/state.ts";
import { serviceResponse } from "../../core/service-actions.ts";
import { canCommitRewind, parseRewindPoints, readRewindPreview, rewindEffect, sameRewindScope } from "./turnActionsModel.ts";
import type { RewindMode, RewindPoint, RewindPreview } from "./turnActionsModel.ts";

export function TurnActions({ runtime, session, promptIndex, promptText, onRewound, onEdit, onVisibilityChange }: {
  runtime: Runtime; session: Pick<SessionState, "id" | "agentState">; promptIndex: number | null; promptText: string;
  onRewound: (sessionId: string, promptText: string | null) => void | Promise<void>;
  onEdit?: (text: string) => void;
  onVisibilityChange?: (open: boolean) => void;
}) {
  useLocale();
  const [point, setPoint] = useState<RewindPoint | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { onVisibilityChange?.(open); return () => onVisibilityChange?.(false); }, [open, onVisibilityChange]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const [mode, setMode] = useState<RewindMode>("conversation_only");
  const [preview, setPreview] = useState<RewindPreview | null>(null);
  const requestPreview = async (checkpoint: RewindPoint, range: RewindMode) => {
    const result = await runtime.effect(rewindEffect(session.id, checkpoint, range));
    if (!result.ok) throw new Error(result.error);
    return readRewindPreview(result.value, checkpoint.promptIndex, range);
  };
  const load = async () => {
    if (locked.current) return;
    locked.current = true; setOpen(true); setBusy(true); setError(null); setPreview(null); setPoint(null); setMode("conversation_only");
    try {
      const result = await runtime.effect({ kind: "service/request", operation: "rewindPoints", params: { sessionId: session.id } });
      if (!result.ok) throw new Error(result.error);
      const checkpoint = parseRewindPoints(result.value).find(p => p.promptIndex === promptIndex) ?? null;
      setPoint(checkpoint);
      if (checkpoint) setPreview(await requestPreview(checkpoint, "conversation_only"));
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { locked.current = false; setBusy(false); }
  };
  const showPreview = async (range: RewindMode) => {
    if (!point || locked.current) return;
    locked.current = true; setBusy(true); setError(null); setMode(range); setPreview(null);
    try { setPreview(await requestPreview(point, range)); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { locked.current = false; setBusy(false); }
  };
  const commit = async () => {
    if (!point || !preview || !canCommitRewind(preview) || locked.current || session.agentState !== "idle") return;
    locked.current = true; setBusy(true); setError(null);
    try {
      const current = await requestPreview(point, mode);
      setPreview(current);
      if (!sameRewindScope(preview, current)) throw new Error(tr("回退范围已改变或出现冲突，请检查最新预览后重新确认。"));
      // The kernel offers no atomic compare-and-commit token. Recheck immediately; never knowingly override a conflict.
      const result = await runtime.effect(rewindEffect(session.id, point, mode, "commit"));
      if (!result.ok) throw new Error(result.error);
      const response = serviceResponse(result.value);
      if (response["success"] !== true) throw new Error(typeof response["error"] === "string" ? response["error"] : tr("回退未完成"));
      await onRewound(session.id, typeof response["prompt_text"] === "string" ? response["prompt_text"] : null);
      setOpen(false);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { locked.current = false; setBusy(false); }
  };
  return <div className="turn-actions">
    <CopyButton text={promptText} label="复制输入" />
    {onEdit && <Btn variant="ghost" size="icon" type="button" aria-label={tr("复制输入到草稿")} disabled={session.agentState !== "idle"} title={tr("复制此轮输入到草稿；发送会产生新回合")} onClick={() => onEdit(promptText)}><IconEdit size={15} /></Btn>}
    <Btn variant="ghost" size="icon" type="button" aria-label={tr("回退到此轮之前…")} title={tr("回退到此轮之前…")} disabled={session.agentState !== "idle" || promptIndex === null || busy} onClick={() => void load()}><IconRewind size={15} /></Btn>
    <Dialog open={open} title={tr("回合回退")} busy={busy} onClose={() => setOpen(false)}><p>{tr("回退到第")}{(promptIndex ?? 0) + 1}{tr("轮执行之前。")}</p>
      {point && <><Field label={tr("范围")}><SelectControl value={mode} disabled={busy} onChange={e => void showPreview(e.target.value as RewindMode)}>
        <option value="conversation_only">{tr("仅对话，保留当前文件")}</option>
        <option value="files_only" disabled={!point.hasFileChanges}>{tr("仅文件")}</option>
        <option value="all" disabled={!point.hasFileChanges}>{tr("对话与文件")}</option>
      </SelectControl></Field>
        {preview && <div aria-live="polite"><p>{tr("将回退的文件")}: {preview.cleanFiles.length}</p><ul>{preview.cleanFiles.map(path => <li key={path}>{path}</li>)}</ul>
          {mode !== "files_only" && <p>{tr("此轮及后续对话将移除；确认后原输入可恢复到草稿。")}</p>}
          {!!preview.conflicts.length && <><p role="alert">{tr("文件存在外部修改，当前禁止提交回退。")}</p><ul>{preview.conflicts.map(conflict => <li key={conflict.path}>{conflict.path} ({conflict.type})</li>)}</ul></>}
          {preview.error && <p role="alert">{preview.error}</p>}
        </div>}
        <div className="ui-actions"><Btn disabled={busy} onClick={() => void showPreview(mode)}>{tr("刷新预览")}</Btn>
        <Btn variant="primary" disabled={busy || !preview || !canCommitRewind(preview) || session.agentState !== "idle"} onClick={() => void commit()}>{tr("确认回退")}</Btn></div>
      </>}
      {!point && !busy && !error && <p>{tr("此轮没有可用的内核检查点。")}</p>}
      {error && <p role="alert">{error}</p>}
      <Btn disabled={busy} onClick={() => setOpen(false)}>{tr("取消")}</Btn>
    </Dialog>
  </div>;
}
