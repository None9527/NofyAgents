import { loadPlaywright } from './playwright-driver.mjs';
import assert from 'node:assert/strict';
import { mkdtemp,mkdir,readFile,writeFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),appRoot=resolve(here,'..'),project=resolve(appRoot,'../..');
const temp=await mkdtemp(join(tmpdir(),'nofy-retry-e2e-')),home=join(temp,'home'),nofy=join(temp,'nofy'),cwd=join(temp,'workspace'),gate=join(temp,'stage');
const output=join(project,'output/playwright','workflow-system-'+new Date().toISOString().replaceAll(':','-'));
await Promise.all([home,nofy,cwd,output].map(p=>mkdir(p,{recursive:true})));await writeFile(gate,'1');
const report={source:'Controlled multi-stage workflow in isolated Electron; DOM identity and frame measurements',cases:[],consoleErrors:[],output};
let app,page;
async function check(name,fn){try{const details=await fn();report.cases.push({name,status:'passed',details});console.log('PASS '+name);}catch(e){report.cases.push({name,status:'failed',error:String(e)});console.error('FAIL '+name+': '+e);await page?.screenshot({path:join(output,report.cases.length+'-failure.png')}).catch(()=>{});}}
const stage=n=>writeFile(gate,String(n));
const distance=()=>page.locator('.spine').evaluate(el=>el.scrollHeight-el.clientHeight-el.scrollTop);
const bottom=()=>page.waitForFunction(()=>{const el=document.querySelector('.spine');return el.scrollHeight-el.clientHeight-el.scrollTop<8;});
try {
 let source=await readFile(join(here,'mock-kernel.mjs'),'utf8');
 const marker="    if (text === 'e2e:thought') {";
 source=source.replace(marker,`    if (text === 'e2e:workflow') {
   const thought=text=>event(sid,'agent_thought_chunk',{content:{type:'text',text}});
   const tool=(id,status='completed')=>event(sid,'tool_call',{toolCallId:id,title:'run_terminal_command',kind:'execute',status,rawInput:{command:'inspect-'+id}});
   thought('先检查工作区');
   let current=1;
   const timer=setInterval(()=>{const next=Number(readFileSync(process.env.NOFY_E2E_GATE,'utf8'));if(next===current)return;current=next;
    if(next===2)thought('，确认项目配置');
    if(next===3)thought('\\n接着核对构建入口');
    if(next===4){tool('a');tool('b');}
    if(next===5){tool('c');setTimeout(()=>tool('d'),80);setTimeout(()=>tool('e'),160);}
    if(next===6)event(sid,'agent_message_chunk',{content:{type:'text',text:'检查完成，正在整理结果。'}});
    if(next===7){complete(sid,'验证通过。');clearInterval(timer);}
   },40);
 } else if (text === 'e2e:viewport') {
   event(sid,'agent_thought_chunk',{content:{type:'text',text:'正在检查视口行为'}});
   let current=8;
   const timer=setInterval(()=>{const next=Number(readFileSync(process.env.NOFY_E2E_GATE,'utf8'));if(next===current)return;current=next;
    if(next===8.5)event(sid,'agent_message_chunk',{content:{type:'text',text:'先说明检查思路。'}});
    if(next===9)event(sid,'agent_message_chunk',{content:{type:'text',text:Array.from({length:40},(_,i)=>'段落 '+i+'：可连续阅读的工作说明，包含当前检查结果和下一步操作。').join('\\n\\n')}});
    if(next===10)event(sid,'agent_message_chunk',{content:{type:'text',text:'\\n\\n追加内容。'.repeat(8)}});
    if(next===11){event(sid,'response_completed',{usage:{}},true);event(sid,'tool_call',{toolCallId:'error-tool',title:'run_terminal_command',kind:'execute',status:'failed',rawInput:{command:'inspect-error'},content:[{type:'content',content:{type:'text',text:'Permission denied\\n'.repeat(25)}}]});}
    if(next===12){complete(sid,'视口验证结束。');clearInterval(timer);}
   },40);
 } else if (text === 'e2e:thought') {`);
 const mock=join(temp,'kernel.mjs');await writeFile(mock,source,{mode:0o700});
 const {_electron}=await loadPlaywright();app=await _electron.launch({executablePath:join(appRoot,'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'),args:[appRoot,'--user-data-dir='+join(temp,'chromium')],env:{...process.env,HOME:home,NOFY_HOME:nofy,NOFY_BIN:mock,NOFY_WORKSPACE:cwd,NOFY_E2E_LOG:join(temp,'wire.jsonl'),NOFY_E2E_GATE:gate,NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:'',ELECTRON_RUN_AS_NODE:''}});
 page=await app.firstWindow();page.setDefaultTimeout(10000);page.on('pageerror',e=>report.consoleErrors.push(String(e)));
 const input=page.locator('textarea.composer__input');await page.locator('textarea.composer__input:not(:disabled)').waitFor();await page.setViewportSize({width:1080,height:780});
 await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.focus();w.webContents.focus();});await page.waitForFunction(()=>document.hasFocus());await page.waitForTimeout(120);
 await input.fill('e2e:workflow');await page.getByRole('button',{name:'发送',exact:true}).click();
 await check('S01 collapsed reasoning exposes live content; same-line growth preserves node',async()=>{
  const summary=page.locator('.block--thought > summary');await summary.waitFor();
  assert.ok((await summary.innerText()).includes('先检查工作区'));
  assert.ok(await page.locator('.transcript-response-space').evaluate(el=>el.getBoundingClientRect().height)>0,'first submitted turn must also reserve answer space');
  assert.equal(await page.locator('.block--thought[open]').count(),0);
  await page.evaluate(()=>window.reasonLine=document.querySelector('.block--thought .ui-rolling-summary__current'));
  await stage(2);await page.waitForFunction(()=>document.querySelector('.block--thought > summary')?.textContent.includes('确认项目配置'));
  assert.equal(await page.evaluate(()=>window.reasonLine===document.querySelector('.block--thought .ui-rolling-summary__current')),true);
 });
 await check('S02 reasoning changes identity without replay or replacing the text node',async()=>{
  await stage(3);await page.waitForFunction(()=>document.querySelector('.block--thought .ui-rolling-summary__current')?.textContent.includes('接着核对'));
  assert.equal(await page.locator('.ui-rolling-summary__out').count(),0);
  assert.equal(await page.evaluate(()=>window.reasonLine===document.querySelector('.block--thought .ui-rolling-summary__current')),true);
  assert.equal(await page.locator('.block--thought .ui-rolling-summary__current').evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.screenshot({path:join(output,'reasoning-live.png')});
 });
 await check('S03 completed child tools remain one active stage with current command',async()=>{
  await stage(4);await page.locator('.work-group').waitFor();
  const summary=page.locator('.work-group > summary');assert.ok((await summary.innerText()).includes('inspect-b'));
  assert.equal(await summary.locator('.activity-live').count(),1);assert.equal(await page.locator('.work-group[open]').count(),0);
  await page.evaluate(()=>window.stageNode=document.querySelector('.work-group'));
  await page.evaluate(()=>{window.summarySamples=[];window.summaryObserver=new MutationObserver(()=>window.summarySamples.push(document.querySelector('.work-group .ui-rolling-summary__current')?.textContent));window.summaryObserver.observe(document.querySelector('.work-group .ui-rolling-summary__current'),{childList:true,characterData:true,subtree:true});});
  await stage(5);await page.waitForFunction(()=>document.querySelectorAll('.work-group .activity-card').length===5);
  await page.waitForFunction(()=>document.querySelector('.work-group .ui-rolling-summary__current')?.textContent==='inspect-e');
  assert.equal(await page.evaluate(()=>window.stageNode===document.querySelector('.work-group')),true);
  const shown=await page.evaluate(()=>{window.summaryObserver.disconnect();return window.summarySamples;});
  assert.ok(!shown.includes('inspect-c')&&!shown.includes('inspect-d'),JSON.stringify(shown));
  assert.equal(await page.locator('.block--thought .activity-live').count(),0);
  await page.waitForTimeout(350);await page.screenshot({path:join(output,'command-stage.png')});
 });
 await check('S04 arriving prose ends stage and shows live response before completion',async()=>{
  await stage(6);await page.locator('.block--agent').waitFor();
  assert.equal(await page.locator('.work-group .activity-card__title.activity-live').count(),0);
  assert.ok((await page.locator('.work-group > summary').innerText()).includes('5 个命令'));
  assert.equal(await page.locator('[data-history-toggle]').getAttribute('aria-expanded'),'true');
  assert.equal(await page.locator('.message-actions').count(),0);
  assert.ok(await page.locator('.block--agent').isVisible());
  await page.evaluate(()=>window.liveAnswer=document.querySelector('.block--agent'));
 });
 await check('S05 completed answer retains its DOM while work folds, keyboard restores details',async()=>{
  await stage(7);await page.waitForFunction(()=>document.querySelector('.composer')?.dataset.inputState==='ready');await page.waitForTimeout(450);
  assert.equal(await page.evaluate(()=>window.liveAnswer===document.querySelector('.block--agent')),true);
  assert.equal(await page.locator('[data-history-toggle]').getAttribute('aria-expanded'),'false');
  assert.ok(await page.locator('.block--agent').isVisible());
  const fold=await page.locator('[data-history-toggle]').evaluate(el=>{const label=el.querySelector('.turnhead__label').getBoundingClientRect(),chevron=el.querySelector('.ui-motion-disclosure__chevron').getBoundingClientRect(),column=el.closest('.spine__inner').getBoundingClientRect();return {gap:chevron.left-label.right,trailing:column.right-chevron.right};});
  assert.ok(fold.gap>=0&&fold.gap<28&&fold.trailing>80,JSON.stringify(fold));
  await input.focus();
  assert.equal(await input.evaluate(el=>getComputedStyle(el).outlineStyle),'none');
  assert.ok(await page.locator('.transcript-response-space').evaluate(el=>el.getBoundingClientRect().height)<1,'settled turn must drop the answer reservation');
  await page.screenshot({path:join(output,'completed.png')});
  await page.locator('[data-history-toggle]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(300);
  await page.locator('.work-group > summary').click();await page.waitForTimeout(300);
  assert.equal(await page.locator('.work-group[open]').count(),1);
  assert.equal(await page.locator('.work-group .activity-card').count(),5);
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.work-group > summary .ui-rolling-summary__current').evaluate(el=>getComputedStyle(el).animationName),'none');
 });

 await check('S06 a new turn reserves bounded answer space, consumed by a growing response',async()=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await stage(8);
  await input.fill('e2e:viewport');await page.getByRole('button',{name:'发送',exact:true}).click();
  await page.locator('.block--thought > summary').filter({hasText:'正在检查视口行为'}).waitFor();
  const initial=await page.locator('.transcript-response-space').evaluate(el=>({space:el.getBoundingClientRect().height,available:document.querySelector('.spine').clientHeight}));
  assert.ok(initial.space>0&&initial.space<=initial.available*2/3,JSON.stringify(initial));
  await stage(8.5);await page.waitForFunction(()=>document.querySelector('.spine')?.innerText.includes('先说明检查思路'));await page.waitForTimeout(120);
  await stage(9);await page.waitForFunction(()=>document.querySelector('.spine')?.innerText.includes('段落 39'));
  await bottom();assert.ok(await page.locator('.transcript-response-space').evaluate(el=>el.getBoundingClientRect().height)<1);
  return initial;
 });
 await check('S07 upward reading is not stolen by streaming; explicit bottom resumes following',async()=>{
  await page.locator('.spine').hover();await page.mouse.wheel(0,-350);await page.waitForTimeout(180);
  const before=await page.locator('.spine').evaluate(el=>el.scrollTop);
  assert.ok(await distance()>150);
  await stage(10);await page.waitForFunction(()=>document.querySelector('.spine')?.innerText.includes('追加内容'));
  await page.waitForTimeout(180);const after=await page.locator('.spine').evaluate(el=>el.scrollTop);
  assert.ok(Math.abs(after-before)<3,JSON.stringify({before,after}));
  await page.getByRole('button',{name:'回到最新消息',exact:true}).click();await bottom();
  return {before,after};
 });
 await check('S08 opening tool output anchors the trigger, user wheel cancels compensation',async()=>{
  await stage(11);const summary=page.locator('[data-block-id="tool:error-tool"] .activity-card > summary');await summary.waitFor();await bottom();
  await summary.click();
  const frames=await summary.evaluate(async el=>{const samples=[];for(let i=0;i<22;i++){samples.push(el.getBoundingClientRect().top);await new Promise(requestAnimationFrame);}return samples;});
  assert.ok(Math.max(...frames)-Math.min(...frames)<3,JSON.stringify(frames));
  await summary.click();await page.locator('.spine').hover();await page.mouse.wheel(0,-180);await page.waitForTimeout(400);
  assert.ok(await distance()>80);
  return {maxDrift:Math.max(...frames)-Math.min(...frames)};
 });
 await check('S09 completed turn retains error outside folded history; narrow geometry stays bounded',async()=>{
  await stage(12);await page.waitForFunction(()=>document.querySelector('.composer')?.dataset.inputState==='ready');
  const row=page.locator('.turn-segment').filter({hasText:'e2e:viewport'}),head=row.locator('[data-history-toggle]');
  await head.scrollIntoViewIfNeeded();if(await head.getAttribute('aria-expanded')==='true')await head.click();await page.waitForTimeout(380);
  assert.ok(await row.locator('[data-block-id="tool:error-tool"] .activity-card').isVisible());
  assert.ok(await row.getByText('视口验证结束。',{exact:true}).isVisible());
  await page.setViewportSize({width:700,height:640});await page.waitForTimeout(350);
  const geometry=await page.locator('.spine').evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth}));
  assert.ok(geometry.scrollWidth<=geometry.width+1,JSON.stringify(geometry));
  await page.screenshot({path:join(output,'narrow-error-retained.png')});return geometry;
 });
} catch(e){report.cases.push({name:'setup',status:'failed',error:String(e)});console.error(e);await page?.screenshot({path:join(output,'setup-failure.png')}).catch(()=>{});}
finally{await app?.close().catch(()=>{});await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await rm(temp,{recursive:true,force:true});console.log('Report: '+join(output,'report.json'));}
if(report.cases.some(c=>c.status==='failed')||report.consoleErrors.length)process.exitCode=1;
