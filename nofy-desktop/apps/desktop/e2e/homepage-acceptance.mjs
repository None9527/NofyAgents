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
const output = join(root, 'nofy-desktop/output/playwright', 'homepage-'+new Date().toISOString().replaceAll(':', '-'));
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
  const mockPath=join(temp,'homepage-kernel.mjs');
  let source=await readFile(join(here,'mock-kernel.mjs'),'utf8');
  source=source.replaceAll("'E2E model'",JSON.stringify('Production configurable model with a very long name 模型名称'.repeat(3)));
  source=source.replace('    running.set(sid, f.id);', `    if (running.has(sid)) {
      const id=p._meta?.promptId;state.sessions[sid].queue.push({id,text,version:0,kind:'prompt'});queueChanged(sid);
      setTimeout(()=>{state.sessions[sid].queue=state.sessions[sid].queue.filter(e=>e.id!==id);queueChanged(sid);reply(f.id,{stopReason:'end_turn'});},3100);return;
    }
    running.set(sid, f.id);`);
  source=source.replace("if (text === 'e2e:thought') {", "if (text === 'e2e:hold') { setTimeout(()=>complete(sid,'Held task finished'),3000); } else if (text === 'e2e:thought') {");
  source=source.replace("  } else if (f.id !== undefined) reply(f.id, {});", `  } else if (f.method === '_nofy/session/info') reply(f.id,{result:{context:{used:22026,total:131072,usagePct:17,freeTokens:109046,autoCompactThresholdPercent:85,systemPromptTokens:1034,toolDefinitionsTokens:7597,toolDefinitionsCount:25,messageTokens:13567,messageCount:6,turnCount:1,toolCallCount:0,compactionCount:0,usageCategories:Array.from({length:16},(_,i)=>({label:'Synthetic category '+i,tokens:200,detail:'Fixture'}))}}});
  else if (f.id !== undefined) reply(f.id, {});`);
  await writeFile(mockPath,source,{mode:0o700});
  application=await _electron.launch({executablePath,args:[appRoot,`--user-data-dir=${join(temp,'chromium')}`],env:{...process.env,HOME:home,NOFY_HOME:nofyHome,NOFY_BIN:mockPath,NOFY_WORKSPACE:cwd,NOFY_E2E_LOG:logPath,NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:process.env.NOFY_E2E_DEV_URL??'',ELECTRON_RUN_AS_NODE:''},timeout:30000});
  page=await application.firstWindow(); page.on('pageerror',e=>report.consoleErrors.push({case:currentCase,message:String(e),stack:e.stack}));
  await page.locator('textarea.composer__input:not(:disabled)').waitFor({timeout:30000}); await page.screenshot({path:join(output,'initial.png')});
  await page.setViewportSize({width:1280,height:900});
  await check('H01 empty greeting and composer form one responsive group',async()=>{
    const geometry=await page.evaluate(()=>{const e=document.querySelector('.empty').getBoundingClientRect(),c=document.querySelector('.composer__inner').getBoundingClientRect();return {gap:c.y-e.bottom,center:Math.abs((c.x+c.width/2)-(e.x+e.width/2))};});
    assert.ok(geometry.gap<48,JSON.stringify(geometry));assert.ok(geometry.center<6);await page.screenshot({path:join(output,'empty.png')});return geometry;
  });
  const prompt='请检查这两份配置，比较不同档位，并给出可复用的调用示例。';
  await send(prompt);await page.getByRole('heading',{name:'验证结果',exact:true}).waitFor();await idle();
  await check('H02 transcript, composer and bubble share an axis across panel geometry',async()=>{
    const metrics=[];
    for(const width of [880,900,901,1000,1280,1440,1920])for(const side of [264,480]){
      await page.setViewportSize({width,height:900});
      await page.evaluate(w=>localStorage.setItem('nofy-desktop:layout',`sidebar-open|aux-closed|w=${w}|v=projects|s=recent|dock-closed|a=548`),side);
      await page.reload();await page.getByRole('heading',{name:'验证结果',exact:true}).waitFor();await page.locator('textarea.composer__input:not(:disabled)').waitFor();await page.waitForFunction(()=>document.querySelector('.shell')?.dataset.sidebarMotion==='false');
      const measure=()=>page.evaluate(()=>{const b=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,w:r.width};};return {chat:b('.card__conversation'),body:b('.card__body'),column:b('.spine__inner'),composer:b('.composer__inner'),mode:document.querySelector('.workbench').dataset.paneMode};});
      const before=await measure();assert.ok(Math.abs(before.column.x-before.composer.x)<=6);assert.ok(Math.abs(before.column.w-before.composer.w)<=11);
      await page.getByRole('button',{name:'展开侧边面板',exact:true}).click();await page.locator('.side-sheet[open]').waitFor();await page.waitForFunction(()=>document.querySelector('.shell')?.dataset.auxMotion==='false');
      const after=await measure();
      assert.ok(await page.locator('.composer__row').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
      if(after.mode==='split') {
        assert.ok(after.chat.w>=280,JSON.stringify(after));
        const hierarchy=await page.evaluate(()=>{const workbench=document.querySelector('.workbench'),pane=document.querySelector('.side-sheet'),aux=document.querySelector('.aux'),card=document.querySelector('.card'),header=document.querySelector('.card__head'),handle=document.querySelector('.aux__handle');const a=aux.getBoundingClientRect(),c=card.getBoundingClientRect(),h=header.getBoundingClientRect(),p=pane.getBoundingClientRect(),bar=handle.getBoundingClientRect();return {sibling:pane.parentElement===workbench,insideCard:!!pane.closest('.card'),topDifference:Math.abs(a.y-c.y),headerRight:h.right,paneLeft:p.left,handleTop:bar.y,workbenchTop:workbench.getBoundingClientRect().y,handleHeight:bar.height,workbenchHeight:workbench.getBoundingClientRect().height};});
        assert.equal(hierarchy.sibling,true);assert.equal(hierarchy.insideCard,false);assert.ok(hierarchy.topDifference<1,JSON.stringify(hierarchy));assert.ok(hierarchy.headerRight<=hierarchy.paneLeft+1);assert.ok(Math.abs(hierarchy.handleHeight-hierarchy.workbenchHeight)<1);assert.ok(Math.abs(hierarchy.handleTop-hierarchy.workbenchTop)<1);
      }
      else {assert.equal(after.mode,'sheet');assert.ok(Math.abs(after.chat.w-before.chat.w)<1);assert.equal(await page.locator('.side-sheet').evaluate(el=>el.matches(':modal')),true);}
      metrics.push({width,side,before,after});
      if([901,1280].includes(width)&&side===264)await page.screenshot({path:join(output,`layout-${width}.png`)});
      await page.locator('.side-sheet').getByRole('button',{name:'收起右侧栏',exact:true}).click();
    }
    return metrics;
  });
  await check('H03 sheet traps focus, closes with Escape and restores the toggle',async()=>{
    await page.setViewportSize({width:560,height:700});await page.waitForTimeout(300);await page.waitForFunction(()=>document.querySelector('.shell')?.dataset.sidebarMotion==='false');const toggle=page.getByRole('button',{name:'展开侧边面板',exact:true});await toggle.click();
    await page.locator('.side-sheet').waitFor();await page.evaluate(()=>document.querySelector('.composer__input').focus());
    assert.equal(await page.evaluate(()=>document.querySelector('.side-sheet').contains(document.activeElement)),true);
    await page.keyboard.press('Meta+k');assert.equal(await page.locator('.palette').count(),0);
    await page.keyboard.press('Escape');await page.locator('.side-sheet').waitFor({state:'hidden'});assert.equal(await toggle.evaluate(el=>el===document.activeElement),true);
    await toggle.click();await page.keyboard.press('Meta+Alt+b');await page.locator('.side-sheet').waitFor({state:'hidden'});
  });
  await check('H03b menus inside a modal sheet stay clickable and Escape closes only the menu',async()=>{
    await page.getByRole('button',{name:'展开侧边面板',exact:true}).click();await page.locator('.ui-pane-choice').filter({hasText:'文件'}).click();
    const trigger=page.getByRole('button',{name:'新增标签',exact:true});await trigger.click();const menu=page.getByRole('menu');await menu.waitFor();
    assert.equal(await menu.evaluate(el=>el.closest('dialog')?.matches(':modal')),true);
    for(const item of await menu.getByRole('menuitem').all()){assert.equal(await item.evaluate(el=>{const b=el.getBoundingClientRect(),hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return hit===el||el.contains(hit);}),true);}
    await page.keyboard.press('Escape');await menu.waitFor({state:'hidden'});assert.equal(await page.locator('.side-sheet').evaluate(el=>el.matches(':modal')),true);
    await page.locator('.side-sheet').getByRole('button',{name:'收起右侧栏',exact:true}).click();
  });
  await check('H04 switching tasks restores reading position and back-to-latest is reachable',async()=>{
    await page.setViewportSize({width:1280,height:900});await page.waitForFunction(()=>document.querySelector('.shell')?.dataset.sidebarMotion==='false');const navigation=page.getByRole('button',{name:'切换侧边栏',exact:true});if(await navigation.getAttribute('aria-expanded')==='false'){await navigation.click();await page.waitForFunction(()=>document.querySelector('.shell')?.dataset.sidebarMotion==='false');}await page.locator('.shell__handle').dblclick();await page.locator('.spine').hover();await page.mouse.wheel(0,-1500);await page.waitForTimeout(150);
    const before=await page.locator('.spine').evaluate(el=>el.scrollTop);assert.ok(before<10);
    await page.getByRole('button',{name:'新建任务',exact:true}).click();await page.locator('.taskrow__btn').filter({hasText:'E2E task 2'}).waitFor();
    await page.locator('.taskrow__btn').filter({hasText:'E2E task 1'}).click();await page.getByRole('heading',{name:'验证结果',exact:true}).waitFor();await page.waitForTimeout(150);
    const after=await page.locator('.spine').evaluate(el=>el.scrollTop);assert.ok(Math.abs(after-before)<4,JSON.stringify({before,after}));
    await page.getByRole('button',{name:'回到最新消息',exact:true}).click();await page.waitForTimeout(100);assert.ok(await page.locator('.spine').evaluate(el=>el.scrollHeight-el.scrollTop-el.clientHeight)<10);return {before,after};
  });
  await check('H05 resizing while reading retains the same message anchor',async()=>{
    const delta=await page.locator('.spine').evaluate(el=>200-el.scrollTop);await page.locator('.spine').hover();await page.mouse.wheel(0,delta);await page.waitForTimeout(300);assert.ok(await page.locator('.spine').evaluate(el=>el.scrollTop)>80);
    const anchor=()=>page.evaluate(()=>{const host=document.querySelector('.spine'),top=host.getBoundingClientRect().top;const row=[...host.querySelectorAll('[data-read-key]')].find(el=>el.getBoundingClientRect().bottom>top+8);return {key:row?.dataset.readKey,offset:row?.getBoundingClientRect().top-top};});
    const before=await anchor();await page.setViewportSize({width:1000,height:700});await page.waitForTimeout(150);const after=await anchor();assert.equal(after.key,before.key);assert.ok(Math.abs(after.offset-before.offset)<5,JSON.stringify({before,after}));return {before,after};
  });
  await check('H06 approval replaces composer visually and preserves its draft on completion',async()=>{
    await send('e2e:plan');await page.getByRole('button',{name:'批准并执行',exact:true}).waitFor();
    assert.equal(await input().isVisible(),false);assert.equal(await page.locator('.conversation-dock').getAttribute('data-blocked'),'true');
    await page.screenshot({path:join(output,'approval.png')});await page.getByRole('button',{name:'批准并执行',exact:true}).click();await input().waitFor();await idle();
  });
  await check('H07 busy submission enters the authoritative queue before RPC completion',async()=>{
    await send('e2e:hold');await page.getByRole('button',{name:'停止',exact:true}).waitFor();await page.getByRole('status').filter({hasText:'正在等待模型响应…'}).waitFor();await page.screenshot({path:join(output,'waiting-for-first-content.png')});await page.waitForFunction(()=>document.querySelector('.composer__input').value==='');
    await input().fill('additional instruction');await input().press('Enter');
    await page.locator('.queue').getByText('additional instruction',{exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('.composer__input').value==='');
    const frames=await prompts();assert.equal(frames.at(-1).frame.params.prompt[0].text,'additional instruction');assert.match(frames.at(-1).frame.params._meta.promptId,/^desktop-/);
    await page.getByRole('button',{name:'停止',exact:true}).waitFor();await page.screenshot({path:join(output,'queued.png')});await page.waitForTimeout(3400);
  });
  await check('H08 file-only attachment can submit without artificial text',async()=>{
    await writeFile(join(cwd,'attachment.txt'),'attachment content');
    await application.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},join(cwd,'attachment.txt'));
    await input().fill('');await page.locator('.composer__row .menu__trigger').first().click();await page.getByRole('menuitem',{name:'添加附件',exact:true}).click();
    await page.getByRole('button',{name:'发送',exact:true}).click();await idle();const frames=await prompts();assert.ok(frames.at(-1).frame.params.prompt.some(block=>block.type==='resource_link'));
  });
  await check('H09 user actions remain hidden and close to the bubble; process rows are compact',async()=>{
    await application.evaluate(({BrowserWindow})=>{const win=BrowserWindow.getAllWindows()[0];win.focus();win.webContents.focus();});
    await page.locator('.spine').hover();await page.mouse.wheel(0,-5000);await page.waitForTimeout(150);await page.mouse.move(15,500);await input().focus();
    const action=page.locator('.turn-actions').first(),bubble=page.locator('.block--user .block__body').first();
    assert.equal(await action.evaluate(el=>getComputedStyle(el).opacity),'0');const gap=await page.evaluate(()=>{const a=document.querySelector('.turn-actions').getBoundingClientRect(),b=document.querySelector('.block--user .block__body').getBoundingClientRect();return a.y-b.bottom;});assert.ok(Math.abs(gap-4)<1,String(gap));
    await bubble.hover();await page.waitForFunction(el=>getComputedStyle(el).opacity==='1',await action.elementHandle());
    assert.ok(await page.locator('.work-group').count()>=1);assert.equal(await page.locator('.block--event').filter({hasText:'hook:'}).count(),0);
  });

  await page.setViewportSize({width:1440,height:900});await page.locator('.shell__handle').dblclick();
  await page.getByRole('button',{name:'展开侧边面板',exact:true}).click();await page.locator('.aux__head').waitFor();
  await page.waitForTimeout(180);await page.screenshot({path:join(output,'full-height-workspace.png')});

  await check('H10 context popover escapes dock clipping, fits small viewports and scrolls all stats',async()=>{
    await page.getByRole('button',{name:'收起右侧栏',exact:true}).click();
    await application.evaluate(({BrowserWindow})=>{const win=BrowserWindow.getAllWindows()[0];win.focus();win.webContents.focus();});
    const metrics=[];
    for(const [width,height] of [[1440,900],[880,420]]){
      await page.setViewportSize({width,height});await page.locator('.ctx').click();const panel=page.getByRole('dialog',{name:'上下文用量',exact:true});await panel.waitFor();await panel.getByText('Synthetic category 15',{exact:true}).waitFor();
      await panel.hover();await page.waitForTimeout(180);assert.ok(await panel.isVisible(),'hover bridge lost panel');
      const measured=await panel.evaluate(el=>{const r=el.getBoundingClientRect(),dock=document.querySelector('.conversation-dock').getBoundingClientRect();return {topLayer:el.matches(':popover-open'),inDock:!!el.closest('.conversation-dock'),box:r.toJSON(),viewport:{w:innerWidth,h:innerHeight},dock:dock.toJSON(),height:el.clientHeight,scroll:el.scrollHeight,overflow:getComputedStyle(el).overflowY};});
      assert.equal(measured.topLayer,true);assert.equal(measured.inDock,false);assert.ok(measured.box.y>=7&&measured.box.bottom<=measured.viewport.h-7,JSON.stringify(measured));assert.ok(measured.box.x>=7&&measured.box.right<=measured.viewport.w-7);assert.ok(measured.box.y<measured.dock.y,'popup still constrained to the dock');
      await panel.evaluate(el=>{el.scrollTop=el.scrollHeight;});await page.waitForTimeout(80);
      const last=await panel.locator('.ctxpop__stats .ctxrow').last().evaluate(el=>{const r=el.getBoundingClientRect(),pop=el.closest('.ctxpop').getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {inside:r.top>=pop.top&&r.bottom<=pop.bottom,hit:hit===el||el.contains(hit)};});assert.equal(last.inside,true);assert.equal(last.hit,true);metrics.push(measured);
      if(height===420){assert.ok(measured.scroll>measured.height);await page.screenshot({path:join(output,'context-small-viewport.png')});}
      await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'});
    }
    await page.setViewportSize({width:1440,height:900});await application.evaluate(({BrowserWindow})=>{const win=BrowserWindow.getAllWindows()[0];win.focus();win.webContents.focus();});await page.mouse.move(20,200);await page.waitForTimeout(150);await page.locator('.ctx').hover();report.contextHoverDebug=await page.locator('.ctx').evaluate(el=>({hover:el.matches(':hover'),focused:document.hasFocus(),expanded:el.getAttribute('aria-expanded')}));await page.locator('.ctxpop').waitFor();await page.locator('.ctxpop').hover();await page.waitForTimeout(180);assert.ok(await page.locator('.ctxpop').isVisible());await page.mouse.move(20,200);await page.locator('.ctxpop').waitFor({state:'hidden'});
    await input().focus();await page.locator('.ctx').focus();await page.locator('.ctxpop').waitFor();await page.keyboard.press('Enter');await page.locator('.card__head').click();await page.locator('.ctxpop').waitFor({state:'hidden'});return metrics;
  });
  await check('H11 right pane has one straight divider while the drag target remains eight',async()=>{
    await page.getByRole('button',{name:'展开侧边面板',exact:true}).click();await page.locator('.aux__handle').waitFor();await page.waitForFunction(()=>document.querySelector('.shell')?.dataset.auxMotion==='false');
    const gap=await page.evaluate(()=>{const card=document.querySelector('.card').getBoundingClientRect(),aux=document.querySelector('.aux').getBoundingClientRect(),rail=document.querySelector('.aux__handle').getBoundingClientRect();return {gap:aux.left-card.right,rail:rail.toJSON(),before:document.querySelector('.side-sheet').getBoundingClientRect().width};});assert.ok(Math.abs(gap.gap-1)<1,JSON.stringify(gap));assert.equal(gap.rail.width,8);const seam=await page.evaluate(()=>{const card=getComputedStyle(document.querySelector('.card')),aux=getComputedStyle(document.querySelector('.aux')),line=getComputedStyle(document.querySelector('.aux__handle'),'::after');return {cardBorder:card.borderRightWidth,auxBorder:aux.borderLeftWidth,cardRadius:card.borderTopRightRadius,auxRadius:aux.borderTopLeftRadius,lineWidth:line.width,color:line.backgroundColor};});assert.equal(seam.cardBorder,'0px');assert.equal(seam.auxBorder,'0px');assert.equal(seam.cardRadius,'0px');assert.equal(seam.auxRadius,'0px');assert.equal(seam.lineWidth,'1px');assert.notEqual(seam.color,'rgba(0, 0, 0, 0)');
    await page.mouse.move(gap.rail.x+4,gap.rail.y+100);await page.mouse.down();await page.mouse.move(gap.rail.x-26,gap.rail.y+100,{steps:8});await page.mouse.up();const after=await page.locator('.side-sheet').evaluate(el=>el.getBoundingClientRect().width);assert.ok(after>gap.before+20);await page.locator('.aux__handle').dblclick();await page.screenshot({path:join(output,'thin-pane-gap.png')});return gap;
  });


  await check('H12 folding and reopening preserve the current reading anchor',async()=>{
    await page.locator('.side-sheet').getByRole('button',{name:'收起右侧栏',exact:true}).click();await page.setViewportSize({width:1280,height:900});await page.waitForFunction(()=>document.querySelector('.shell')?.dataset.sidebarMotion==='false');
    const left=page.getByRole('button',{name:'切换侧边栏',exact:true});if(await left.getAttribute('aria-expanded')==='false'){await left.click();await page.waitForFunction(()=>document.querySelector('.shell')?.dataset.sidebarMotion==='false');}
    await page.locator('.spine').hover();await page.mouse.wheel(0,-500);await page.waitForTimeout(150);
    const read=()=>page.evaluate(()=>{const host=document.querySelector('.spine'),top=host.getBoundingClientRect().top,row=[...host.querySelectorAll('[data-read-key]')].find(el=>el.getBoundingClientRect().bottom>top+8);return {key:row?.dataset.readKey,offset:row?.getBoundingClientRect().top-top};});
    const before=await read();assert.ok(before.key);await left.click();await page.waitForFunction(()=>document.querySelector('.shell')?.dataset.sidebarMotion==='false');await page.waitForTimeout(150);const folded=await read();assert.equal(folded.key,before.key);assert.ok(Math.abs(folded.offset-before.offset)<5,JSON.stringify({before,folded}));await left.click();await page.waitForFunction(()=>document.querySelector('.shell')?.dataset.sidebarMotion==='false');await page.waitForTimeout(150);const reopened=await read();assert.equal(reopened.key,before.key);assert.ok(Math.abs(reopened.offset-before.offset)<5,JSON.stringify({before,reopened}));return {before,folded,reopened};
  });


  await check('H13 full-page route hiding retains the current message and reading offset',async()=>{
    await application.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.focus();w.webContents.focus();});await page.waitForFunction(()=>document.hasFocus());const distance=await page.locator('.spine').evaluate(el=>Math.min(500,(el.scrollHeight-el.clientHeight)/2)-el.scrollTop);await page.locator('.spine').hover();await page.mouse.wheel(0,distance);await page.waitForTimeout(150);
    const read=()=>page.evaluate(()=>{const host=document.querySelector('.spine'),top=host.getBoundingClientRect().top,row=[...host.querySelectorAll('[data-read-key]')].find(el=>el.getBoundingClientRect().bottom>top+8);return {key:row?.dataset.readKey,offset:row?.getBoundingClientRect().top-top};});const before=await read();assert.ok(before.key);assert.ok(await page.locator('.spine').evaluate(el=>el.scrollTop)>80,'route reading test must start away from the top');
    await page.locator('.sidebar__foot button').last().click();await page.getByRole('menuitem',{name:/设置…/}).click();await page.locator('.set').waitFor();await page.waitForTimeout(200);await page.getByRole('button',{name:'返回工作区',exact:true}).click();await page.locator('.spine').waitFor();await page.waitForTimeout(200);const after=await read();assert.equal(after.key,before.key);assert.ok(Math.abs(after.offset-before.offset)<5,JSON.stringify({before,after}));return {before,after};
  });


  await check('H14 reading lane has whitespace, wide blocks fit and commentary has no duplicate answer actions',async()=>{
    await page.setViewportSize({width:1440,height:900});await page.getByRole('button',{name:'回到最新消息',exact:true}).click();await page.waitForTimeout(150);
    const g=await page.evaluate(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON(),host=rect('.card__conversation'),column=rect('.spine__inner'),input=rect('.composer__inner'),code=document.querySelector('.block--agent > .md > .codeblock'),table=document.querySelector('.block--agent > .md > .md-table');return {host,column,input,code:code?.getBoundingClientRect().toJSON(),table:table?.getBoundingClientRect().toJSON(),font:getComputedStyle(document.querySelector('.block--agent')).fontSize,topPadding:getComputedStyle(document.querySelector('.spine')).paddingTop,innerActions:document.querySelectorAll('.turn-segment__history .message-actions').length,expandedThoughts:document.querySelectorAll('.block--thought[open]').length};});
    assert.ok(g.column.width<=768);assert.ok(g.column.x-g.host.x>=24);assert.ok(Math.abs(g.column.x-g.input.x)<1);assert.ok(parseFloat(g.font)>=16);assert.equal(g.topPadding,'40px');assert.equal(g.innerActions,0);assert.equal(g.expandedThoughts,0);for(const block of [g.code,g.table]){assert.ok(block);assert.ok(block.width<=896);assert.ok(block.width>=g.column.width);assert.ok(block.x>=g.host.x+20&&block.right<=g.host.right-20);}
    await page.locator('.spine').hover();await page.mouse.wheel(0,-5000);await page.waitForTimeout(150);await page.screenshot({path:join(output,'reading-whitespace.png')});return g;
  });


  await check('H15 a new turn awaiting its first content has a visible status above the input',async()=>{
    await page.getByRole('button',{name:'回到最新消息',exact:true}).click();await page.waitForTimeout(150);await send('e2e:hold');const status=page.getByRole('status').filter({hasText:'正在等待模型响应…'});await status.waitFor();await page.waitForTimeout(150);
    const g=await page.evaluate(()=>{const el=[...document.querySelectorAll('[role=status]')].find(el=>el.textContent.includes('正在等待模型响应…')),r=el.getBoundingClientRect(),h=document.querySelector('.spine').getBoundingClientRect(),input=document.querySelector('.composer__inner').getBoundingClientRect();return {status:r.toJSON(),host:h.toJSON(),input:input.toJSON()};});assert.ok(g.status.y>=g.host.y&&g.status.bottom<=g.host.bottom);assert.ok(g.status.bottom<=g.input.y);await page.screenshot({path:join(output,'visible-waiting-status.png')});await idle();return g;
  });

} catch(e) {report.cases.push({name:'GUI setup',status:'failed',error:String(e)});console.error(e);}
finally {if(application)await application.close().catch(()=>{});report.finishedAt=new Date().toISOString();await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await writeFile(join(output,'wire.jsonl'),await readFile(logPath,'utf8').catch(()=>''));await rm(temp,{recursive:true,force:true});console.log(`Report: ${join(output,'report.json')}`);}
if(report.cases.some(r=>r.status==='failed')||report.consoleErrors.length)process.exitCode=1;
