// FIX-WS expand probe: click Z-Image toggle, wait, dump sessions
import WebSocket from 'ws';
const list = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const page = list.find(p => p.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const pend = {};
const send = (method, params={}) => new Promise(r => { const m = ++id; pend[m] = r; ws.send(JSON.stringify({id:m, method, params})); });
const evalJs = (expression) => send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
ws.on('message', d => { const m = JSON.parse(d); if (m.id && pend[m.id]) { pend[m.id](m.result); delete pend[m.id]; } });
ws.on('open', async () => {
  await send('Runtime.enable');
  const target = process.argv[2] || '/home/none/Z-Image';
  let r = await evalJs(`(() => {
    const row = document.querySelector('[data-ws-enum-path="${target}"]');
    if (!row) return { found: false, all: [...document.querySelectorAll('[data-ws-enum-path]')].map(e => e.getAttribute('data-ws-enum-path')) };
    row.querySelector('[data-testid="ws-enum-workspace-toggle"]').click();
    return { found: true, clicked: true };
  })()`);
  console.log('click:', JSON.stringify(r.result?.value ?? r.exceptionDetails));
  await new Promise(res => setTimeout(res, 4000));
  r = await evalJs(`(() => {
    const row = document.querySelector('[data-ws-enum-path="${target}"]');
    if (!row) return { found: false };
    const sessions = [...row.querySelectorAll('[data-testid="ws-enum-session-row"]')].map(s => ({
      id: s.getAttribute('data-ws-enum-session-id'),
      text: s.textContent.trim().slice(0, 80),
    }));
    const empty = row.querySelector('[data-testid="ws-enum-sessions-empty"]');
    return { found: true, sessionRows: sessions.length, sessions: sessions.slice(0, 8), emptyText: empty ? empty.textContent.trim() : null };
  })()`);
  console.log('after:', JSON.stringify(r.result?.value ?? r.exceptionDetails, null, 1));
  ws.close(); process.exit(0);
});
