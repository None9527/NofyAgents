import type { Block } from "../../core/store/state.ts";
import { toolPresentation } from "./workModel.ts";
export type ActivityTool=Extract<Block,{kind:"tool-call"}>;
export type ActivityPhase="pending"|"running"|"complete"|"failed"|"stopped"|"attention"|"unknown";
/** Human-facing summary uses operation semantics; raw identifiers stay in technical details. */
export function activitySummary(block: ActivityTool) {
  const info = toolPresentation(block), phase = activityPhase(block);
  const complete = phase === "complete";
  const identity = (block.name ?? block.title ?? block.toolKind ?? "").toLowerCase();
  const label = info.family === "execute" ? (complete ? "已运行" : phase === "pending" ? "准备命令" : "运行命令")
    : info.family === "edit" ? (complete ? "已编辑" : "编辑文件")
    : info.family === "explore" ? (/grep|search|find/.test(identity) ? (complete ? "已搜索" : "搜索")
      : /list|glob/.test(identity) ? (complete ? "已浏览" : "浏览") : (complete ? "已读取" : "读取"))
    : block.title ?? block.name ?? "工具调用";
  const path = info.path ?? block.editPreviews?.[0]?.path;
  const detail = info.detail ?? path;
  const normalized = path?.replace(/\\/g, "/");
  return { ...info, label, detail, filename: normalized?.split("/").at(-1), parent: normalized?.includes("/") ? normalized.slice(0, normalized.lastIndexOf("/")) : undefined };
}
export function activityPhase(block:ActivityTool):ActivityPhase {
  if(block.interactionPending)return "attention";
  if(block.status === null && (block.argsDelta || block.rawInput !== null) && block.resultText === null && block.rawOutput === null) return "pending";
  switch(block.status){case "pending":return "pending";case "running":case "in_progress":return "running";case "success":case "completed":return "complete";case "failed":case "error":return "failed";case "cancelled":case "canceled":case "interrupted":return "stopped";default:return "unknown";}
}
export function aggregatePhase(blocks:ActivityTool[]):ActivityPhase {
  const phases=blocks.map(activityPhase);
  return (["attention","running","failed","pending","stopped","unknown","complete"] as const).find(phase=>phases.includes(phase))??"unknown";
}
/** Known edit input only. These are operation fragments, never claimed as a full file/turn diff. */
export function editFragment(block:ActivityTool) {
  const preview=block.editPreviews?.[0];
  const input=block.rawInput&&typeof block.rawInput==="object"?block.rawInput as Record<string,unknown>:{};
  const before=preview?preview.oldText:input.old_string??input.oldText??input.old_text;
  const after=preview?preview.newText:input.new_string??input.newText??input.new_text;
  if(typeof before!=="string"||typeof after!=="string")return null;
  const lines=(s:string)=>s?s.replace(/\r\n/g,"\n").split("\n"):[];
  return {before:lines(before),after:lines(after)};
}
export function activityCounts(blocks:Block[]) {
  const tools=blocks.filter((b):b is ActivityTool=>b.kind==="tool-call");
  return {tools:tools.length,reads:tools.filter(b=>toolPresentation(b).family==="explore").length,commands:tools.filter(b=>toolPresentation(b).family==="execute").length,edits:tools.filter(b=>toolPresentation(b).family==="edit").length,failed:tools.filter(b=>activityPhase(b)==="failed").length,attention:tools.filter(b=>activityPhase(b)==="attention").length,thoughts:blocks.filter(b=>b.kind==="agent-thought").length};
}
