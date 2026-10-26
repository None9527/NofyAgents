import assert from "node:assert/strict";
import test from "node:test";
import { resolveConversationSplit, CHAT_MIN_WIDTH } from "../renderer/ui/conversationLayout.ts";
import { conversationReadingMemory } from "../renderer/application/conversation/readingMemory.ts";
import { observePromptAdmission } from "../renderer/application/conversation/promptAdmission.ts";
import { createStore } from "../renderer/core/store/store.ts";
import { initialState } from "../renderer/core/store/state.ts";
import { reduce } from "../renderer/core/project.ts";
import { normalizeNotification } from "../renderer/core/events.ts";
import type { Runtime } from "../renderer/core/runtime.ts";
import type { TaskResult } from "../renderer/core/effects.ts";
const defer = <T>() => { let resolve!: (value:T)=>void; const promise = new Promise<T>(done => {resolve=done;}); return {promise,resolve}; };
function fixture() {
  const store = createStore(reduce, initialState());
  store.dispatch({type:"connection/initialized",result:{}});
  store.dispatch({type:"session/created",sessionId:"s",cwd:"/project",modelId:null});
  const user = (text:string) => store.dispatch({type:"kernel/event",event:normalizeNotification("session/update",{sessionId:"s",update:{sessionUpdate:"user_message_chunk",content:{type:"text",text}}})!});
  return {store,user,runtime:{store} as Runtime};
}
test("split resolution never sacrifices the conversation minimum at any sidebar geometry",()=>{
  for(let available=0;available<=1920;available++) for(const preferred of [320,548,760]) {
    const result=resolveConversationSplit(available,preferred);
    if(result.mode==="split") { assert.ok(available-result.width-1>=CHAT_MIN_WIDTH);assert.ok(result.width>=320); }
    else assert.ok(available<CHAT_MIN_WIDTH+320+1);
  }
});
test("reading state is session/client scoped and survives another view instance",()=>{
  const owner={},a=conversationReadingMemory(owner,"a"),b=conversationReadingMemory(owner,"b");
  const saved={following:false,top:800,anchor:"turn-3",offset:-20};a.write(saved);
  assert.deepEqual(conversationReadingMemory(owner,"a").read(),saved);assert.equal(b.read(),undefined);assert.equal(conversationReadingMemory({},"a").read(),undefined);
});
test("reading cache evicts oldest scopes and does not grow with unbounded navigation",()=>{
  const owner={};for(let i=0;i<80;i++) conversationReadingMemory(owner,String(i)).write({following:true,top:i,anchor:null,offset:0});
  assert.equal(conversationReadingMemory(owner,"0").read(),undefined);assert.equal(conversationReadingMemory(owner,"79").read()?.top,79);
});
test("prompt admission resolves on a new user echo while the execution RPC remains pending",async()=>{
  const f=fixture(),completion=defer<TaskResult>();
  const pending=observePromptAdmission(f.runtime,"s","hello","p1",()=>completion.promise);
  f.user("hello");assert.equal((await pending).ok,true);
  completion.resolve({ok:true,effect:"session/prompt"});
});
test("historical identical text cannot acknowledge a new submission",async()=>{
  const f=fixture();f.user("hello");const completion=defer<TaskResult>();let admitted=false;
  const pending=observePromptAdmission(f.runtime,"s","hello","p1",()=>completion.promise).then(value=>{admitted=true;return value;});
  f.store.dispatch({type:"session/activated",sessionId:"s"});await new Promise(done=>setTimeout(done,25));assert.equal(admitted,false);
  completion.resolve({ok:false,effect:"session/prompt",error:"rejected"});assert.equal((await pending).ok,false);
});
test("queue admission requires the submitted prompt id, not unrelated queued text",async()=>{
  const f=fixture(),completion=defer<TaskResult>();let admitted=false;
  const pending=observePromptAdmission(f.runtime,"s","hello","p1",()=>completion.promise).then(value=>{admitted=true;return value;});
  const queue=(id:string)=>f.store.dispatch({type:"kernel/event",event:normalizeNotification("_nofy/queue/changed",{sessionId:"s",entries:[{id,text:"hello"}]})!});
  queue("other");await new Promise(done=>setTimeout(done,25));assert.equal(admitted,false);queue("p1");assert.equal((await pending).ok,true);completion.resolve({ok:true,effect:"session/prompt"});
});
test("disconnect during admission returns failure without waiting for the old RPC",async()=>{
  const f=fixture(),completion=defer<TaskResult>();const pending=observePromptAdmission(f.runtime,"s","hello","p1",()=>completion.promise);
  f.store.dispatch({type:"connection/status",status:"reconnecting"});assert.equal((await pending).ok,false);completion.resolve({ok:false,effect:"session/prompt",error:"closed"});
});
test("a rejected queued prompt cannot stop the already running turn",()=>{
  const f=fixture();f.store.dispatch({type:"session/turn-requested",sessionId:"s"});
  f.store.dispatch({type:"session/turn-failed",sessionId:"s",error:"queued request rejected",preserveRunning:true});
  assert.equal(f.store.getState().sessions.s?.agentState,"turn-running");assert.equal(f.store.getState().sessions.s?.blocks.at(-1)?.kind,"event");
});
