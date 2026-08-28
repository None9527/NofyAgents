// HOME-SEG 最终验证（真实鼠标事件版）
import WebSocket from 'ws';
import fs from 'node:fs';

const base = process.argv[2] || '/tmp/home-seg-final';
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
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const evalJs = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true });
  return r?.result?.value ?? null;
};
const screenshot = async (path) => {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path, Buffer.from(data, 'base64'));
  console.log('shot →', path);
};
const clickAt = async (x, y) => {
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
};
const clickSelector = async (selector, filter) => {
  const pos = await evalJs(`(()=>{
    let els=[...document.querySelectorAll(${JSON.stringify(selector)})];
    ${filter ? `els=els.filter(${filter});` : ''}
    const el=els[0]; if(!el) return null;
    el.scrollIntoView({block:'center'});
    const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};
  })()`);
  if (!pos) return false;
  await sleep(150);
  await clickAt(pos.x, pos.y);
  return true;
};

ws.on('open', async () => {
  await send('Page.enable');

  // 0) 确保在 Home 段
  await clickSelector('[role="tab"]', '(e)=>e.textContent.trim()==="Home"');
  await sleep(1200);

  // 1) Home 段选中态 + 扁平 list
  const home = await evalJs(`(()=>({
    selected:[...document.querySelectorAll('[role="tab"]')].map(t=>t.textContent.trim()+':'+t.getAttribute('aria-selected')),
    rows:[...document.querySelectorAll('[data-testid="home-conversation-row"]')].length,
    firstRows:[...document.querySelectorAll('[data-testid="home-conversation-row"]')].slice(0,3).map(r=>r.textContent.trim().slice(0,48)),
    prefs:localStorage.getItem('zcode-sidebar-task-preferences'),
  }))()`);
  console.log('HOME', JSON.stringify(home, null, 1));
  await screenshot(base + '-1-home.png');

  // 2) 点击第一行 → 打开会话（复用任务打开路径）
  const sid = await evalJs(`document.querySelector('[data-testid="home-conversation-row"]')?.getAttribute('data-home-session-id') ?? null`);
  const okClick = await clickSelector('[data-testid="home-conversation-row"]');
  console.log('row clicked:', okClick, 'sid=', sid);
  await sleep(3000);
  const opened = await evalJs(`(()=>({
    activeRowSid:document.querySelector('[data-testid="home-conversation-row"][data-home-session-active="true"]')?.getAttribute('data-home-session-id') ?? null,
    paneActive:!!document.querySelector('[data-v4-pane][data-focused="true"], [data-focused="true"]'),
  }))()`);
  console.log('OPENED', JSON.stringify(opened));
  await screenshot(base + '-2-opened.png');

  // 3) 切 项目 段（回归）
  await clickSelector('[role="tab"]', '(e)=>e.textContent.trim()==="项目"||e.textContent.trim()==="Project"');
  await sleep(1500);
  const proj = await evalJs(`(()=>({
    selected:[...document.querySelectorAll('[role="tab"]')].map(t=>t.textContent.trim()+':'+t.getAttribute('aria-selected')),
    projectSection:!!document.querySelector('[data-testid="project-section"]'),
    workspaceList:!!document.querySelector('[data-testid="workspace-list"]'),
    homeListGone:!document.querySelector('[data-testid="home-conversation-list"]'),
    prefs:localStorage.getItem('zcode-sidebar-task-preferences'),
  }))()`);
  console.log('PROJECT', JSON.stringify(proj, null, 1));
  await screenshot(base + '-3-project.png');

  // 4) 切回 Home
  await clickSelector('[role="tab"]', '(e)=>e.textContent.trim()==="Home"');
  await sleep(1200);
  const home2 = await evalJs(`(()=>({
    selected:[...document.querySelectorAll('[role="tab"]')].map(t=>t.textContent.trim()+':'+t.getAttribute('aria-selected')),
    rows:[...document.querySelectorAll('[data-testid="home-conversation-row"]')].length,
  }))()`);
  console.log('HOME-AGAIN', JSON.stringify(home2));
  await screenshot(base + '-4-home-again.png');

  ws.close();
  process.exit(0);
});
