import WebSocket from 'ws';
const list = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const page = list.find(p => p.type === 'page'); // REBRAND: title-agnostic matcher after debrand
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
ws.on('open', () => { ws.send(JSON.stringify({id:1, method:'Page.reload', params:{}})); setTimeout(()=>process.exit(0),1500); });
