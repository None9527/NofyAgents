// Probe round 2: cancel-method discovery, close/resume, set_mode on real session,
// full initialize + session/new model payload.
const url = process.argv[2] ?? "ws://127.0.0.1:9803/ws?server-key=nofy-desktop";
const ws = new WebSocket(url);
let nextId = 1;
const pending = new Map();
const pushes = [];

function rpc(method, params, timeoutMs = 6000) {
  return new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, { resolve });
    ws.send(JSON.stringify({ jsonrpc: "2.0", id, method, params }));
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); resolve({ __timeout: true }); }
    }, timeoutMs);
  });
}
const short = (v, n = 1500) => {
  const s = JSON.stringify(v, null, 1);
  return s.length > n ? s.slice(0, n) + "…" : s;
};

ws.onmessage = (ev) => {
  let f; try { f = JSON.parse(String(ev.data)); } catch { return; }
  if (f.id != null && (f.result !== undefined || f.error !== undefined)) {
    const w = pending.get(f.id);
    if (!w) return;
    pending.delete(f.id);
    w.resolve(f.error ? { __error: f.error } : f.result);
    return;
  }
  if (f.method) pushes.push({ m: f.method, p: short(f.params, 300) });
};

ws.onopen = async () => {
  const init = await rpc("initialize", {
    protocolVersion: 1,
    clientCapabilities: { fs: { readTextFile: true, writeTextFile: true } },
    clientInfo: { name: "acp-probe2", version: "0.1.0" },
  });
  console.log("== FULL initialize ==");
  console.log(short(init, 6000));

  const sess = await rpc("session/new", { cwd: process.env.HOME + "/nofy-build", mcpServers: [] });
  console.log("== FULL session/new ==");
  console.log(short(sess, 8000));
  const sid = sess.sessionId;

  const probes = [
    ["session/cancel", { sessionId: sid }],
    ["session/stop", { sessionId: sid }],
    ["session/interrupt", { sessionId: sid }],
    ["_nofy/session/cancel", { sessionId: sid }],
    ["session/set_mode", { sessionId: sid, modeId: "default" }],
    ["session/set_model", { sessionId: sid, modelId: "qwen3.8-max" }],
    ["session/resume", { sessionId: sid, mcpServers: [] }],
    ["session/close", { sessionId: sid }],
    ["session/subscribe", { sessionId: sid }],
    ["_nofy/session/history", { sessionId: sid }],
    ["_nofy/session/messages", { sessionId: sid }],
    ["_nofy/session/replay", { sessionId: sid }],
  ];
  for (const [m, p] of probes) {
    console.log(`== ${m} ==`);
    console.log(short(await rpc(m, p), 1200));
  }
  console.log("== pushes ==");
  for (const x of pushes.slice(0, 40)) console.log(x.m, "::", x.p);
  ws.close();
  process.exit(0);
};
ws.onerror = () => { console.log("WS ERROR"); process.exit(2); };
setTimeout(() => { console.log("overall timeout"); process.exit(4); }, 90000);
