import WebSocket from '/Users/mac/nofy-build/desktop/src/node_modules/ws/wrapper.mjs';
import fs from 'node:fs';
const PORT = process.env.CDP_PORT || 9333;
const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = list.find(p => p.type === 'page');
if (!page) { console.error('no page target'); process.exit(1); }
console.log('PAGE URL:', page.url);
const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
let id = 0; const pend = {};
const send = (method, params={}) => new Promise(r => { const m = ++id; pend[m] = r; ws.send(JSON.stringify({id:m, method, params})); });
const events = [];
ws.on('message', d => { const m = JSON.parse(d);
  if (m.id && pend[m.id]) { pend[m.id](m.result); delete pend[m.id]; return; }
  if (m.method === 'Runtime.consoleAPICalled') events.push('[console.'+m.params.type+'] ' + (m.params.args||[]).map(a=>a.value??a.description??a.unserializableValue??'').join(' ').slice(0,400));
  if (m.method === 'Runtime.exceptionThrown') events.push('[EXCEPTION] ' + JSON.stringify(m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text || m.params.exceptionDetails).slice(0,600));
  if (m.method === 'Log.entryAdded') events.push('[log.'+m.params.entry.level+'] ' + (m.params.entry.text||'').slice(0,300));
  if (m.method === 'Runtime.javascriptExceptionThrown') events.push('[js-exception] ' + m.params.text);
});
ws.on('open', async () => {
  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  await new Promise(r => setTimeout(r, 4000)); // collect late console
  const ev = (expr) => send('Runtime.evaluate', { expression: expr, returnByValue: true }).then(r => r?.result?.value ?? JSON.stringify(r));
  console.log('== DOM STATE ==');
  console.log('root children:', await ev(`document.getElementById('root')?.childElementCount`));
  console.log('root innerHTML length:', await ev(`document.getElementById('root')?.innerHTML?.length`));
  console.log('body classes:', await ev(`document.body.className`));
  console.log('loading overlay present:', await ev(`!!document.getElementById('loading')`));
  console.log('html classes:', await ev(`document.documentElement.className`));
  console.log('zcode bridge:', await ev(`typeof window.zcode`));
  console.log('launch marks:', await ev(`JSON.stringify(window.__ZCODE_LAUNCH_MARKS__||null).slice(0,120)`));
  console.log('renderer start ts:', await ev(`window.__ZCODE_RENDERER_START__ > 0`));
  console.log('react commit at:', await ev(`window.__ZCODE_REACT_COMMIT_AT__ > 0`));
  console.log('first root subtree:', await ev(`(function(){const r=document.getElementById('root'); if(!r||!r.firstElementChild) return '(empty)'; const el=r.firstElementChild; return el.tagName+'.'+(el.className||'').toString().slice(0,120);})()`));
  console.log('visible text sample:', await ev(`(function(){const r=document.getElementById('root'); return r? r.innerText.replace(/\\s+/g,' ').slice(0,300):'(no root)';})()`));
  console.log('== EVENTS (' + events.length + ') ==');
  for (const e of events.slice(0, 60)) console.log(e);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('/tmp/a0-s5-boot/boot-shot-1.png', Buffer.from(shot.data, 'base64'));
  console.log('screenshot saved /tmp/a0-s5-boot/boot-shot-1.png');
  ws.close(); process.exit(0);
});
setTimeout(() => { console.error('timeout'); process.exit(2); }, 30000);
