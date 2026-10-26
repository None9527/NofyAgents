import { loadPlaywright } from "./playwright-driver.mjs";
/** Actual Electron GUI against deterministic ACP emulator; no real model or credentials.
 * Run after pnpm build: node apps/desktop/e2e/renderer-acceptance.mjs
 */
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const here = dirname(fileURLToPath(import.meta.url)), appRoot = resolve(here, '..'), root = resolve(appRoot, '../../..');
const {_electron}=await loadPlaywright();
const temp = await mkdtemp(join(tmpdir(), 'nofy-gui-e2e-'));
const output = join(root, 'nofy-desktop/output/playwright', 'layout-audit-'+new Date().toISOString().replaceAll(':', '-'));
const home = join(temp, 'home'), nofyHome = join(temp, 'nofy'), cwd = join(temp, '项目 A with spaces'), logPath = join(temp, 'wire.jsonl');
await Promise.all([mkdir(output, { recursive: true }), mkdir(home), mkdir(nofyHome), mkdir(cwd)]);
const report = { source: 'Electron GUI + deterministic ACP emulator (no real model)', startedAt: new Date().toISOString(), cases: [], consoleErrors: [], output };
let application, page, currentCase = "startup";
async function check(name, fn) { currentCase = name; const start = performance.now(); try { const details = await fn(); report.cases.push({ name, status: 'passed', durationMs: Math.round(performance.now()-start), details }); console.log(`PASS ${name}`); } catch (e) { report.cases.push({ name, status: 'failed', error: String(e) }); console.error(`FAIL ${name}: ${e}`); if(page) await page.screenshot({path:join(output,`${report.cases.length}-failure.png`)}).catch(()=>{}); } }
const wire = async () => { try { return (await readFile(logPath,'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse); } catch { return []; } };
const prompts = async () => (await wire()).filter(r=>r.frame.method==='session/prompt');
const input = () => page.locator('textarea.composer__input');
async function send(text) { await input().fill(text); await page.getByRole('button',{name:'发送',exact:true}).click(); }
async function copyAndWait(button) { await button.click(); await page.waitForFunction(el=>el.title==='已复制',await button.elementHandle()); }
async function idle() { await page.waitForFunction(()=>document.querySelector('.composer')?.dataset.inputState==='ready',undefined,{timeout:15000}); }
try {
  const dist=join(appRoot,'node_modules/electron/dist');
  const executablePath=process.platform==='darwin'?join(dist,'Electron.app/Contents/MacOS/Electron'):process.platform==='win32'?join(dist,'electron.exe'):join(dist,'electron');
  application=await _electron.launch({executablePath,args:[appRoot,`--user-data-dir=${join(temp,'chromium')}`],env:{...process.env,HOME:home,NOFY_HOME:nofyHome,NOFY_BIN:join(here,'mock-kernel.mjs'),NOFY_WORKSPACE:cwd,NOFY_E2E_LOG:logPath,NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:process.env.NOFY_E2E_DEV_URL??'',ELECTRON_RUN_AS_NODE:''},timeout:30000});
  page=await application.firstWindow(); page.on('pageerror',e=>report.consoleErrors.push({case:currentCase,message:String(e),stack:e.stack}));
  await page.locator('textarea.composer__input:not(:disabled)').waitFor({timeout:30000}); await page.screenshot({path:join(output,'initial.png')});
  report.empty=await page.evaluate(()=>{const box=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};return {chat:box('.card__conversation'),spine:box('.spine'),empty:box('.empty'),composer:box('.composer__inner')};});
  const prompt='请检查这两份配置，比较不同档位，并给出可复用的调用示例。';
  await send(prompt);await page.getByRole('heading',{name:'验证结果',exact:true}).waitFor();await idle();
  report.measurements=[];
  const configurations=[
    {name:'left264-rightClosed',side:264,left:true,right:false},
    {name:'left264-right548',side:264,left:true,right:true},
    {name:'left480-right548',side:480,left:true,right:true},
    {name:'leftClosed-rightClosed',side:264,left:false,right:false},
  ];
  for(const width of [880,900,901,1000,1280,1440,1920]){
    for(const config of configurations){
      await page.setViewportSize({width,height:900});
      await page.evaluate(c=>localStorage.setItem('nofy-desktop:layout',`${c.left?'sidebar-open':'sidebar-closed'}|${c.right?'aux-open':'aux-closed'}|w=${c.side}|v=projects|s=recent|dock-closed|a=548`),config);
      await page.reload();
      await page.locator('textarea.composer__input:not(:disabled)').waitFor({timeout:15000});
      await page.getByRole('heading',{name:'验证结果',exact:true}).waitFor();
      if(config.right){await page.getByRole('button',{name:'展开侧边面板',exact:true}).click();await page.locator('.aux').waitFor();}
      const metrics=await page.evaluate(()=>{
        const box=selector=>{const el=document.querySelector(selector);if(!el)return null;const b=el.getBoundingClientRect(),s=getComputedStyle(el);return {x:b.x,y:b.y,w:b.width,h:b.height,client:el.clientWidth,scroll:el.scrollWidth,padding:s.padding,position:s.position,overflowX:s.overflowX,scrollbarGutter:s.scrollbarGutter,fontSize:s.fontSize};};
        const composer=document.querySelector('.composer__inner'),rect=composer.getBoundingClientRect();
        const controls=[...document.querySelectorAll('.composer__row button')].map(el=>{const b=el.getBoundingClientRect();return {label:el.getAttribute('aria-label')||el.title||el.textContent,w:b.width,right:b.right,clipped:b.right>rect.right+1||b.left<rect.left-1};});
        const spine=document.querySelector('.spine');spine.style.scrollBehavior='auto';spine.scrollTop=0;
        return {window:{w:innerWidth,h:innerHeight},rootFont:getComputedStyle(document.documentElement).fontSize,body:box('.card__body'),chat:box('.card__conversation'),spine:box('.spine'),column:box('.spine__inner'),user:box('.block--user .block__body'),answer:box('.block--agent .md'),composer:box('.composer__inner'),toolbar:box('.composer__row'),header:box('.card__head'),aux:box('.aux'),controls};
      });
      report.measurements.push({width,config:config.name,...metrics});
      if([880,901,1280,1920].includes(width)&&[configurations[0].name,configurations[1].name].includes(config.name))await page.screenshot({path:join(output,`${width}-${config.name}.png`)});
    }
  }
  await page.setViewportSize({width:1280,height:560});
  await page.evaluate(()=>localStorage.setItem('nofy-desktop:layout','sidebar-open|aux-closed|w=264|v=projects|dock-closed'));
  await page.reload();await page.locator('textarea.composer__input:not(:disabled)').waitFor();
  await input().fill(Array.from({length:12},(_,i)=>`第${i+1}行较长输入`).join('\n'));
  report.shortHeight=await page.evaluate(()=>{const b=selector=>{const el=document.querySelector(selector),r=el.getBoundingClientRect();return {y:r.y,h:r.height,w:r.width};};return {spine:b('.spine'),composer:b('.composer__inner'),input:b('.composer__input')};});
  await page.screenshot({path:join(output,'560-height-multiline.png')});
  await input().fill('');

} catch(e) {report.cases.push({name:'GUI setup',status:'failed',error:String(e)});console.error(e);}
finally {if(application)await application.close().catch(()=>{});report.finishedAt=new Date().toISOString();await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await writeFile(join(output,'wire.jsonl'),await readFile(logPath,'utf8').catch(()=>''));await rm(temp,{recursive:true,force:true});console.log(`Report: ${join(output,'report.json')}`);}
if(report.cases.some(r=>r.status==='failed')||report.consoleErrors.length)process.exitCode=1;
