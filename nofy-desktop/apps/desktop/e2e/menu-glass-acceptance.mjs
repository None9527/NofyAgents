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
const output = join(root, 'nofy-desktop/output/playwright', 'menu-glass-'+new Date().toISOString().replaceAll(':', '-'));
const home = join(temp, 'home'), nofyHome = join(temp, 'nofy'), cwd = join(temp, '项目 A with spaces'), logPath = join(temp, 'wire.jsonl');
await Promise.all([mkdir(output, { recursive: true }), mkdir(home), mkdir(nofyHome), mkdir(cwd)]);
const report = { source: 'Electron GUI + deterministic ACP emulator (no real model)', startedAt: new Date().toISOString(), cases: [], consoleErrors: [], output };
let application, page, currentCase = "startup";
async function check(name, fn) { currentCase = name; const start = performance.now(); try { const details = await fn(); report.cases.push({ name, status: 'passed', durationMs: Math.round(performance.now()-start), details }); console.log(`PASS ${name}`); } catch (e) { report.cases.push({ name, status: 'failed', error: String(e) }); console.error(`FAIL ${name}: ${e}`); if(page) await page.screenshot({path:join(output,`${report.cases.length}-failure.png`)}).catch(()=>{}); } }
const wire = async () => { try { return (await readFile(logPath,'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse); } catch { return []; } };
const prompts = async () => (await wire()).filter(r=>r.frame.method==='session/prompt');
const input = () => page.locator('textarea.composer__input');
async function send(text) { await input().fill(text); await page.getByRole('button',{name:'发送',exact:true}).click(); }
async function idle() { await page.waitForFunction(()=>document.querySelector('.composer')?.dataset.inputState==='ready',undefined,{timeout:15000}); }
try {
  const dist=join(appRoot,'node_modules/electron/dist');
  const executablePath=process.platform==='darwin'?join(dist,'Electron.app/Contents/MacOS/Electron'):process.platform==='win32'?join(dist,'electron.exe'):join(dist,'electron');
  application=await _electron.launch({executablePath,args:[appRoot,`--user-data-dir=${join(temp,'chromium')}`],env:{...process.env,HOME:home,NOFY_HOME:nofyHome,NOFY_BIN:join(here,'mock-kernel.mjs'),NOFY_WORKSPACE:cwd,NOFY_E2E_LOG:logPath,NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:process.env.NOFY_E2E_DEV_URL??'',ELECTRON_RUN_AS_NODE:''},timeout:30000});
  page=await application.firstWindow(); page.on('pageerror',e=>report.consoleErrors.push({case:currentCase,message:String(e),stack:e.stack}));
  await page.locator('textarea.composer__input:not(:disabled)').waitFor({timeout:30000}); await page.screenshot({path:join(output,'initial.png')});
  await check('P01 bottom input menus remain above their triggers and clickable',async()=>{
    
    for(const size of [{width:1280,height:860},{width:1024,height:768},{width:880,height:560}]){
      await page.setViewportSize(size);
      for(const trigger of [page.locator('.composer .menu__trigger').first(),page.locator('.composer .menu__trigger').nth(1),page.locator('.composer .menu__trigger').last()]){
        await trigger.click();const menu=page.getByRole('menu');await menu.waitFor();const box=await menu.boundingBox(),anchor=await trigger.boundingBox();assert.ok(box&&anchor&&box.y+box.height<=anchor.y-3,JSON.stringify({box,anchor}));assert.ok(box.x>=0&&box.x+box.width<=size.width&&box.y>=0&&box.y+box.height<=size.height);
        for(const item of await menu.getByRole('menuitem').all()){assert.ok(await item.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===el||el.contains(hit);}),'Menu item clipped/covered');}
        await page.keyboard.press('Escape');await menu.waitFor({state:'hidden'});assert.ok(await trigger.evaluate(el=>el===document.activeElement));
      }
    }
  });
  await check('P02 outside click and keyboard selection keep menu lifecycle intact',async()=>{
    const trigger=page.locator('.composer .menu__trigger').first();await trigger.click();await page.getByRole('menu').waitFor();await page.keyboard.press('ArrowDown');assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('role')),'menuitem');await page.keyboard.press('Escape');await page.getByRole('menu').waitFor({state:'hidden'});
    await trigger.click();const outside=await page.locator('.card__title').boundingBox();await page.mouse.click(outside.x+outside.width/2,outside.y+outside.height/2);await page.getByRole('menu').waitFor({state:'hidden'});
  });
  await check('P03 dark and light glass keep the sidebar transparent over a translucent shell',async()=>{
    await page.setViewportSize({width:1280,height:860});
    for(const theme of ['theme-zai-dark','theme-zai-light']){
      await page.evaluate(theme=>{document.documentElement.className=theme+(theme.endsWith('dark')?' dark':'')+' platform-mac-desktop';},theme);
      const layers=await page.evaluate(()=>({sidebar:getComputedStyle(document.querySelector('.sidebar')).backgroundColor,body:getComputedStyle(document.body).backgroundColor,shell:getComputedStyle(document.querySelector('.shell')).backgroundColor}));assert.equal(layers.sidebar,'rgba(0, 0, 0, 0)');assert.equal(layers.body,'rgba(0, 0, 0, 0)');assert.ok(layers.shell.includes('/ 0.')||layers.shell.startsWith('rgba('),JSON.stringify(layers));
      await page.locator('.composer .menu__trigger').first().click();await page.getByRole('menu').waitFor();await page.screenshot({path:join(output,'composer-menu-'+theme+'.png')});await page.keyboard.press('Escape');
    }
  });
} catch(e) {report.cases.push({name:'GUI setup',status:'failed',error:String(e)});console.error(e);}
finally {if(application)await application.close().catch(()=>{});report.finishedAt=new Date().toISOString();await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await writeFile(join(output,'wire.jsonl'),await readFile(logPath,'utf8').catch(()=>''));await rm(temp,{recursive:true,force:true});console.log(`Report: ${join(output,'report.json')}`);}
if(report.cases.some(r=>r.status==='failed')||report.consoleErrors.length)process.exitCode=1;
