import { loadPlaywright } from './playwright-driver.mjs';
import assert from 'node:assert/strict';
import { mkdtemp,mkdir,readFile,writeFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),appRoot=resolve(here,'..'),project=resolve(appRoot,'../..');
const temp=await mkdtemp(join(tmpdir(),'nofy-retry-e2e-')),home=join(temp,'home'),nofy=join(temp,'nofy'),cwd=join(temp,'workspace'),gate=join(temp,'stage');
const output=join(project,'output/playwright','workflow-motion-'+new Date().toISOString().replaceAll(':','-'));
await Promise.all([home,nofy,cwd,output].map(p=>mkdir(p,{recursive:true})));await writeFile(gate,'1');
const report={source:'Controlled multi-stage workflow in isolated Electron; DOM identity and frame measurements',cases:[],consoleErrors:[],output};
let app,page;
async function check(name,fn){try{const details=await fn();report.cases.push({name,status:'passed',details});console.log('PASS '+name);}catch(e){report.cases.push({name,status:'failed',error:String(e)});console.error('FAIL '+name+': '+e);await page?.screenshot({path:join(output,report.cases.length+'-failure.png')}).catch(()=>{});}}
const stage=n=>writeFile(gate,String(n));
const distance=()=>page.locator('.spine').evaluate(el=>el.scrollHeight-el.clientHeight-el.scrollTop);
const bottom=()=>page.waitForFunction(()=>{const el=document.querySelector('.spine');return el.scrollHeight-el.clientHeight-el.scrollTop<8;});
try {
 let source=await readFile(join(here,'mock-kernel.mjs'),'utf8');const marker="    if (text === 'e2e:thought') {";assert.equal(source.split(marker).length,2);
 const records=JSON.parse('['+(await readFile(join(project,'docs/fixtures/empty-response-retry-2026-10-13.jsonl'),'utf8')).trim().split('\n').join(',')+']');
 source=source.replace(marker,`    if (text === 'e2e:retry') {
   event(sid,'agent_message_chunk',{content:{type:'text',text:'先检查项目配置，再验证结果。'}});event(sid,'response_completed',{usage:{}},true);
   event(sid,'tool_call',{toolCallId:'cmd',title:'run_terminal_command',kind:'execute',status:'running',rawInput:{command:'inspect-project'}});
   event(sid,'tool_call_update',{toolCallId:'cmd',kind:'execute',status:'running',content:[{type:'text',text:'Inspecting workspace…'}]});
   let current=1;
   const timer=setInterval(()=>{const next=Number(readFileSync(process.env.NOFY_E2E_GATE,'utf8'));if(next===current)return;current=next;
    if(next===2){event(sid,'tool_call_update',{toolCallId:'cmd',status:'completed',content:[{type:'text',text:'Configuration valid'}]});event(sid,'agent_message_chunk',{content:{type:'text',text:'检查完成，配置正确。'}});}
    if(next===3){complete(sid,'验证通过。');clearInterval(timer);}
   },60);
 } else if (text === 'e2e:thought') {`);
 const mock=join(temp,'kernel.mjs');await writeFile(mock,source,{mode:0o700});
 const {_electron}=await loadPlaywright();app=await _electron.launch({executablePath:join(appRoot,'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'),args:[appRoot,'--user-data-dir='+join(temp,'chromium')],env:{...process.env,HOME:home,NOFY_HOME:nofy,NOFY_BIN:mock,NOFY_WORKSPACE:cwd,NOFY_E2E_LOG:join(temp,'wire.jsonl'),NOFY_E2E_GATE:gate,NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:'',ELECTRON_RUN_AS_NODE:''}});
 page=await app.firstWindow();page.setDefaultTimeout(10000);page.on('pageerror',e=>report.consoleErrors.push(String(e)));
 const input=page.locator('textarea.composer__input');await page.locator('textarea.composer__input:not(:disabled)').waitFor();await page.setViewportSize({width:1280,height:800});
 await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.focus();w.webContents.focus();});await page.waitForFunction(()=>document.hasFocus());await page.waitForTimeout(120);
 await input.fill('e2e:retry');await page.getByRole('button',{name:'发送',exact:true}).click();
 await check('W01 one quiet summary, no redundant waiting footer or auto-opening command',async()=>{
  await page.locator('.activity-card').waitFor();await page.waitForTimeout(250);
  assert.equal(await page.locator('.turn-feedback[data-state=running]').count(),0);
  assert.equal(await page.locator('.activity-card[open]').count(),0);
  assert.equal(await page.locator('.activity-badge__pulse').count(),0);
  const live=page.locator('.activity-card__title.activity-live');assert.equal(await live.evaluate(el=>getComputedStyle(el).animationDuration),'4s');
 });
 await check('W02 additional answer preserves previous message DOM and manual tool expansion',async()=>{
  await page.locator('.activity-card > summary').click();await page.waitForTimeout(220);
  await page.evaluate(()=>{window.workflowPrevious=document.querySelector('[data-block-kind="agent-message"]');window.workflowTool=document.querySelector('.activity-card');});
  await stage(2);await page.waitForFunction(()=>document.querySelectorAll('[data-block-kind="agent-message"]').length===2);await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>window.workflowPrevious===document.querySelector('[data-block-kind="agent-message"]')),true);
  assert.equal(await page.evaluate(()=>window.workflowTool===document.querySelector('.activity-card')),true);
  assert.equal(await page.locator('.activity-card').getAttribute('open'),'');
  await page.screenshot({path:join(output,'streaming.png')});
 });
 await check('W03 completion collapses history continuously without remounting final answer',async()=>{
  await page.evaluate(()=>{window.workflowFinal=[...document.querySelectorAll('[data-block-kind="agent-message"]')].at(-1);window.motionSamples=[];window.recordMotion=true;
   const sample=()=>{window.motionSamples.push(document.querySelector('.turn-segment').getBoundingClientRect().height);if(window.recordMotion)requestAnimationFrame(sample);};sample();});
  await stage(3);await page.waitForFunction(()=>document.querySelector('.composer')?.dataset.inputState==='ready');await page.waitForTimeout(450);
  const result=await page.evaluate(()=>{window.recordMotion=false;return{same:window.workflowFinal===[...document.querySelectorAll('[data-block-kind="agent-message"]')].at(-1),heights:window.motionSamples};});
  assert.equal(result.same,true);assert.ok(new Set(result.heights.map(Math.round)).size>4,JSON.stringify(result));
  assert.equal(await page.locator('.turn-feedback').count(),0);assert.equal(await page.locator('.activity-live').count(),0);
  await page.screenshot({path:join(output,'completed.png')});return result;
 });
 await check('W04 keyboard expansion and reduced motion preserve final answer and manual tool state',async()=>{
  await page.emulateMedia({reducedMotion:'reduce'});const toggle=page.locator('[data-history-toggle]');await toggle.focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('[data-history-toggle]')?.getAttribute('aria-expanded')==='true');
  assert.equal(await page.locator('.activity-card').getAttribute('open'),'');
  assert.ok(await page.locator('.ui-collapse-row').first().evaluate(el=>parseFloat(getComputedStyle(el).transitionDuration)<0.001));
  assert.equal(await page.evaluate(()=>window.workflowFinal===[...document.querySelectorAll('[data-block-kind="agent-message"]')].at(-1)),true);
 });
} catch(e){report.cases.push({name:'setup',status:'failed',error:String(e)});console.error(e);await page?.screenshot({path:join(output,'setup-failure.png')}).catch(()=>{});}
finally{await app?.close().catch(()=>{});await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await rm(temp,{recursive:true,force:true});console.log('Report: '+join(output,'report.json'));}
if(report.cases.some(c=>c.status==='failed')||report.consoleErrors.length)process.exitCode=1;
