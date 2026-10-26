import test from "node:test";
import assert from "node:assert/strict";
import { createSettingsClient } from "../renderer/application/settings/client.ts";
import { initialState } from "../renderer/core/store/state.ts";
import type { Effect, TaskResult } from "../renderer/core/effects.ts";
const okay = (value: unknown): TaskResult => ({ok:true,effect:"service/request",value});
function fixture(read: (effect: Effect) => Promise<TaskResult>) {
  const state=initialState();state.connection.status="ready";const calls:Effect[]=[];
  const client=createSettingsClient(async effect=>{calls.push(effect);return read(effect);},()=>state);
  return {state,calls,client};
}
test("credential acceptance clears the form only after authenticate, reload, and auth read-back",async()=>{
  const order:string[]=[];const f=fixture(async effect=>{assert.equal(effect.kind,"service/request");if(effect.kind!=="service/request")throw Error();order.push(effect.operation);return effect.operation==="authInfo"?okay({result:{methodId:"api_key"}}):okay({result:{ok:true}});});
  const result=await f.client.credentials.save(" fake-test ",()=>order.push("accepted"));assert.equal(result.kind,"success");assert.deepEqual(order,["setApiKey","modelAuthenticate","modelsReload","authInfo","accepted"]);assert.deepEqual(f.calls[0],{kind:"service/request",operation:"setApiKey",params:{key:"fake-test"}});
});
test("unconfirmed credential writes preserve the form and never authenticate",async()=>{
  const f=fixture(async()=>okay({result:{ok:false}}));let accepted=false;assert.equal((await f.client.credentials.save("fake",()=>accepted=true)).kind,"error");assert.equal(accepted,false);assert.equal(f.calls.length,1);
});
test("reconnect after a credential write blocks old authentication and old form callbacks",async()=>{
  const f=fixture(async()=>{f.state.connection.transportEpoch++;return okay({result:{ok:true}});});let accepted=false;const result=await f.client.credentials.save("fake",()=>accepted=true);assert.equal(result.kind,"error");if(result.kind==="error")assert.equal(result.code,"stale");assert.equal(accepted,false);assert.equal(f.calls.length,1);
});
test("authentication failure keeps the credential draft",async()=>{
  const f=fixture(async effect=>effect.kind==="service/request"&&effect.operation==="modelAuthenticate"?{ok:false,effect:"service/request",error:"method_not_found"}:okay({result:{ok:true}}));
  let key="sk-test";const result=await f.client.credentials.save(key,()=>{key="";});assert.equal(result.kind,"error");if(result.kind==="error")assert.equal(result.message,"凭据已保存，认证失败：method_not_found");assert.equal(key,"sk-test");assert.equal(f.calls.length,2);
});
test("a model reload failure keeps the credential draft",async()=>{
  const f=fixture(async effect=>effect.kind==="service/request"&&effect.operation==="modelsReload"?{ok:false,effect:"service/request",error:"reload failed"}:okay({result:{ok:true}}));
  let key="sk-test";const result=await f.client.credentials.save(key,()=>{key="";});assert.equal(result.kind,"error");if(result.kind==="error")assert.equal(result.message,"凭据已保存；模型刷新失败：reload failed");assert.equal(key,"sk-test");assert.deepEqual(f.calls.map(call=>call.kind==="service/request"?call.operation:call.kind),["setApiKey","modelAuthenticate","modelsReload"]);
});
test("credential save without an api_key read-back keeps the draft",async()=>{
  const f=fixture(async()=>okay({result:{ok:true}}));let key="sk-test";const result=await f.client.credentials.save(key,()=>{key="";});assert.equal(result.kind,"error");if(result.kind==="error")assert.equal(result.message,"内核未回读确认。");assert.equal(key,"sk-test");assert.equal(f.calls.length,4);
});
test("concurrent forms share the credential transaction lock",async()=>{
  let finish!:(result:TaskResult)=>void;const f=fixture(async()=>new Promise(done=>finish=done));const first=f.client.credentials.save("fake",()=>{});const second=await f.client.credentials.save("other",()=>{});assert.equal(second.kind,"error");if(second.kind==="error")assert.equal(second.code,"busy");finish(okay({result:{ok:false}}));await first;
});
test("authentication catalogs expose only the method, never a key returned by a service",async()=>{
  const f=fixture(async()=>okay({result:{methodId:"api_key",apiKey:"fake-private-field",other:"hidden"}}));assert.deepEqual(await f.client.catalog.read("auth",null,null),{methodId:"api_key"});
});
test("bundle detail rejects missing content and a changed transport",async()=>{
  const missing=fixture(async()=>okay({result:{}}));await assert.rejects(()=>missing.client.catalog.entry("agent","a"));const stale=fixture(async()=>{stale.state.connection.transportEpoch++;return okay({result:{content:"old"}});});await assert.rejects(()=>stale.client.catalog.entry("persona","p"));
});
function skillValue(name: string, enabled: boolean) {
  return { result: { skills: [{ name, description: "", path: "/skills/" + name, scope: "user", user_invocable: true, enabled }] } };
}
test("skill toggle sends the skill name, enabled flag, and workspace cwd", async () => {
  const f = fixture(async () => okay(skillValue("review", false)));
  const result = await f.client.catalog.toggleSkill("review", false, "/work/app");
  assert.equal(result.kind, "success");
  assert.deepEqual(f.calls, [{ kind: "skills/toggle", name: "review", enabled: false, cwd: "/work/app" }]);
});
test("skill toggle preserves a kernel transport error", async () => {
  const f = fixture(async () => ({ ok: false, effect: "skills/toggle", error: "Skill 'review' not found" }));
  assert.deepEqual(await f.client.catalog.toggleSkill("review", false, "/work/app"), { kind: "error", code: "remote", message: "Skill 'review' not found" });
});
test("skill toggle treats an ExtMethodResult error as failure even when the list matches", async () => {
  const value = { ...skillValue("review", false), error: "Failed to save config: disk" };
  const f = fixture(async () => okay(value));
  const result = await f.client.catalog.toggleSkill("review", false, "/work/app");
  assert.equal(result.kind, "error");
  if (result.kind === "error") assert.equal(result.message, "Failed to save config: disk");
});
test("skill toggle shows an ExtMethodError message from the envelope", async () => {
  const f = fixture(async () => okay({ result: null, error: { code: "save", message: "Failed to save config: disk" } }));
  const result = await f.client.catalog.toggleSkill("review", false, "/work/app");
  assert.equal(result.kind, "error");
  if (result.kind === "error") assert.equal(result.message, "Failed to save config: disk");
});
test("skill toggle refuses an empty payload, a missing row, a missing flag, and a mismatched flag", async () => {
  const values: unknown[] = [{}, { result: { skills: [] } }, { result: { skills: [{ name: "other", enabled: false }] } }, { result: { skills: [{ name: "review" }] } }, { result: { skills: [{ name: "review", enabled: true }] } }];
  for (const value of values) {
    const f = fixture(async () => okay(value));
    const result = await f.client.catalog.toggleSkill("review", false, "/work/app");
    assert.equal(result.kind, "error");
    if (result.kind === "error") assert.equal(result.message, "内核未确认技能状态。");
  }
});
test("skill toggle does not call the kernel for an empty name, an empty cwd, or a connection that is not ready", async () => {
  const f = fixture(async () => okay(skillValue("review", true)));
  assert.equal((await f.client.catalog.toggleSkill("", true, "/work/app")).kind, "error");
  const missingCwd = await f.client.catalog.toggleSkill("review", true, "");
  assert.equal(missingCwd.kind, "error");
  if (missingCwd.kind === "error") assert.equal(missingCwd.code, "validation");
  f.state.connection.status = "idle";
  const stale = await f.client.catalog.toggleSkill("review", true, "/work/app");
  assert.equal(stale.kind, "error");
  if (stale.kind === "error") assert.equal(stale.code, "stale");
  assert.equal(f.calls.length, 0);
});
test("skill toggle drops a response when the connection epoch changes", async () => {
  const f = fixture(async () => { f.state.connection.transportEpoch++; return okay(skillValue("review", false)); });
  const result = await f.client.catalog.toggleSkill("review", false, "/work/app");
  assert.equal(result.kind, "error");
  if (result.kind === "error") assert.equal(result.code, "stale");
});
test("skill toggles share one write lock", async () => {
  let finish!: (result: TaskResult) => void;
  const f = fixture(async () => new Promise((done) => { finish = done; }));
  const first = f.client.catalog.toggleSkill("review", false, "/work/app");
  const second = await f.client.catalog.toggleSkill("other", true, "/work/app");
  assert.equal(second.kind, "error");
  if (second.kind === "error") assert.equal(second.code, "busy");
  finish(okay(skillValue("review", false)));
  assert.equal((await first).kind, "success");
  assert.equal(f.calls.length, 1);
});
test("native model configuration delegates the exact CAS patch without kernel service requests",async()=>{
  const state=initialState();let saved:unknown;const snapshot={editable:true,revisionHash:"r",models:[],defaultModelId:null} as never;
  const client=createSettingsClient(async()=>{throw Error("unexpected service call");},()=>state,{readModelConfig:async()=>snapshot,updateModelConfig:async patch=>{saved=patch;return snapshot;}});
  const patch={expectedRevision:"r",id:"test",name:"Test",makeDefault:true,apiBackend:"responses" as const};await client.models.save(patch);assert.equal(saved,patch);assert.equal(await client.models.read(),snapshot);
});
