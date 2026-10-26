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
const temp = await mkdtemp(join(tmpdir(), 'nofy-workspace-e2e-'));
const output = join(root, 'nofy-desktop/output/playwright', 'workspace-'+new Date().toISOString().replaceAll(':', '-'));
const home = join(temp, 'home'), nofyHome = join(temp, 'nofy'), cwd = join(temp, '项目 A with spaces'), logPath = join(temp, 'wire.jsonl');
await Promise.all([mkdir(output, { recursive: true }), mkdir(home), mkdir(nofyHome), mkdir(cwd)]);
await writeFile(join(cwd,'A.md'),'# fixture'); await writeFile(join(cwd,'B.ts'),'fixture');
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
  application=await _electron.launch({executablePath,args:[appRoot,`--user-data-dir=${join(temp,'chromium')}`],env:{...process.env,HOME:home,NOFY_HOME:nofyHome,NOFY_BIN:join(here,'workspace-kernel.mjs'),NOFY_WORKSPACE:cwd,NOFY_E2E_LOG:logPath,NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:process.env.NOFY_E2E_DEV_URL??'',ELECTRON_RUN_AS_NODE:''},timeout:30000});
  page=await application.firstWindow(); page.on('pageerror',e=>report.consoleErrors.push({case:currentCase,message:String(e),stack:e.stack}));
  await page.locator('textarea.composer__input:not(:disabled)').waitFor({timeout:30000}); await page.screenshot({path:join(output,'initial.png')});
  await check('W00 right pane home lists the real tools',async()=>{
    await page.getByRole('button',{name:'展开侧边面板',exact:true}).click();
    const home=page.locator('.aux .ui-pane-home');await home.waitFor();await page.locator('.browserpane__address').waitFor();await page.getByRole('tab',{name:'新标签页',exact:true}).waitFor();assert.equal(await home.locator('.ui-pane-choice').count(),4);assert.equal(await home.locator('.ui-pane-choice:disabled').count(),0);assert.equal(await page.locator('.ui-pane-home__sites').count(),0);
    const metrics=await page.evaluate(()=>{const e=document.querySelector('.aux .ui-pane-home'),h=e.querySelector('h2'),bar=document.querySelector('.aux__head'),style=getComputedStyle(e);return {title:h.textContent,bar:bar.getBoundingClientRect().height,hMargin:getComputedStyle(h).margin,rows:[...e.querySelectorAll('.ui-pane-choice')].map(el=>el.getBoundingClientRect().height),labels:[...e.querySelectorAll('.ui-pane-choice')].map(el=>el.getAttribute('aria-label')),expand:document.querySelector('.aux [aria-label="全屏显示"]')!=null,placeholder:document.querySelector('.browserpane__address').getAttribute('placeholder'),align:style.alignItems,justify:style.justifyContent};});assert.equal(metrics.title,'工具');assert.equal(metrics.bar,48);assert.equal(metrics.hMargin,'0px');assert.deepEqual(metrics.rows,[40,40,40,40]);assert.deepEqual(metrics.labels,['文件','审查','子智能体','终端']);assert.equal(metrics.expand,true);assert.equal(metrics.placeholder,'搜索或输入网址');assert.equal(metrics.align,'stretch');assert.equal(metrics.justify,'flex-start');await page.screenshot({path:join(output,'shared-empty-pane.png')});await page.getByRole('button',{name:'收起右侧栏',exact:true}).click();return metrics;
  });
  await check('W01 file reads use the scoped ACP adapter; late A cannot replace B',async()=>{
    await page.getByRole('button',{name:'展开侧边面板',exact:true}).click();
    await page.getByRole('button',{name:'文件',exact:true}).click();
    await page.locator('.filetree__row').filter({hasText:'A.md'}).click();
    await page.locator('.filetree__row').filter({hasText:'B.ts'}).click();
    await page.locator('.filepane__preview-body').getByText('ACTIVE B CONTENT',{exact:true}).waitFor();
    await page.waitForTimeout(600);
    assert.match(await page.locator('.filepane__preview-body').innerText(),/ACTIVE B CONTENT/);
    assert.doesNotMatch(await page.locator('.filepane__preview-body').innerText(),/LATE A CONTENT/);
  });
  await check('W02 closing a pending preview prevents it reappearing',async()=>{
    await page.locator('.filetree__row').filter({hasText:'A.md'}).click();
    await page.getByRole('button',{name:'关闭 A.md',exact:true}).click(); await page.waitForTimeout(600);
    assert.equal(await page.getByRole('tablist',{name:'文件标签',exact:true}).getByRole('tab').count(),0);
  });
  await check('W03 session switch invalidates same-root file reads',async()=>{
    await page.locator('.filetree__row').filter({hasText:'A.md'}).click();
    await page.getByRole('button',{name:'新建任务',exact:true}).first().click();
    await page.getByText('Workspace 2',{exact:true}).first().waitFor();
    await page.waitForTimeout(600);
    assert.equal(await page.getByRole('tablist',{name:'文件标签',exact:true}).getByRole('tab').count(),0);
    await page.locator('.filetree__row').filter({hasText:'B.ts'}).waitFor();
  });
  await check('W04 failed fuzzy open displays the error',async()=>{
    await page.locator('.filepane__search input').fill('missing');
    await page.locator('.filepane__error').filter({hasText:'Workspace search unavailable'}).waitFor();
    const frames=await wire();assert.ok(frames.some(r=>r.frame.method==='_nofy/fs/list'&&r.frame.params.includeHidden===false));
    assert.ok(frames.some(r=>r.frame.method==='_nofy/fs/read_file'&&r.frame.params.maxLines===4000));
    await page.screenshot({path:join(output,'workspace.png')});
  });
  await check('W05 preview slot, double-click pinning and resource deduplication',async()=>{
    await page.locator('.filepane__search input').fill('');
    await page.locator('.filetree__row').filter({hasText:'B.ts'}).click();await page.getByRole('tab',{name:'B.ts',exact:true}).dblclick();
    await page.locator('.filetree__row').filter({hasText:'A.md'}).dblclick();await page.getByRole('heading',{name:'LATE A CONTENT',exact:true}).waitFor();
    assert.equal(await page.getByRole('tablist',{name:'文件标签',exact:true}).getByRole('tab').count(),2);
    await page.locator('.filetree__row').filter({hasText:'B.ts'}).click();assert.equal(await page.getByRole('tablist',{name:'文件标签',exact:true}).getByRole('tab').count(),2);
  });
  await check('W06 Markdown/source modes retain separate reading positions',async()=>{
    await page.getByRole('tab',{name:'A.md',exact:true}).click();await page.getByRole('heading',{name:'LATE A CONTENT',exact:true}).waitFor();
    await page.locator('.filepane__preview-body').evaluate(el=>{el.scrollTop=340;});await page.waitForTimeout(100);
    await page.getByRole('button',{name:'查看源码',exact:true}).click();await page.locator('.filepane__preview-body').evaluate(el=>{el.scrollTop=170;});await page.waitForTimeout(100);
    await page.getByRole('button',{name:'预览 Markdown',exact:true}).click();assert.ok(await page.locator('.filepane__preview-body').evaluate(el=>el.scrollTop)>300);
    await page.getByRole('button',{name:'查看源码',exact:true}).click();assert.ok(await page.locator('.filepane__preview-body').evaluate(el=>el.scrollTop)>130);
    await page.getByRole('button',{name:'预览 Markdown',exact:true}).click();
  });
  await check('W07 tree and outer-panel hiding preserve resource tabs and scroll',async()=>{
    report.positionsW07=[];const record=async phase=>{const data=await page.evaluate(()=>{const el=document.querySelector('.filepane__preview-body');return {top:el.scrollTop,height:el.scrollHeight,client:el.clientHeight,active:document.activeElement?.textContent,prefs:JSON.parse(localStorage.getItem('nofy-desktop:file-workspaces-v1')??'null')};});report.positionsW07.push({phase,...data});return data.top;};await record('before-hide');
    await page.getByRole('button',{name:'隐藏文件树',exact:true}).click();assert.equal(await page.getByRole('complementary',{name:'工作区文件树',exact:true}).count(),0);
    await record('after-hide');await page.getByRole('tab',{name:'B.ts',exact:true}).click();await record('after-B');await page.getByRole('tab',{name:'A.md',exact:true}).click();assert.ok(await record('after-A')>300,'A tab scroll was lost');
    await page.getByRole('button',{name:'收起右侧栏',exact:true}).click();await page.getByRole('button',{name:'展开侧边面板',exact:true}).click();await page.getByRole('heading',{name:'LATE A CONTENT',exact:true}).waitFor();
    assert.equal(await page.getByRole('tablist',{name:'文件标签',exact:true}).getByRole('tab').count(),2);assert.ok(await record('after-outer-reopen')>300,'Outer close/reopen lost file scroll');
    await page.getByRole('button',{name:'显示文件树',exact:true}).click();await page.screenshot({path:join(output,'fileworkspace-wide.png')});
  });
  if(report.cases.at(-1)?.status==='failed')throw new Error('Stop after W07 to avoid cascading invalid workspace state');
  await check('W18 one shared resource tab strip, no redundant menu and module switching',async()=>{
    const chrome=await page.evaluate(()=>{const head=document.querySelector('.aux__head'), tabs=document.querySelector('[aria-label="文件标签"]'), header=document.querySelector('.fileworkspace__header'), split=document.querySelector('.fileworkspace__split');return {head:head.getBoundingClientRect().toJSON(),tabs:tabs.getBoundingClientRect().toJSON(),header:header.getBoundingClientRect().toJSON(),split:split.getBoundingClientRect().toJSON(),oldTabs:document.querySelectorAll('.fileworkspace__tabs').length,secondary:document.querySelectorAll('.fileworkspace__secondary-actions').length};});
    assert.equal(chrome.oldTabs,0);assert.equal(chrome.secondary,0);assert.ok(chrome.tabs.y>=chrome.head.y&&chrome.tabs.y+chrome.tabs.height<=chrome.head.y+chrome.head.height);assert.ok(Math.abs(chrome.header.y+chrome.header.height-chrome.split.y)<2);
    await page.getByRole('button',{name:'新增标签',exact:true}).click();await page.getByRole('menuitem',{name:'审查',exact:true}).click();
    assert.equal(await page.getByRole('tab',{name:'A.md',exact:true}).getAttribute('aria-selected'),'false');
    await page.getByRole('tab',{name:'A.md',exact:true}).click();await page.getByRole('heading',{name:'LATE A CONTENT',exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('.filepane__preview-body')?.scrollTop>300);
    assert.equal(await page.getByRole('tablist',{name:'文件标签',exact:true}).getByRole('tab').count(),2);
    assert.equal(await page.getByRole('button',{name:'文件操作',exact:true}).count(),0);
    assert.equal(await page.locator('.fileworkspace__header').getByRole('button',{name:'刷新',exact:true}).count(),0);
    await page.screenshot({path:join(output,'unified-resource-chrome.png')});return chrome;
  });
  await check('W19 responsive source and non-overlapping tree at 320/400/548px in both themes',async()=>{
    await page.setViewportSize({width:1700,height:1000});
    await writeFile(join(cwd,'Live.txt'),'LONG_SOURCE_'.repeat(80)+'长行内容'.repeat(20));await page.locator('.filetree__row').filter({hasText:'Live.txt'}).click();await page.locator('.codeblock--wrap').waitFor();
    const metrics=[];
    for(const size of [320,400,548]){
      const handle=page.locator('.aux__handle'), box=await handle.boundingBox(), before=await page.locator('.side-sheet').boundingBox();
      await page.mouse.move(box.x+2,box.y+80);await page.mouse.down();await page.mouse.move(box.x+2+before.width-size,box.y+80,{steps:8});await page.mouse.up();await page.waitForTimeout(80);
      for(const theme of ['dark','light']){
        await page.evaluate(theme=>{document.documentElement.classList.remove('theme-zai-dark','theme-zai-light');document.documentElement.classList.add('theme-zai-'+theme);},theme);
        const data=await page.evaluate(()=>{const header=document.querySelector('.fileworkspace__header'), path=document.querySelector('.fileworkspace__breadcrumbs'), action=document.querySelector('.fileworkspace__actions'), aux=document.querySelector('.aux'), tree=document.querySelector('.fileworkspace__explorer');return {header:header.getBoundingClientRect().toJSON(),path:path.getBoundingClientRect().toJSON(),action:action.getBoundingClientRect().toJSON(),width:aux.clientWidth,background:getComputedStyle(aux).backgroundColor,treeBackground:getComputedStyle(tree).backgroundColor};});
        assert.ok(data.path.width>45,JSON.stringify(data));assert.ok(data.action.x+data.action.width<=data.header.x+data.header.width,JSON.stringify(data));assert.ok(Math.abs(data.action.y+data.action.height/2-(data.path.y+data.path.height/2))<2);assert.equal(data.background,data.treeBackground);const content=await page.evaluate(()=>{const v=document.querySelector('.filepane__preview-body'),p=v.querySelector('.codeblock__pre'),l=v.querySelector('.codeblock__line'),t=document.querySelector('.fileworkspace__explorer');const vr=v.getBoundingClientRect(),tr=t.getBoundingClientRect();return {vw:v.clientWidth,sw:v.scrollWidth,pw:p.clientWidth,ps:p.scrollWidth,line:l.getBoundingClientRect().height,lineHeight:parseFloat(getComputedStyle(l).lineHeight),previewRight:vr.right,treeLeft:tr.left};});assert.ok(content.sw<=content.vw+1,JSON.stringify(content));assert.ok(content.ps<=content.pw+1,JSON.stringify(content));assert.ok(content.line>content.lineHeight*2,JSON.stringify(content));assert.ok(content.previewRight<=content.treeLeft+1,JSON.stringify(content));assert.ok(await page.getByRole('button',{name:'新增标签',exact:true}).isVisible());assert.equal(await page.getByRole('button',{name:'新增标签',exact:true}).evaluate(el=>{const b=el.getBoundingClientRect();return document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)===el||el.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));}),true);metrics.push({size,theme,...data});
      }
    }
    await page.evaluate(()=>{document.documentElement.classList.remove('theme-zai-light');document.documentElement.classList.add('theme-zai-dark');});await page.locator('.aux__handle').dblclick();
    await page.getByRole('button',{name:'代码自动换行',exact:true}).click();assert.ok(await page.locator('.codeblock__pre').evaluate(el=>el.scrollWidth>el.clientWidth));await page.getByRole('button',{name:'代码自动换行',exact:true}).click();await page.screenshot({path:join(output,'responsive-source.png')});await page.getByRole('button',{name:'关闭 Live.txt',exact:true}).click();
    await writeFile(join(cwd,'protoc'),'synthetic extensionless source');await page.locator('.filetree__row').filter({hasText:'protoc'}).click();await page.locator('.codeblock__lang').waitFor();assert.doesNotMatch(await page.locator('.codeblock__lang').innerText(),/\//);assert.equal(await page.locator('.fileworkspace__secondary-actions').count(),0);await page.screenshot({path:join(output,'unified-source-chrome.png')});
    await page.getByRole('button',{name:'关闭 protoc',exact:true}).click();await page.getByRole('tab',{name:'A.md',exact:true}).click();return metrics;
  });
  await check('W08 session switch restores only its own resource workspace',async()=>{
    await page.getByRole('button',{name:'新建任务',exact:true}).first().click();await page.getByText('Workspace 3',{exact:true}).first().waitFor();
    assert.equal(await page.getByRole('tablist',{name:'文件标签',exact:true}).getByRole('tab').count(),0);
    await page.locator('.taskrow__btn').filter({hasText:'Workspace 2'}).click();await page.getByRole('heading',{name:'LATE A CONTENT',exact:true}).waitFor();assert.equal(await page.getByRole('tablist',{name:'文件标签',exact:true}).getByRole('tab').count(),2);
  });
  await check('W09 narrow tree split, themes and closing a non-active tab',async()=>{
    await page.setViewportSize({width:1024,height:768});await page.getByRole('button',{name:'隐藏文件树',exact:true}).click();
    await page.screenshot({path:join(output,'fileworkspace-narrow.png')});await page.getByRole('button',{name:'显示文件树',exact:true}).click();
    await page.evaluate(()=>{document.documentElement.classList.remove('theme-zai-dark');document.documentElement.classList.add('theme-zai-light');});await page.screenshot({path:join(output,'fileworkspace-light.png')});
    await page.getByRole('button',{name:'关闭 B.ts',exact:true}).click();assert.equal(await page.getByRole('tab',{name:'A.md',exact:true}).getAttribute('aria-selected'),'true');
    assert.equal(await page.getByRole('tablist',{name:'文件标签',exact:true}).getByRole('tab').count(),1);
  });
  await check('W10 draggable inner tree width is independent and survives hide/show',async()=>{
    await page.setViewportSize({width:1700,height:1000});const tree=page.getByRole('complementary',{name:'工作区文件树',exact:true});const rail=page.getByRole('separator',{name:'调整文件树宽度',exact:true});
    const before=(await tree.boundingBox()).width,box=await rail.boundingBox();assert.ok(box);await page.mouse.move(box.x+2,box.y+100);await page.mouse.down();await page.mouse.move(box.x-55,box.y+100,{steps:10});await page.mouse.up();
    const after=(await tree.boundingBox()).width;assert.ok(after>before+20,JSON.stringify({before,after}));
    await page.getByRole('button',{name:'隐藏文件树',exact:true}).click();await page.getByRole('button',{name:'显示文件树',exact:true}).click();assert.ok(Math.abs((await tree.boundingBox()).width-after)<2);
    await rail.focus();await rail.press('ArrowRight');assert.ok((await tree.boundingBox()).width<after);
  });
  await check('W11 header breadcrumb and copy actions cross real native IPC',async()=>{
    const breadcrumb=page.getByRole('navigation',{name:'文件路径',exact:true});assert.match(await breadcrumb.innerText(),/项目 A with spaces/);assert.match(await breadcrumb.innerText(),/A.md/);
    await page.getByRole('button',{name:'复制完整路径',exact:true}).click();assert.equal(await application.evaluate(({clipboard})=>clipboard.readText()),join(cwd,'A.md'));
    await page.getByRole('button',{name:'复制路径选项',exact:true}).click();await page.getByRole('menuitem',{name:'复制相对路径',exact:true}).click();assert.equal(await application.evaluate(({clipboard})=>clipboard.readText()),'A.md');
  });
  await check('W12 default open, failure, app chooser cancellation and reveal use host providers',async()=>{
    await application.evaluate(({shell,dialog})=>{globalThis.__workspaceHost=[];shell.openPath=async path=>{globalThis.__workspaceHost.push(['open',path]);return '';};shell.showItemInFolder=path=>globalThis.__workspaceHost.push(['reveal',path]);dialog.showOpenDialog=async()=>({canceled:true,filePaths:[]});});
    await page.getByRole('button',{name:'打开',exact:true}).click();await page.getByText('已交给系统打开',{exact:true}).waitFor();
    await page.getByRole('button',{name:'打开方式',exact:true}).click();await page.getByRole('menuitem',{name:'选择应用打开…',exact:true}).click();await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='打开')?.disabled);
    await page.getByRole('button',{name:'打开方式',exact:true}).click();await page.getByRole('menuitem',{name:'在文件管理器中显示',exact:true}).click();await page.getByText('已在文件管理器中显示',{exact:true}).waitFor();
    assert.deepEqual(await application.evaluate(()=>globalThis.__workspaceHost),[['open',join(cwd,'A.md')],['reveal',join(cwd,'A.md')]]);
    await application.evaluate(({shell})=>{shell.openPath=async()=> 'Host open rejected';});await page.getByRole('button',{name:'打开',exact:true}).click();await page.getByText('Host open rejected',{exact:true}).waitFor();
    await page.screenshot({path:join(output,'workspace-header.png')});
  });
  await check('W13 raster preview crosses bounded native IPC without an ACP text read',async()=>{
    const path=join(cwd,'Image.png');const before=(await wire()).filter(row=>row.frame.method==='_nofy/fs/read_file'&&row.frame.params.path===path).length;
    await writeFile(path,Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR5sAAAAASUVORK5CYII=','base64'));
    await page.locator('.filetree__row').filter({hasText:'Image.png'}).click();const image=page.locator('.fileworkspace__image img');await image.waitFor();await page.waitForFunction(()=>document.querySelector('.fileworkspace__image img')?.naturalWidth===1);assert.equal((await wire()).filter(row=>row.frame.method==='_nofy/fs/read_file'&&row.frame.params.path===path).length,before);
  });
  await check('W14 unsupported archives offer host opening and never request ACP text',async()=>{
    const path=join(cwd,'Archive.zip');await writeFile(path,'fixture archive');await page.locator('.filetree__row').filter({hasText:'Archive.zip'}).click();await page.getByText('此类型暂不支持预览，请使用上方打开方式查看。',{exact:true}).waitFor();assert.equal((await wire()).filter(row=>row.frame.method==='_nofy/fs/read_file'&&row.frame.params.path===path).length,0);
  });
  await check('W15 external writes update the selected file through scoped invalidation',async()=>{
    await writeFile(join(cwd,'Live.txt'),'LIVE VERSION ONE');await page.locator('.filetree__row').filter({hasText:'Live.txt'}).click();await page.getByText('LIVE VERSION ONE',{exact:true}).waitFor();await writeFile(join(cwd,'Live.txt'),'LIVE VERSION TWO');await page.getByText('LIVE VERSION TWO',{exact:true}).waitFor();assert.ok((await wire()).filter(row=>row.frame.method==='_nofy/fs/read_file'&&row.frame.params.path.endsWith('Live.txt')).length>=2);
  });
  await check('W16 deleted files retain last known content with an explicit stale/error state',async()=>{
    await rm(join(cwd,'Live.txt'));await page.locator('.filepane__error').filter({hasText:'File was deleted'}).waitFor();await page.getByText('LIVE VERSION TWO',{exact:true}).waitFor();await page.locator('.fileworkspace__meta').filter({hasText:'显示缓存内容，请刷新以确认最新状态。'}).waitFor();await page.locator('.filetree__row').filter({hasText:'Live.txt'}).waitFor({state:'hidden'});
  });
  await check('W17 renderer reload recovers pinned tabs, mode, scroll and tree width without caching content',async()=>{
    await page.getByRole('tab',{name:'A.md',exact:true}).click();await page.getByRole('heading',{name:'LATE A CONTENT',exact:true}).waitFor();await page.getByRole('button',{name:'查看源码',exact:true}).click();await page.locator('.filepane__preview-body').evaluate(el=>{el.scrollTop=230;});await page.waitForTimeout(100);
    const width=await page.locator('.fileworkspace').evaluate(el=>el.style.getPropertyValue('--file-tree-width'));
    await page.reload();await page.locator('textarea.composer__input:not(:disabled)').waitFor();await page.getByRole('button',{name:'展开侧边面板',exact:true}).click();await page.getByRole('button',{name:'文件',exact:true}).click();await page.getByRole('button',{name:'预览 Markdown',exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('.filepane__preview-body')?.scrollTop>180);
    assert.equal(await page.getByRole('tablist',{name:'文件标签',exact:true}).getByRole('tab').count(),1);assert.equal(await page.locator('.fileworkspace').evaluate(el=>el.style.getPropertyValue('--file-tree-width')),width);
    const persisted=await page.evaluate(()=>localStorage.getItem('nofy-desktop:file-workspaces-v1'));assert.ok(persisted.includes('A.md'));assert.ok(!persisted.includes('LATE A CONTENT'));await page.screenshot({path:join(output,'workspace-restored.png')});
  });
  await check('W20 shared pane controls resolve to consistent dimensions across width and theme',async()=>{
    await page.setViewportSize({width:1700,height:1000});await application.evaluate(({BrowserWindow})=>{const win=BrowserWindow.getAllWindows()[0];win.focus();win.webContents.focus();});await page.waitForTimeout(120);const results=[];
    for(const size of [320,548]){
      const handle=page.locator('.aux__handle'),box=await handle.boundingBox(),before=await page.locator('.side-sheet').boundingBox();await page.mouse.move(box.x+4,box.y+100);await page.mouse.down();await page.mouse.move(box.x+4+before.width-size,box.y+100,{steps:8});await page.mouse.up();await page.waitForTimeout(120);
      for(const theme of ['dark','light']){
        await page.evaluate(theme=>{document.documentElement.classList.remove('theme-zai-dark','theme-zai-light');document.documentElement.classList.add('theme-zai-'+theme);},theme);
        const data=await page.evaluate(()=>{const a=document.querySelector('.aux'),bars=[...a.querySelectorAll('.ui-pane-toolbar')],controls=[...a.querySelectorAll('.ui-pane-toolbar .ui-pane-icon,.ui-pane-toolbar .menu__trigger,.ui-pane-toolbar .ui-pane-button')];return {bars:bars.map(el=>el.getBoundingClientRect().height),controls:controls.map(el=>el.getBoundingClientRect().height),tabs:[...a.querySelectorAll('.ui-pane-tab')].map(el=>el.getBoundingClientRect().height),search:a.querySelector('.ui-pane-search')?.getBoundingClientRect().height,rows:[...a.querySelectorAll('.filetree__row')].map(el=>el.getBoundingClientRect().height),disclosureSlots:a.querySelectorAll('.filetree__disclosure').length,treeRows:a.querySelectorAll('.filetree__row').length};});assert.deepEqual(data.bars,[48,48]);assert.ok(data.controls.every(x=>x===32),JSON.stringify(data));assert.ok(data.tabs.every(x=>x===32));assert.equal(data.search,32);assert.ok(data.rows.every(x=>x===28));assert.equal(data.disclosureSlots,data.treeRows);results.push({size,theme,...data});await page.screenshot({path:join(output,`shared-pane-${size}-${theme}.png`)});
      }
    }
    return results;
  });
} catch(e) {report.cases.push({name:'GUI setup',status:'failed',error:String(e)});console.error(e);}
finally {if(application)await application.close().catch(()=>{});report.finishedAt=new Date().toISOString();await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await writeFile(join(output,'wire.jsonl'),await readFile(logPath,'utf8').catch(()=>''));await rm(temp,{recursive:true,force:true});console.log(`Report: ${join(output,'report.json')}`);}
if(report.cases.some(r=>r.status==='failed')||report.consoleErrors.length)process.exitCode=1;
