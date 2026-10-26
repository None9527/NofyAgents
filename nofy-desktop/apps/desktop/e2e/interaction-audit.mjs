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
const output = join(root, 'nofy-desktop/output/playwright', 'interaction-audit-'+new Date().toISOString().replaceAll(':', '-'));
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
  const prompt='请检查这两份配置，比较不同档位，并给出可复用的调用示例。';
  await send(prompt);await page.getByRole('heading',{name:'验证结果',exact:true}).waitFor();await idle();
  report.observations={};
  await page.setViewportSize({width:1280,height:900});
  await page.locator('.spine').hover();await page.mouse.wheel(0,-1200);await page.waitForTimeout(250);
  const before=await page.evaluate(()=>{const el=document.querySelector('.spine');return {top:el.scrollTop,height:el.scrollHeight,client:el.clientHeight};});
  await page.getByRole('button',{name:'新建任务',exact:true}).click();await page.locator('.taskrow__btn').filter({hasText:'E2E task 2'}).waitFor();
  await page.locator('.taskrow__btn').filter({hasText:'E2E task 1'}).click();await page.getByRole('heading',{name:'验证结果',exact:true}).waitFor();await page.waitForTimeout(250);
  const after=await page.evaluate(()=>{const el=document.querySelector('.spine');return {top:el.scrollTop,height:el.scrollHeight,client:el.clientHeight,backButton:[...document.querySelectorAll('button')].some(b=>/回到底部|返回底部|最新消息/.test(b.getAttribute('aria-label')||b.textContent))};});
  report.observations.sessionScroll={before,after};
  await send('e2e:plan');await page.getByRole('button',{name:'批准并执行',exact:true}).waitFor();
  await input().fill('执行过程中追加的指导');const count=(await prompts()).length;await input().press('Enter');
  report.observations.busyInput={beforePromptCount:count,afterPromptCount:(await prompts()).length,draft:await input().inputValue(),stopVisible:await page.getByRole('button',{name:'停止',exact:true}).count(),sendVisible:await page.getByRole('button',{name:'发送',exact:true}).count()};
  report.observations.approval=await page.evaluate(()=>{const box=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};return {chat:box('.card__conversation'),spine:box('.spine'),approval:box('.approvals'),composer:box('.composer__inner')};});
  await page.screenshot({path:join(output,'approval-busy-dock.png')});
  await page.getByRole('button',{name:'批准并执行',exact:true}).click();await idle();

} catch(e) {report.cases.push({name:'GUI setup',status:'failed',error:String(e)});console.error(e);}
finally {if(application)await application.close().catch(()=>{});report.finishedAt=new Date().toISOString();await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await writeFile(join(output,'wire.jsonl'),await readFile(logPath,'utf8').catch(()=>''));await rm(temp,{recursive:true,force:true});console.log(`Report: ${join(output,'report.json')}`);}
if(report.cases.some(r=>r.status==='failed')||report.consoleErrors.length)process.exitCode=1;
