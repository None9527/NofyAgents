import test from "node:test";
import assert from "node:assert/strict";
import { toolEditPreviews } from "../renderer/core/toolContent.ts";
import { reduce } from "../renderer/core/project.ts";
import { initialState } from "../renderer/core/store/state.ts";
import { normalizeNotification } from "../renderer/core/events.ts";
test("ACP diff is typed without confusing unrelated text or malformed content",()=>{
  assert.deepEqual(toolEditPreviews([{type:"diff",path:"a.ts",oldText:"old",newText:"new"},{type:"diff",path:"b.ts",newText:"content"},{type:"content",content:{type:"text",text:"output"}}]),[{path:"a.ts",oldText:"old",newText:"new"},{path:"b.ts",oldText:null,newText:"content"}]);
  assert.equal(toolEditPreviews([{type:"diff",path:"a.ts",newText:42}]),null);
});
test("later status and text updates retain the earlier edit preview and replay is idempotent",()=>{
  let state=reduce(initialState(),{type:"session/created",sessionId:"s",cwd:"/workspace",modelId:null});
  const event=(seq:number,content:unknown[],status:string)=>normalizeNotification("session/update",{sessionId:"s",update:{sessionUpdate:"tool_call_update",toolCallId:"edit",kind:"edit",status,content},_meta:{eventId:"s-"+seq}});
  const first=event(1,[{type:"diff",path:"a.ts",oldText:"old",newText:"new"}],"in_progress");
  state=reduce(state,{type:"kernel/event",event:first});
  state=reduce(state,{type:"kernel/event",event:event(2,[{type:"content",content:{type:"text",text:"Edited successfully"}}],"completed")});
  const block=state.sessions.s!.blocks[0]!;assert.equal(block.kind,"tool-call");
  if(block.kind!=="tool-call")return;
  assert.deepEqual(block.editPreviews,[{path:"a.ts",oldText:"old",newText:"new"}]);assert.equal(block.resultText,"Edited successfully");
  assert.equal(reduce(state,{type:"kernel/event",event:first}),state);
});
