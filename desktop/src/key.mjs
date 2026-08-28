import WebSocket from 'ws';
const [,, vk, mods, key, code] = process.argv.map(Number);
const list = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const page = list.find(p => p.type === 'page' && p.title === 'ZCode');
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
await new Promise(r=>ws.on('open',r));
ws.send(JSON.stringify({id:1,method:'Input.dispatchKeyEvent',params:{type:'rawKeyDown',modifiers:mods,windowsVirtualKeyCode:vk,key:code?'':'',code:code?'':''}}));
setTimeout(()=>{ws.send(JSON.stringify({id:2,method:'Input.dispatchKeyEvent',params:{type:'keyUp',modifiers:mods,windowsVirtualKeyCode:vk}}));},70);
setTimeout(()=>process.exit(0),300);
