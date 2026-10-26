import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeNotification } from '../renderer/core/events.ts';
import { reduce } from '../renderer/core/project.ts';
import { initialState } from '../renderer/core/store/state.ts';
const sid = 'retry-session';
const records = readFileSync(new URL('../../../docs/fixtures/empty-response-retry-2026-10-13.jsonl', import.meta.url), 'utf8').trim().split('\n').map(l=>JSON.parse(l));
const notify = (state: ReturnType<typeof initialState>, method: string, params: Record<string, unknown>) => reduce(state, {type:'kernel/event',event:normalizeNotification(method,params)});
function started() {
 let s=reduce(initialState(),{type:'session/turn-requested',sessionId:sid});
 return notify(s,'session/update',{sessionId:sid,update:{sessionUpdate:'user_message_chunk',content:{type:'text',text:'检查目录'}}});
}
test('real retry wire: each attempt is visible, terminal failure converges and replays idempotently',()=>{
 let s=started();
 for(const r of records){
  s=notify(s,r.method,r.params);
  const f=s.sessions[sid]!.turns.at(-1)!.feedback;
  if(r.params.update.type==='retrying'){
   assert.equal(f?.kind,'retrying');assert.equal(f?.attempt,r.params.update.attempt);
   assert.equal(s.sessions[sid]!.agentState,'turn-running');
  }
 }
 const session=s.sessions[sid]!;
 assert.deepEqual(s.unhandled,{});
 assert.equal(session.agentState,'idle');assert.equal(session.stopReason,'error');
 assert.equal(session.turns.at(-1)?.feedback?.kind,'failed');assert.ok(session.turns.at(-1)?.endedAt);
 const once=s.sessions[sid];for(const r of records)s=notify(s,r.method,r.params);
 assert.equal(s.sessions[sid],once);
});
test('RPC failure closes streaming blocks and open turn even without turn_completed',()=>{
 let s=notify(started(),'session/update',{sessionId:sid,update:{sessionUpdate:'agent_thought_chunk',content:{type:'text',text:'checking'}}});
 s=reduce(s,{type:'session/turn-failed',sessionId:sid,error:'Connection lost'});
 const v=s.sessions[sid]!;assert.equal(v.agentState,'idle');assert.ok(v.turns.at(-1)?.endedAt);
 assert.equal(v.turns.at(-1)?.feedback?.kind,'failed');assert.equal(v.openAgentBlockId,null);
 assert.ok(v.blocks.every(b=>b.kind!=='agent-thought'||b.closed));
});
test('queued prompt rejection does not terminate the active turn',()=>{
 const s=reduce(started(),{type:'session/turn-failed',sessionId:sid,error:'queue rejected',preserveRunning:true});
 assert.equal(s.sessions[sid]!.agentState,'turn-running');assert.equal(s.sessions[sid]!.turns.at(-1)!.endedAt,null);
});
test('first real output clears retry indicator; success and cancellation never leave retry UI',()=>{
 for(const kind of ['agent_message_chunk','agent_thought_chunk','tool_call']){
  let s=notify(started(),records[0].method,records[0].params);
  s=notify(s,'session/update',{sessionId:sid,update:{sessionUpdate:kind,content:{type:'text',text:'recovered'},toolCallId:'tool',title:'read_file'}});
  assert.equal(s.sessions[sid]!.turns.at(-1)!.feedback,undefined,kind);
 }
 for(const reason of ['end_turn','cancelled']){
  let s=notify(started(),records[0].method,records[0].params);
  s=notify(s,'_nofy/session/update',{sessionId:sid,update:{sessionUpdate:'turn_completed',stop_reason:reason}});
  assert.equal(s.sessions[sid]!.turns.at(-1)!.feedback,undefined);
  assert.equal(s.sessions[sid]!.agentState,'idle');
 }
});
test('kernel begins queued turn after idle; authoritative user event restores running state',()=>{
 let s=notify(started(),'_nofy/session/update',{sessionId:sid,update:{sessionUpdate:'turn_completed',stop_reason:'end_turn'}});
 s=notify(s,'session/update',{sessionId:sid,update:{sessionUpdate:'agent_message_chunk',content:{type:'text',text:'previous answer'}}});
 s=notify(s,'session/update',{sessionId:sid,update:{sessionUpdate:'user_message_chunk',content:{type:'text',text:'queued turn'}}});
 assert.equal(s.sessions[sid]!.agentState,'turn-running');
 assert.equal(s.sessions[sid]!.turns.at(-1)?.endedAt,null);
});
test('turn_completed(error) alone exposes agent_result; session history keeps measured timestamps',()=>{
 let s=notify(initialState(),'session/update',{sessionId:sid,update:{sessionUpdate:'user_message_chunk',content:{type:'text',text:'prompt'}},_meta:{agentTimestampMs:1000}});
 s=notify(s,'_nofy/session/update',{sessionId:sid,update:{sessionUpdate:'turn_completed',stop_reason:'error',agent_result:'upstream refused'},_meta:{agentTimestampMs:8000}});
 assert.equal(s.sessions[sid]!.turns[0]?.feedback?.message,'upstream refused');
 assert.equal(s.sessions[sid]!.turns[0]?.endedAt,8000);
 assert.equal(s.sessions[sid]!.turns[0]?.startedAt,1000);
});
test('terminal outcome stops unfinished tool animation without claiming tool success',()=>{
 let s=notify(started(),'session/update',{sessionId:sid,update:{sessionUpdate:'tool_call',toolCallId:'partial',status:'running',title:'run_terminal_command'}});
 s=reduce(s,{type:'session/turn-failed',sessionId:sid,error:'transport closed'});
 const tool=s.sessions[sid]!.blocks.find(b=>b.kind==='tool-call');
 assert.equal(tool?.kind==='tool-call'&&tool.status,'interrupted');
});
test('argument streaming resumes after retry before tool execution starts',()=>{
 let s=notify(started(),records[0].method,records[0].params);
 s=notify(s,'_nofy/session/update',{sessionId:sid,update:{sessionUpdate:'tool_call_delta_chunk',tool_call_id:'tool',tool_index:0,arguments_delta:'{"command":'}});
 assert.equal(s.sessions[sid]!.turns.at(-1)!.feedback,undefined);
});
test('a message after empty failed turn starts a new turn even with adjacent user blocks',()=>{
 let s=reduce(started(),{type:'session/turn-failed',sessionId:sid,error:'empty response'});
 s=notify(s,'session/update',{sessionId:sid,update:{sessionUpdate:'user_message_chunk',content:{type:'text',text:'try again'}}});
 assert.equal(s.sessions[sid]!.turns.length,2);
 assert.equal(s.sessions[sid]!.turns.at(-1)?.endedAt,null);
 assert.equal(s.sessions[sid]!.turns[0]?.feedback?.kind,'failed');
});
