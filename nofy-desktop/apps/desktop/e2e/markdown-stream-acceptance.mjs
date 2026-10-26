import { loadPlaywright } from './playwright-driver.mjs';
import assert from 'node:assert/strict';
import { mkdtemp,mkdir,readFile,writeFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),appRoot=resolve(here,'..'),project=resolve(appRoot,'../..');
const temp=await mkdtemp(join(tmpdir(),'nofy-markdown-e2e-')),home=join(temp,'home'),nofy=join(temp,'nofy'),cwd=join(temp,'workspace'),gate=join(temp,'stage');
const output=join(project,'output/playwright','markdown-stream-'+new Date().toISOString().replaceAll(':','-'));
await Promise.all([home,nofy,cwd,output].map(p=>mkdir(p,{recursive:true})));await writeFile(gate,'1');
const report={source:'Isolated Electron with incremental ACP frames; actual DOM identity, controls and scroll measurements',cases:[],consoleErrors:[],output};
let app,page;
async function check(name,fn){try{const details=await fn();report.cases.push({name,status:'passed',details});console.log('PASS '+name);}catch(e){report.cases.push({name,status:'failed',error:String(e)});console.error('FAIL '+name+': '+e);await page?.screenshot({path:join(output,report.cases.length+'-failure.png')}).catch(()=>{});}}
const stage=n=>writeFile(gate,String(n));
const waitText=text=>page.waitForFunction(text=>document.querySelector('.spine')?.textContent.includes(text),text);
try {
 let source=await readFile(join(here,'mock-kernel.mjs'),'utf8');
 const marker="    if (text === 'e2e:thought') {";
 source=source.replace(marker,`    if (text === 'e2e:markdown-stream') {
   const chunk=(text,streamStartMs=100)=>{
    const s=state.sessions[sid];const frame={method:'session/update',params:{sessionId:sid,update:{sessionUpdate:'agent_message_chunk',content:{type:'text',text}},_meta:{eventId:sid+'-'+(++s.seq),streamStartMs}}};
    s.events.push(frame);send(frame);save();
   };
   chunk('# 流式结果\\n\\n稳定正文，不应反复重建。\\n\\n'+String.fromCharCode(96).repeat(3)+'ts\\nconst first = 1;\\n');
   let current=1;
   const timer=setInterval(()=>{const next=Number(readFileSync(process.env.NOFY_E2E_GATE,'utf8'));if(next===current)return;current=next;
    if(next===2)chunk('const second = 2;\\n');
    if(next===3)chunk(''+String.fromCharCode(96).repeat(3)+'\\n\\n| 名称 | 数量 |\\n| --- | ---: |\\n| CPU | 8 |\\n');
    if(next===4)chunk('| RAM | 16 |\\n');
    if(next===5)chunk('\\n表格之后的正文。');
    if(next===6)chunk('\\n\\n'+Array.from({length:45},(_,i)=>'段落 '+i+'：检查流式内容的滚动跟随、阅读位置和稳定布局。').join('\\n\\n'));
    if(next===7)chunk('\\n\\n继续追加，不应抢走阅读位置。'.repeat(5));
    if(next===8){event(sid,'response_completed',{usage:{}},true);event(sid,'turn_completed',{prompt_id:sid+'-turn',stop_reason:'end_turn',usage:{}},true);reply(running.get(sid),{stopReason:'end_turn'});running.delete(sid);clearInterval(timer);}
   },40);
 } else if (text === 'e2e:response-boundary') {
   const chunk=(text,streamStartMs)=>{
    const s=state.sessions[sid];const frame={method:'session/update',params:{sessionId:sid,update:{sessionUpdate:'agent_message_chunk',content:{type:'text',text}},_meta:{eventId:sid+'-'+(++s.seq),streamStartMs}}};s.events.push(frame);send(frame);save();
   };
   chunk('第一段独立响应。',200);
   let current=9;
   const timer=setInterval(()=>{const next=Number(readFileSync(process.env.NOFY_E2E_GATE,'utf8'));if(next===current)return;current=next;
    if(next===10)chunk('第二段独立响应。',300);
    if(next===11){complete(sid,'结束。');clearInterval(timer);}
   },40);
 } else if (text === 'e2e:thought') {`);
 const mock=join(temp,'kernel.mjs');await writeFile(mock,source,{mode:0o700});
 const {_electron}=await loadPlaywright();app=await _electron.launch({executablePath:join(appRoot,'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'),args:[appRoot,'--user-data-dir='+join(temp,'chromium')],env:{...process.env,HOME:home,NOFY_HOME:nofy,NOFY_BIN:mock,NOFY_WORKSPACE:cwd,NOFY_E2E_LOG:join(temp,'wire.jsonl'),NOFY_E2E_GATE:gate,NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:'',ELECTRON_RUN_AS_NODE:''}});
 page=await app.firstWindow();page.setDefaultTimeout(10000);page.on('pageerror',e=>report.consoleErrors.push(String(e)));
 const input=page.locator('textarea.composer__input');await page.locator('textarea.composer__input:not(:disabled)').waitFor();await page.setViewportSize({width:1080,height:780});
 await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.focus();w.webContents.focus();});await page.waitForFunction(()=>document.hasFocus());
 await input.fill('e2e:markdown-stream');await page.getByRole('button',{name:'发送',exact:true}).click();await page.locator('.codeblock').waitFor();
 await check('M01 unfinished fence is readable; only the changing fragment reparses',async()=>{
  await page.getByRole('button',{name:'代码自动换行',exact:true}).click();
  await page.evaluate(()=>{window.prefix=document.querySelector('.block--agent .md__p');window.code=document.querySelector('.codeblock');window.__NOFY_UI_TRACE={counts:{}};});
  await stage(2);await waitText('const second = 2;');
  assert.ok(await page.evaluate(()=>window.prefix===document.querySelector('.block--agent .md__p')&&window.code===document.querySelector('.codeblock')));
  assert.equal(await page.getByRole('button',{name:'代码自动换行',exact:true}).getAttribute('aria-pressed'),'true');
  const counts=await page.evaluate(()=>window.__NOFY_UI_TRACE.counts);assert.equal(counts.MarkdownFragment,1,JSON.stringify(counts));return counts;
 });
 await check('M02 closing the fence and starting a table preserves code identity and wrap',async()=>{
  await stage(3);await page.locator('.md__table').waitFor();
  assert.ok(await page.evaluate(()=>window.code===document.querySelector('.codeblock')));
  assert.equal(await page.getByRole('button',{name:'代码自动换行',exact:true}).getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'展开表格',exact:true}).click();await page.getByRole('dialog',{name:'表格',exact:true}).waitFor();
  await page.evaluate(()=>window.table=document.querySelector('.md-table'));
 });
 await check('M03 growing then freezing a table preserves the expanded view',async()=>{
  await stage(4);await page.getByRole('dialog',{name:'表格',exact:true}).getByText('RAM',{exact:true}).waitFor();
  await stage(5);await waitText('表格之后的正文。');
  assert.ok(await page.evaluate(()=>window.table===document.querySelector('.md-table')));
  assert.ok(await page.getByRole('dialog',{name:'表格',exact:true}).isVisible());
  await page.keyboard.press('Escape');await page.getByRole('dialog',{name:'表格',exact:true}).waitFor({state:'hidden'});
  await page.screenshot({path:join(output,'streaming-code-table.png')});
 });
 await check('M04 growth follows the bottom; user scrolling suspends following',async()=>{
  await stage(6);await waitText('段落 44');await page.waitForFunction(()=>{const el=document.querySelector('.spine');return el.scrollHeight-el.clientHeight-el.scrollTop<8;});
  await page.locator('.spine').hover();await page.mouse.wheel(0,-400);await page.waitForTimeout(200);
  const before=await page.locator('.spine').evaluate(el=>el.scrollTop);
  await stage(7);await waitText('继续追加');await page.waitForTimeout(180);
  const after=await page.locator('.spine').evaluate(el=>el.scrollTop);assert.ok(Math.abs(after-before)<3,JSON.stringify({before,after}));return {before,after};
 });
 await check('M05 turn completion does not remount Markdown controls or steal reading position',async()=>{
  const before=await page.locator('.spine').evaluate(el=>el.scrollTop);await stage(8);await page.waitForFunction(()=>document.querySelector('.composer')?.dataset.inputState==='ready');await page.waitForTimeout(400);
  assert.ok(await page.evaluate(()=>window.code===document.querySelector('.codeblock')&&window.table===document.querySelector('.md-table')));
  assert.equal(await page.getByRole('button',{name:'代码自动换行',exact:true}).getAttribute('aria-pressed'),'true');
  const after=await page.locator('.spine').evaluate(el=>el.scrollTop);assert.ok(Math.abs(after-before)<3,JSON.stringify({before,after}));return {before,after};
 });
 await check('M06 explicit response identities keep separate ordered blocks before turn completion',async()=>{
  await stage(9);await input.fill('e2e:response-boundary');await page.getByRole('button',{name:'发送',exact:true}).click();await waitText('第一段独立响应');
  await stage(10);await waitText('第二段独立响应');
  const blocks=await page.locator('.block--agent').allTextContents();assert.ok(blocks.some(t=>t==='第一段独立响应。'),JSON.stringify(blocks));assert.ok(blocks.some(t=>t==='第二段独立响应。'),JSON.stringify(blocks));
  assert.notEqual(await page.locator('.composer').getAttribute('data-input-state'),'ready');
  await stage(11);await page.waitForFunction(()=>document.querySelector('.composer')?.dataset.inputState==='ready');
  await page.setViewportSize({width:700,height:640});await page.waitForTimeout(350);
  const geometry=await page.locator('.spine').evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth}));assert.ok(geometry.scrollWidth<=geometry.width+1,JSON.stringify(geometry));
  await page.screenshot({path:join(output,'response-boundary-narrow.png')});return geometry;
 });
} catch(e){report.cases.push({name:'setup',status:'failed',error:String(e)});console.error(e);await page?.screenshot({path:join(output,'setup-failure.png')}).catch(()=>{});}
finally{await app?.close().catch(()=>{});await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await rm(temp,{recursive:true,force:true});console.log('Report: '+join(output,'report.json'));}
if(report.cases.some(c=>c.status==='failed')||report.consoleErrors.length)process.exitCode=1;
