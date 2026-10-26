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
const output = join(root, 'nofy-desktop/output/playwright', 'rich-'+new Date().toISOString().replaceAll(':', '-'));
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
  await check('R01 user bubble, icon actions and grouped exploration match the conversation structure',async()=>{
    const user=await page.locator('.block--user .block__body').boundingBox(),content=await page.locator('.spine__inner').boundingBox();assert.ok(user.x>content.x+40&&user.x+user.width<=content.x+content.width);
    assert.equal(await page.locator('.turn-actions').innerText(),'');
    await copyAndWait(page.getByRole('button',{name:'复制输入',exact:true}));assert.equal(await application.evaluate(({clipboard})=>clipboard.readText()),prompt);
    await page.getByRole('button',{name:'复制输入到草稿',exact:true}).click();assert.equal(await input().inputValue(),prompt);await input().fill('');
    if(await page.locator('.turnhead').getAttribute('aria-expanded')!=='true') await page.locator('.turnhead').click();assert.equal(await page.locator('.work-group').count(),1);
    assert.match(await page.locator('.work-group summary').first().innerText(),/2 文件/);
    await page.locator('.work-group > summary').click();assert.equal(await page.locator('.tool-card').count(),2);
    assert.equal(await page.locator('.block--event').count(),0);
  });
  await check('R02 nested Markdown, GFM task list and table cells render as semantic content',async()=>{
    assert.equal(await page.locator('.md__ol > li > .md__ul').count(),1);
    assert.equal(await page.locator('.md input[type=checkbox]').count(),2);
    assert.equal(await page.locator('.md__table tbody tr').count(),2);
    await copyAndWait(page.getByRole('button',{name:'复制表格',exact:true}));assert.match(await application.evaluate(({clipboard})=>clipboard.readText()),/档位\t数量\nlow\t4,096\nhigh\t29,014/);
    await page.getByRole('button',{name:'展开表格',exact:true}).click();await page.getByRole('dialog',{name:'表格',exact:true}).waitFor();assert.equal(await page.getByRole('dialog').locator('tbody tr').count(),2);await page.getByRole('dialog').getByRole('button',{name:'关闭',exact:true}).click();
  });
  await check('R03 code copy and wrapping preserve exact text',async()=>{
    await copyAndWait(page.getByRole('button',{name:'复制代码块内容',exact:true}));const code=await application.evaluate(({clipboard})=>clipboard.readText());assert.match(code,/"enabled": true/);assert.ok(code.includes('src/long-folder/'));
    await page.getByRole('button',{name:'代码自动换行',exact:true}).click();assert.equal(await page.getByRole('button',{name:'代码自动换行',exact:true}).getAttribute('aria-pressed'),'true');assert.ok(await page.locator('.codeblock .tok--string').count()>2);
  });
  await check('R04 table and code downloads use native save dialog and retain original data',async()=>{
    const csvPath=join(temp,'table.csv');await application.evaluate(({dialog},file)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:file});},csvPath);
    await page.locator('.md-table').getByRole('button',{name:'下载内容',exact:true}).click();await page.waitForTimeout(300);assert.match(await readFile(csvPath,'utf8'),/"low","4,096"/);
    const codePath=join(temp,'code.json');await application.evaluate(({dialog},file)=>{dialog.showSaveDialog=async()=>({canceled:false,filePath:file});},codePath);
    await page.locator('.codeblock').getByRole('button',{name:'下载内容',exact:true}).click();await page.waitForTimeout(300);assert.match(await readFile(codePath,'utf8'),/"mode": "high"/);
  });
  await check('R05 dark/light, wide/narrow layouts keep reading surfaces within their viewport',async()=>{
    for(const theme of ['theme-zai-dark','theme-zai-light']){
      await page.evaluate(theme=>{document.documentElement.className=theme+(theme.endsWith('dark')?' dark':'')+' platform-mac-desktop';},theme);
      for(const size of [{width:1440,height:1000},{width:880,height:700}]){
        await page.setViewportSize(size);await page.locator('.spine').evaluate(el=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();el.style.scrollBehavior='auto';el.scrollTop=0;});
        assert.ok(await page.locator('.spine').evaluate(el=>el.scrollWidth<=el.clientWidth+2));
        await page.screenshot({path:join(output,`rich-top-${theme}-${size.width}.png`)});
        await page.locator('.codeblock').scrollIntoViewIfNeeded();await page.screenshot({path:join(output,`rich-content-${theme}-${size.width}.png`)});
      }
    }
  });
} catch(e) {report.cases.push({name:'GUI setup',status:'failed',error:String(e)});console.error(e);}
finally {if(application)await application.close().catch(()=>{});report.finishedAt=new Date().toISOString();await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await writeFile(join(output,'wire.jsonl'),await readFile(logPath,'utf8').catch(()=>''));await rm(temp,{recursive:true,force:true});console.log(`Report: ${join(output,'report.json')}`);}
if(report.cases.some(r=>r.status==='failed')||report.consoleErrors.length)process.exitCode=1;
