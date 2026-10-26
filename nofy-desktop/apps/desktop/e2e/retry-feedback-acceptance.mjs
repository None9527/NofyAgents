import { loadPlaywright } from './playwright-driver.mjs';
import assert from 'node:assert/strict';
import { mkdtemp,mkdir,readFile,writeFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),appRoot=resolve(here,'..'),project=resolve(appRoot,'../..');
const temp=await mkdtemp(join(tmpdir(),'nofy-retry-e2e-')),home=join(temp,'home'),nofy=join(temp,'nofy'),cwd=join(temp,'workspace'),gate=join(temp,'stage');
const output=join(project,'output/playwright','retry-'+new Date().toISOString().replaceAll(':','-'));
await Promise.all([home,nofy,cwd,output].map(p=>mkdir(p,{recursive:true})));await writeFile(gate,'1');
const report={source:'Real captured retry wire + controlled tool context in isolated Electron; no external model calls',cases:[],consoleErrors:[],output};
let app,page;
async function check(name,fn){try{const details=await fn();report.cases.push({name,status:'passed',details});console.log('PASS '+name);}catch(e){report.cases.push({name,status:'failed',error:String(e)});console.error('FAIL '+name+': '+e);await page?.screenshot({path:join(output,report.cases.length+'-failure.png')}).catch(()=>{});}}
const stage=n=>writeFile(gate,String(n));
const distance=()=>page.locator('.spine').evaluate(el=>el.scrollHeight-el.clientHeight-el.scrollTop);
const bottom=()=>page.waitForFunction(()=>{const el=document.querySelector('.spine');return el.scrollHeight-el.clientHeight-el.scrollTop<8;});
try {
 let source=await readFile(join(here,'mock-kernel.mjs'),'utf8');const marker="    if (text === 'e2e:thought') {";assert.equal(source.split(marker).length,2);
 const records=JSON.parse('['+(await readFile(join(project,'docs/fixtures/empty-response-retry-2026-10-13.jsonl'),'utf8')).trim().split('\n').join(',')+']');
 source=source.replace(marker,`    if (text === 'e2e:retry') {
   const wire=${JSON.stringify(records)};
   event(sid,'agent_message_chunk',{content:{type:'text',text:Array.from({length:35},(_,i)=>'进展 '+i+'：检查项目配置并记录结果。').join('\\n\\n')}});
   event(sid,'response_completed',{usage:{}},true);
   event(sid,'turn_completed',{stop_reason:'end_turn'},true);
   event(sid,'user_message_chunk',{content:{type:'text',text:'检查目录中的模型'}});
   event(sid,'tool_call',{toolCallId:'cmd',title:'run_terminal_command',kind:'execute',status:'running',rawInput:{command:'inspect-project'}});
   event(sid,'tool_call_update',{toolCallId:'cmd',kind:'execute',status:'running',content:[{type:'text',text:'Inspecting workspace…'}]});
   let current=1;
   const timer=setInterval(()=>{const next=Number(readFileSync(process.env.NOFY_E2E_GATE,'utf8'));if(next===current)return;current=next;
    if(next===2){event(sid,'tool_call_update',{toolCallId:'cmd',status:'failed',content:[{type:'text',text:'missing field command'}]});event(sid,'retry_state',wire[0].params.update,true);}
    if(next===3)event(sid,'retry_state',wire[13].params.update,true);
    if(next===4){event(sid,'retry_state',wire[14].params.update,true);event(sid,'turn_completed',wire[15].params.update,true);running.delete(sid);send({id:f.id,error:{code:-32603,message:'empty response from model (no_visible_content)'}});clearInterval(timer);}
   },60);
 } else if (text === 'e2e:scroll') {
   for(let i=0;i<20;i++)event(sid,'agent_message_chunk',{content:{type:'text',text:'动态行 '+i+'。\\n\\n'}});
   let current=4;
   const timer=setInterval(()=>{if(!running.has(sid)){clearInterval(timer);return;}const n=Number(readFileSync(process.env.NOFY_E2E_GATE,'utf8'));if(n===current)return;current=n;
    event(sid,'agent_message_chunk',{content:{type:'text',text:'追加内容。\\n\\n'.repeat(15)}});
   },60);
 } else if (text === 'e2e:thought') {`);
 const mock=join(temp,'kernel.mjs');await writeFile(mock,source,{mode:0o700});
 const {_electron}=await loadPlaywright();app=await _electron.launch({executablePath:join(appRoot,'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'),args:[appRoot,'--user-data-dir='+join(temp,'chromium')],env:{...process.env,HOME:home,NOFY_HOME:nofy,NOFY_BIN:mock,NOFY_WORKSPACE:cwd,NOFY_E2E_LOG:join(temp,'wire.jsonl'),NOFY_E2E_GATE:gate,NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:'',ELECTRON_RUN_AS_NODE:''}});
 page=await app.firstWindow();page.setDefaultTimeout(10000);page.on('pageerror',e=>report.consoleErrors.push(String(e)));
 const input=page.locator('textarea.composer__input');await page.locator('textarea.composer__input:not(:disabled)').waitFor();await page.setViewportSize({width:1280,height:800});
 await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.focus();w.webContents.focus();});await page.waitForFunction(()=>document.hasFocus());await page.waitForTimeout(120);
 await input.fill('e2e:retry');await page.getByRole('button',{name:'发送',exact:true}).click();
 await check('R01 compact running command follows bottom without a redundant footer',async()=>{
  await page.locator('.activity-card').waitFor();await bottom();await page.getByRole('button',{name:'停止',exact:true}).waitFor();
  assert.equal(await page.locator('.turn-feedback[data-state=running]').count(),0);
  assert.equal(await page.locator('.activity-card .activity-live').evaluate(el=>getComputedStyle(el).animationDuration),'4s');
  await page.screenshot({path:join(output,'running.png')});return {distance:await distance()};
 });
 await check('R02 real retry attempts visible without forcing failed tool open; reading history retained',async()=>{
  await page.locator('.spine').hover();await page.mouse.wheel(0,-800);await page.waitForTimeout(200);const before=await page.locator('.spine').evaluate(el=>el.scrollTop);
  await stage(2);await page.locator('.turn-feedback[data-state=retrying]').waitFor({state:'attached'});await page.waitForTimeout(300);
  assert.match(await page.locator('.turn-feedback').innerText(),/1 \/ 15/);assert.equal(await page.locator('.activity-card').getAttribute('open'),null);
  const after=await page.locator('.spine').evaluate(el=>el.scrollTop);assert.ok(Math.abs(after-before)<5,{before,after});
  await page.getByRole('button',{name:'回到最新消息',exact:true}).click();await bottom();await stage(3);await page.waitForFunction(()=>document.querySelector('.turn-feedback__attempt')?.textContent==='14 / 15');await bottom();
  await page.screenshot({path:join(output,'retrying.png')});return {before,after,distance:await distance()};
 });
 await check('R03 terminal failure preserves visible work, ends running animation and offers recovery',async()=>{
  await stage(4);await page.waitForFunction(()=>document.querySelector('.composer')?.dataset.inputState==='ready');await page.locator('.turn-feedback[data-state=failed]').waitFor();await bottom();
  assert.equal(await page.locator('.turn-feedback[data-state=failed]').count(),1);assert.ok(await page.locator('.activity-card').isVisible());assert.equal(await page.locator('.activity-card').evaluate(el=>el.closest('.ui-collapse-row').dataset.open),'true');
  assert.equal(await page.locator('.activity-card').getAttribute('open'),null);assert.equal(await page.locator('.turn-feedback .activity-live').count(),0);
  assert.match(await page.locator('.turn-feedback').innerText(),/模型返回了空响应/);
  await page.getByRole('button',{name:'编辑原消息',exact:true}).click();assert.equal(await input.inputValue(),'检查目录中的模型');
  await page.waitForTimeout(300);
  const geometry=await page.locator('.composer').evaluate(el=>{const a=[];for(let n=el;n;n=n.parentElement)a.push({class:n.className,top:n.getBoundingClientRect().top,height:n.clientHeight,scrollTop:n.scrollTop,scrollHeight:n.scrollHeight});return a;});
  assert.equal(geometry.find(n=>n.class==='card__conversation').scrollTop,0);assert.ok(geometry[0].top>600,JSON.stringify(geometry));
  await page.screenshot({path:join(output,'failed.png')});return geometry;
 });
 await check('R04 opening details preserves reading anchor; explicit send resumes following',async()=>{
  assert.ok(await page.locator('.activity-card > summary').isVisible());
  await page.locator('.activity-card > summary').click();await page.waitForTimeout(250);assert.equal(await page.locator('.activity-card').getAttribute('open'),'');
  await page.locator('.spine').hover();await page.mouse.wheel(0,-1200);await page.waitForTimeout(200);assert.ok(await distance()>200);
  await input.fill('e2e:scroll');await page.getByRole('button',{name:'发送',exact:true}).click();await bottom();
  await stage(5);await page.waitForTimeout(250);await bottom();return {distance:await distance()};
 });
 await check('R05 streaming preserves manual reading, back-to-latest restores it, cancel ends live feedback',async()=>{
  await page.locator('.spine').hover();await page.mouse.wheel(0,-450);await page.waitForTimeout(180);const before=await page.locator('.spine').evaluate(el=>el.scrollTop);
  await stage(6);await page.waitForTimeout(300);const after=await page.locator('.spine').evaluate(el=>el.scrollTop);assert.ok(Math.abs(after-before)<5,{before,after});
  await page.getByRole('button',{name:'回到最新消息',exact:true}).click();await bottom();
  await page.getByRole('button',{name:'停止',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.composer')?.dataset.inputState==='ready');assert.equal(await page.locator('.turn-feedback[data-state=running]').count(),0);return {before,after};
 });
 await check('R06 narrow column and reduced motion keep feedback readable',async()=>{
  await page.setViewportSize({width:1920,height:900});
  await page.getByRole('button',{name:'展开侧边面板',exact:true}).click();await page.locator('.aux__handle').waitFor();await page.waitForFunction(()=>document.querySelector('.shell')?.dataset.auxMotion==='false');
  const h=await page.locator('.aux__handle').boundingBox();await page.mouse.move(h.x+4,h.y+120);await page.mouse.down();await page.mouse.move(450,h.y+120,{steps:20});await page.mouse.up();await page.waitForTimeout(250);
  assert.ok(await page.locator('.card__conversation').evaluate(el=>el.clientWidth)<=300);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.turn-feedback[data-state=failed]').scrollIntoViewIfNeeded();
  const metrics=await page.locator('.turn-feedback[data-state=failed]').evaluate(el=>({width:el.clientWidth,overflow:el.scrollWidth-el.clientWidth}));assert.ok(metrics.overflow<=1);
  await page.screenshot({path:join(output,'narrow-feedback.png')});return metrics;
 });
} catch(e){report.cases.push({name:'setup',status:'failed',error:String(e)});console.error(e);await page?.screenshot({path:join(output,'setup-failure.png')}).catch(()=>{});}
finally{await app?.close().catch(()=>{});await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await rm(temp,{recursive:true,force:true});console.log('Report: '+join(output,'report.json'));}
if(report.cases.some(c=>c.status==='failed')||report.consoleErrors.length)process.exitCode=1;
