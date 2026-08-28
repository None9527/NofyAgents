import WebSocket from 'ws';
const list = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const page = list.find((p) => p.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0;
const pend = {};
const send = (method, params = {}) =>
  new Promise((r) => {
    const m = ++id;
    pend[m] = r;
    ws.send(JSON.stringify({ id: m, method, params }));
  });
ws.on('message', (d) => {
  const m = JSON.parse(d);
  if (m.id && pend[m.id]) {
    pend[m.id](m.result);
    delete pend[m.id];
  }
  if (m.method === 'Runtime.consoleAPICalled') {
    const txt = (m.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
    console.log('[console]', m.params.type, txt.slice(0, 300));
  }
  if (m.method === 'Runtime.exceptionThrown') {
    console.log('[EXCEPTION]', JSON.stringify(m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text || '').slice(0, 500));
  }
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
ws.on('open', async () => {
  await send('Runtime.enable');
  // 检查 Home tab 元素细节
  const r = await send('Runtime.evaluate', {
    expression: `(()=>{const t=[...document.querySelectorAll('[role="tab"]')].find(t=>t.textContent.trim()==='Home');if(!t)return null;return {tag:t.tagName,disabled:t.disabled,attrs:[...t.attributes].map(a=>a.name+'='+a.value).join(' '),rect:(()=>{const r=t.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})()};})()`,
    returnByValue: true,
  });
  console.log('HOME TAB', JSON.stringify(r.result?.value, null, 1));
  // 真实鼠标点击
  const pos = r.result?.value?.rect;
  if (pos) {
    const x = pos.x + pos.w / 2, y = pos.y + pos.h / 2;
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    await sleep(1200);
    const r2 = await send('Runtime.evaluate', {
      expression: `(()=>({prefs:localStorage.getItem('zcode-sidebar-task-preferences'),selected:[...document.querySelectorAll('[role="tab"]')].map(t=>t.textContent.trim()+':'+(t.getAttribute('aria-selected')||t.getAttribute('data-state')||'')),rows:[...document.querySelectorAll('[data-testid="home-conversation-row"]')].length,empty:!!document.querySelector('[data-testid="home-conversation-empty"]')}))()`,
      returnByValue: true,
    });
    console.log('AFTER REAL CLICK', JSON.stringify(r2.result?.value));
  }
  await sleep(500);
  ws.close();
  process.exit(0);
});
