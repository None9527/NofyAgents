#!/usr/bin/env node
/** Isolated file-workspace ACP fixture. Reads no credentials or real project files. */
import { createInterface } from 'node:readline';
import { appendFileSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
if (!process.env.NOFY_E2E_LOG || !process.env.NOFY_HOME) throw new Error('Isolation required');
const cwd = process.env.NOFY_WORKSPACE;
const sessions = new Map(); let next = 0;
const reply = (id, result) => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
const session = id => ({ sessionId: id, models: { currentModelId: 'fixture', availableModels: [{ modelId: 'fixture', name: 'Fixture' }] }, _meta: { currentWorkingDirectory: cwd, 'nofy/sessionDetail': { sessionId: id, cwd, title: `Workspace ${next}`, kind: 'build' } } });
createInterface({ input: process.stdin }).on('line', line => {
  const f = JSON.parse(line), p = f.params ?? {};
  appendFileSync(process.env.NOFY_E2E_LOG, JSON.stringify({ pid: process.pid, frame: f }) + '\n');
  if (f.method === 'initialize') reply(f.id, { protocolVersion: 1, agentCapabilities: { loadSession: true, promptCapabilities: { embeddedContext: true } }, authMethods: [] });
  else if (f.method === 'session/new') { const id = `workspace-${++next}`; sessions.set(id, { sessionId: id, cwd, title: `Workspace ${next}`, activity: 'idle', resident: true }); reply(f.id, session(id)); }
  else if (f.method === 'session/load') reply(f.id, session(p.sessionId));
  else if (f.method === '_nofy/sessions/list') reply(f.id, { sessions: [...sessions.values()] });
  else if (f.method === '_nofy/fs/list') reply(f.id, { result: { nodes: [...new Set(['A.md', 'B.ts',...readdirSync(p.path)])].map(name => ({ name, path: join(p.path, name), type: 'file' })), truncated: false } });
  else if (f.method === '_nofy/fs/read_file') {
    if (p.path.endsWith('Live.txt')) { try { const content=readFileSync(p.path,'utf8');reply(f.id,{result:{content,size:content.length,lineCount:1,type:'text'}}); } catch { process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:f.id,error:{code:-32000,message:'File was deleted'}})+'\n'); } return; }
    const a = p.path.endsWith('A.md');
    setTimeout(() => reply(f.id, { result: { content: a ? '# LATE A CONTENT\n\n' + Array.from({length:120},(_,i)=>'Paragraph '+i+' for scrolling.').join('\n\n') : 'ACTIVE B CONTENT', size: 16, lineCount: 1, type: 'text' } }), a ? 450 : 15);
  } else if (f.method === '_nofy/search/fuzzy/open') process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: f.id, error: { code: -32000, message: 'Workspace search unavailable' } }) + '\n');
  else if (f.id !== undefined) reply(f.id, {});
});
