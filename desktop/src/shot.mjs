import WebSocket from 'ws';
import fs from 'node:fs';
const list = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const page = list.find(p => p.type === 'page'); // REBRAND: title-agnostic matcher after debrand
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const pend = {};
const send = (method, params={}) => new Promise(r => { const m = ++id; pend[m] = r; ws.send(JSON.stringify({id:m, method, params})); });
ws.on('message', d => { const m = JSON.parse(d); if (m.id && pend[m.id]) { pend[m.id](m.result); delete pend[m.id]; } });
ws.on('open', async () => {
  await send('Page.enable');
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(process.argv[2] || '/tmp/zrun.png', Buffer.from(data, 'base64'));
  console.log('shot ok'); ws.close(); process.exit(0);
});
