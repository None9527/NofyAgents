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
const output = join(root, 'nofy-desktop/output/playwright', 'zcode-align-'+new Date().toISOString().replaceAll(':', '-'));
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
  await check('T01 streaming thought chunks form one readable group', async()=>{
    await send('e2e:thought');
    await page.getByText('正在思考',{exact:true}).waitFor();
    await page.waitForTimeout(500);
    assert.equal(await page.locator('.block--thought').count(),1);
    assert.ok(await page.locator('.block--thought').evaluate(el=>el.open));
    await idle();
    assert.equal(await page.locator('.block--agent').count(),1);
    const turn=page.locator('.turn-segment').filter({hasText:'e2e:thought'});
    if(await turn.locator('.turnhead').getAttribute('aria-expanded')!=='true') await turn.locator('.turnhead').click();
    const thought=page.locator('.block--thought');
    assert.equal(await thought.count(),1);
    assert.equal(await thought.evaluate(el=>el.open),false);
    assert.equal(await thought.locator('.block__body').isVisible(),false);
    await thought.locator('summary').click();
    assert.equal(await thought.locator('.block__body').innerText(),'There is no need to invoke tools. I will respond with a friendly greeting.');
    await page.screenshot({path:join(output,'thought-expanded.png')});
    await thought.locator('summary').click();
  });
  await check('T02 find stays outside transcript, supports shortcut, navigation and Escape',async()=>{
    await input().focus(); await page.keyboard.press(process.platform==='darwin'?'Meta+f':'Control+f');
    const search=page.getByRole('search');await search.waitFor();
    await page.getByRole('textbox',{name:'查找已加载内容',exact:true}).fill('coding assistant');
    await page.getByRole('button',{name:'下一处',exact:true}).click();
    assert.equal(await page.locator('.conversation-find__count').innerText(),'1 / 1');
    const bar=await page.locator('.spine__toolbar').boundingBox(),transcript=await page.locator('.spine').boundingBox();
    assert.ok(bar.y+bar.height<=transcript.y+1,JSON.stringify({bar,transcript}));
    await page.getByRole('textbox',{name:'查找已加载内容',exact:true}).press('Escape');await search.waitFor({state:'hidden'});
    assert.equal(await page.locator('.card__head').getByRole('button',{name:'查找已加载内容',exact:true}).count(),0);
  });
  await check('T03 transcript tools fit dark/light and narrow layouts',async()=>{
    for(const theme of ['theme-zai-dark','theme-zai-light']){
      await page.evaluate(theme=>{document.documentElement.className=theme+(theme.endsWith('dark')?' dark':'')+' platform-mac-desktop';},theme);
      for(const size of [{width:1280,height:860},{width:880,height:560}]){
        await page.setViewportSize(size);
        await page.keyboard.press(process.platform==='darwin'?'Meta+f':'Control+f');
        await page.getByRole('search').waitFor();
        const bar=await page.getByRole('search').boundingBox();assert.ok(bar.x>=0&&bar.x+bar.width<=size.width);
        assert.ok(await page.getByRole('button',{name:'关闭',exact:true}).isVisible());
        await page.screenshot({path:join(output,`conversation-${theme}-${size.width}.png`)});
        await page.getByRole('button',{name:'关闭',exact:true}).click();
        await page.screenshot({path:join(output,`conversation-closed-${theme}-${size.width}.png`)});
      }
    }
  });
  await check('T04 hooks never render and trailing work remains after the final answer',async()=>{
    await send('e2e:flow');await idle();
    const row=page.locator('.turn-segment').filter({hasText:'e2e:flow'});
    const answer=await row.getByText('Flow final answer',{exact:true}).boundingBox();
    const after=await row.getByText('Record completed result',{exact:true}).boundingBox();
    assert.ok(answer&&after&&after.y>answer.y,JSON.stringify({answer,after}));
    assert.equal(await row.getByText('Inspect workspace',{exact:true}).count(),1);
    await row.locator('.turnhead').click();await row.getByText('Inspect workspace',{exact:true}).waitFor({state:'hidden'});
    assert.equal(await row.getByText('Flow final answer',{exact:true}).count(),1);
    if(await row.locator('.turnhead').getAttribute('aria-expanded')!=='true') await row.locator('.turnhead').click();await row.getByText('Inspect workspace',{exact:true}).waitFor();
    const before=await row.getByText('Inspect workspace',{exact:true}).boundingBox();
    assert.ok(before.y<(await row.getByText('Flow final answer',{exact:true}).boundingBox()).y);
    await row.getByText('Record completed result',{exact:true}).click();await row.getByText('结果',{exact:true}).click();await row.getByText('Saved the result successfully.',{exact:true}).waitFor();
    assert.doesNotMatch(await page.locator('.spine').innerText(),/hook:/);
    assert.equal(await page.locator('.block--event').count(),0);
    assert.equal(await page.locator('.spine__toolbar').count(),0);
    assert.equal(await page.locator('.card__head').getByRole('button',{name:'查找已加载内容',exact:true}).count(),0);
    await page.screenshot({path:join(output,'flow-order.png')});
  });
  await check('T05 header, panel-local button and shortcut collapse the entire right panel',async()=>{
    for(const size of [{width:1280,height:860},{width:880,height:560}]){
      await page.setViewportSize(size);
      await page.getByRole('button',{name:'展开侧边面板',exact:true}).click();await page.locator('.aux').waitFor();
      await page.getByRole('button',{name:'收起右侧栏',exact:true}).click();await page.locator('.aux').waitFor({state:'hidden'});
      await page.getByRole('button',{name:'展开侧边面板',exact:true}).click();
      if(!await page.locator('.fileworkspace').count())await page.getByRole('button',{name:'文件',exact:true}).click();await page.getByRole('complementary',{name:'工作区文件树',exact:true}).waitFor();
      await page.getByRole('button',{name:'隐藏文件树',exact:true}).click();assert.equal(await page.getByRole('complementary',{name:'工作区文件树',exact:true}).count(),0);
      await page.getByRole('button',{name:'显示文件树',exact:true}).click();
      await page.getByRole('button',{name:'收起右侧栏',exact:true}).click();await page.locator('.aux').waitFor({state:'hidden'});
      await page.keyboard.press(process.platform==='darwin'?'Meta+Alt+b':'Control+Alt+b');await page.locator('.aux').waitFor();
      assert.equal(await page.getByRole('button',{name:'隐藏文件树',exact:true}).count(),1);
      if(await page.locator('.side-sheet').evaluate(el=>el.matches(':modal')))await page.keyboard.press(process.platform==='darwin'?'Meta+Alt+b':'Control+Alt+b');else await page.getByRole('button',{name:'收起右侧栏',exact:true}).click();await page.locator('.aux').waitFor({state:'hidden'});
    }
  });
} catch(e) {report.cases.push({name:'GUI setup',status:'failed',error:String(e)});console.error(e);}
finally {if(application)await application.close().catch(()=>{});report.finishedAt=new Date().toISOString();await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await writeFile(join(output,'wire.jsonl'),await readFile(logPath,'utf8').catch(()=>''));await rm(temp,{recursive:true,force:true});console.log(`Report: ${join(output,'report.json')}`);}
if(report.cases.some(r=>r.status==='failed')||report.consoleErrors.length)process.exitCode=1;
