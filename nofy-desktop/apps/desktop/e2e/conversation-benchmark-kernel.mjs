#!/usr/bin/env node
/** Deterministic benchmark corpus. No credentials, real project data or model requests. */
import { createInterface } from 'node:readline';
import { appendFileSync } from 'node:fs';
const trace=value=>{if(process.env.NOFY_BENCH_LOG)appendFileSync(process.env.NOFY_BENCH_LOG,JSON.stringify(value)+'\n');};
const cwd=process.env.NOFY_WORKSPACE; if(!process.env.NOFY_HOME||!cwd)throw new Error('isolated environment required');
const sessions=new Map();let next=0;
const send=f=>{if(f.id!==undefined&&f.result?.stopReason)trace({kind:'completed',id:f.id});return process.stdout.write(JSON.stringify({jsonrpc:'2.0',...f})+'\n');};
const reply=(id,result)=>send({id,result});
const update=(sid,kind,fields={},ext=false)=>{const s=sessions.get(sid);const frame={method:ext?'_nofy/session/update':'session/update',params:{sessionId:sid,update:{sessionUpdate:kind,...fields},_meta:{eventId:`${sid}-${++s.seq}`}}};s.events.push(frame);send(frame);};
const response=sid=>({sessionId:sid,models:{currentModelId:'benchmark',availableModels:[{modelId:'benchmark',name:'Benchmark'}]},_meta:{currentWorkingDirectory:cwd,'nofy/sessionDetail':{sessionId:sid,cwd,title:sessions.get(sid).title,kind:'build'}}});
createInterface({input:process.stdin}).on('line',line=>{
 const f=JSON.parse(line),p=f.params??{};if(!f.method)return;if(f.method==='session/prompt')trace({kind:'submitted',id:f.id,text:(p.prompt??[]).filter(b=>b.type==='text').map(b=>b.text).join('')});
 if(f.method==='initialize')reply(f.id,{protocolVersion:1,agentCapabilities:{loadSession:true,promptCapabilities:{embeddedContext:true}},authMethods:[]});
 else if(f.method==='session/new'){const sid=`bench-${++next}`;sessions.set(sid,{seq:0,events:[],title:`Bench ${next}`});reply(f.id,response(sid));}
 else if(f.method==='session/load'){reply(f.id,response(p.sessionId));for(const frame of sessions.get(p.sessionId).events)send(frame);}
 else if(f.method==='_nofy/sessions/list')reply(f.id,{sessions:[...sessions].map(([sessionId,s])=>({sessionId,cwd,title:s.title,activity:'idle',resident:true}))});
 else if(f.method==='session/prompt'){
  const sid=p.sessionId,text=(p.prompt??[]).filter(b=>b.type==='text').map(b=>b.text).join('');
  const size=/^bench:(1000|10000)$/.exec(text)?.[1];
  if(size){for(let i=0;i<Number(size)/2;i++){update(sid,'user_message_chunk',{content:{type:'text',text:`Bench user ${i}`},_meta:{promptIndex:i}});update(sid,'agent_message_chunk',{content:{type:'text',text:`Bench reply ${i} **bold**`}});update(sid,'response_completed',{usage:{}},true);update(sid,'turn_completed',{stop_reason:'end_turn',usage:{}},true);}reply(f.id,{stopReason:'end_turn'});}
  else if(text==='bench:dynamic'){update(sid,'user_message_chunk',{content:{type:'text',text}});update(sid,'agent_message_chunk',{content:{type:'text',text:'# Intermediate details\n\n'+Array.from({length:60},(_,i)=>'Expanded paragraph '+i).join('\n\n')}});update(sid,'response_completed',{usage:{}},true);update(sid,'agent_message_chunk',{content:{type:'text',text:'Dynamic final'}});update(sid,'response_completed',{usage:{}},true);update(sid,'turn_completed',{stop_reason:'end_turn',usage:{}},true);reply(f.id,{stopReason:'end_turn'});}
  else if(text==='bench:stream'){
   update(sid,'user_message_chunk',{content:{type:'text',text}});let tick=0;const timer=setInterval(()=>{update(sid,'agent_message_chunk',{content:{type:'text',text:` chunk-${++tick}`}});if(tick===20){clearInterval(timer);update(sid,'response_completed',{usage:{}},true);update(sid,'turn_completed',{stop_reason:'end_turn',usage:{}},true);reply(f.id,{stopReason:'end_turn'});}},40);
  }else reply(f.id,{stopReason:'end_turn'});
 }else if(f.method==='session/cancel')reply(f.id,{});
 else if(f.id!==undefined)reply(f.id,{});
});
