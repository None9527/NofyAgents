import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readMcpServers} from '../renderer/ui/readers.ts';
test('MCP live session enable state overrides configured/catalog enable defaults',()=>{
 const servers=readMcpServers({result:{servers:[{name:'disabled-live',enabled:true,session:{enabled:false,status:'ready'}},{name:'enabled-live',enabled:false,session:{enabled:true}},{name:'legacy-disabled',enabled:false},{name:'default'}]}});
 assert.deepEqual(servers.map(server=>server.enabled),[false,true,false,true]);
 assert.equal(servers[0]?.status,'ready');
});
