/** Hermetic settings probe: does not copy credentials or alter real config. */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getKernel } from '../main/acp/connection.ts';
import { createIsolatedNofyHome } from '../main/kernel/test-home.ts';
import { setKernelEnv, shutdownKernel, spawnKernelChild } from '../main/kernel/supervisor.ts';
const home = createIsolatedNofyHome();
const cwd = mkdtempSync(join(tmpdir(), 'nofy-settings-probe-'));
setKernelEnv({ ...process.env, HOME: home.path, NOFY_HOME: home.path });
const conn = getKernel();
const report: Record<string, unknown> = {};
async function probe(method: string, params: unknown, label = method) {
  try { const value = await conn.ext(method, params, 10_000); report[label] = value; return value; }
  catch (error) { report[label] = { error: error instanceof Error ? error.message : String(error) }; return null; }
}
try {
  conn.attachChild(spawnKernelChild());
  await conn.ready(20_000);
  await probe('_nofy/auth/info', {});
  await probe('_nofy/setApiKey', { key:'settings-probe-dummy-not-real' });
  try { report['authenticate'] = await conn.rpc('authenticate', {methodId:'api_key'}, 10_000); }
  catch(error) { report['authenticate'] = {error: error instanceof Error ? error.message : String(error)}; }
  const created = await conn.rpc('session/new', { cwd, mcpServers: [] }, 20_000) as {sessionId:string};
  const sid = created.sessionId;
  await probe('_nofy/internal/reload_models',{},'models.reload');
  await probe('_nofy/auth/info',{},'auth.readback');
  await probe('_nofy/hooks/list', {sessionId:sid});
  await probe('_nofy/bundle/status',{},'bundle.status');
  await probe('_nofy/mcp/upsert', {session_id:sid,server_name:'settings-probe',url:'http://127.0.0.1:1/mcp'});
  await probe('_nofy/mcp/list', {sessionId:sid});
  await probe('_nofy/mcp/toggle', {session_id:sid,server_name:'settings-probe',enabled:false});
  await probe('_nofy/mcp/upsert',{session_id:sid,server_name:'settings-setup-probe',url:'http://127.0.0.1:1/mcp',setup:{fields:[{id:'region',label:'Region',type:'select',required:true,options:[{label:'Test',value:'test'}]}]}},'mcp.setup_upsert');
  await probe('_nofy/mcp/auth_trigger',{session_id:sid,server_name:'settings-setup-probe'},'mcp.auth_trigger');
  await probe('_nofy/mcp/setup',{sessionId:sid,serverName:'settings-setup-probe',values:{region:'test'}},'mcp.setup');
  await probe('_nofy/mcp/delete',{session_id:sid,server_name:'settings-setup-probe'},'mcp.setup_delete');
  await probe('_nofy/mcp/delete', {session_id:sid,server_name:'settings-probe'});
  const pluginDir=join(cwd,'test-plugin');
  mkdirSync(pluginDir);
  writeFileSync(join(pluginDir,'plugin.json'),JSON.stringify({name:'settings-test-plugin',version:'1.0.0',description:'Hermetic test plugin'}));
  await probe('_nofy/plugins/action',{sessionId:sid,action:{type:'install',source:pluginDir}},'plugin.install');
  await probe('_nofy/plugins/action',{sessionId:sid,action:{type:'reload'}},'plugin.reload');
  const listed=await probe('_nofy/plugins/list',{sessionId:sid},'plugin.list') as {result?:{plugins?:{id:string}[]}}|null;
  const pluginId=listed?.result?.plugins?.[0]?.id??'settings-test-plugin';
  await probe('_nofy/plugins/action',{sessionId:sid,action:{type:'disable',plugin_id:pluginId}},'plugin.disable');
  await probe('_nofy/plugins/list',{sessionId:sid},'plugin.disabled.readback');
  await probe('_nofy/plugins/action',{sessionId:sid,action:{type:'enable',plugin_id:pluginId}},'plugin.enable');
  await probe('_nofy/plugins/list',{sessionId:sid},'plugin.enabled.readback');
  await probe('_nofy/plugins/action',{sessionId:sid,action:{type:'uninstall',plugin_id:pluginId,confirmed:false}},'plugin.uninstall');
  await probe('_nofy/plugins/action',{sessionId:sid,action:{type:'reload'}},'plugin.uninstall.reload');
  await probe('_nofy/plugins/list',{sessionId:sid},'plugin.uninstalled.readback');
  await probe('_nofy/mcp/list',{sessionId:sid},'mcp.deleted.readback');
  await probe('_nofy/setApiKey', {key:''});
  const hooks = report['_nofy/hooks/list'] as {result?:{hooks?:unknown[]}} | undefined;
  if (hooks?.result?.hooks) report['_nofy/hooks/list'] = { result: { hooksCount: hooks.result.hooks.length } };
  writeFileSync(join(import.meta.dirname,'../../../docs/contract/settings-write-probe.json'), JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
  for (const label of ['plugin.install','plugin.reload','plugin.disable','plugin.enable','plugin.uninstall','plugin.uninstall.reload']) assert.equal((report[label] as {result:{status:string}}).result.status,'success',label);
  assert.equal((report['plugin.disabled.readback'] as {result:{plugins:{enabled:boolean}[]}}).result.plugins[0]?.enabled,false);
  assert.equal((report['plugin.enabled.readback'] as {result:{plugins:{enabled:boolean}[]}}).result.plugins[0]?.enabled,true);
  assert.equal((report['plugin.uninstalled.readback'] as {result:{plugins:unknown[]}}).result.plugins.length,0);
  assert.equal((report['mcp.deleted.readback'] as {result:{servers:unknown[]}}).result.servers.length,0);
  process.exitCode=0;
} finally { conn.close(); shutdownKernel(); home.cleanup(); rmSync(cwd,{recursive:true,force:true}); }
