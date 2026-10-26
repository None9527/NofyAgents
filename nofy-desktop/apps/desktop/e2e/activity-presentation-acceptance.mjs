import { loadPlaywright } from './playwright-driver.mjs';
import assert from 'node:assert/strict';
import { mkdtemp,mkdir,readFile,writeFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),appRoot=resolve(here,'..'),project=resolve(appRoot,'../..');
const temp=await mkdtemp(join(tmpdir(),'nofy-activity-e2e-')),home=join(temp,'home'),nofy=join(temp,'nofy'),cwd=join(temp,'workspace'),gate=join(temp,'activity-stage');
const output=join(project,'output/playwright','activities-'+new Date().toISOString().replaceAll(':','-'));
await Promise.all([home,nofy,cwd,output].map(p=>mkdir(p,{recursive:true})));await writeFile(gate,'1');
const report={source:'isolated Electron + staged synthetic ACP; native DOM, pointer, keyboard and animation frames',cases:[],consoleErrors:[],output};
let app,page;
async function check(name,fn){try{const details=await fn();report.cases.push({name,status:'passed',details});console.log('PASS '+name);}catch(e){report.cases.push({name,status:'failed',error:String(e)});console.error('FAIL '+name+': '+e);await page?.screenshot({path:join(output,report.cases.length+'-failure.png')}).catch(()=>{});}}
const input=()=>page.locator('textarea.composer__input');
const focus=async()=>{await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.focus();w.webContents.focus();});await page.waitForFunction(()=>document.hasFocus());await page.waitForTimeout(120);};
const card=id=>page.locator('.activity-card').filter({has:page.locator('.activity-card__detail').filter({hasText:id})}).first();
const stage=n=>writeFile(gate,String(n));
const idle=()=>page.waitForFunction(()=>document.querySelector('.composer')?.dataset.inputState==='ready');
try{
 let source=await readFile(join(here,'mock-kernel.mjs'),'utf8');source=source.replace('title: `E2E task ${state.next - 1}`',"title:'活动反馈与配置校验，一段较长的会话标题'");const marker="    if (text === 'e2e:thought') {";assert.equal(source.split(marker).length,2);
 source=source.replace(marker,`    if (text === 'e2e:activity') {
      event(sid,'hook_execution',{event_name:'start'},true);
      event(sid,'agent_thought_chunk',{content:{type:'text',text:'先读取配置，运行验证，再编辑文件。'}});
      for(const path of ['src/alpha.ts','src/beta.ts']) {
        event(sid,'tool_call',{toolCallId:path,title:'读取文件',kind:'read',status:'running',rawInput:{file_path:path}});
        event(sid,'tool_call_update',{toolCallId:path,kind:'read',status:'completed',content:[{type:'text',text:'unique search result '+path}]});
      }
      event(sid,'agent_message_chunk',{content:{type:'text',text:'已查阅两份配置，开始运行验证。'}});
      event(sid,'response_completed',{usage:{}},true);
      event(sid,'tool_call',{toolCallId:'cmd-one',title:'验证项目',kind:'execute',status:'running',rawInput:{command:'pnpm test --reporter=verbose'}});
      event(sid,'tool_call_update',{toolCallId:'cmd-one',kind:'execute',status:'running',content:[{type:'text',text:'Running tests…\\nPASS configuration'}]});
      event(sid,'tool_call_update',{toolCallId:'cmd-one',kind:'execute',status:'running'});
      let current=1;
      const timer=setInterval(()=>{
        const next=Number(readFileSync(process.env.NOFY_E2E_ACTIVITY_GATE,'utf8'));if(next===current)return;current=next;
        if(next===2) {
          event(sid,'tool_call_update',{toolCallId:'cmd-one',kind:'execute',status:'completed',content:[{type:'text',text:'All checks passed'}]});
          event(sid,'tool_call',{toolCallId:'cmd-two',title:'第二个命令',kind:'execute',status:'running',rawInput:{command:'node validate.js'}});
          event(sid,'tool_call_update',{toolCallId:'cmd-two',kind:'execute',status:'running'});
        }
        if(next===3) {
          event(sid,'tool_call_update',{toolCallId:'cmd-two',kind:'execute',status:'completed',content:[{type:'text',text:'Validation complete'}]});
          event(sid,'tool_call',{toolCallId:'edit-one',title:'编辑配置',kind:'edit',status:'running',rawInput:{file_path:'src/config.ts',old_string:'export const enabled = false;',new_string:'export const enabled = true;\\nexport const validated = true;'}});
        event(sid,'tool_call_update',{toolCallId:'edit-one',kind:'edit',status:'running',rawInput:{file_path:'src/config.ts',variant:'Write'},content:[{type:'diff',path:'src/config.ts',oldText:'export const enabled = false;',newText:'export const enabled = true;\\nexport const validated = true;'}]});
        }
        if(next===4) {
          event(sid,'tool_call_update',{toolCallId:'edit-one',kind:'edit',status:'completed',content:[{type:'text',text:'Updated configuration'}]});
          event(sid,'tool_call',{toolCallId:'fail-one',title:'失败命令',kind:'execute',status:'failed',rawInput:{command:'node missing.js'},content:[{type:'text',text:'Cannot find module missing.js'}]});
          event(sid,'tool_call_update',{toolCallId:'fail-one',kind:'execute',status:'failed',content:[{type:'text',text:'Cannot find module missing.js'}]});
          event(sid,'tool_call',{toolCallId:'unknown-one',title:'未知结果',kind:'other',content:[{type:'text',text:'done'}]});
          clearInterval(timer);complete(sid,'# 活动验证完成\\n\\n完成配置更新；缺少文件的检查需要后续处理。');
        }
      },80);
    } else if (text === 'e2e:thought') {`);
 const mock=join(temp,'kernel.mjs');await writeFile(mock,source,{mode:0o700});
 const {_electron}=await loadPlaywright();app=await _electron.launch({executablePath:join(appRoot,'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'),args:[appRoot,'--user-data-dir='+join(temp,'chromium')],env:{...process.env,HOME:home,NOFY_HOME:nofy,NOFY_BIN:mock,NOFY_WORKSPACE:cwd,NOFY_E2E_LOG:join(temp,'wire.jsonl'),NOFY_E2E_ACTIVITY_GATE:gate,NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:'',ELECTRON_RUN_AS_NODE:''}});page=await app.firstWindow();page.setDefaultTimeout(12000);page.on('pageerror',e=>report.consoleErrors.push(String(e)));await page.locator('textarea.composer__input:not(:disabled)').waitFor();await page.setViewportSize({width:1920,height:1000});
 await input().fill('e2e:activity');await page.getByRole('button',{name:'发送',exact:true}).click();await card('pnpm test').waitFor();await focus();
 await check('A01 live command output, grouped reads, thoughts and hidden hooks are distinct',async()=>{
   const command=card('pnpm test');assert.equal(await command.getAttribute('open'),null);assert.equal(await command.locator('.activity-badge').count(),0);assert.ok((await command.locator('.activity-output pre').textContent()).includes('PASS configuration'));
   assert.equal(await page.locator('.activity-explore').count(),1);assert.equal(await page.locator('.activity-explore').getAttribute('open'),null);assert.equal(await page.locator('.block--thought').getAttribute('open'),null);assert.equal(await page.locator('.block--event').filter({hasText:'hook:'}).count(),0);
   const motion=await command.locator('.activity-live').evaluate(el=>getComputedStyle(el).animationName);assert.equal(motion,'activity-shimmer');await page.screenshot({path:join(output,'live-command.png')});return {motion};
 });
 await check('A02 commands stay compact and manual expansion survives status completion',async()=>{
   await stage(2);await page.locator('.activity-execute > summary').click();await card('node validate.js').waitFor();await page.waitForTimeout(250);assert.equal(await card('pnpm test').getAttribute('open'),null);
   const second=card('node validate.js');assert.equal(await second.getAttribute('open'),null);await second.locator(':scope > summary').click();assert.equal(await second.getAttribute('open'),'');await stage(3);await page.locator('.activity-diff').waitFor({state:'attached'});await page.waitForTimeout(250);assert.equal(await second.getAttribute('open'),'');assert.equal(await second.locator('.activity-badge').count(),0);return {compactDefault:true,manualOverride:true};
 });
 await check('A03 editing displays actual changed fragments with semantic colors',async()=>{
   const diff=page.locator('.activity-diff');await page.locator('.activity-card').filter({has:diff}).locator(':scope > summary').click();await diff.waitFor();assert.equal(await diff.locator('[data-change=removed]').count(),1);assert.equal(await diff.locator('[data-change=added]').count(),2);assert.equal(await diff.locator('.activity-diff__stats').innerText(),'+2 −1');assert.ok((await diff.locator('pre').innerText()).includes('export const enabled = true'));
   const colors=await diff.evaluate(el=>({removed:getComputedStyle(el.querySelector('[data-change=removed]')).color,added:getComputedStyle(el.querySelector('[data-change=added]')).color}));assert.notEqual(colors.removed,colors.added);await page.screenshot({path:join(output,'edit-fragment.png')});return colors;
 });
 await stage(4);await idle();await page.getByRole('heading',{name:'活动验证完成',exact:true}).waitFor();
 await check('A04 completed turn and failures collapse by default; details remain available',async()=>{
   assert.equal(await page.locator('.activity-slice').getAttribute('data-open'),'false');await page.locator('.activity-slice > button').click();await page.waitForTimeout(220);const failed=card('node missing.js');assert.equal(await failed.getAttribute('open'),null);await failed.locator(':scope > summary').click();await page.waitForTimeout(220);assert.equal(await failed.locator('.activity-badge').innerText(),'失败');assert.ok((await failed.locator('.activity-output pre').innerText()).includes('Cannot find module'));
   const unknown=page.locator('.activity-card').filter({hasText:'未知结果'});assert.equal(await unknown.locator('.activity-badge').innerText(),'状态未知');assert.equal(await unknown.getAttribute('open'),null);assert.equal(await unknown.locator(':scope > summary').count(),1);assert.equal(await page.locator('.turn-segment__history-row .message-actions').count(),0);await page.screenshot({path:join(output,'failed-and-answer.png')});
 });
 await check('A05 disclosure animates both directions and keyboard/reduced motion remain usable',async()=>{
   const detail=page.locator('.activity-explore');async function frames(){return detail.evaluate(async el=>{const samples=[];el.querySelector(':scope > summary').click();for(let i=0;i<22;i++){await new Promise(requestAnimationFrame);samples.push(el.getBoundingClientRect().height);}return samples;});}
   const opened=await frames();const closed=await frames();const distinct=a=>new Set(a.map(v=>Math.round(v))).size;assert.ok(distinct(opened)>3,JSON.stringify(opened));assert.ok(distinct(closed)>3,JSON.stringify(closed));
   await detail.locator(':scope > summary').focus();await page.keyboard.press('Enter');await page.waitForTimeout(220);assert.equal(await detail.getAttribute('open'),'');await page.emulateMedia({reducedMotion:'reduce'});const reduced=await frames();assert.ok(distinct(reduced)<=2,JSON.stringify(reduced));assert.equal(await detail.evaluate(el=>getComputedStyle(el,'::details-content').transitionDuration),'0s');await page.emulateMedia({reducedMotion:'no-preference'});return {opened,closed,reduced};
 });
 await check('P01 compact summaries, one terminal surface, hover controls and diff line rhythm',async()=>{
   const command=card('node missing.js');await command.scrollIntoViewIfNeeded();
   assert.equal(await command.locator('.codeblock').count(),0);
   assert.equal(await command.locator('.activity-output').count(),1);
   assert.equal(await command.locator('.activity-command code').innerText(),'node missing.js');
   await page.mouse.move(10,200);await page.waitForTimeout(180);
   const copy=command.getByRole('button',{name:'复制结果',exact:true});assert.equal(await copy.evaluate(el=>getComputedStyle(el).opacity),'0');
   await command.locator('.activity-output').hover();await page.waitForTimeout(180);assert.equal(await copy.evaluate(el=>getComputedStyle(el).opacity),'1');
   await copy.click();await page.waitForFunction(el=>el.title==='已复制',await copy.elementHandle());assert.equal(await app.evaluate(({clipboard})=>clipboard.readText()),'Cannot find module missing.js');
   const completed=card('pnpm test'),summary=completed.locator(':scope > summary');
   await page.mouse.move(10,200);await page.waitForTimeout(180);assert.equal(await summary.locator('.ui-motion-disclosure__chevron').evaluate(el=>getComputedStyle(el).opacity),'0');
   const size=await summary.boundingBox(),host=await completed.boundingBox();assert.ok(size.width<host.width*.9);
   await summary.hover();await page.waitForTimeout(180);assert.equal(await summary.locator('.ui-motion-disclosure__chevron').evaluate(el=>getComputedStyle(el).opacity),'1');
   const edit=page.locator('.activity-card').filter({has:page.locator('.activity-diff')});if(await edit.getAttribute('open')===null) await edit.locator(':scope > summary').click();await page.waitForTimeout(220);
   const rhythm=await edit.locator('.activity-diff__line').evaluateAll(els=>els.map(el=>({height:el.getBoundingClientRect().height,line:parseFloat(getComputedStyle(el).lineHeight)})));assert.ok(rhythm.every(r=>r.height<=r.line+1),JSON.stringify(rhythm));
   await page.screenshot({path:join(output,'refined-expanded.png')});return {summaryWidth:size.width,containerWidth:host.width,diffRows:rhythm};
 });
 await check('P02 activity surfaces remain legible in both themes and keep one detail surface for edits',async()=>{
   const edit=page.locator('.activity-card').filter({has:page.locator('.activity-diff')});assert.equal(await edit.locator('.activity-output').count(),0);
   const original=await page.evaluate(()=>document.documentElement.className);
   await page.setViewportSize({width:1440,height:1000});
   for(const theme of ['theme-zai-dark','theme-zai-light']) {
     await page.evaluate(theme=>{document.documentElement.className=theme+(theme.endsWith('dark')?' dark':'')+' platform-mac-desktop';},theme);
     await edit.scrollIntoViewIfNeeded();await page.waitForTimeout(250);
     const styles=await edit.evaluate(el=>({fg:getComputedStyle(el.querySelector('summary')).color,bg:getComputedStyle(el.querySelector('.activity-diff')).backgroundColor,font:parseFloat(getComputedStyle(el.querySelector('summary')).fontSize),overflow:document.querySelector('.spine').scrollWidth-document.querySelector('.spine').clientWidth}));
     assert.ok(styles.font>=13);assert.ok(styles.overflow<=1);assert.notEqual(styles.fg,styles.bg);
     await page.screenshot({path:join(output,'refined-'+theme+'.png')});
   }
   await page.evaluate(value=>{document.documentElement.className=value;},original);await page.setViewportSize({width:1920,height:1000});
 });
 await check('A06 normal completed activity collapses; search reveals a read inside nested groups',async()=>{
   await input().fill('e2e:rich');await page.getByRole('button',{name:'发送',exact:true}).click();await page.getByRole('heading',{name:'验证结果',exact:true}).waitFor();await idle();const last=page.locator('.activity-slice').last();assert.equal(await last.getAttribute('data-open'),'false');
   await page.keyboard.press('Meta+f');const find=page.getByRole('textbox',{name:'查找已加载内容',exact:true});await find.fill('unique search result src/alpha.ts');await find.press('Enter');await page.waitForTimeout(400);const target=page.locator('[data-block-id]').filter({hasText:'unique search result src/alpha.ts'}).last();assert.equal(await target.isVisible(),true);assert.equal(await page.locator('.activity-explore').first().getAttribute('open'),'');await page.keyboard.press('Escape');return {searchRevealed:true};
 });
 await check('A07 manual resize gives the workbench more than 760px and shrinks chat to 280px',async()=>{
   await page.getByRole('button',{name:'展开侧边面板',exact:true}).click();await page.locator('.aux__handle').waitFor();await page.waitForFunction(()=>document.querySelector('.shell')?.dataset.auxMotion==='false');await focus();const r=await page.locator('.aux__handle').boundingBox();await page.mouse.move(r.x+4,r.y+120);await page.mouse.down();await page.mouse.move(450,r.y+120,{steps:20});await page.mouse.up();await page.waitForTimeout(300);
   const g=await page.evaluate(()=>{const box=s=>document.querySelector(s).getBoundingClientRect().toJSON();return {chat:box('.card__conversation'),pane:box('.side-sheet'),main:box('.shell__main'),composer:box('.composer__inner'),rowOverflow:document.querySelector('.composer__row').scrollWidth-document.querySelector('.composer__row').clientWidth,documentOverflow:document.documentElement.scrollWidth-innerWidth,svg:[...document.querySelectorAll('.composer__row svg')].map(e=>e.getBoundingClientRect().width)};});assert.ok(g.chat.width>=280&&g.chat.width<=300,JSON.stringify(g));assert.ok(g.pane.width>760);assert.ok(g.rowOverflow<=1);assert.equal(g.documentOverflow,0);assert.ok(g.composer.width<=g.chat.width);assert.ok(g.svg.every(w=>w>=12));await page.screenshot({path:join(output,'narrow-middle.png')});const title=await page.locator('.card__title').boundingBox();report.headerDebug=await page.locator('.card__head').evaluate(el=>[el,...el.children,...el.querySelector('.card__head-left').children].map(node=>({class:node.className,rect:node.getBoundingClientRect().toJSON(),style:{display:getComputedStyle(node).display,flex:getComputedStyle(node).flex,padding:getComputedStyle(node).padding,width:getComputedStyle(node).width}})));assert.ok(title.width>70,JSON.stringify(report.headerDebug));await page.getByRole('button',{name:'帮助：本窗口的键位表与版本信息',exact:true}).click();await page.getByRole('menuitem',{name:/^查找已加载内容/}).click();await page.getByRole('textbox',{name:'查找已加载内容',exact:true}).waitFor();await page.keyboard.press('Escape');return g;
 });
 await check('A08 narrow controls and messages fit with navigation folded and reduced window width',async()=>{
   await page.getByRole('button',{name:'切换侧边栏',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.shell')?.dataset.sidebarMotion==='false');await page.setViewportSize({width:1000,height:760});await page.waitForTimeout(250);const metrics=await page.evaluate(()=>{const c=document.querySelector('.card__conversation'),h=document.querySelector('.card__head'),row=document.querySelector('.composer__row');return {chat:c.clientWidth,headerOverflow:h.scrollWidth-h.clientWidth,rowOverflow:row.scrollWidth-row.clientWidth,documentOverflow:document.documentElement.scrollWidth-innerWidth};});assert.ok(metrics.chat>=280&&metrics.chat<420);assert.ok(metrics.headerOverflow<=1);assert.ok(metrics.rowOverflow<=1);assert.equal(metrics.documentOverflow,0);await input().fill('窄栏仍可输入');assert.equal(await input().inputValue(),'窄栏仍可输入');await page.screenshot({path:join(output,'narrow-folded.png')});return metrics;
 });
}catch(e){if(page){await page.screenshot({path:join(output,'setup-failure.png')});report.dom=await page.locator('details').evaluateAll(els=>els.map(el=>({class:el.className,open:el.open,expanded:el.querySelector('summary')?.getAttribute('aria-expanded'),height:el.clientHeight,pseudo:getComputedStyle(el,'::details-content').height,visible:getComputedStyle(el,'::details-content').contentVisibility,text:el.innerText.slice(0,400)})));}report.cases.push({name:'setup',status:'failed',error:String(e)});console.error(e);}finally{await app?.close().catch(()=>{});await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await rm(temp,{recursive:true,force:true});console.log('Report: '+join(output,'report.json'));}if(report.cases.some(c=>c.status==='failed')||report.consoleErrors.length)process.exitCode=1;
