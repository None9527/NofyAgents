#!/usr/bin/env node
/** Isolated task overview fixture: only reads the temporary test workspace. */
import { createInterface } from 'node:readline';
import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
if (!process.env.NOFY_E2E_LOG || !process.env.NOFY_HOME) throw new Error('Isolation required');
const cwd=process.env.NOFY_WORKSPACE, sessions=new Map(); let next=0,seq=0;
const send=frame=>process.stdout.write(JSON.stringify({jsonrpc:'2.0',...frame})+'\n');
const reply=(id,result)=>send({id,result});
const error=(id,message)=>send({id,error:{code:-32000,message}});
const info=id=>({sessionId:id,models:{currentModelId:'fixture',availableModels:[{modelId:'fixture',name:'Fixture'}]},_meta:{currentWorkingDirectory:cwd,'nofy/sessionDetail':{sessionId:id,cwd,title:sessions.get(id).title,kind:'build'}}});
const event=(id,kind,fields={},extension=false)=>{const f={method:extension?'_nofy/session/update':'session/update',params:{sessionId:id,update:{sessionUpdate:kind,...fields},_meta:{eventId:String(++seq)}}};sessions.get(id).events.push(f);send(f);};
createInterface({input:process.stdin}).on('line',line=>{
 const f=JSON.parse(line),p=f.params??{};appendFileSync(process.env.NOFY_E2E_LOG,JSON.stringify(f)+'\n');
 if(f.method==='initialize')reply(f.id,{protocolVersion:1,agentCapabilities:{loadSession:true,promptCapabilities:{embeddedContext:true}},authMethods:[]});
 else if(f.method==='session/new'){const id=`task-${++next}`;sessions.set(id,{sessionId:id,cwd,title:`Overview ${next}`,activity:'idle',resident:true,events:[]});reply(f.id,info(id));}
 else if(f.method==='session/load'){reply(f.id,info(p.sessionId));for(const e of sessions.get(p.sessionId).events)send(e);}
 else if(f.method==='_nofy/sessions/list')reply(f.id,{sessions:[...sessions.values()].map(({events,...s})=>({...s,lastChangeUnixMs:Date.now()}))});
 else if(f.method==='_nofy/session/rename'){if(p.title==='reject')return error(f.id,'Rename rejected by fixture');sessions.get(p.sessionId).title=p.title;event(p.sessionId,'session_info_update',{title:p.title});reply(f.id,{success:true});}
 else if(f.method==='_nofy/session/fork'){const id=`task-${++next}`;sessions.set(id,{...sessions.get(p.sourceSessionId),sessionId:id,title:'Forked overview',events:[]});reply(f.id,{newSessionId:id,newCwd:cwd});}
 else if(f.method==='_nofy/session/delete'){sessions.delete(p.sessionId);reply(f.id,{success:true});}
 else if(f.method==='_nofy/git/status'){if(existsSync(join(cwd,'fail-git')))return error(f.id,'Git fixture unavailable');reply(f.id,{result:{root:cwd,branch:'main',staged:[],unstaged:[{path:'A.md',type:'edit',staged:false,additions:12,deletions:3}]}});}
 else if(f.method==='_nofy/git/branches')reply(f.id,{result:{currentBranch:'main',repoRoot:cwd,branches:[{name:'main',current:true,remote:false},{name:'feature',current:false,remote:false},{name:'origin/main',current:false,remote:true}]}});
 else if(f.method==='_nofy/git/stage'){if(!Array.isArray(p.paths)||p.paths.length!==1||p.paths[0]!=='A.md')return error(f.id,'stage paths rejected');reply(f.id,{result:{paths:['A.md']}});}
 else if(f.method==='_nofy/git/unstage')reply(f.id,{result:{}});
 else if(f.method==='_nofy/git/discard'){if(p.scope!=='working'||p.includeUntracked!==false||!Array.isArray(p.paths)||p.paths[0]!=='A.md')return error(f.id,'discard shape rejected');reply(f.id,{result:{}});}
 else if(f.method==='_nofy/git/commit'){if(p.message==='ship'&&p.push===true&&p.amend!==true&&p.signoff!==true&&p.sync!==true&&p.stageAll!==true)return reply(f.id,{result:{commitHash:'abc123',output:'[main abc123] ship'},error:'pushed with warning'});return error(f.id,'commit shape rejected');}
 else if(f.method==='_nofy/git/checkout'){if((p.create===true&&p.branch==='topic')||(p.create===false&&p.branch==='feature'))return reply(f.id,{result:{}});return error(f.id,'checkout rejected');}
 else if(f.method==='_nofy/git/diffs'){const ok=p.from==='origin/main'&&p.to==='HEAD'&&p.mergeBase===true&&p.includePatch===true;reply(f.id,{result:{files:ok?[{path:'A.md',type:'edit',additions:1,deletions:1,patch:'@@ -1 +1 @@\n-old\n+new\n'}]:[]}});}
 else if(f.method==='_nofy/fs/list')reply(f.id,{result:{nodes:readdirSync(p.path).map(name=>({name,path:join(p.path,name),type:'file'})),truncated:false}});
 else if(f.method==='_nofy/fs/read_file')reply(f.id,{result:{content:readFileSync(p.path,'utf8'),size:20,lineCount:1,type:'text'}});
 else if(f.method==='session/prompt'){
  const id=p.sessionId;text: {const text=p.prompt.filter(b=>b.type==='text').map(b=>b.text).join(' ');event(id,'user_message_chunk',{content:{type:'text',text}});if(text==='hold'){sessions.get(id).pending=f.id; sessions.get(id).activity='working';break text;}
  for(const name of ['A.md','B.ts','C.txt','D.json']) event(id,'tool_call',{toolCallId:name,title:'Read '+name,kind:'read',status:'completed',locations:[{path:join(cwd,name)}]});
  event(id,'tool_call',{toolCallId:'agent-1',title:'task',status:'completed',rawInput:{description:'Inspect references',subagent_type:'research'},content:[{type:'text',text:'Subagent started in background.\nsubagent_id: child-1\ntype: research\ndescription: Inspect references'}]});
  event(id,'agent_message_chunk',{content:{type:'text',text:'Overview fixture complete. Files and agents belong to this task.'}});
  event(id,'response_completed',{},true);event(id,'turn_completed',{stop_reason:'end_turn'},true);reply(f.id,{stopReason:'end_turn'});}
 }
 else if(f.method==='session/cancel'){const s=sessions.get(p.sessionId);s.activity='idle';event(p.sessionId,'turn_completed',{stop_reason:'cancelled'},true);reply(s.pending,{stopReason:'cancelled'});}
 else if(f.id!==undefined)reply(f.id,{});
});
