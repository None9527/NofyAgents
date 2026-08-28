import WebSocket from 'ws';
const list = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const page = list.find(p => p.type === 'page' && p.title === 'ZCode');
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const pend = {};
const send = (m, p={}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({id:i, method:m, params:p})); });
ws.on('message', d => { const m = JSON.parse(d); if (m.id && pend[m.id]) { pend[m.id](m.result); } });
ws.on('open', async () => {
  const r = await send('Runtime.evaluate', { expression: `JSON.stringify({ready:document.readyState, zcode:typeof window.zcode, rootKids:document.getElementById('root')?.children.length, bodyCls:document.body.className, scripts:[...document.scripts].map(s=>s.src.split('/').pop()).slice(0,8)})`, returnByValue: true });
  console.log(r.result?.value);
  process.exit(0);
});
