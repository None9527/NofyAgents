import { loadPlaywright } from './playwright-driver.mjs';
import assert from 'node:assert/strict';
import { mkdtemp,mkdir,writeFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),appRoot=resolve(here,'..'),project=resolve(appRoot,'../..');
const temp=await mkdtemp(join(tmpdir(),'nofy-sidebar-e2e-')),home=join(temp,'home'),nofy=join(temp,'nofy'),cwd=join(temp,'workspace');
const output=join(project,'output/playwright','collapsed-spacing-'+new Date().toISOString().replaceAll(':','-'));
await Promise.all([home,nofy,cwd,output].map(path=>mkdir(path,{recursive:true})));
const report={source:'isolated Electron + synthetic ACP',cases:[],consoleErrors:[],output};
let app,page;
const toggle=()=>page.getByRole('button',{name:'切换侧边栏',exact:true});
async function check(name,fn){try{const details=await fn();report.cases.push({name,status:'passed',details});console.log('PASS '+name);}catch(e){report.cases.push({name,status:'failed',error:String(e)});console.error('FAIL '+name+': '+e);await page.screenshot({path:join(output,report.cases.length+'-failure.png')});}}
async function layout(width,viewport=1440){await page.setViewportSize({width:viewport,height:900});await page.evaluate(width=>localStorage.setItem('nofy-desktop:layout',`sidebar-open|aux-closed|w=${width}|v=projects|s=recent|dock-closed|a=548`),width);await page.reload();await page.locator('textarea.composer__input:not(:disabled)').waitFor();}
try{
 const {_electron}=await loadPlaywright();app=await _electron.launch({executablePath:join(appRoot,'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'),args:[appRoot,'--user-data-dir='+join(temp,'chromium')],env:{...process.env,HOME:home,NOFY_HOME:nofy,NOFY_BIN:join(here,'mock-kernel.mjs'),NOFY_WORKSPACE:cwd,NOFY_E2E_LOG:join(temp,'wire.jsonl'),NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:'',ELECTRON_RUN_AS_NODE:''}});page=await app.firstWindow();page.on('pageerror',e=>report.consoleErrors.push(String(e)));await page.locator('textarea.composer__input:not(:disabled)').waitFor();
 await check('C01 collapsed frame and conversation use the available width',async()=>{
 const metrics=[];
 for(const viewport of (process.env.NOFY_SPACING_BASELINE?[1280]:[880,1024,1280,1440,1920])){
   await layout(264,viewport);if(await page.locator('.sidebar').isVisible())await toggle().click();await page.waitForFunction(()=>document.querySelector('.shell')?.dataset.sidebarMotion==='false');
   await page.locator('textarea.composer__input').fill('e2e:rich');await page.getByRole('button',{name:'发送',exact:true}).click();await page.getByRole('heading',{name:'验证结果',exact:true}).first().waitFor();await page.waitForFunction(()=>document.querySelector('.composer')?.dataset.inputState==='ready');
   const data=await page.evaluate(()=>{const box=s=>document.querySelector(s).getBoundingClientRect().toJSON();return {viewport:innerWidth,card:box('.card'),host:box('.card__conversation'),text:box('.spine__inner'),input:box('.composer__inner')};});metrics.push(data);report.metrics=metrics;
   await page.screenshot({path:join(output,'collapsed-'+viewport+'.png')});
   assert.ok(Math.abs(data.card.left)<1,JSON.stringify(data));assert.ok(Math.abs(data.text.x-data.input.x)<=6,JSON.stringify(data));assert.ok(Math.abs(data.text.width-data.input.width)<=11,JSON.stringify(data));
   assert.ok(data.input.width>=Math.min(768,data.host.width-80)-1,JSON.stringify(data));
   assert.ok(Math.abs((data.input.x+data.input.width/2)-(data.host.x+data.host.width/2))<1,'reading lane must be centered independently of header navigation');
 }
 return metrics;
 });
}catch(e){report.cases.push({name:'setup',status:'failed',error:String(e)});console.error(e);}finally{await app?.close().catch(()=>{});await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await rm(temp,{recursive:true,force:true});console.log('Report: '+join(output,'report.json'));}if(report.cases.some(c=>c.status==='failed')||report.consoleErrors.length)process.exitCode=1;
