import WebSocket from 'ws';
const out = [];
const list = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const page = list.find(p => p.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const pend = {};
const send = (m, p={}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({id:i, method:m, params:p})); });
ws.on('message', d => {
  const m = JSON.parse(d);
  if (m.id && pend[m.id]) { pend[m.id](m.result); delete pend[m.id]; return; }
  if (m.method === 'Runtime.consoleAPICalled' || m.method === 'Runtime.exceptionThrown') {
    const txt = m.method === 'Runtime.exceptionThrown'
      ? 'EXC: ' + (m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text || '')
      : 'CON[' + m.params.type + ']: ' + (m.params.args||[]).map(a => a.description || a.value || '').join(' ');
    out.push(txt.slice(0, 500));
  }
});
ws.on('open', async () => {
  await send('Runtime.enable');
  setTimeout(() => { require('fs').writeFileSync('/tmp/renderer-console.log', out.join('\n')); process.exit(0); }, Number(process.argv[2] || 45000));
});
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
