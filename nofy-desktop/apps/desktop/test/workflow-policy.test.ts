import test from 'node:test';
import assert from 'node:assert/strict';
import { presentWorkSegment, latestReasoningLine } from '../renderer/features/conversation/workflowModel.ts';
import { groupWorkBlocks } from '../renderer/features/conversation/workModel.ts';
import type { Block } from '../renderer/core/store/state.ts';
import type { TurnSegment } from '../renderer/features/conversation/spineModel.ts';
const answer: Block = { kind:'agent-message', id:'answer', text:'Result', closed:true, usage:null };
const thought: Block = { kind:'agent-thought', id:'thought', text:'Checking', closed:true };
const segment: TurnSegment = { key:'s', user:null, turn:{startedAt:1,endedAt:2}, middle:[thought], final:answer, running:false };
const tool = (id:string):Extract<Block,{kind:'tool-call'}> => ({ kind:'tool-call',id,toolCallId:id,name:'run_terminal_command',title:null,toolKind:'execute',status:'completed',rawInput:{command:id},locations:[],argsDelta:'',resultText:'',rawOutput:null,interactionPending:false,interactionKind:null });
test('running text remains chronological work, never prematurely promoted to final answer',()=>{
 const view=presentWorkSegment({...segment,running:true});
 assert.equal(view.answer,null); assert.equal(view.defaultOpen,true); assert.deepEqual([...view.history],['thought','answer']);
});
test('only successful completed tail text leaves the folding history',()=>{
 const view=presentWorkSegment(segment); assert.equal(view.answer,answer);assert.equal(view.defaultOpen,false);
 assert.deepEqual([...view.history],['thought']); assert.deepEqual(view.ordered,[thought,answer]);
});
test('following tool does not turn earlier commentary into final answer',()=>{
 const view=presentWorkSegment({...segment,following:[tool('last')]});
 assert.equal(view.answer,null);assert.equal(view.defaultOpen,true);assert.equal(view.ordered.at(-1)?.id,'last');
});
test('failure and cancellation preserve work even with a partial response',()=>{
 assert.equal(presentWorkSegment({...segment,turn:{startedAt:1,endedAt:2,feedback:{kind:'failed',message:'failed',at:2}}}).defaultOpen,true);
 assert.equal(presentWorkSegment({...segment,middle:[{...tool('stop'),status:'cancelled'}]}).defaultOpen,true);
});
test('diagnostic hook suffix does not absorb the final response',()=>{
 assert.equal(presentWorkSegment({...segment,following:[{kind:'event',id:'hook',tag:'hook:stop',payload:{}}]}).answer,answer);
});
test('failed tools and pending confirmations stay outside folded ordinary history',()=>{
 const failed={...tool('failed'),status:'failed'};
 const pending={...tool('permission'),interactionPending:true};
 const view=presentWorkSegment({...segment,middle:[thought,tool('ok'),failed,pending]});
 assert.deepEqual([...view.persistent],['failed','permission']);
 assert.deepEqual([...view.history],['thought','ok']);
 assert.equal(view.answer,answer);
});
test('visible response phase does not falsely identify a running message as final',()=>{
 const view=presentWorkSegment({...segment,running:true});
 assert.equal(view.phase,'responding');assert.equal(view.answer,null);
 assert.equal(presentWorkSegment({...segment,final:null,running:true}).phase,'working');
});
test('command stages preserve chronology and stop at actual text or reasoning boundaries',()=>{
 const items=groupWorkBlocks([tool('a'),tool('b'),thought,tool('c'),answer]);
 assert.deepEqual(items.map(item=>item.kind),['execute','block','execute','block']);
 assert.equal(items[0]?.kind==='execute'&&items[0].blocks.length,2);
});
test('reasoning summary refreshes one line and rolls only at nonempty line boundaries',()=>{
 assert.deepEqual(latestReasoningLine('first\nsecond\n'),{key:'1',text:'second'});
 assert.deepEqual(latestReasoningLine('first\nsecond grows'),{key:'1',text:'second grows'});
 assert.equal(latestReasoningLine('\r\n  '),null);
});
