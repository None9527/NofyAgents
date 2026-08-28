import WebSocket from 'ws';
const text = process.argv[2] || '用 bash 执行 echo nofy-ok';
const list = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const page = list.find(p => p.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const pend = {};
const send = (m, p={}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({id:i, method:m, params:p})); });
ws.on('message', d => { const m = JSON.parse(d); if (m.id && pend[m.id]) { pend[m.id](m.result); delete pend[m.id]; } });
const sleep = ms => new Promise(r => setTimeout(r, ms));
ws.on('open', async () => {
  const r = await send('Runtime.evaluate', {
    expression: `(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='发送'&&!b.disabled);if(!b)return null;const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`,
    returnByValue: true,
  });
  const pos = r.result?.value;
  console.log('sendbtn', JSON.stringify(pos));
  await send('Input.insertText', { text });
  await sleep(300);
  if (pos) {
    await send('Input.dispatchMouseEvent', {type:'mousePressed', x:pos.x, y:pos.y, button:'left', clickCount:1});
    await send('Input.dispatchMouseEvent', {type:'mouseReleased', x:pos.x, y:pos.y, button:'left', clickCount:1});
  }
  console.log('sent2');
  ws.close(); process.exit(0);
});
