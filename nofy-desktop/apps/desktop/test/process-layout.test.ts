import test from 'node:test';
import assert from 'node:assert/strict';
import { presentWorkSegment } from '../renderer/features/conversation/workflowModel.ts';
import { activityPhase } from '../renderer/features/conversation/activityModel.ts';
import { planEntries } from '../renderer/features/conversation/planModel.ts';
import type { Block } from '../renderer/core/store/state.ts';
import type { TurnSegment } from '../renderer/features/conversation/spineModel.ts';
const tool: Extract<Block,{kind:'tool-call'}>={kind:'tool-call',id:'tool',toolCallId:'t',name:'todo_write',title:'Updating plan',toolKind:'think',status:'completed',rawInput:null,locations:[],argsDelta:'',resultText:null,rawOutput:null,interactionPending:false,interactionKind:null};
const base:TurnSegment={key:'s',user:null,turn:null,middle:[],final:null,running:true};
const thought:Block={kind:'agent-thought',id:'thought',text:'checking',closed:true};
const blank:Block={kind:'agent-message',id:'blank',text:'\n\n',closed:true,usage:null};
const plan:Block={kind:'event',id:'plan',tag:'plan',payload:{entries:[{content:'Inspect files',status:'in_progress'}]}};
test('real thought, blank delta, plan tool and plan sequence has no phantom prose rows',()=>{
 const segment={...base,middle:[thought,blank,tool,{kind:'event',id:'hook',tag:'hook:stop',payload:[]} as Block,plan]};
 assert.deepEqual(presentWorkSegment(segment).ordered.map(b=>b.id),['thought','plan']);
 assert.equal(segment.middle.length,5,'stored transcript is preserved');
 assert.equal(presentWorkSegment({...base,final:blank,running:false}).answer,null);
 assert.deepEqual(presentWorkSegment({...base,final:{...blank,text:'Real text'}}).ordered.map(b=>b.id),['blank'],'same message appears when text arrives');
});
test('plan rendering never hides failed updates or unrelated tools',()=>{
 for(const changed of [{...tool,status:'failed'},{...tool,name:'other_tool'}])assert.deepEqual(presentWorkSegment({...base,middle:[changed,plan]}).ordered.map(b=>b.id),['tool','plan']);
});
test('plan decoder preserves status and rejects malformed entries without invented progress',()=>{
 assert.deepEqual(planEntries(plan.payload),[{content:'Inspect files',status:'in_progress'}]);
 assert.equal(planEntries({entries:[{status:'completed'}]}),null);
 assert.deepEqual(planEntries({entries:[{content:'Future',status:'new-state'}]}),[{content:'Future',status:'unknown'}]);
 assert.deepEqual(planEntries({entries:[]}),[]);
});
test('partial arguments and initial tool inputs remain pending, never imply success',()=>{
 assert.equal(activityPhase({...tool,status:null,argsDelta:'{"command":'}),'pending');
 assert.equal(activityPhase({...tool,status:null,rawInput:{command:'pwd'}}),'pending');
 assert.equal(activityPhase({...tool,status:null,resultText:'output'}),'unknown');
 assert.equal(activityPhase({...tool,status:'in_progress'}),'running');
});
