import { loadPlaywright } from './playwright-driver.mjs';
import assert from 'node:assert/strict';
import { mkdtemp,mkdir,writeFile,rm,readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),appRoot=resolve(here,'..'),project=resolve(appRoot,'../..');
const temp=await mkdtemp(join(tmpdir(),'nofy-overview-e2e-')),home=join(temp,'home'),nofy=join(temp,'nofy'),cwd=join(temp,'workspace');
const output=join(project,'output/playwright','task-overview-'+new Date().toISOString().replaceAll(':','-'));
await Promise.all([home,nofy,cwd,output].map(path=>mkdir(path,{recursive:true})));
for(const name of ['A.md','B.ts','C.txt','D.json'])await writeFile(join(cwd,name),'# Reference '+name+'\n\nSource navigation verified.');
const report={source:'isolated Electron with synthetic ACP; no real model requests',cases:[],consoleErrors:[],output};let app,page;
async function check(name,fn){try{const details=await fn();report.cases.push({name,status:'passed',details});console.log('PASS '+name);}catch(e){report.cases.push({name,status:'failed',error:String(e)});console.error('FAIL '+name+': '+e);await page?.screenshot({path:join(output,report.cases.length+'-failure.png')}).catch(()=>{});}}
const overview=()=>page.locator('.task-overview');
const trigger=()=>page.getByRole('button',{name:'任务概览',exact:true});
const menu=async()=>{await page.getByRole('button',{name:'会话操作',exact:true}).click();await page.getByRole('menu').waitFor();};
const send=async text=>{await page.locator('textarea.composer__input').fill(text);await page.locator('textarea.composer__input').press('Enter');};
try{
 const {_electron}=await loadPlaywright();app=await _electron.launch({executablePath:join(appRoot,'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'),args:[appRoot,'--user-data-dir='+join(temp,'chromium')],env:{...process.env,HOME:home,NOFY_HOME:nofy,NOFY_BIN:join(here,'task-overview-kernel.mjs'),NOFY_WORKSPACE:cwd,NOFY_E2E_LOG:join(temp,'wire.jsonl'),NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:'',ELECTRON_RUN_AS_NODE:''}});page=await app.firstWindow();page.setDefaultTimeout(6000);page.on('pageerror',e=>report.consoleErrors.push(String(e)));await page.locator('textarea.composer__input:not(:disabled)').waitFor();
 await check('A01 real projection populates task sources and Git summary',async()=>{
  await page.setViewportSize({width:1440,height:900});await send('Inspect sources');await page.getByText('Overview fixture complete. Files and agents belong to this task.',{exact:true}).waitFor();await trigger().click();await overview().waitFor();await overview().getByText('+12',{exact:true}).waitFor();assert.equal(await overview().getByRole('button',{name:'A.md',exact:true}).count(),1);assert.equal(await overview().getByRole('button',{name:'D.json',exact:true}).count(),0);await overview().getByRole('button',{name:'查看全部',exact:true}).click();await overview().getByRole('button',{name:'D.json',exact:true}).waitFor();await page.screenshot({path:join(output,'overview.png')});
  assert.equal(await overview().getByText('Inspect references',{exact:true}).count(),1);await page.keyboard.press('Escape');assert.equal(await overview().count(),0);assert.equal(await trigger().evaluate(e=>e===document.activeElement),true);
 });
 await check('A02 source opens the existing file workspace and details',async()=>{
  await trigger().click();await overview().getByRole('button',{name:'A.md',exact:true}).click();await page.locator('.filepane').waitFor();await page.getByText('Source navigation verified.',{exact:true}).waitFor();assert.equal(await overview().count(),0);await page.getByRole('button',{name:'收起右侧栏',exact:true}).click();
 });
 await check('A03 pinned overview adapts overlay / shift / gutter and preserves section choice',async()=>{
  await trigger().click();await overview().getByRole('button',{name:'固定任务概览',exact:true}).click();await page.locator('.task-overview-inline').waitFor();await overview().getByRole('button',{name:'来源',exact:true}).click();
  const metrics=[];for(const width of [900,1440,1920]){await page.setViewportSize({width,height:900});await page.waitForTimeout(250);const g=await page.evaluate(()=>{const panel=document.querySelector('.task-overview').getBoundingClientRect();return{width:innerWidth,mode:document.querySelector('.card__body').dataset.overviewMode,panel:panel.toJSON(),overflow:document.documentElement.scrollWidth>innerWidth};});assert.equal(g.overflow,false);assert.ok(g.panel.x>=0&&g.panel.right<=width);assert.equal(await overview().getByRole('button',{name:'来源',exact:true}).getAttribute('aria-expanded'),'false');metrics.push(g);await page.screenshot({path:join(output,'pinned-'+width+'.png')});}
  assert.deepEqual(metrics.map(m=>m.mode),['closed','shift','gutter']);await overview().getByRole('button',{name:'关闭任务概览',exact:true}).click();assert.equal(await overview().count(),0);await trigger().click();await overview().waitFor();assert.equal(await overview().getByRole('button',{name:'取消固定概览'}).getAttribute('aria-pressed'),'true');return metrics;
 });
 await check('A03b short viewport scrolls overview and preserves a visible input',async()=>{
  await page.setViewportSize({width:900,height:420});await page.waitForTimeout(250);
  await overview().getByRole('button',{name:'来源',exact:true}).click();
  await page.waitForFunction(()=>{const el=document.querySelector('.task-overview-popover');return el&&el.scrollHeight>el.clientHeight;});
  const g=await page.locator('.task-overview-popover').evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),scrollable:el.scrollHeight>el.clientHeight}));assert.ok(g.rect.bottom<=420);assert.ok(g.rect.bottom <= (await page.locator(".dock-composer").boundingBox()).y);assert.equal(g.scrollable,true);await page.screenshot({path:join(output,'short-overview.png')});
  await page.keyboard.press('Escape');assert.equal(await overview().count(),0);assert.equal(await trigger().evaluate(el=>el===document.activeElement),true);assert.equal(await page.locator('textarea.composer__input').isVisible(),true);await page.setViewportSize({width:1920,height:900});await trigger().click();
 });
 await check('A03d floating overview keeps the repository menu on top',async()=>{
  await page.setViewportSize({width:900,height:900});await page.waitForTimeout(250);
  if(!await overview().count())await trigger().click();
  await page.locator('.task-overview-popover').waitFor();
  const row=overview().locator('.task-overview__entry').filter({hasText:'个文件'});
  await row.scrollIntoViewIfNeeded();await row.hover();
  await overview().getByRole('button',{name:'版本库操作',exact:true}).click();
  const hit=await page.evaluate(()=>{
    const menu=document.querySelector('.menu__pop');
    const item=menu?.querySelector('[role=menuitem]');
    if(!(menu instanceof HTMLElement)||!(item instanceof HTMLElement))return{ok:false,reason:'missing'};
    const box=item.getBoundingClientRect();
    const el=document.elementFromPoint(box.left+box.width/2,box.top+box.height/2);
    return{ok:el instanceof Element&&el.closest('.menu__pop')===menu,popover:menu.matches(':popover-open'),width:menu.getBoundingClientRect().width,height:menu.getBoundingClientRect().height,hit:el instanceof Element?el.textContent.trim().slice(0,24):null};
  });
  assert.equal(hit.ok,true,JSON.stringify(hit));
  assert.equal(hit.popover,true,JSON.stringify(hit));
  assert.ok(hit.height>=2&&hit.width>=2&&hit.width<600,JSON.stringify(hit));
  await page.getByRole('menuitem',{name:'提交变更',exact:true}).click();
  const commit=page.getByRole('dialog',{name:'提交变更',exact:true});
  await commit.waitFor();
  assert.equal(await page.locator('.task-overview-popover').count(),1);
  await commit.getByRole('button',{name:'关闭',exact:true}).click();
  await commit.waitFor({state:'hidden'});
  await page.setViewportSize({width:1920,height:900});
  await page.locator('.task-overview-inline').waitFor();
  return hit;
 });
 await check('A03c overview routes to agent and review details',async()=>{
  await page.locator('.agentrow .agentrow__status.activity-live').filter({hasText:'正在工作'}).waitFor();
  await trigger().click();
  await page.locator('.task-overview-inline').waitFor({state:'hidden'});
  const chip=page.locator('.chipstack .diffchip').filter({hasText:'运行中'});
  await chip.waitFor();
  assert.equal(await page.locator('.agentlive').count(),0);
  await chip.click();
  await page.locator('.agentsdir__row[open]').waitFor();
  await page.locator('.agentsdir__status.activity-live').filter({hasText:'正在工作'}).waitFor();
  await page.getByRole('button',{name:'收起右侧栏',exact:true}).click();
  await trigger().click();
  await overview().waitFor();
  const agentButton=overview().getByRole('button',{name:/Inspect references/});
  await agentButton.filter({hasText:'正在工作'}).waitFor();
  await agentButton.click();
  await page.locator('.agentsdir__row[open]').waitFor();
  await page.locator('.agentsdir__status.activity-live').filter({hasText:'正在工作'}).waitFor();
  assert.equal((await page.locator('.agentsdir__row[open] .agentbadge--mark').innerText()).trim(),'R');
  assert.equal(await page.locator('.agentsdir__time').count(),0);
  assert.equal(await page.locator('.agentsdir').getByRole('button',{name:'取消子智能体',exact:true}).count(),1);
  await page.screenshot({path:join(output,'agents.png')});
  await page.getByRole('button',{name:'收起右侧栏',exact:true}).click();await trigger().click();await overview().getByRole('button',{name:/1 个文件/}).click();await page.locator('.review').waitFor();await page.getByRole('combobox',{name:'变更来源',exact:true}).waitFor();assert.equal(await page.getByRole('combobox',{name:'变更来源',exact:true}).inputValue(),'branch');await page.getByRole('button',{name:'跳转到 A.md',exact:true}).waitFor();await page.getByRole('button',{name:'收起右侧栏',exact:true}).click();await trigger().click();
 });
 await check('A08 path writes and the repository menu use real git calls',async()=>{
  await overview().getByRole('button',{name:/1 个文件/}).click();await page.locator('.review').waitFor();
  await page.getByRole('button',{name:'文件操作 A.md',exact:true}).click();
  assert.equal(await page.getByRole('menuitem',{name:'暂存',exact:true}).count(),0);
  assert.equal(await page.getByRole('menuitem',{name:'丢弃',exact:true}).count(),0);
  await page.keyboard.press('Escape');
  await page.getByRole('combobox',{name:'变更来源',exact:true}).selectOption('unstaged');
  await page.getByRole('button',{name:'文件操作 A.md',exact:true}).click();
  assert.equal(await page.getByRole('menuitem',{name:'取消暂存',exact:true}).count(),0);
  await page.getByRole('menuitem',{name:'暂存',exact:true}).click();
  await page.getByRole('button',{name:'文件操作 A.md',exact:true}).click();
  const discardItem=page.getByRole('menuitem',{name:'丢弃',exact:true});
  await page.waitForFunction(()=>{const item=[...document.querySelectorAll('[role=menuitem]')].find(el=>el.textContent.trim()==='丢弃');return item&&!item.hasAttribute('disabled');});
  await discardItem.click();
  let discard=page.getByRole('dialog',{name:'丢弃更改',exact:true});
  await discard.getByRole('button',{name:'取消',exact:true}).click();
  await discard.waitFor({state:'hidden'});
  await page.getByRole('button',{name:'文件操作 A.md',exact:true}).click();
  await page.getByRole('menuitem',{name:'丢弃',exact:true}).click();
  await page.getByRole('dialog',{name:'丢弃更改',exact:true}).getByRole('button',{name:'丢弃',exact:true}).click();
  await page.getByRole('dialog',{name:'丢弃更改',exact:true}).waitFor({state:'hidden'});
  await page.getByRole('button',{name:'收起右侧栏',exact:true}).click();
  if(!await overview().count())await trigger().click();
  const changeRow=overview().getByRole('button',{name:/1 个文件/});
  await changeRow.hover();
  await overview().getByRole('button',{name:'版本库操作',exact:true}).click();
  for(const name of ['提交变更','创建分支','切换分支'])await page.getByRole('menuitem',{name,exact:true}).waitFor();
  assert.equal(await page.getByRole('menuitem',{name:'推送',exact:true}).count(),0);
  await page.getByRole('menuitem',{name:'提交变更',exact:true}).click();
  const commit=page.getByRole('dialog',{name:'提交变更',exact:true});
  await commit.getByRole('textbox',{name:'提交说明',exact:true}).fill('ship');
  assert.equal(await commit.getByRole('checkbox',{name:'提交并推送',exact:true}).isChecked(),false);
  await commit.getByRole('checkbox',{name:'提交并推送',exact:true}).check();
  await commit.getByRole('button',{name:'提交变更',exact:true}).click();
  await commit.getByText('pushed with warning',{exact:false}).waitFor();
  await commit.getByRole('button',{name:'关闭',exact:true}).click();
  await commit.waitFor({state:'hidden'});
  await changeRow.hover();
  await overview().getByRole('button',{name:'版本库操作',exact:true}).click();
  await page.getByRole('menuitem',{name:'创建分支',exact:true}).click();
  const create=page.getByRole('dialog',{name:'创建分支',exact:true});
  await create.getByRole('textbox',{name:'分支名称',exact:true}).fill('topic');
  await create.getByRole('button',{name:'创建分支',exact:true}).click();
  await create.waitFor({state:'hidden'});
  await changeRow.hover();
  await overview().getByRole('button',{name:'版本库操作',exact:true}).click();
  await page.getByRole('menuitem',{name:'切换分支',exact:true}).click();
  const switched=page.getByRole('dialog',{name:'切换分支',exact:true});
  await page.waitForFunction(()=>{const node=document.querySelector('dialog[open] select');return node instanceof HTMLSelectElement&&node.value==='feature';});
  await switched.getByRole('button',{name:'切换分支',exact:true}).click();
  await switched.waitFor({state:'hidden'});
  const wire=await readFile(join(temp,'wire.jsonl'),'utf8');
  const frames=wire.trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));
  const stage=frames.filter(frame=>frame.method==='_nofy/git/stage');
  assert.equal(stage.length,1);
  assert.deepEqual(stage[0].params.paths,['A.md']);
  const discards=frames.filter(frame=>frame.method==='_nofy/git/discard');
  assert.equal(discards.length,1);
  assert.equal(discards[0].params.scope,'working');
  assert.equal(discards[0].params.includeUntracked,false);
  assert.deepEqual(discards[0].params.paths,['A.md']);
  const commits=frames.filter(frame=>frame.method==='_nofy/git/commit');
  assert.equal(commits.length,1);
  assert.equal(commits[0].params.message,'ship');
  assert.equal(commits[0].params.push,true);
  assert.equal(commits[0].params.amend,undefined);
  const checkouts=frames.filter(frame=>frame.method==='_nofy/git/checkout');
  assert.deepEqual(checkouts.map(frame=>({branch:frame.params.branch,create:frame.params.create})),[{branch:'topic',create:true},{branch:'feature',create:false}]);
 });
 await check('A04 Git failure is visible and retry restores data',async()=>{
  await writeFile(join(cwd,'fail-git'),'1');await page.reload();await page.locator('textarea.composer__input:not(:disabled)').waitFor();if(!await overview().count())await trigger().click();await overview().getByText('Git fixture unavailable',{exact:false}).waitFor();await rm(join(cwd,'fail-git'));await overview().getByRole('button',{name:'重试',exact:true}).click();await overview().getByText('+12',{exact:true}).waitFor();await overview().getByRole('button',{name:'关闭任务概览',exact:true}).click();
 });
 await check('A05 shared session menu supports keyboard, rename failure and retry',async()=>{
  await menu();await page.keyboard.press('Escape');assert.equal(await page.getByRole('menu').count(),0);await menu();await page.getByRole('menuitem',{name:'重命名',exact:true}).click();let dialog=page.getByRole('dialog',{name:'重命名',exact:true});await dialog.getByRole('textbox').fill('reject');await dialog.getByRole('button',{name:'保存',exact:true}).click();await dialog.getByRole('alert').waitFor();await dialog.getByRole('textbox').fill('Renamed task');await dialog.getByRole('button',{name:'保存',exact:true}).click();await page.locator('.card__title').filter({hasText:'Renamed task'}).waitFor();await menu();await page.getByRole('menuitem',{name:'置顶会话（仅此窗口）',exact:true}).click();await menu();await page.getByRole('menuitem',{name:'取消置顶（仅此窗口）',exact:true}).waitFor();await page.keyboard.press('Escape');
 });
 await check('A06 running task cannot fork or archive; another task has no leaked sources',async()=>{
  await send('hold');await menu();assert.equal(await page.getByRole('menuitem',{name:/分叉为新会话/}).isDisabled(),true);assert.equal(await page.getByRole('menuitem',{name:/归档会话/}).isDisabled(),true);await page.keyboard.press('Escape');await page.getByRole('button',{name:'新建任务',exact:true}).first().click();await page.locator('.card__title').filter({hasText:'Overview 2'}).waitFor();await trigger().click();await overview().getByText('已加载内容中暂无文件引用',{exact:true}).waitFor();await overview().getByRole('button',{name:'关闭任务概览',exact:true}).click();await menu();await page.getByRole('menuitem',{name:'分叉为新会话',exact:true}).click();await page.locator('.card__title').filter({hasText:'Forked overview'}).waitFor();
 });
 await check('A07 280px middle pane retains both task controls without header overflow',async()=>{
  await page.setViewportSize({width:900,height:700});await page.evaluate(()=>localStorage.setItem('nofy-desktop:layout','sidebar-closed|aux-closed|w=264|v=projects|s=recent|dock-closed|a=900|as=fixed'));await page.reload();await page.locator('textarea.composer__input:not(:disabled)').waitFor();await page.getByRole('button',{name:'展开侧边面板',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.shell__main').getBoundingClientRect().width<300);
  for(const name of ['会话操作','任务概览']){const el=page.getByRole('button',{name,exact:true});await el.waitFor({state:'visible'});const g=await el.evaluate(el=>({button:el.getBoundingClientRect().toJSON(),main:el.closest('.shell__main').getBoundingClientRect().toJSON()}));assert.ok(g.button.x>=g.main.x&&g.button.right<=g.main.right);}
  await menu();await page.keyboard.press('Escape');await trigger().click();await overview().waitFor();await page.screenshot({path:join(output,'narrow-middle.png')});await page.keyboard.press('Escape');
 });

}catch(e){report.cases.push({name:'setup',status:'failed',error:String(e)});console.error(e);}finally{await app?.close().catch(()=>{});await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await writeFile(join(output,'wire.jsonl'),await readFile(join(temp,'wire.jsonl'),'utf8').catch(()=>''));await rm(temp,{recursive:true,force:true});console.log('Report: '+join(output,'report.json'));}if(report.cases.some(c=>c.status==='failed')||report.consoleErrors.length)process.exitCode=1;
