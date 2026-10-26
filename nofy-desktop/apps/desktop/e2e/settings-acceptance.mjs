import { loadPlaywright } from "./playwright-driver.mjs";
/** Actual Electron settings GUI, deterministic ACP emulator. No real model/config/credentials. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import { chmod,mkdtemp,mkdir,readFile,rm,writeFile } from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const here=dirname(fileURLToPath(import.meta.url)),appRoot=resolve(here,'..'),root=resolve(appRoot,'../../..');
const {_electron}=await loadPlaywright();
const temp=await mkdtemp(join(tmpdir(),'nofy-settings-gui-'));const output=join(root,'nofy-desktop/output/playwright',new Date().toISOString().replaceAll(':','-')+'-settings');
const home=join(temp,'home'),nofyHome=join(temp,'nofy'),cwd=join(temp,'workspace'),logPath=join(temp,'wire.jsonl');
await Promise.all([mkdir(output,{recursive:true}),mkdir(home),mkdir(nofyHome),mkdir(cwd)]);
// Extend only the temporary copy of the shared emulator, leaving other E2E scenarios untouched.
const extra=`
  if(f.method==='_nofy/skills/list'||f.method==='_nofy/skills/toggle'){
    if(!state.testSkills)state.testSkills=[{name:'gui-skill',description:'Mock skill',path:'/skills/gui-skill',scope:'user',user_invocable:true,enabled:true},{name:'stuck-skill',description:'Toggle fails',path:'/skills/stuck-skill',scope:'user',user_invocable:true,enabled:true}];
    if(f.method==='_nofy/skills/toggle'){
      if(p.name!=='gui-skill'){reply(f.id,{result:null,error:"Skill '"+p.name+"' not found"});return;}
      for(const skill of state.testSkills)if(skill.name===p.name)skill.enabled=p.enabled===true;
      save();
      reply(f.id,{result:{skills:state.testSkills}});
      return;
    }
    reply(f.id,{result:{skills:state.testSkills}});
    return;
  }
  if(f.method==='_nofy/terminal/list'){reply(f.id,{result:{terminals:state.testTerminal?[{terminalId:'gui-terminal',interactive:true,status:'connected',name:'workspace',cwd:state.testTerminalCwd}]:[]}});return;}
  if(f.method==='_nofy/terminal/pty/create'){state.testTerminal=true;state.testTerminalCwd=p.cwd;save();reply(f.id,{result:{terminalId:'gui-terminal'}});setTimeout(()=>notify('_nofy/terminal/pty/notification',{terminalId:'gui-terminal',type:'output',data:Buffer.from('E2E terminal palette test\\r\\n').toString('base64')}),100);return;}
  if(f.method==='_nofy/terminal/pty/load'||f.method==='_nofy/terminal/pty/resize'){reply(f.id,{result:{terminalId:'gui-terminal',rows:24,cols:80,exited:false}});return;}
  if (f.method === '_nofy/mcp/list') { reply(f.id,{result:{servers:state.testMcp??[]}}); return; }
  if (f.method === '_nofy/mcp/upsert') {state.testMcp=[{name:p.server_name,source:'local',type:'http',url:p.url,session:{enabled:true,status:'ready',tools:[{name:'mock_echo'}]}}];save();if(p.server_name==='delayed-test')setTimeout(()=>reply(f.id,{result:{ok:true,message:'Delayed old write'}}),1800);else reply(f.id,{result:{ok:true}});return;}
  if (f.method === '_nofy/mcp/toggle') {for(const server of state.testMcp??[])if(server.name===p.server_name)server.session.enabled=p.enabled;save();reply(f.id,{result:{ok:true}});return;}
  if (f.method === '_nofy/mcp/delete') {state.testMcp=(state.testMcp??[]).filter(s=>s.name!==p.server_name);save();reply(f.id,{result:{ok:true}});return;}
  if (f.method === '_nofy/mcp/auth_trigger') {reply(f.id,{result:p.server_name==='setup-test'?{status:'setup_required',setup:{fields:[{id:'region',label:'Setup region',type:'select',required:true,options:[{label:'US',value:'us'}]}]}}:{status:'authenticated'}});return;}
  if (f.method === '_nofy/mcp/setup') {reply(f.id,{result:p.serverName==='setup-test'&&p.values?.region==='us'?{status:'authenticated'}:{status:'validation_error',message:'Incorrect setup payload'}});return;}
  if (f.method === '_nofy/plugins/list') {reply(f.id,{result:{plugins:state.testPlugins??[]}});return;}
  if (f.method === '_nofy/plugins/action') {const action=p.action??{};if(action.type==='install')state.testConfirmation=action.source==='confirmation-fixture';if(action.type==='uninstall'&&state.testConfirmation&&!action.confirmed){reply(f.id,{result:{status:'confirmation_required',message:'Confirm repository removal'}});return;}if(action.type==='install')state.testPlugins=[{id:'test/mock-plugin',name:'GUI test plugin',enabled:true,scope:'user',description:'Mock UI lifecycle test',version:'1.0.0',skillCount:1,agentCount:0,mcpServerCount:0}];if(action.type==='disable'||action.type==='enable')for(const plugin of state.testPlugins??[])plugin.enabled=action.type==='enable';if(action.type==='uninstall')state.testPlugins=[];save();reply(f.id,{result:{status:'success',message:'Mock action accepted',requiresReload:state.testConfirmation&&action.type!=='reload',requiresRestart:false}});return;}
  if(f.method==='_nofy/hooks/list'){reply(f.id,{result:{hooks:[]}});return;}
  if(f.method==='_nofy/auth/info'){reply(f.id,{methodId:state.testKey?'api_key':null});return;}
  if(f.method==='_nofy/setApiKey'){state.testKey=!!p.key;save();reply(f.id,{result:{ok:true}});return;}
  if(f.method==='_nofy/internal/reload_models'){reply(f.id,{result:{models:1}});return;}
  if(f.method==='authenticate'){reply(f.id,{});return;}
`;
const mock=join(temp,'settings-kernel.mjs');let source=await readFile(join(here,'mock-kernel.mjs'),'utf8');source=source.replace("  if (f.method === 'initialize') {",extra+"\n  if (f.method === 'initialize') {");await writeFile(mock,source);await chmod(mock,0o700);
const report={source:'Actual Electron GUI + temporary deterministic ACP emulator; not real services',startedAt:new Date().toISOString(),cases:[],consoleErrors:[],output};
let application,page,currentCase='startup';
async function check(name,fn){currentCase=name;try{if(/^(MCP|Plugin|Credential|Provider)/.test(name))await openSettings();const details=await fn();report.cases.push({name,status:'passed',details});console.log('PASS '+name);}catch(error){report.cases.push({name,status:'failed',error:String(error)});console.error('FAIL '+name+': '+error);if(page)await page.screenshot({path:join(output,'failure-'+report.cases.length+'.png')}).catch(()=>{});}}
async function shot(name){await page.screenshot({path:join(output,name+'.png')});}
async function openSettings(){if(await page.locator('.set').isVisible())return;await page.locator('.sidebar__foot button').last().click();await page.getByRole('menuitem',{name:/设置…|Settings…/}).click();await page.locator('.set').waitFor();}
async function openModels(){await openSettings();await page.getByRole('button',{name:/^(模型|Models)$/}).click();}
async function openModelEditor(){if(await page.getByLabel('模型 ID',{exact:true}).isVisible())return;await openModels();await page.getByRole('button',{name:'新增模型配置',exact:true}).click();}
async function closeSettings(){if(await page.locator('.set').isVisible())await page.getByRole('button',{name:/^(返回工作区|Back to workspace)$/}).click();await page.locator('.set').waitFor({state:'hidden'});}
async function appearance(name){await closeSettings();await page.locator('.sidebar__foot button').last().click();await page.getByRole('menuitem',{name,exact:true}).click();}
async function language(value){await appearance(value==='en'?'English':'中文');}
async function wire(){return(await readFile(logPath,'utf8')).trim().split('\n').filter(Boolean).map(JSON.parse);}
async function visibleBox(selector){const box=await page.locator(selector).first().boundingBox();const viewport=await page.evaluate(()=>({w:innerWidth,h:innerHeight}));assert.ok(box&&box.y>=0&&box.y+box.height<=viewport.h&&box.x>=0&&box.x+box.width<=viewport.w,JSON.stringify({box,viewport}));return box;}
try{
 const dist=join(appRoot,'node_modules/electron/dist');const executablePath=process.platform==='darwin'?join(dist,'Electron.app/Contents/MacOS/Electron'):join(dist,'electron');
 application=await _electron.launch({executablePath,args:[appRoot,`--user-data-dir=${join(temp,'chromium')}`],env:{...process.env,HOME:home,NOFY_HOME:nofyHome,NOFY_BIN:mock,NOFY_WORKSPACE:cwd,NOFY_E2E_LOG:logPath,NOFY_ISOLATED_HOME:'0',NOFY_DEV_SERVER_URL:process.env.NOFY_E2E_DEV_URL??'',ELECTRON_RUN_AS_NODE:''},timeout:30000});page=await application.firstWindow();page.setDefaultTimeout(10000);page.on('pageerror',error=>report.consoleErrors.push({case:currentCase,message:String(error)}));
 await page.locator('textarea.composer__input:not(:disabled)').waitFor({timeout:30000});
 await check('Settings language EN/ZH changes live without losing drafts',async()=>{
  await page.locator('textarea.composer__input').fill('KEEP draft 中文 backend text');await language('en');assert.equal(await page.locator('html').getAttribute('lang'),'en');await page.getByRole('button',{name:'Send',exact:true}).waitFor();const suggestions=await page.locator('.empty__sugs').innerText();assert.ok(!/[\u3400-\u9fff]/.test(suggestions),'Static suggestions retain Chinese: '+suggestions);await openSettings();await page.getByRole('heading',{name:'Models',exact:true}).waitFor();await shot('settings-en');await page.getByRole('button',{name:'Back to workspace',exact:true}).click();assert.equal(await page.locator('textarea.composer__input').inputValue(),'KEEP draft 中文 backend text');await language('zh-CN');await openSettings();await page.getByRole('heading',{name:'模型',exact:true}).waitFor();await shot('settings-zh');
 });
 await check('System theme follows media changes; explicit themes override',async()=>{
  await appearance('跟随系统');await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.classList.contains('theme-zai-light'));await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>document.documentElement.classList.contains('theme-zai-dark'));await appearance('浅色');await page.emulateMedia({colorScheme:'dark'});assert.ok(await page.locator('html').evaluate(el=>el.classList.contains('theme-zai-light')));await shot('settings-light');
 });
 await check('Font and language survive renderer reload',async()=>{
  await appearance('18 px');await language('en');await page.reload();await page.locator('textarea.composer__input:not(:disabled)').waitFor({timeout:20000});assert.equal(await page.locator('html').getAttribute('lang'),'en');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--ui-font-size').trim()),'18px');await appearance('14 px');await language('zh-CN');
 });
 await check('Mounted terminal palette follows system theme changes',async()=>{
  await appearance('跟随系统');await page.getByRole('button',{name:'展开终端面板',exact:true}).click();await page.locator('.xterm-rows').waitFor();
  const colors=()=>page.evaluate(()=>{const rows=document.querySelector('.xterm-rows'),dock=document.querySelector('.dock');return {terminal:rows?getComputedStyle(rows).color:null,dock:dock?getComputedStyle(dock).color:null};});
  await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.classList.contains('theme-zai-light'));await new Promise(r=>setTimeout(r,100));const light=await colors();await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>document.documentElement.classList.contains('theme-zai-dark'));await new Promise(r=>setTimeout(r,100));const dark=await colors();await shot('terminal-system-dark');assert.notEqual(light.dock,dark.dock,'Dock theme must change');assert.notEqual(light.terminal,dark.terminal,'Mounted xterm palette remains stale');await page.getByRole('button',{name:'关闭终端面板',exact:true}).first().click();await openSettings();return {light,dark};
 });
 await check('MCP GUI create disable enable authenticate delete readback',async()=>{
  await page.getByRole('button',{name:'MCP 服务',exact:true}).click();await page.getByRole('button',{name:'新增服务',exact:true}).click();await page.getByRole('textbox',{name:'MCP 名称',exact:true}).fill('gui-test-mcp');await page.locator('label').filter({hasText:'地址'}).locator('input').fill('http://127.0.0.1:1/mock');await page.getByRole('button',{name:'保存',exact:true}).click();await page.getByText('gui-test-mcp',{exact:true}).first().waitFor();await page.getByRole('button',{name:'停用',exact:true}).click();await page.getByRole('button',{name:'启用',exact:true}).click();await page.getByRole('button',{name:'认证 / Setup',exact:true}).click();await page.getByText('删除',{exact:true}).click();await page.getByRole('button',{name:'确认删除',exact:true}).click();await page.getByText('这个会话还没挂 MCP 服务。',{exact:true}).waitFor();const methods=(await wire()).map(row=>row.frame.method);for(const method of ['_nofy/mcp/upsert','_nofy/mcp/toggle','_nofy/mcp/auth_trigger','_nofy/mcp/delete'])assert.ok(methods.includes(method));
 });
 await check('Plugin GUI install disable enable uninstall',async()=>{
  await page.getByRole('button',{name:'插件',exact:true}).click();await page.getByRole('textbox',{name:'插件来源',exact:true}).fill('mock-plugin-source');await page.getByRole('button',{name:'安装',exact:true}).click();await page.getByText('GUI test plugin',{exact:true}).waitFor();await page.getByRole('button',{name:'停用',exact:true}).click();await page.getByRole('button',{name:'启用',exact:true}).click();await page.getByText('卸载',{exact:true}).click();await page.getByRole('button',{name:'卸载此插件',exact:true}).click();await page.getByText('尚未安装插件。',{exact:true}).waitFor();const actions=(await wire()).filter(row=>row.frame.method==='_nofy/plugins/action').map(row=>row.frame.params.action.type);for(const action of ['install','disable','enable','uninstall'])assert.ok(actions.includes(action));
 });
 await check('MCP GUI invalid draft is retained without any kernel write',async()=>{
  await page.getByRole('button',{name:'MCP 服务',exact:true}).click();await page.getByRole('button',{name:'新增服务',exact:true}).click();
  await page.getByRole('textbox',{name:'MCP 名称',exact:true}).fill('invalid-test');await page.getByLabel('地址',{exact:true}).fill('invalid-url');
  const before=(await wire()).filter(row=>row.frame.method==='_nofy/mcp/upsert').length;
  await page.getByRole('button',{name:'保存',exact:true}).click();await page.getByText('HTTP 地址格式不正确。',{exact:true}).waitFor();
  assert.equal((await wire()).filter(row=>row.frame.method==='_nofy/mcp/upsert').length,before);assert.equal(await page.getByLabel('地址',{exact:true}).inputValue(),'invalid-url');
  await page.getByRole('button',{name:'取消',exact:true}).click();
 });
 await check('MCP GUI Setup uses normalized fields and the camel-case submission',async()=>{
  await page.getByRole('button',{name:'MCP 服务',exact:true}).click();await page.getByRole('button',{name:'新增服务',exact:true}).click();
  await page.getByRole('textbox',{name:'MCP 名称',exact:true}).fill('setup-test');await page.getByLabel('地址',{exact:true}).fill('http://127.0.0.1:1/setup');await page.getByRole('button',{name:'保存',exact:true}).click();
  await page.getByText('setup-test',{exact:true}).first().waitFor();await page.getByRole('button',{name:'认证 / Setup',exact:true}).click();await page.getByRole('combobox',{name:'Setup region',exact:true}).selectOption('us');
  await shot('mcp-domain-setup');await page.getByRole('button',{name:'保存 Setup',exact:true}).click();await page.getByRole('combobox',{name:'Setup region',exact:true}).waitFor({state:'hidden'});
  const request=(await wire()).filter(row=>row.frame.method==='_nofy/mcp/setup').at(-1);assert.equal(request.frame.params.serverName,'setup-test');assert.deepEqual(request.frame.params.values,{region:'us'});assert.ok(request.frame.params.sessionId);
  await page.getByText('删除',{exact:true}).click();await page.getByRole('button',{name:'确认删除',exact:true}).click();await page.getByText('这个会话还没挂 MCP 服务。',{exact:true}).waitFor();
 });
 await check('Plugin GUI repository confirmation and required reload are explicit',async()=>{
  await page.getByRole('button',{name:'插件',exact:true}).click();await page.getByRole('textbox',{name:'插件来源',exact:true}).fill('confirmation-fixture');await page.getByRole('button',{name:'安装',exact:true}).click();await page.getByText('GUI test plugin',{exact:true}).waitFor();
  const start=(await wire()).filter(row=>row.frame.method==='_nofy/plugins/action');assert.ok(start.some(row=>row.frame.params.action.type==='reload'));
  await page.getByText('卸载',{exact:true}).click();await page.getByRole('button',{name:'卸载此插件',exact:true}).click();await page.getByRole('button',{name:'确认卸载整个插件仓库',exact:true}).waitFor();
  await page.getByText('GUI test plugin',{exact:true}).waitFor();await shot('plugin-domain-confirmation');await page.getByRole('button',{name:'确认卸载整个插件仓库',exact:true}).click();await page.getByText('尚未安装插件。',{exact:true}).waitFor();
  const frames=(await wire()).filter(row=>row.frame.method==='_nofy/plugins/action').map(row=>row.frame.params.action);const removals=frames.filter(action=>action.type==='uninstall');assert.equal(removals.at(-2).confirmed,false);assert.equal(removals.at(-1).confirmed,true);assert.equal(frames.at(-1).type,'reload');
 });
 await check('Skill toggle shows the kernel error and changes the dot only after the list confirms it',async()=>{
  await openSettings();await page.getByRole('button',{name:'技能',exact:true}).click();
  const stuck=page.locator('.set__row',{has:page.getByText('stuck-skill',{exact:true})});
  const skill=page.locator('.set__row',{has:page.getByText('gui-skill',{exact:true})});
  await stuck.getByRole('button',{name:'停用',exact:true}).waitFor();
  await skill.locator('.dot--completed').waitFor();
  const listsBefore=(await wire()).filter(row=>row.frame.method==='_nofy/skills/list').length;
  await stuck.getByRole('button',{name:'停用',exact:true}).click();
  await page.getByRole('alert').filter({hasText:"Skill 'stuck-skill' not found"}).waitFor();
  await stuck.locator('.dot--completed').waitFor();
  await stuck.getByRole('button',{name:'停用',exact:true}).waitFor();
  assert.equal((await wire()).filter(row=>row.frame.method==='_nofy/skills/list').length,listsBefore);
  await skill.getByRole('button',{name:'停用',exact:true}).click();
  await skill.getByRole('button',{name:'启用',exact:true}).waitFor();
  assert.equal(await skill.locator('.dot--completed').count(),0);
  await stuck.locator('.dot--completed').waitFor();
  const frames=(await wire()).map(row=>row.frame);
  const toggleAt=frames.findLastIndex(frame=>frame.method==='_nofy/skills/toggle'&&frame.params?.name==='gui-skill');
  const listAt=frames.findLastIndex(frame=>frame.method==='_nofy/skills/list');
  assert.ok(toggleAt>=0&&listAt>toggleAt);
  assert.deepEqual(frames[toggleAt].params,{name:'gui-skill',enabled:false,cwd});
  await shot('skills-toggle');
 });
 await check('MCP save guard scopes shortcuts and A B A route re-entry starts clean',async()=>{
  await page.getByRole('button',{name:'MCP 服务',exact:true}).click();await page.getByRole('button',{name:'新增服务',exact:true}).click();
  await page.getByRole('textbox',{name:'MCP 名称',exact:true}).fill('delayed-test');await page.getByLabel('地址',{exact:true}).fill('http://127.0.0.1:1/delayed');await page.getByRole('button',{name:'保存',exact:true}).click();
  await page.getByRole('button',{name:'用量',exact:true}).click();await page.getByRole('dialog',{name:'正在保存设置',exact:true}).waitFor();await page.getByRole('button',{name:'继续编辑',exact:true}).click();const sessionRequests=(await wire()).filter(row=>row.frame.method==='session/new').length;await page.keyboard.press('Meta+n');await page.waitForTimeout(100);assert.equal((await wire()).filter(row=>row.frame.method==='session/new').length,sessionRequests,'settings shortcut bypassed pending-save guard');await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='新增服务')?.disabled);await page.getByRole('button',{name:'返回工作区',exact:true}).click();await page.locator('textarea.composer__input').waitFor();await page.keyboard.press('Meta+n');await page.waitForFunction(()=>document.title.includes('E2E task 2'));await page.keyboard.press('Meta+Shift+[');await page.waitForFunction(()=>document.title.includes('E2E task 1'));await openSettings();await page.getByRole('button',{name:'MCP 服务',exact:true}).click();
  await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='新增服务')?.disabled);
  assert.equal(await page.getByText('Delayed old write',{exact:true}).count(),0);await shot('mcp-domain-aba');
 });
 await check('Settings warm navigation reuses catalogs and refresh explicitly rereads them',async()=>{
  await page.getByRole('button',{name:'插件',exact:true}).click();await page.getByLabel('插件来源',{exact:true}).waitFor();await page.waitForTimeout(100);
  const count=async()=> (await wire()).filter(row=>row.frame.method==='_nofy/plugins/list').length;
  const before=await count();await page.getByRole('button',{name:'用量',exact:true}).click();await page.getByRole('button',{name:'插件',exact:true}).click();await page.waitForTimeout(100);assert.equal(await count(),before);
  await page.getByRole('button',{name:'重新读取',exact:true}).filter({has:page.locator('svg')}).click();await page.waitForTimeout(100);assert.equal(await count(),before+1);
 });
 await check('Plugin unsaved exit preserves input on cancel and discards only after confirmation',async()=>{
  await page.getByRole('button',{name:'插件',exact:true}).click();await page.getByLabel('插件来源',{exact:true}).fill('unsaved-plugin-source');
  await page.getByRole('button',{name:'返回工作区',exact:true}).click();await page.getByRole('dialog',{name:'未保存的修改',exact:true}).waitFor();await page.getByRole('button',{name:'继续编辑',exact:true}).click();assert.equal(await page.getByLabel('插件来源',{exact:true}).inputValue(),'unsaved-plugin-source');
  await page.getByRole('button',{name:'用量',exact:true}).click();await page.getByRole('button',{name:'放弃修改并离开',exact:true}).click();await page.getByRole('heading',{name:'用量',exact:true}).waitFor();await page.getByRole('button',{name:'插件',exact:true}).click();assert.equal(await page.getByLabel('插件来源',{exact:true}).inputValue(),'');
 });
 await check('MCP unsaved route change protects the draft',async()=>{
  await page.getByRole('button',{name:'MCP 服务',exact:true}).click();await page.getByRole('button',{name:'新增服务',exact:true}).click();await page.getByLabel('MCP 名称',{exact:true}).fill('unsaved-mcp');
  await page.getByRole('button',{name:'技能',exact:true}).click();await page.getByRole('button',{name:'继续编辑',exact:true}).click();assert.equal(await page.getByLabel('MCP 名称',{exact:true}).inputValue(),'unsaved-mcp');await page.getByRole('button',{name:'技能',exact:true}).click();await page.getByRole('button',{name:'放弃修改并离开',exact:true}).click();await page.getByRole('heading',{name:'技能',exact:true}).waitFor();
 });
 await check('Provider Escape protects changed model fields and leaves only after discard',async()=>{
  await openModelEditor();await page.getByLabel('模型 ID',{exact:true}).fill('unsaved-provider');await page.keyboard.press('Escape');await page.getByRole('dialog',{name:'未保存的修改',exact:true}).waitFor();await page.getByRole('button',{name:'继续编辑',exact:true}).click();assert.equal(await page.getByLabel('模型 ID',{exact:true}).inputValue(),'unsaved-provider');await page.keyboard.press('Escape');await page.getByRole('button',{name:'放弃修改并离开',exact:true}).click();await page.getByLabel('模型 ID',{exact:true}).waitFor({state:'hidden'});
 });
 await check('Credential draft is protected without serializing the key',async()=>{
  await openModels();await page.getByText('应用认证',{exact:true}).click();await page.getByLabel('API Key',{exact:true}).fill('E2E-unsaved-not-a-real-secret');await page.getByRole('button',{name:'用量',exact:true}).click();await page.getByRole('button',{name:'继续编辑',exact:true}).click();assert.equal(await page.getByLabel('API Key',{exact:true}).inputValue(),'E2E-unsaved-not-a-real-secret');await page.getByRole('button',{name:'用量',exact:true}).click();await page.getByRole('button',{name:'放弃修改并离开',exact:true}).click();
 });
 await check('Credential form clears fake input on kernel acceptance',async()=>{
  await page.getByRole('button',{name:'用量',exact:true}).click();await openModels();await page.getByText('应用认证',{exact:true}).click();await page.getByLabel('API Key',{exact:true}).fill('E2E-dummy-not-a-real-secret');await page.getByRole('button',{name:'保存凭据',exact:true}).click();await page.getByText('凭据已保存，内核接受认证请求。重启应用后创建会话测试真实模型连接。',{exact:true}).waitFor();assert.equal(await page.getByLabel('API Key',{exact:true}).inputValue(),'');
 });
 await check('Provider save refuses pending approval without config or PID changes',async()=>{
  await page.getByRole('button',{name:'返回工作区',exact:true}).click();await page.locator('textarea.composer__input').fill('e2e:plan');await page.getByRole('button',{name:'发送',exact:true}).click();await page.getByRole('button',{name:'批准并执行',exact:true}).waitFor();const beforeConfig=await readFile(join(nofyHome,'config.json'),'utf8').catch(()=>null);const beforePids=[...new Set((await wire()).map(row=>row.pid))];await openSettings();await page.getByRole('button',{name:'用量',exact:true}).click();await openModelEditor();await page.getByLabel('模型 ID',{exact:true}).fill('blocked-approval-model');await page.getByLabel('显示名称',{exact:true}).fill('Blocked approval draft');await page.getByLabel('模型 API 地址',{exact:true}).fill('https://example.com/v1');await page.getByLabel('模型 API Key',{exact:true}).fill('E2E-blocked-key-not-real');await page.getByRole('button',{name:'保存模型配置',exact:true}).click();await page.locator('[role="status"]').filter({hasText:'请先停止运行中的任务并处理审批，再保存模型配置'}).waitFor();assert.equal(await page.getByLabel('模型 ID',{exact:true}).inputValue(),'blocked-approval-model');assert.equal(await page.getByLabel('显示名称',{exact:true}).inputValue(),'Blocked approval draft');assert.equal(await page.getByLabel('模型 API Key',{exact:true}).inputValue(),'E2E-blocked-key-not-real');assert.equal(await readFile(join(nofyHome,'config.json'),'utf8').catch(()=>null),beforeConfig);assert.deepEqual([...new Set((await wire()).map(row=>row.pid))],beforePids);await shot('provider-approval-refused');await page.keyboard.press('Escape');await page.getByRole('button',{name:'放弃修改并离开',exact:true}).click();await page.getByRole('button',{name:'返回工作区',exact:true}).click();await page.getByRole('button',{name:'批准并执行',exact:true}).click();await page.locator('textarea.composer__input').waitFor();await visibleBox('textarea.composer__input');await openSettings();return {configurationUnchanged:true,kernelPidsUnchanged:true,inputPreserved:true,approvalThenResolved:true};
 });
 await check('Provider native GUI saves isolated config and restarts one kernel',async()=>{
  await page.getByRole('button',{name:'用量',exact:true}).click();await openModelEditor();await page.getByLabel('模型 ID',{exact:true}).fill('gui-provider-model');await page.getByLabel('显示名称',{exact:true}).fill('GUI native provider model');await page.getByLabel('共享供应商 ID',{exact:true}).fill('gui-provider');await page.getByLabel('模型 API 地址',{exact:true}).fill('https://example.com/v1');await page.getByLabel('模型 API Key',{exact:true}).fill('E2E-provider-dummy-not-real');await page.getByLabel('API 协议',{exact:true}).selectOption('responses');await page.getByRole('button',{name:'保存模型配置',exact:true}).click();await page.getByText('模型配置已保存，内核已重新启动。请新建会话测试真实连接。',{exact:true}).waitFor({timeout:20000});assert.equal(await page.getByLabel('模型 API Key',{exact:true}).count(),0);const config=JSON.parse(await readFile(join(nofyHome,'config.json'),'utf8'));assert.equal(config.model['gui-provider-model'].model_provider,'gui-provider');assert.equal(config.model_providers['gui-provider'].api_backend,'responses');assert.equal(config.models.default,'gui-provider-model');assert.equal(config.model_providers['gui-provider'].api_key,'E2E-provider-dummy-not-real');assert.ok(!await page.locator('.set').innerText().then(text=>text.includes('E2E-provider-dummy-not-real')));const pids=new Set((await wire()).map(row=>row.pid));assert.equal(pids.size,2,'Exactly one replacement kernel');await shot('provider-native-saved');
 });
 await check('Provider stale revision refuses overwrite and preserves the form',async()=>{
  const path=join(nofyHome,'config.json');const external=JSON.parse(await readFile(path,'utf8'));external.ui={...(external.ui??{}),e2e_external_change:true};const externalBytes=JSON.stringify(external,null,2)+'\n';await writeFile(path,externalBytes);const externalHash=createHash('sha256').update(externalBytes).digest('hex');await openModelEditor();await page.getByLabel('模型 ID',{exact:true}).fill('stale-revision-model');await page.getByLabel('显示名称',{exact:true}).fill('Stale revision draft');await page.getByLabel('模型 API 地址',{exact:true}).fill('https://example.com/v1');await page.getByLabel('模型 API Key',{exact:true}).fill('E2E-stale-key-not-real');await page.getByRole('button',{name:'保存模型配置',exact:true}).click();await page.locator('[role="status"]').filter({hasText:'Config changed since it was opened. Reload before saving.'}).waitFor();assert.equal(await page.getByLabel('模型 ID',{exact:true}).inputValue(),'stale-revision-model');assert.equal(await page.getByLabel('显示名称',{exact:true}).inputValue(),'Stale revision draft');assert.equal(await page.getByLabel('模型 API Key',{exact:true}).inputValue(),'E2E-stale-key-not-real');const saved=await readFile(path,'utf8');assert.equal(createHash('sha256').update(saved).digest('hex'),externalHash);assert.equal(JSON.parse(saved).model['stale-revision-model'],undefined);await shot('provider-stale-refused');await page.getByRole('button',{name:'取消',exact:true}).first().click();await page.getByRole('button',{name:'放弃修改并离开',exact:true}).click();await page.getByRole('button',{name:'重新读取',exact:true}).filter({has:page.locator('svg')}).click();return {externalConfigurationHash:externalHash,externalConfigurationPreserved:true,inputPreserved:true};
 });
 await check('1024x768 dark/light approval replaces composer and restores it after completion',async()=>{
  await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setContentSize(1024,768));for(const theme of ['深色','浅色']){await appearance(theme);await visibleBox('textarea.composer__input');await page.locator('textarea.composer__input').fill('e2e:plan');await page.getByRole('button',{name:'发送',exact:true}).click();await page.getByRole('button',{name:'批准并执行',exact:true}).waitFor();assert.equal(await page.locator('textarea.composer__input').isVisible(),false);const approveButton=page.getByRole('button',{name:'批准并执行',exact:true});await approveButton.scrollIntoViewIfNeeded();const approve=await approveButton.boundingBox();assert.ok(approve&&approve.y+approve.height<=768);assert.ok(await approveButton.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===el||el.contains(hit);}), 'Approval action is obscured');await shot('1024-'+(theme==='深色'?'dark':'light')+'-plan');await page.getByRole('button',{name:'批准并执行',exact:true}).click();await page.locator('textarea.composer__input').waitFor();await visibleBox('textarea.composer__input');await openSettings();}
 });
}catch(error){report.cases.push({name:'GUI startup',status:'failed',error:String(error)});console.error(error);}finally{if(application)await application.close().catch(()=>{});report.finishedAt=new Date().toISOString();await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));const sanitized=(await wire().catch(()=>[])).map(row=>{if(row.frame.params?.key)row.frame.params.key='[REDACTED TEST VALUE]';return row;});await writeFile(join(output,'wire.jsonl'),sanitized.map(row=>JSON.stringify(row)).join('\n'));await rm(temp,{recursive:true,force:true});console.log('Report: '+join(output,'report.json'));}
if(report.cases.some(row=>row.status==='failed')||report.consoleErrors.length)process.exitCode=1;
