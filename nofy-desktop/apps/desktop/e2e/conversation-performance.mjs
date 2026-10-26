import { loadPlaywright } from "./playwright-driver.mjs";
/** Same-machine production Electron baseline. Timings are evidence, not pass/fail performance budgets. */
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const here=dirname(fileURLToPath(import.meta.url)),appRoot=resolve(here,'..'),repo=resolve(appRoot,'../../..');
const {_electron}=await loadPlaywright(),temp=await mkdtemp(join(tmpdir(),'nofy-conversation-bench-'));
const output=join(repo,'nofy-desktop/output/performance',`${process.argv[2]??'candidate'}-${new Date().toISOString().replaceAll(':','-')}`),home=join(temp,'home'),nofyHome=join(temp,'nofy'),cwd=join(temp,'workspace');
await Promise.all([mkdir(output,{recursive:true}),mkdir(home),mkdir(nofyHome),mkdir(cwd)]);
const report={label:process.argv[2]??'candidate',source:'Production Electron; deterministic ACP; opt-in numeric render counters; no real model',viewport:{width:1440,height:900},cases:[],consoleErrors:[]};let app,page;
const reset=async()=>page.evaluate(()=>{globalThis.__NOFY_UI_TRACE={counts:{},longTasks:[],inputFrames:[]};if(!globalThis.__benchObserver){globalThis.__benchObserver=new PerformanceObserver(list=>{for(const e of list.getEntries())globalThis.__NOFY_UI_TRACE?.longTasks.push(e.duration);});globalThis.__benchObserver.observe({type:'longtask',buffered:false});}});
const snapshot=async()=>page.evaluate(()=>({counts:{...globalThis.__NOFY_UI_TRACE.counts},longTasks:globalThis.__NOFY_UI_TRACE.longTasks.slice(),inputFrames:globalThis.__NOFY_UI_TRACE.inputFrames.slice(),totalBlocks:Number(document.querySelector('.spine')?.dataset.totalBlocks??0),virtualized:document.querySelector('.spine')?.dataset.virtualized==='true',domBlocks:document.querySelectorAll('.spine .block--user,.spine .block--agent').length,domNodes:document.querySelector('.spine')?.querySelectorAll('*').length??0,heapBytes:performance.memory?.usedJSHeapSize??null}));
const input=()=>page.locator('textarea.composer__input');
async function send(text){await input().fill(text);await page.getByRole('button',{name:'发送',exact:true}).click();}
async function idle() { await page.waitForFunction(()=>document.querySelector('.composer')?.dataset.inputState==='ready',undefined,{timeout:120000}); }
try{
 const dist=join(appRoot,'node_modules/electron/dist'),executablePath=process.platform==='darwin'?join(dist,'Electron.app/Contents/MacOS/Electron'):join(dist,'electron');
 app=await _electron.launch({executablePath,args:[appRoot,`--user-data-dir=${join(temp,'chromium')}`],env:{...process.env,HOME:home,NOFY_HOME:nofyHome,NOFY_BIN:join(here,'conversation-benchmark-kernel.mjs'),NOFY_WORKSPACE:cwd,NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:'',ELECTRON_RUN_AS_NODE:''}});
 page=await app.firstWindow();page.on('pageerror',error=>report.consoleErrors.push(String(error)));await page.setViewportSize(report.viewport);await input().filter({hasNot:page.locator(':disabled')}).waitFor();await page.locator('textarea.composer__input:not(:disabled)').waitFor({timeout:30000});
 for(const size of [1000,10000]){
  if(size===10000){await page.getByRole('button',{name:'新建任务',exact:true}).first().click();await page.getByText('Bench 2',{exact:true}).first().waitFor();}
  await reset();const start=performance.now();await send(`bench:${size}`);await page.waitForFunction(n=>document.querySelector('.spine')?.innerText.includes(`Bench reply ${n/2-1}`),size,{timeout:120000});await idle();await page.waitForTimeout(200);const load=await snapshot();load.loadMs=Math.round(performance.now()-start);assert.equal(load.totalBlocks,size);if(load.virtualized)assert.ok(load.domBlocks<200);else assert.equal(load.domBlocks,size);console.log('Loaded '+size);
  await reset();await input().evaluate(el=>{el.addEventListener('input',()=>{const at=performance.now();requestAnimationFrame(()=>globalThis.__NOFY_UI_TRACE.inputFrames.push(performance.now()-at));});});
  for(let i=0;i<20;i++){await input().fill('draft-'+i);await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));}
  const editing=await snapshot();const times=editing.inputFrames.slice().sort((a,b)=>a-b);editing.inputToFrameP95Ms=times[Math.ceil(times.length*.95)-1]??null;
  await input().fill('');await reset();await send('bench:stream');await page.waitForFunction(()=>document.querySelector('.spine')?.innerText.includes('chunk-20'),undefined,{timeout:120000});await idle();await page.waitForTimeout(100);const stream=await snapshot();report.cases.push({size,load,editing,stream});await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));console.log('Measured '+size);
 }
 await page.getByRole('button',{name:'新建任务',exact:true}).first().click();await page.getByText('Bench 3',{exact:true}).first().waitFor();await send('bench:1000');await idle();await page.locator('.taskrow__btn').filter({hasText:'Bench 2'}).click();await page.waitForFunction(()=>document.querySelector('.spine')?.innerText.includes('Bench reply 4999'));await page.waitForTimeout(200);await reset();
 // Send a typed prompt through the real preload to the inactive session; selectors must isolate A.
 await page.evaluate(()=>globalThis.nofy.request('session/prompt',{sessionId:'bench-3',prompt:[{type:'text',text:'bench:stream'}]}));await page.waitForTimeout(100);report.background=await snapshot();
 await page.locator('.sidebar__foot button').last().click();await page.getByRole('menuitem',{name:/设置…|Settings…/}).click();await page.locator('.set').waitFor();await page.waitForTimeout(200);await reset();await page.evaluate(()=>globalThis.nofy.request('session/prompt',{sessionId:'bench-3',prompt:[{type:'text',text:'bench:stream'}]}));await page.waitForTimeout(100);report.settingsBackground=await snapshot();
 if(report.label.startsWith('after-shell')){for(const item of report.cases){for(const name of ['Sidebar','ApprovalHost','QueueHost'])assert.equal(item.editing.counts[name]??0,0,'Draft input repainted '+name);assert.ok((item.stream.counts.App??0)<10,'Streaming chunks invalidated window composition');assert.ok((item.stream.counts.Composer??0)<10,'Streaming chunks invalidated composer');assert.equal(item.stream.counts.Sidebar??0,0,'Streaming chunks repainted navigation');}for(const name of ['Spine','Composer','Sidebar','ApprovalHost','QueueHost'])assert.equal(report.background.counts[name]??0,0,'Inactive streaming repainted '+name);}
 if(report.label.startsWith('after')){for(const item of report.cases)assert.equal(item.editing.counts.Markdown??0,0,'Historical Markdown rerendered during draft input');assert.equal(report.background.counts.Spine??0,0,'Inactive session repainted active conversation');assert.ok((report.background.counts.App??0)<200,'App entered a render feedback loop');assert.equal(report.settingsBackground.counts.SettingsSurface??0,0,'Background messages repainted static settings');}
 await page.screenshot({path:join(output,'settings-after-background.png')});
}catch(error){report.error=String(error);console.error(error);process.exitCode=1;}
finally{if(app)await app.close().catch(()=>{});await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await rm(temp,{recursive:true,force:true});console.log('Report '+join(output,'report.json'));}
if(report.consoleErrors.length)process.exitCode=1;
