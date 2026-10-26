import { loadPlaywright } from './playwright-driver.mjs';
import assert from 'node:assert/strict';
import { mkdtemp,mkdir,readFile,writeFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),appRoot=resolve(here,'..'),project=resolve(appRoot,'../..');
const temp=await mkdtemp(join(tmpdir(),'nofy-center-')),home=join(temp,'home'),nofy=join(temp,'nofy'),cwd=join(temp,'workspace'),gate=join(temp,'gate');
const output=join(project,'output/playwright','process-layout-'+new Date().toISOString().replaceAll(':','-'));
await Promise.all([home,nofy,cwd,output].map(p=>mkdir(p,{recursive:true})));await writeFile(gate,'hold');
const report={source:'isolated Electron + controlled ACP; actual content-axis geometry, lifecycle clock and scoped actions',cases:[],consoleErrors:[],output};let app,page;
async function check(name,fn){try{const details=await fn();report.cases.push({name,status:'passed',details});console.log('PASS '+name);}catch(e){report.cases.push({name,status:'failed',error:String(e)});console.error('FAIL '+name+': '+e);await page?.screenshot({path:join(output,report.cases.length+'-failure.png')}).catch(()=>{});}}
try {
 let source=await readFile(join(here,'mock-kernel.mjs'),'utf8');
 source=source.replace("    if (text === 'e2e:thought') {", `    if (text === 'e2e:density') {
    const thought=()=>{event(sid,'agent_thought_chunk',{content:{type:'text',text:'检查数据与配置。'.repeat(120)}});event(sid,'agent_message_chunk',{content:{type:'text',text:'\\n\\n'}});event(sid,'response_completed',{usage:{}},true);};
    const command='inspect '+ 'very-long-project-path/'.repeat(24);
    thought();
    event(sid,'tool_call',{toolCallId:'plan-tool',title:'Updating plan',kind:'other',status:'completed',rawInput:{}});
    event(sid,'plan',{entries:[{content:'检查文件',status:'completed',priority:'high'},{content:'核对配置',status:'in_progress',priority:'medium'},{content:'整理结果',status:'pending',priority:'low'}]});
    thought();event(sid,'tool_call',{toolCallId:'cmd1',title:'run_terminal_command',kind:'execute',status:'completed',rawInput:{command}});
    thought();event(sid,'tool_call',{toolCallId:'cmd2',title:'run_terminal_command',kind:'execute',status:'completed',rawInput:{command}});
    thought();event(sid,'tool_call_delta_chunk',{tool_call_id:'cmd3',tool_index:3,name:'run_terminal_command',arguments_delta:'{"command":"inspect'},true);
    } else if (text === 'e2e:thought') {`);
 const mock=join(temp,'kernel.mjs');await writeFile(mock,source,{mode:0o700});
 const {_electron}=await loadPlaywright();app=await _electron.launch({executablePath:join(appRoot,'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'),args:[process.env.NOFY_PROCESS_BASELINE ? join(project,'release/mac-arm64/Nofy.app/Contents/Resources/app') : appRoot,'--user-data-dir='+join(temp,'chromium')],env:{...process.env,HOME:home,NOFY_HOME:nofy,NOFY_BIN:mock,NOFY_WORKSPACE:cwd,NOFY_E2E_LOG:join(temp,'wire.jsonl'),NOFY_E2E_GATE:gate,NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:'',ELECTRON_RUN_AS_NODE:''}});
 page=await app.firstWindow();page.setDefaultTimeout(10000);page.on('pageerror',e=>report.consoleErrors.push(String(e)));
 await page.locator('textarea.composer__input:not(:disabled)').waitFor();
 const send=async text=>{await page.locator('textarea.composer__input').fill(text);await page.getByRole('button',{name:'发送',exact:true}).click();};
 await page.setViewportSize({width:1440,height:1000});await send('e2e:density');await page.locator('.activity-card').last().waitFor();await page.waitForTimeout(450);
 await check('D01 collapsed process rows have no invisible content height',async()=>{
  const metrics=await page.locator('.block--thought').evaluateAll(nodes=>nodes.map(el=>({height:el.getBoundingClientRect().height,summary:el.querySelector('summary').getBoundingClientRect().height,body:getComputedStyle(el,'::details-content').height,display:getComputedStyle(el).display})));
  await page.locator('.spine').hover();await page.mouse.wheel(0,-10000);await page.waitForFunction(()=>document.querySelector('.spine').scrollTop<1);await page.screenshot({path:join(output,'process.png')});assert.ok(metrics.every(m=>m.height<=36),JSON.stringify(metrics));return metrics;
 });
 await check('D01b whitespace deltas never allocate transcript rows',async()=>{assert.equal(await page.locator('[data-block-kind="agent-message"]').count(),0);});
 await check('D01c adjacent collapsed process rows stay compact',async()=>{const boxes=await page.locator('.turn-timeline__item').evaluateAll(nodes=>nodes.filter(el=>el.getBoundingClientRect().height>0).map(el=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom})));assert.ok(boxes.length>=5);for(let i=1;i<boxes.length;i++)assert.ok(boxes[i].top-boxes[i-1].bottom<=12,JSON.stringify(boxes));return boxes;});
 await check('D02 operation labels never shrink under long command text, including narrow panes',async()=>{
  for(const width of [1440,640]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(200);const metrics=await page.locator('.activity-card__title').evaluateAll(nodes=>nodes.map(el=>({text:el.textContent,width:el.clientWidth,scroll:el.scrollWidth})));assert.ok(metrics.every(m=>m.scroll<=m.width+1),JSON.stringify(metrics));assert.ok(await page.locator('.spine').evaluate(el=>el.scrollWidth<=el.clientWidth+1));}
 });
 await check('D03 plan is presented as task progress rather than a raw event tag',async()=>{
  const plan=page.locator('.plan-activity');assert.equal(await plan.count(),1);assert.match(await plan.innerText(),/1.*3/);await plan.locator('summary').click();await plan.locator('ol').getByText('核对配置',{exact:true}).waitFor();await page.waitForTimeout(350);assert.equal(await plan.locator('li').count(),3);const listBounds=await plan.evaluate(el=>({bottom:el.getBoundingClientRect().bottom,last:el.querySelector('li:last-child').getBoundingClientRect().bottom}));assert.ok(listBounds.last<=listBounds.bottom+1,JSON.stringify(listBounds));assert.equal(await page.locator('.block--event').count(),0);
 });
 await check('D04 pending tool arguments are not shown as an unknown result',async()=>{assert.doesNotMatch(await page.locator('.activity-card').last().innerText(),/状态未知/);});
 await check('D05 thought details open and close without retained blank height',async()=>{const row=page.locator('.block--thought').first();await row.locator('summary').click();await page.waitForTimeout(350);assert.ok((await row.boundingBox()).height>100);await row.locator('summary').click();await page.waitForTimeout(200);assert.ok((await row.boundingBox()).height<=36);});
 await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(350);await page.screenshot({path:join(output,'final-process.png')});
} catch(e){report.cases.push({name:'setup',status:'failed',error:String(e)});console.error(e);}
finally{await app?.close().catch(()=>{});await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await writeFile(join(output,'wire.jsonl'),await readFile(join(temp,'wire.jsonl'),'utf8').catch(()=>''));await rm(temp,{recursive:true,force:true});console.log('Report: '+join(output,'report.json'));}
if(report.cases.some(c=>c.status==='failed')||report.consoleErrors.length)process.exitCode=1;
