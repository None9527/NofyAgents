// FIX-WS inspect: dump ws-enum sidebar state via CDP
import WebSocket from 'ws';
const list = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const page = list.find(p => p.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const pend = {};
const send = (method, params={}) => new Promise(r => { const m = ++id; pend[m] = r; ws.send(JSON.stringify({id:m, method, params})); });
ws.on('message', d => { const m = JSON.parse(d); if (m.id && pend[m.id]) { pend[m.id](m.result); delete pend[m.id]; } });
ws.on('open', async () => {
  await send('Runtime.enable');
  const expr = `(() => {
    const rows = [...document.querySelectorAll('[data-testid="ws-enum-workspace-row"]')].map(r => {
      const path = r.getAttribute('data-ws-enum-path');
      const toggle = r.querySelector('[data-testid="ws-enum-workspace-toggle"]');
      const count = toggle ? toggle.textContent.trim().split('\\n').pop() : '?';
      const sessions = [...r.querySelectorAll('[data-testid="ws-enum-session-row"]')].map(s => ({
        id: s.getAttribute('data-ws-enum-session-id'),
        title: s.textContent.trim().slice(0, 60),
      }));
      const empty = r.querySelector('[data-testid="ws-enum-sessions-empty"]');
      return { path, count, sessionRows: sessions.length, sessions: sessions.slice(0, 5), emptyText: empty ? empty.textContent.trim() : null };
    });
    const seg = [...document.querySelectorAll('[role="tab"], button')].map(b => b.getAttribute('aria-selected') + ':' + b.textContent.trim()).filter(t => t.includes('true') || /项目|Home|home/.test(t)).slice(0, 10);
    return { wsEnumRows: rows, segmentHints: seg };
  })()`;
  const { result, exceptionDetails } = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  if (exceptionDetails) console.log('EXCEPTION:', JSON.stringify(exceptionDetails).slice(0, 800));
  console.log(JSON.stringify(result.value ?? null, null, 1));
  ws.close(); process.exit(0);
});
