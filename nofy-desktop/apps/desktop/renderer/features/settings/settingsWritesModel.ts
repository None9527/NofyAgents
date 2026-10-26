import { tr } from "../../ui/i18n.ts";
export { decideModelSave, finishModelSave, modelConfigConfirms, modelResourceConfirms, settleSettingsWrite } from "../../application/settings/public.ts";
export type { ModelSaveExpectation, SettingsWriteSettlement } from "../../application/settings/public.ts";
/** Wire validation and result verdicts, independent of React and transport. */
export function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
export function response(value: unknown): Record<string, unknown> {
  const outer = record(value);
  return typeof outer['result'] === 'object' && outer['result'] !== null ? record(outer['result']) : outer;
}
export function writeVerdict(value: unknown): {ok:boolean; message:string; restart:boolean; reload:boolean} {
  const result = response(value);
  const status = result['status'];
  const ok = result['ok'] === true || status === 'success' || status === 'authenticated';
  return {ok,message:typeof result['message'] === 'string' ? result['message'] : typeof result['error'] === 'string' ? result['error'] : ok ? tr("已写入；正在重新读取内核状态。") : tr("操作未成功：{0}",[String(status ?? '返回值未确认成功')]),restart:result['requiresRestart']===true,reload:result['requiresReload']===true};
}
export type { McpDraft } from "../../application/settings/public.ts";
import type { McpDraft } from "../../application/settings/public.ts";
import { validateMcpDraft } from "../../application/settings/public.ts";
import { encodeMcpDefinition } from "../../core/settings/protocol.ts";
/** Compatibility for existing contract tests; views use SettingsClient. */
export function mcpWriteParams(draft: McpDraft, sessionId: string): Record<string, unknown> {
  return encodeMcpDefinition(sessionId, validateMcpDraft(draft));
}
export type HookRow = {name:string;event:string;source:string;handler:string;disabled:boolean};
export function readHookRows(value:unknown):HookRow[] {
  const list=response(value)['hooks'];
  return Array.isArray(list)?list.flatMap(item=>{
    const row=record(item);
    return typeof row['name']==='string' ? [{name:row['name'],event:String(row['event']??''),source:String(row['sourceDir']??''),handler:String(row['command']??row['url']??''),disabled:row['disabled']===true}] : [];
  }):[];
}
