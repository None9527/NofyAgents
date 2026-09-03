// A1-R128 DOM dump：root innerHTML 全文取证
import http from 'node:http';
import { WebSocket } from 'ws';
import fs from 'node:fs';

const port = Number(process.env.CDP_PORT || 9508);
const out = process.env.DUMP_OUT || '/tmp/a1r0/dom-dump.html';

function getJson(path) {
  return new Promise((res, rej) => {
    http.get({ host: '127.0.0.1', port, path }, (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
}

const targets = await getJson('/json');
const page = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
if (!page) { console.error('no page target'); process.exit(1); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const send = (method, params = {}) => new Promise((res, rej) => {
  const mid = ++id;
  pending.set(mid, { res, rej });
  ws.send(JSON.stringify({ id: mid, method, params }));
});
ws.on('message', (buf) => {
  const m = JSON.parse(String(buf));
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
  }
});
await new Promise((r) => ws.once('open', r));
await send('Runtime.enable');
const html = await send('Runtime.evaluate', {
  expression: `document.getElementById('root')?.innerHTML ?? ''`,
  returnByValue: true,
}).then((r) => r.result.value);
fs.writeFileSync(out, html);
console.log('dumped', html.length, 'chars to', out);
ws.close();
process.exit(0);
