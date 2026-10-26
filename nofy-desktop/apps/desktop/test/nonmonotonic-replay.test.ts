import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {initialState} from '../renderer/core/store/state.ts';import {normalizeNotification} from '../renderer/core/events.ts';import {reduce} from '../renderer/core/project.ts';
import type {JsonObject} from '../main/acp/connection.ts';
import {hasEventSequence,rememberEventSequence,type EventSequenceRanges} from '../renderer/core/eventSequence.ts';
const wire: Array<{method:string;params:JsonObject}>=readFileSync(new URL('../../../docs/fixtures/nonmonotonic-replay-2026-10-13.jsonl',import.meta.url),'utf8').trim().split('\n').map(l=>JSON.parse(l));
const replay=(state=initialState())=>wire.reduce((s,f)=>reduce(s,{type:'kernel/event',event:normalizeNotification(f.method,f.params)}),state);
test('actual cold replay retains out-of-order users, answers, tool results and terminal error',()=>{
 const state=replay(),s=state.sessions['replay-session']!;
 assert.equal(s.blocks.filter(b=>b.kind==='user-message').length,3);
 assert.equal(s.blocks.filter(b=>b.kind==='agent-message').length,2);
 const tools=s.blocks.filter(b=>b.kind==='tool-call');assert.equal(tools.length,6);
 assert.ok(tools.every(t=>t.resultText));assert.equal(s.turns.length,3);
 assert.equal(s.turns.at(-1)?.feedback?.kind,'failed');assert.equal(s.agentState,'idle');
 const again=replay(state);assert.equal(again.sessions['replay-session'],s,'repeated replay must not append duplicate chunks');
});
test('sequence membership preserves gaps and compresses adjacent arrivals immutably',()=>{
 let ranges:EventSequenceRanges=[];
 for(const seq of [12,9,7,8,10,15,14,13]) ranges=rememberEventSequence(ranges,seq);
 assert.deepEqual(ranges,[[7,10],[12,15]]);
 assert.equal(hasEventSequence(ranges,11),false);
 const merged=rememberEventSequence(ranges,11);
 assert.deepEqual(merged,[[7,15]]);assert.deepEqual(ranges,[[7,10],[12,15]]);
 assert.equal(rememberEventSequence(merged,9),merged);
});
test('fresh replay reset clears exact membership and reconstructs history',()=>{
 const state=replay();const cleared=reduce(state,{type:'session/replay-reset',sessionId:'replay-session'});
 assert.deepEqual(cleared.sessions['replay-session']!.seenEventSeqs,[]);
 const restored=replay(cleared).sessions['replay-session']!,original=state.sessions['replay-session']!;
 assert.deepEqual(restored.blocks,original.blocks);assert.deepEqual(restored.turns,original.turns);
 assert.deepEqual(restored.seenEventSeqs,original.seenEventSeqs);assert.equal(restored.agentState,'idle');
});
