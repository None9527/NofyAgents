import WebSocket from 'ws';
const expr = process.argv[2];
const list = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const page = list.find(p => p.type === 'page'); // REBRAND: title-agnostic matcher after debrand
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
let id=0; const pend={};
const send=(m,p={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p}));});
ws.on('message',d=>{const m=JSON.parse(d); if(m.id&&pend[m.id])pend[m.id](m.result);});
ws.on('open', async ()=>{
  const r = await send('Runtime.evaluate',{expression:expr, returnByValue:true});
  console.log(JSON.stringify(r.result?.value).slice(0,800));
  process.exit(0);
});
