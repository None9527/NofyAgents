import WebSocket from 'ws';
const list = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const page = list.find(p => p.type === 'page' && p.title === 'ZCode');
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
ws.on('open', () => {
  ws.send(JSON.stringify({id:1, method:'Input.dispatchKeyEvent', params:{type:'rawKeyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27}}));
  setTimeout(()=>ws.send(JSON.stringify({id:2, method:'Input.dispatchKeyEvent', params:{type:'keyUp', key:'Escape', code:'Escape', windowsVirtualKeyCode:27}})), 60);
  setTimeout(()=>process.exit(0), 300);
});
