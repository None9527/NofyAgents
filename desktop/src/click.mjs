import WebSocket from 'ws';
const [,, x, y] = process.argv.map(Number);
const list = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const page = list.find(p => p.type === 'page'); // REBRAND: title-agnostic matcher after debrand
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0;
const send = (m, p={}) => ws.send(JSON.stringify({id:++id, method:m, params:p}));
ws.on('open', () => {
  send('Input.dispatchMouseEvent', {type:'mousePressed', x, y, button:'left', clickCount:1});
  setTimeout(()=>send('Input.dispatchMouseEvent', {type:'mouseReleased', x, y, button:'left', clickCount:1}), 80);
  setTimeout(()=>process.exit(0), 400);
});
