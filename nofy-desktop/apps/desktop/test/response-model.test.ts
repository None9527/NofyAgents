import { test } from 'node:test';
import assert from 'node:assert/strict';
import { turnClock, turnHookRuns } from '../renderer/features/conversation/responseModel.ts';
import type { Block } from '../renderer/core/store/state.ts';
test('clock keeps seconds across minute/hour boundaries and freezes at completion',()=>{
 const live={startedAt:1000,endedAt:null};
 assert.equal(turnClock(live,62500,'zh-CN'),'1 分 1 秒');
 assert.equal(turnClock(live,3662000,'en'),'1 h 1 m 1 s');
 assert.equal(turnClock({...live,endedAt:5000},99000,'zh-CN'),'4 秒');
 assert.equal(turnClock(live,0,'zh-CN'),'0 秒');
});
test('hook diagnostics decode real nested DTO, deduplicate replay and preserve unknown states',()=>{
 const hook:Block={kind:'event',id:'h1',tag:'hook:stop',payload:[
 {name:'ok',status:{status:'success',elapsed_ms:12}},
 {name:'gate',status:{status:'failed',blocked:true,error:'blocked',elapsed_ms:5}},
 {name:'broken',status:{status:'failed',error:'oops',elapsed_ms:0},output:'details'},
 {name:'skip',status:{status:'skipped'}},{name:'future',status:{status:'new-status'}},null]};
 const runs=turnHookRuns([hook,hook,{kind:'event',id:'h2',tag:'hook:start',payload:null}]);
 assert.deepEqual(runs.map(r=>r.status),['success','blocked','failed','skipped','unknown']);
 assert.equal(runs[0]!.elapsedMs,12);assert.equal(runs[2]!.elapsedMs,0);assert.equal(runs[2]!.output,'details');assert.equal(runs[3]!.elapsedMs,null);
});
