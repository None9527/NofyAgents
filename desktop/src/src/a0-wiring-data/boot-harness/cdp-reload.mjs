import WebSocket from '/Users/mac/nofy-build/desktop/src/node_modules/ws/wrapper.mjs';
const list = await (await fetch('http://127.0.0.1:9333/json/list')).json();
const page = list.find(p => p.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const pend = {};
const send = (method, params={}) => new Promise(r => { const m = ++id; pend[m] = r; ws.send(JSON.stringify({id:m, method, params})); });
ws.on('message', d => { const m = JSON.parse(d); if (m.id && pend[m.id]) { pend[m.id](m.result); delete pend[m.id]; } });
ws.on('open', async () => {
  await send('Page.enable');
  await send('Page.reload', { ignoreCache: true });
  console.log('reloaded');
  setTimeout(() => { ws.close(); process.exit(0); }, 2000);
});
