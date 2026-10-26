import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { useRef, useState } from "react";
import { Btn } from "../../ui/primitives.tsx";
import { Field, TextInput } from "../../ui/forms.tsx";
import { Dialog } from "../../ui/dialog.tsx";
import { MenuButton } from "../../ui/menu.tsx";
import { organizationCommands, sessionCommandAvailability } from "./sessionCommands.ts";
import { IconEllipsis } from "../../ui/icons.tsx";
import type { Runtime } from "../../core/runtime.ts";
import type { SessionState } from "../../core/store/state.ts";
import { serviceResponse } from "../../core/service-actions.ts";
import { exportLoadedConversation } from "../conversation/public.ts";
import { forkAtTurnEffect } from "../conversation/public.ts";
import { EMPTY_SESSION_METADATA } from "./sessionMetadataModel.ts";
import type { SessionMetadata, SessionMetadataPatch } from "./sessionMetadataModel.ts";

export type SessionActionsMenuProps = {
  metadata?: SessionMetadata;
  onMetadataChange?: (patch: SessionMetadataPatch) => void;
  runtime: Runtime;
  session: Pick<SessionState, "id" | "cwd" | "title" | "agentState">;
  onSelectSession: (sessionId: string, cwd: string) => void | Promise<void>;
  onDeleted?: (sessionId: string) => void;
  saveText: (content: string, filename: string) => Promise<boolean>;
  onError?: (message: string) => void;
};
export function SessionActionsMenu({ runtime, session, onSelectSession, onDeleted, saveText, onError, metadata = EMPTY_SESSION_METADATA, onMetadataChange }: SessionActionsMenuProps) {
  useLocale();
  const lock = useRef(false);
  const [action, setAction] = useState<"rename" | "delete" | "group" | null>(null);
  const [group, setGroup] = useState("");
  const [title, setTitle] = useState(session.title ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const execute = async (job: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true); setError(null);
    try { await job(); setAction(null); }
    catch (e) { const message = e instanceof Error ? e.message : String(e); setError(message); onError?.(message); }
    finally { lock.current = false; setBusy(false); }
  };
  const request = async (operation: "sessionRename" | "sessionDelete", params: Record<string, unknown>) => {
    const result = await runtime.effect({ kind: "service/request", operation, params });
    if (!result.ok) throw new Error(result.error);
    if (serviceResponse(result.value)["success"] !== true) throw new Error("Kernel did not confirm the operation");
  };
  const running = session.agentState !== "idle";
  const available = sessionCommandAvailability(runtime.store.getState().connection.status === "ready", running, session.cwd);
  const organization = organizationCommands(metadata, running);
  const ensureIdle = () => {
    const current = runtime.store.getState().sessions[session.id];
    if (!current || current.agentState !== "idle") throw new Error(tr("请先停止当前回合"));
  };
  const pick = (id: string) => {
    setError(null);
    const local = organization.find(command => command.id === id);
    if (local) { if (!local.disabled) onMetadataChange?.(local.patch); return; }
    if (id === "rename") { setTitle(session.title ?? ""); setAction("rename"); }
    if (id === "group") { setGroup(metadata.group ?? ""); setAction("group"); }
    if (id === "delete") setAction("delete");
    if (id === "copyPath") void execute(async () => { if (session.cwd) await runtime.bridge.copyFilePath(session.cwd); });
    if (id === "export") void execute(async () => {
      const current = runtime.store.getState().sessions[session.id];
      if (!current) throw new Error(tr("会话已失效"));
      const output = exportLoadedConversation(current); await saveText(output.text, output.filename);
    });
    if (id === "fork") void execute(async () => {
      ensureIdle();
      if (!session.cwd) throw new Error(tr("会话缺少工作目录"));
      const result = await runtime.effect(forkAtTurnEffect(session.id, session.cwd));
      if (!result.ok) throw new Error(result.error);
      const data = serviceResponse(result.value);
      if (typeof data["newSessionId"] !== "string" || typeof data["newCwd"] !== "string") throw new Error(tr("Fork 未返回新会话身份"));
      await runtime.effect({ kind: "roster/pull" });
      await onSelectSession(data["newSessionId"], data["newCwd"]);
    });
  };
  return <div className="session-actions">
    <MenuButton variant="icon" chevron={false} title={tr("会话操作")} trigger={<IconEllipsis size={16}/>} disabled={busy}
      items={[
        { id: "rename", label: tr("重命名"), disabled: !available.rename },
        ...(onMetadataChange ? organization.filter(command => command.id !== "archive").map(command => ({ ...command, label: tr(command.label) })) : []),
        ...(onMetadataChange ? [{ id: "group", label: tr("设置本地分组…") }] : []),
        { id: "fork", label: tr("分叉为新会话"), separatorBefore: true, disabled: !available.fork, hint: running ? tr("运行中") : undefined },
        { id: "export", label: tr("导出已加载内容…"), separatorBefore: true },
        { id: "copyPath", label: tr("复制工作区路径"), disabled: !available.copyPath },
        ...(onMetadataChange ? organization.filter(command => command.id === "archive").map(command => ({ ...command, label: tr(command.label), separatorBefore: true, hint: command.disabled ? tr("运行中") : undefined })) : []),
        { id: "delete", label: tr("删除会话…"), disabled: !available.delete },
      ]} onPick={pick}/>
    <Dialog open={!!error && !action} title={tr("操作未完成")} onClose={() => setError(null)}><p role="alert">{error}</p><Btn onClick={() => setError(null)}>{tr("关闭")}</Btn></Dialog>
    <Dialog open={action !== null} title={tr(action === "group" ? "设置本地分组…" : action === "rename" ? "重命名" : "删除会话…")} busy={busy} onClose={() => { setAction(null); setError(null); }}>
      {action === "group" && <form className="ui-form" onSubmit={(e) => { e.preventDefault(); onMetadataChange?.({ group: group.trim() || null }); setAction(null); }}>
        <Field label={tr("本地分组名称")}><TextInput autoFocus value={group} maxLength={80} onChange={(e) => setGroup(e.target.value)} /></Field>
        <p>{tr("留空移出分组。分组只保存在本机，不同步到内核或云端。")}</p>
        <Btn variant="primary" type="submit">{tr("保存分组")}</Btn>
      </form>}
      {action === "rename" && <form className="ui-form" onSubmit={e => { e.preventDefault(); void execute(async () => {
        await request("sessionRename", { sessionId: session.id, title: title.trim(), ...(session.cwd ? { cwd: session.cwd } : {}) });
        await runtime.effect({ kind: "roster/pull" });
      }); }}>
        <Field label={tr("会话标题")}><TextInput autoFocus value={title} onChange={e => setTitle(e.target.value)} disabled={busy} /></Field>
        <Btn variant="primary" type="submit" disabled={busy || !title.trim()}>{tr("保存")}</Btn>
      </form>}
      {action === "delete" && <div className="ui-form"><p>{tr("永久删除此会话的历史记录。工作区文件保留。")}</p><Btn variant="danger" disabled={busy} onClick={() => void execute(async () => {
        ensureIdle();
        await request("sessionDelete", { sessionId: session.id, ...(session.cwd ? { cwd: session.cwd } : {}) });
        onDeleted?.(session.id);
        await runtime.effect({ kind: "roster/pull" });
      })}>{tr("确认删除")}</Btn></div>}
      {error && <p role="alert">{error}</p>}
      <Btn type="button" disabled={busy} onClick={() => { setAction(null); setError(null); }}>{tr("取消")}</Btn>
    </Dialog>
  </div>;
}
