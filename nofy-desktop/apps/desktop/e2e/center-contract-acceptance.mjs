import { loadPlaywright } from './playwright-driver.mjs';
import assert from 'node:assert/strict';
import { mkdtemp,mkdir,readFile,writeFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),appRoot=resolve(here,'..'),project=resolve(appRoot,'../..');
const temp=await mkdtemp(join(tmpdir(),'nofy-center-')),home=join(temp,'home'),nofy=join(temp,'nofy'),cwd=join(temp,'workspace'),gate=join(temp,'gate');
const output=join(project,'output/playwright','center-contract-'+new Date().toISOString().replaceAll(':','-'));
await Promise.all([home,nofy,cwd,output].map(p=>mkdir(p,{recursive:true})));await writeFile(gate,'hold');
const report={source:'isolated Electron + controlled ACP; actual content-axis geometry, lifecycle clock and scoped actions',cases:[],consoleErrors:[],output};let app,page;
async function check(name,fn){try{const details=await fn();report.cases.push({name,status:'passed',details});console.log('PASS '+name);}catch(e){report.cases.push({name,status:'failed',error:String(e)});console.error('FAIL '+name+': '+e);await page?.screenshot({path:join(output,report.cases.length+'-failure.png')}).catch(()=>{});}}
const wire=async()=> (await readFile(join(temp,'wire.jsonl'),'utf8')).trim().split('\n').map(JSON.parse);
try {
 let source=await readFile(join(here,'mock-kernel.mjs'),'utf8');
 source=source.replace("    reply(f.id, sessionResponse(sid));", "    reply(f.id, sessionResponse(sid));\n    event(sid,'hook_execution',{event_name:'session_start',runs:[{name:'startup-only',status:{status:'success',elapsed_ms:3}}]},true);");
 source=source.replace("    if (text === 'e2e:thought') {",`    if (text === 'e2e:contract') {
    event(sid,'agent_thought_chunk',{content:{type:'text',text:'检查表格边界与回合状态'}});
    event(sid,'hook_execution',{event_name:'user_prompt_submit',runs:[{name:'guard',status:{status:'success',elapsed_ms:18}},{name:'policy',status:{status:'failed',blocked:true,error:'Requires review',elapsed_ms:24}},{name:'optional',status:{status:'skipped'}}]},true);
    event(sid,'agent_message_chunk',{content:{type:'text',text:'# 运行状态\\n\\n正文与表格共用阅读边界。\\n\\n| 进程 | CPU | 说明 |\\n| --- | --- | --- |\\n| IDE | 115% | '+ 'VeryLongUnbrokenValue'.repeat(14)+' |\\n| Nofy | 17% | Normal |\\n\\n~~~json\\n{"path":"'+'longpath/'.repeat(35)+'"}\\n~~~\\n\\n## 结论\\n\\n保持左右边界一致。'}});
    const timer=setInterval(()=>{if(!running.has(sid)){clearInterval(timer);return;}if(readFileSync(process.env.NOFY_E2E_GATE,'utf8')!=='finish')return;clearInterval(timer);
      event(sid,'hook_execution',{event_name:'stop',runs:[{name:'report',status:{status:'failed',error:'Report unavailable',elapsed_ms:7},output:'Detailed diagnostic'}]},true);
      complete(sid,'\\n\\n检查完成。');},50);
    } else if (text === 'e2e:waiting') { event(sid,'hook_execution',{event_name:'user_prompt_submit',runs:[{name:'waiting-hook',status:{status:'success',elapsed_ms:2}}]},true); /* Keep turn open without an answer until cancelled. */
    } else if (text === 'e2e:thought') {`);
 source=source.replace("  } else if (f.method === '_nofy/session/rename') {",`  } else if (f.method === '_nofy/session/fork') {
    const sid='fork-'+state.next++,s=state.sessions[p.sourceSessionId];let index=-1;
    const events=s.events.filter(e=>{if(e.params.update.sessionUpdate==='user_message_chunk')index++;return index<=p.targetPromptIndex;}).map(e=>({...e,params:{...e.params,sessionId:sid}}));
    state.sessions[sid]={...s,title:'Answer branch',events};save();reply(f.id,{newSessionId:sid,newCwd:p.newCwd});
  } else if (f.method === '_nofy/session/rename') {`);
 source=source.replace("    reply(f.id, sessionResponse(p.sessionId));", `    if(p.sessionId.startsWith('fork-') && !state.sessions[p.sessionId].retried){state.sessions[p.sessionId].retried=true;save();send({id:f.id,error:{code:-32603,message:'Temporary load failure'}});return;}
    reply(f.id, sessionResponse(p.sessionId));`);
 const mock=join(temp,'kernel.mjs');await writeFile(mock,source,{mode:0o700});
 const {_electron}=await loadPlaywright();app=await _electron.launch({executablePath:join(appRoot,'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'),args:[appRoot,'--user-data-dir='+join(temp,'chromium')],env:{...process.env,HOME:home,NOFY_HOME:nofy,NOFY_BIN:mock,NOFY_WORKSPACE:cwd,NOFY_E2E_LOG:join(temp,'wire.jsonl'),NOFY_E2E_GATE:gate,NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:'',ELECTRON_RUN_AS_NODE:''}});
 page=await app.firstWindow();page.setDefaultTimeout(10000);page.on('pageerror',e=>report.consoleErrors.push(String(e)));
 await page.locator('textarea.composer__input:not(:disabled)').waitFor();
 const send=async text=>{await page.locator('textarea.composer__input').fill(text);await page.getByRole('button',{name:'发送',exact:true}).click();};
 const idle=()=>page.waitForFunction(()=>document.querySelector('.composer')?.dataset.inputState==='ready');
 await send('e2e:rich');await idle();
 await check('C00 startup hooks do not create a reply, controls or leading layout row',async()=>{
  assert.equal(await page.locator('[data-read-key="lead:0"]').count(),0);
  assert.equal(await page.locator('.turn-segment').count(),1);
  assert.equal(await page.getByRole('button',{name:'从此回答分叉',exact:true}).count(),1);
  assert.equal(await page.getByRole('button',{name:'Hook 统计',exact:true}).count(),0);
  await page.locator('.spine').hover();await page.mouse.wheel(0,-10000);
  await page.waitForFunction(()=>document.querySelector('.spine').scrollTop<1);
  await page.screenshot({path:join(output,'first-answer.png')});
 });
 const geometry=()=>page.locator('.block--agent').first().evaluate(el=>{
  const prose=el.querySelector('.md__p').getBoundingClientRect();
  return {prose:{left:prose.left,right:prose.right},surfaces:[...el.querySelectorAll('.md > .md-table,.md > .codeblock')].map(n=>{const b=n.getBoundingClientRect();return {type:n.className,left:b.left,right:b.right};}),overflow:document.querySelector('.spine').scrollWidth-document.querySelector('.spine').clientWidth};
 });
 await check('C01 table and code align with prose, not merely viewport, at all widths',async()=>{
  const metrics=[];for(const width of [1920,1440,900,640]){await page.setViewportSize({width,height:900});await page.waitForTimeout(350);const g=await geometry();metrics.push({width,...g});for(const s of g.surfaces){assert.ok(Math.abs(s.left-g.prose.left)<1,JSON.stringify({width,...g}));assert.ok(Math.abs(s.right-g.prose.right)<1,JSON.stringify({width,...g}));}assert.ok(g.overflow<2);await page.locator('.md-table').scrollIntoViewIfNeeded();await page.screenshot({path:join(output,`axis-${width}.png`)});}return metrics;
 });
 if(!process.env.NOFY_BASELINE){
 await page.setViewportSize({width:1440,height:900});await send('e2e:contract');const turn=page.locator('.turn-segment').last();await turn.locator('.md-table').waitFor();
 await check('C02 elapsed clock advances while text is streaming; old turn remains unchanged',async()=>{
  const label=turn.locator('.turnhead__label'),before=await label.innerText(),old=await page.locator('.turnhead__label').first().innerText();await page.waitForTimeout(2200);const after=await label.innerText();assert.match(after,/正在处理.*\d+ 秒/);assert.notEqual(after,before);assert.equal(await page.locator('.turnhead__label').first().innerText(),old);assert.equal(await turn.locator('.message-actions').count(),0);return {before,after};
 });
 await writeFile(gate,'finish');await idle();
 await check('C03 completing folds history, freezes time and keeps response controls together',async()=>{
  assert.equal(await turn.locator('[data-history-toggle]').getAttribute('aria-expanded'),'false');assert.ok(await turn.locator('.block--agent').isVisible());const time=await turn.locator('.turnhead__label').innerText();await page.waitForTimeout(1200);assert.equal(await turn.locator('.turnhead__label').innerText(),time);assert.equal(await turn.locator('.message-actions button').count(),4);await turn.locator('.message-actions').scrollIntoViewIfNeeded();await page.screenshot({path:join(output,'response-actions.png')});
 });
 await check('C04 hook statistics are turn scoped, distinguish blocked/errors, and restore focus',async()=>{
  await turn.getByRole('button',{name:'Hook 统计',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Hook 统计',exact:true});await dialog.waitFor();assert.match(await dialog.innerText(),/本轮执行 4.*成功 1.*失败 1.*已阻断 1.*已跳过 1/);await dialog.locator('summary').filter({hasText:'report'}).click();await dialog.getByText('Detailed diagnostic',{exact:true}).waitFor();assert.equal(await page.locator('.block--event').count(),0);await page.waitForTimeout(350);await page.screenshot({path:join(output,'hook-stats.png')});await page.keyboard.press('Escape');assert.equal(await turn.getByRole('button',{name:'Hook 统计',exact:true}).evaluate(el=>el===document.activeElement),true);
 });
 await check('C05 long cell content stays inside table; expanded view is explicit',async()=>{
  const table=turn.locator('.md-table'),body=turn.locator('.block--agent .md__p').first();for(const width of [1920,900,640]){await page.setViewportSize({width,height:850});await page.waitForTimeout(350);const a=await table.boundingBox(),b=await body.boundingBox();assert.ok(Math.abs(a.x-b.x)<1&&Math.abs(a.width-b.width)<1);assert.ok(await page.locator('.spine').evaluate(el=>el.scrollWidth<=el.clientWidth+1));}await table.getByRole('button',{name:'展开表格',exact:true}).click();await page.getByRole('dialog',{name:'表格',exact:true}).waitFor();await page.keyboard.press('Escape');
 });
 await check('C06 narrow middle pane with right workspace keeps content aligned',async()=>{
  await page.setViewportSize({width:900,height:780});await page.evaluate(()=>localStorage.setItem('nofy-desktop:layout','sidebar-closed|aux-closed|w=264|v=projects|s=recent|dock-closed|a=900|as=fixed'));await page.reload();await page.locator('textarea.composer__input:not(:disabled)').waitFor();assert.equal(await page.locator('[data-read-key="lead:0"]').count(),0);await page.getByRole('button',{name:'展开侧边面板',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.shell__main').getBoundingClientRect().width<300);const g=await geometry();for(const s of g.surfaces)assert.ok(Math.abs(s.left-g.prose.left)<1&&Math.abs(s.right-g.prose.right)<1);assert.ok(g.overflow<2);await page.locator('.md-table').last().scrollIntoViewIfNeeded();await page.screenshot({path:join(output,'narrow-middle.png')});await page.getByRole('button',{name:'收起右侧栏',exact:true}).click();return g;
 });
 await check('C07 old-answer fork preserves scope; load retry does not create a duplicate branch',async()=>{
  await page.setViewportSize({width:1440,height:900});await page.getByRole('button',{name:'从此回答分叉',exact:true}).first().click();const failure=page.getByRole('dialog',{name:'分叉失败',exact:true});await failure.waitFor();await failure.getByRole('button',{name:'重试',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.card__title')?.textContent.includes('Answer branch'));const forks=(await wire()).filter(r=>r.frame.method==='_nofy/session/fork');assert.equal(forks.length,1);assert.equal(forks[0].frame.params.targetPromptIndex,0);assert.equal(await page.locator('.block--user').count(),1);assert.equal(await page.getByRole('button',{name:'Hook 统计',exact:true}).count(),0);
 });
 await check('C08 clock runs without tool or answer events and stops when cancelled',async()=>{
  await send('e2e:waiting');const label=page.locator('.turn-segment').last().locator('.turnhead__label');await label.waitFor();const first=await label.innerText();await page.waitForTimeout(2100);assert.notEqual(await label.innerText(),first);await page.getByRole('button',{name:'停止',exact:true}).click();await idle();const ended=await label.innerText();await page.waitForTimeout(1200);assert.equal(await label.innerText(),ended);assert.match(ended,/已工作/);const cancelled=page.locator('.turn-segment').last();assert.equal(await cancelled.getByRole('button',{name:'从此回答分叉',exact:true}).count(),0);assert.equal(await cancelled.getByRole('button',{name:'Hook 统计',exact:true}).count(),1);await cancelled.getByRole('button',{name:'Hook 统计',exact:true}).click();const stats=page.getByRole('dialog',{name:'Hook 统计',exact:true});assert.match(await stats.innerText(),/本轮执行 1/);assert.doesNotMatch(await stats.innerText(),/startup-only/);await page.keyboard.press('Escape');
 });
 }
} catch(e){report.cases.push({name:'setup',status:'failed',error:String(e)});console.error(e);}
finally{await app?.close().catch(()=>{});await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await writeFile(join(output,'wire.jsonl'),await readFile(join(temp,'wire.jsonl'),'utf8').catch(()=>''));await rm(temp,{recursive:true,force:true});console.log('Report: '+join(output,'report.json'));}
if(report.cases.some(c=>c.status==='failed')||report.consoleErrors.length)process.exitCode=1;
