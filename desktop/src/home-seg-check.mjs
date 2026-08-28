// HOME-SEG 验证脚本：Home 段选中态 + 扁平对话 list + 点击打开 + 项目段回归
import WebSocket from 'ws';
import fs from 'node:fs';

const shot = process.argv[2] || '/tmp/home-seg.png';
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
  return r?.result?.value ?? (r?.exceptionDetails ? { __exception: r.exceptionDetails.exception?.description } : null);
};
const screenshot = async (path) => {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path, Buffer.from(data, 'base64'));
  console.log('shot →', path);
};

ws.on('open', async () => {
  await send('Page.enable');
  await send('Runtime.enable');

  // 1) 分段状态 + 偏好 + Home list 概况
  const state = await evalJs(`(()=>{
    const tabs=[...document.querySelectorAll('[role="tab"]')].map(t=>({text:t.textContent.trim(),selected:t.getAttribute('aria-selected')||t.getAttribute('data-state')||'',value:t.getAttribute('value')||''}));
    const rows=[...document.querySelectorAll('[data-testid="home-conversation-row"]')].map(r=>({sid:r.getAttribute('data-home-session-id'),active:r.getAttribute('data-home-session-active'),text:r.textContent.trim().slice(0,40)}));
    const empty=!!document.querySelector('[data-testid="home-conversation-empty"]');
    const prefs=localStorage.getItem('zcode-sidebar-task-preferences');
    return {tabs,rows,empty,prefs,projectSection:!!document.querySelector('[data-testid="project-section"]'),workspaceList:!!document.querySelector('[data-testid="workspace-list"]')};
  })()`);
  console.log('STATE', JSON.stringify(state, null, 1));

  // 2) 若无会话：造一个（点 composer → 输字 → 点发送）
  if (state && state.rows.length === 0) {
    console.log('no sessions — creating one via composer');
    const focus = await evalJs(`(()=>{const c=document.querySelector('[contenteditable="true"]');if(!c)return null;c.focus();const r=c.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    if (focus) {
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: focus.x, y: focus.y, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: focus.x, y: focus.y, button: 'left', clickCount: 1 });
      await sleep(300);
    }
    await send('Input.insertText', { text: 'home-seg 冒烟：echo hi' });
    await sleep(400);
    const btn = await evalJs(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='发送'&&!b.disabled);if(!b)return null;const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    if (btn) {
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: btn.x, y: btn.y, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: btn.x, y: btn.y, button: 'left', clickCount: 1 });
    }
    console.log('sendbtn', JSON.stringify(btn));
    await sleep(6000);
    const after = await evalJs(`(()=>{const rows=[...document.querySelectorAll('[data-testid="home-conversation-row"]')].map(r=>({sid:r.getAttribute('data-home-session-id'),text:r.textContent.trim().slice(0,40)}));return {rows,empty:!!document.querySelector('[data-testid="home-conversation-empty"]')};})()`);
    console.log('AFTER-CREATE', JSON.stringify(after));
  }

  await screenshot(shot);

  // 3) 点击第一行 → 打开会话
  const first = await evalJs(`(()=>{const r=document.querySelector('[data-testid="home-conversation-row"]');if(!r)return null;r.click();return r.getAttribute('data-home-session-id');})()`);
  console.log('clicked row sid=', first);
  await sleep(2500);
  const opened = await evalJs(`(()=>{
    const activeRow=document.querySelector('[data-testid="home-conversation-row"][data-home-session-active="true"]');
    return {activeRowSid:activeRow?activeRow.getAttribute('data-home-session-id'):null,
      hasConversation:!!document.querySelector('[data-testid="conversation-view"], [data-conversation-view], [data-v4-pane]') || document.body.innerText.includes('home-seg 冒烟')};
  })()`);
  console.log('OPENED', JSON.stringify(opened));
  await screenshot(shot.replace(/\.png$/, '-opened.png'));

  // 4) 切 项目 段
  const toProject = await evalJs(`(()=>{const t=[...document.querySelectorAll('[role="tab"]')].find(t=>t.textContent.trim()==='项目'||t.textContent.trim()==='Project');if(!t)return null;t.click();return t.textContent.trim();})()`);
  console.log('switched to segment:', toProject);
  await sleep(1500);
  const proj = await evalJs(`(()=>({projectSection:!!document.querySelector('[data-testid="project-section"]'),workspaceList:!!document.querySelector('[data-testid="workspace-list"]'),prefs:localStorage.getItem('zcode-sidebar-task-preferences'),homeListStillThere:!!document.querySelector('[data-testid="home-conversation-list"]')}))()`);
  console.log('PROJECT-VIEW', JSON.stringify(proj));
  await screenshot(shot.replace(/\.png$/, '-project.png'));

  // 5) 切回 Home 段
  const toHome = await evalJs(`(()=>{const t=[...document.querySelectorAll('[role="tab"]')].find(t=>t.textContent.trim()==='Home');if(!t)return null;t.click();return t.textContent.trim();})()`);
  console.log('switched back to segment:', toHome);
  await sleep(1500);
  const home2 = await evalJs(`(()=>({rows:[...document.querySelectorAll('[data-testid="home-conversation-row"]')].length,prefs:localStorage.getItem('zcode-sidebar-task-preferences'),selected:[...document.querySelectorAll('[role="tab"]')].map(t=>t.textContent.trim()+':'+(t.getAttribute('aria-selected')||t.getAttribute('data-state')||''))}))()`);
  console.log('HOME-AGAIN', JSON.stringify(home2));
  await screenshot(shot.replace(/\.png$/, '-home-again.png'));

  ws.close();
  process.exit(0);
});
