import WebSocket from 'ws';
const [,, key, code, vk, mods] = process.argv.map(Number);
const list = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const page = list.find(p => p.type === 'page' && p.title === 'ZCode');
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
ws.on('open', () => {
  ws.send(JSON.stringify({id:1, method:'Input.dispatchKeyEvent', params:{type:'rawKeyDown', modifiers:mods, key:String.fromCharCode(key+96||98), code:String(code)||'KeyB', windowsVirtualKeyCode:vk, modifiers_:mods}}));
  setTimeout(()=>ws.send(JSON.stringify({id:2, method:'Input.dispatchKeyEvent', params:{type:'keyUp', modifiers:mods, key:'b', code:'KeyB', windowsVirtualKeyCode:vk}})), 80);
  setTimeout(()=>process.exit(0), 350);
});
