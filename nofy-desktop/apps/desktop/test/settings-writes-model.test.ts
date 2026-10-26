import { test } from 'node:test';
import assert from 'node:assert/strict';
import {mcpWriteParams,readHookRows,writeVerdict} from '../renderer/features/settings/settingsWritesModel.ts';
test('settings must inspect business status rather than RPC acceptance',()=>{
 assert.equal(writeVerdict({result:{status:'validation_error',message:'bad'}}).ok,false);
 assert.equal(writeVerdict({result:{status:'confirmation_required'}}).ok,false);
 assert.equal(writeVerdict({result:{status:'success',requiresReload:true}}).reload,true);
 assert.equal(writeVerdict({result:{ok:true}}).ok,true);
 assert.equal(writeVerdict({}).ok,false);
});
test('MCP write payload preserves snake fields and validates transport inputs',()=>{
 assert.deepEqual(mcpWriteParams({name:'服务-1',transport:'http',endpoint:'https://example.com/mcp',args:'[]',env:'{}'},'sid'),{session_id:'sid',server_name:'服务-1',enabled:true,url:'https://example.com/mcp'});
 assert.throws(()=>mcpWriteParams({name:'x',transport:'http',endpoint:'https://secret:token@example.com/mcp',args:'[]',env:'{}'},'sid'),/密码/);
 assert.throws(()=>mcpWriteParams({name:'x',transport:'stdio',endpoint:'node',args:'{}',env:'{}'},'sid'),/字符串数组/);
 assert.throws(()=>mcpWriteParams({name:'x',transport:'stdio',endpoint:'node',args:'[]',env:'{"X":1}'},'sid'),/字符串键值/);
 assert.deepEqual(mcpWriteParams({name:'x',transport:'stdio',endpoint:'node',args:'["a b"]',env:'{"X":"v"}'},'sid'),{session_id:'sid',server_name:'x',enabled:true,command:'node',args:['a b'],env:{X:'v'}});
});
test('hooks preserve scope source and disabled state',()=>{
 assert.deepEqual(readHookRows({result:{hooks:[{name:'project/test',event:'stop',sourceDir:'/p/.nofy',command:'echo test',disabled:true},{}]}}),[{name:'project/test',event:'stop',source:'/p/.nofy',handler:'echo test',disabled:true}]);
});
