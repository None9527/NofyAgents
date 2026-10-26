import test from "node:test";
import assert from "node:assert/strict";
import { activityPhase, activitySummary, aggregatePhase, editFragment, activityCounts } from "../renderer/features/conversation/activityModel.ts";
import type { ActivityTool } from "../renderer/features/conversation/activityModel.ts";
const tool=(fields:Partial<ActivityTool>={}):ActivityTool=>({kind:"tool-call",id:"x",toolCallId:"x",title:"Tool",name:null,toolKind:"execute",status:"completed",rawInput:null,locations:[],argsDelta:"",resultText:"",rawOutput:null,interactionPending:false,interactionKind:null,...fields});
test("activity summaries retain full paths and prioritize actual commands over working directories",()=>{
  const command=activitySummary(tool({rawInput:{command:"pnpm test",path:"/workspace"}}));
  assert.equal(command.detail,"pnpm test");assert.equal(command.label,"已运行");
  const file=activitySummary(tool({toolKind:"read",rawInput:{file_path:"C:\\project\\src\\config.ts"}}));
  assert.equal(file.filename,"config.ts");assert.equal(file.parent,"C:/project/src");
  assert.equal(file.detail,"C:\\project\\src\\config.ts");
  assert.equal(activitySummary(tool({toolKind:"read",rawInput:{path:"README.md"}})).parent,undefined);
  assert.equal(activitySummary(tool({status:"failed"})).label,"运行命令");
  assert.equal(activitySummary(tool({toolKind:"other",name:"grep",status:"running"})).label,"搜索");
});
test("tool phases follow authoritative status and unknown output never implies success",()=>{
  for(const status of ["running","in_progress"])assert.equal(activityPhase(tool({status})),"running");
  for(const status of ["completed","success"])assert.equal(activityPhase(tool({status})),"complete");
  for(const status of ["cancelled","interrupted"])assert.equal(activityPhase(tool({status})),"stopped");
  assert.equal(activityPhase(tool({status:"error"})),"failed");
  assert.equal(activityPhase(tool({status:null,resultText:"all done"})),"unknown");
  assert.equal(activityPhase(tool({status:"running",interactionPending:true})),"attention");
});
test("group status retains failed or pending work among completed reads",()=>{
  assert.equal(aggregatePhase([tool(),tool({status:"failed"})]),"failed");
  assert.equal(aggregatePhase([tool(),tool({status:"pending"})]),"pending");
  assert.equal(aggregatePhase([tool({status:"failed"}),tool({status:"running"})]),"running");
  assert.equal(aggregatePhase([]),"unknown");
});
test("only recognized edit fragments produce previews; empty insertions remain valid",()=>{
  assert.deepEqual(editFragment(tool({rawInput:{old_string:"a\r\nb",new_string:"c"}})),{before:["a","b"],after:["c"]});
  assert.deepEqual(editFragment(tool({rawInput:{old_string:"",new_string:"new"}})),{before:[],after:["new"]});
  assert.deepEqual(editFragment(tool({editPreviews:[{path:"a.ts",oldText:"actual",newText:"patch"}],rawInput:{old_string:"wrong",new_string:"wrong"}})),{before:["actual"],after:["patch"]});
  for(const rawInput of [null,{old_string:42,new_string:"x"},{content:"whole file"},{patch:"diff"}])assert.equal(editFragment(tool({rawInput})),null);
});
test("summary counts derive from real operation kinds and outcomes",()=>{
  const counts=activityCounts([tool({toolKind:"read"}),tool({toolKind:"edit",status:"failed"}),tool({toolKind:"execute"}),{kind:"agent-thought",id:"t",text:"thinking",closed:true}]);
  assert.deepEqual(counts,{tools:3,reads:1,edits:1,commands:1,failed:1,attention:0,thoughts:1});
});
