import { loadPlaywright } from "./playwright-driver.mjs";
/** Actual Electron controls, IPC, validation, export writes and local metadata.
 * ACP is emulated; native dialog providers are stubbed in main, never UI handlers.
 * Run after pnpm build: node apps/desktop/e2e/project-actions.mjs
 */
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const here=dirname(fileURLToPath(import.meta.url)),appRoot=resolve(here,'..'),root=resolve(appRoot,'../../..');
const {_electron}=await loadPlaywright();
const temp=await mkdtemp(join(tmpdir(),'nofy-integration-e2e-'));
const output=join(root,'nofy-desktop/output/playwright',`integration-${new Date().toISOString().replaceAll(':','-')}`);
const home=join(temp,'home'),nofyHome=join(temp,'nofy'),cwd=join(temp,'项目 A with spaces'),other=join(temp,'项目 B with spaces'),exports=join(temp,'exports'),logPath=join(temp,'wire.jsonl');
await Promise.all([mkdir(output,{recursive:true}),mkdir(home),mkdir(nofyHome),mkdir(cwd),mkdir(other),mkdir(exports)]);
const report={source:'Actual Electron GUI with deterministic ACP emulator; native open/save dialog provider stubs only. Actual main IPC, directory validation and fs export write.',startedAt:new Date().toISOString(),cases:[],consoleErrors:[],output};
let application,page,currentCase='startup';
const wire=async()=>{try{return(await readFile(logPath,'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse);}catch{return[];}};
const created=async()=>(await wire()).filter(r=>r.frame.method==='session/new');
const input=()=>page.locator('textarea.composer__input');
const row=(title)=>page.locator('.taskrow__btn').filter({hasText:title});
const metadata=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nofy-desktop:session-metadata')??'null'));
async function check(name,fn){currentCase=name;const start=performance.now();try{const details=await fn();report.cases.push({name,status:'passed',durationMs:Math.round(performance.now()-start),details});console.log(`PASS ${name}`);}catch(e){report.cases.push({name,status:'failed',error:String(e)});console.error(`FAIL ${name}: ${e}`);if(page)await page.screenshot({path:join(output,`${report.cases.length}-failure.png`)}).catch(()=>{});}}
async function openMenu(){await page.getByRole('button',{name:'会话操作',exact:true}).click();}
async function menuAction(name){await openMenu();await page.getByRole('dialog',{name:'会话操作',exact:true}).getByRole('button',{name,exact:true}).click();}
async function send(text){await input().fill(text);await page.getByRole('button',{name:'发送',exact:true}).click();}
async function idle() { await page.waitForFunction(()=>document.querySelector('.composer')?.dataset.inputState==='ready',undefined,{timeout:10000}); }
async function setOpenDialog(value){await application.evaluate(({dialog},result)=>{dialog.showOpenDialog=async()=>result;},value);}
async function setSaveDialog(value){await application.evaluate(({dialog},result)=>{dialog.showSaveDialog=async()=>result;},value);}
try{
 const dist=join(appRoot,'node_modules/electron/dist'),executablePath=process.platform==='darwin'?join(dist,'Electron.app/Contents/MacOS/Electron'):process.platform==='win32'?join(dist,'electron.exe'):join(dist,'electron');
 application=await _electron.launch({executablePath,args:[appRoot,`--user-data-dir=${join(temp,'chromium')}`],env:{...process.env,HOME:home,NOFY_HOME:nofyHome,NOFY_BIN:join(here,'mock-kernel.mjs'),NOFY_WORKSPACE:cwd,NOFY_E2E_LOG:logPath,NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:'',ELECTRON_RUN_AS_NODE:''},timeout:30000});
 page=await application.firstWindow();page.on('pageerror',e=>report.consoleErrors.push({case:currentCase,message:String(e),stack:e.stack}));
 await page.locator('textarea.composer__input:not(:disabled)').waitFor({timeout:30000});
 await page.getByRole('tab',{name:'项目',exact:true}).click();
 await check('I01 deleted session cwd blocks prompt, preserves draft and sends no kernel frame',async()=>{
   await rm(cwd,{recursive:true});
   const before=(await wire()).filter(r=>r.frame.method==='session/prompt').length;
   await send('keep this draft when workspace disappears');
   await page.getByText('工作区不存在或不可访问：',{exact:false}).first().waitFor();
   assert.equal(await input().inputValue(),'keep this draft when workspace disappears');
   assert.equal((await wire()).filter(r=>r.frame.method==='session/prompt').length,before);
   assert.equal(await page.getByRole('button',{name:'停止',exact:true}).count(),0);
   await page.screenshot({path:join(output,'missing-workspace.png')});
 });
 await check('I02 restoring directory permits existing session and real IPC validation',async()=>{
   await mkdir(cwd);
   await page.getByRole('button',{name:'发送',exact:true}).click();
   await page.getByText('E2E answer: keep this draft when workspace disappears',{exact:false}).first().waitFor();
   await idle();assert.equal(await input().inputValue(),'');
   assert.equal(await page.evaluate(path=>window.nofy.validateDirectory(path),cwd),cwd);
 });
 await check('I03 stale selected and last-session paths never create or restore an invalid workspace',async()=>{
   const missing=join(temp,'deleted-package-workspace');
   await page.evaluate(path=>{
     localStorage.setItem('nofy-desktop:workspaces',JSON.stringify({selected:path,recent:[path]}));
     localStorage.setItem('nofy-desktop:last-session',JSON.stringify({id:'old-test-session',cwd:path}));
   },missing);
   const before=(await wire()).length;
   await page.reload();await row('E2E task 2').waitFor({timeout:20000});
   const requests=(await wire()).slice(before).filter(r=>['session/new','session/load'].includes(r.frame.method));
   assert.ok(requests.some(r=>r.frame.method==='session/new'&&r.frame.params.cwd===cwd));
   assert.ok(requests.every(r=>r.frame.params.cwd!==missing));
   assert.equal(await row('E2E task 1').count(),1);
   const prefs=await page.evaluate(()=>JSON.parse(localStorage.getItem('nofy-desktop:workspaces')));
   assert.equal(prefs.selected,cwd);assert.ok(!prefs.recent.includes(missing));
 });
 await check('I04 choosing a missing recent project cannot create a kernel session',async()=>{
   const missing=join(temp,'missing-recent');
   await page.evaluate(path=>localStorage.setItem('nofy-desktop:workspaces',JSON.stringify({selected:null,recent:[path]})),missing);
   await page.reload();await page.locator('textarea.composer__input:not(:disabled)').waitFor();
   await page.getByRole('tab',{name:'项目',exact:true}).click();
   const before=(await created()).length;
   await page.locator('.prow').filter({hasText:'missing-recent'}).click();
   await page.getByText('工作区不存在或不可访问：',{exact:false}).first().waitFor();
   assert.equal((await created()).length,before);
 });

}catch(e){report.cases.push({name:'GUI setup',status:'failed',error:String(e)});console.error(e);}
finally{if(application)await application.close().catch(()=>{});report.finishedAt=new Date().toISOString();await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await writeFile(join(output,'wire.jsonl'),await readFile(logPath,'utf8').catch(()=>''));await rm(temp,{recursive:true,force:true});console.log(`Report: ${join(output,'report.json')}`);}
if(report.cases.some(r=>r.status==='failed')||report.consoleErrors.length)process.exitCode=1;
