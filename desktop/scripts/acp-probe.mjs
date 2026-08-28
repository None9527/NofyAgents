// Live ACP capability probe against a running `nofy agent serve`.
// Calls a list of candidate methods with minimal params and records
// result vs error (method-not-found vs invalid-params tells us existence).
const url = process.argv[2] ?? "ws://127.0.0.1:9803/ws?server-key=nofy-desktop";
const ws = new WebSocket(url);
let nextId = 1;
const pending = new Map();
const serverPushes = [];

function rpc(method, params, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, { resolve });
    ws.send(JSON.stringify({ jsonrpc: "2.0", id, method, params }));
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        resolve({ __timeout: true });
      }
    }, timeoutMs);
  });
}

function short(v) {
  const s = JSON.stringify(v);
  return s.length > 400 ? s.slice(0, 400) + "…" : s;
}

ws.onmessage = (ev) => {
  let frame;
  try { frame = JSON.parse(String(ev.data)); } catch { return; }
  if (frame.id != null && (frame.result !== undefined || frame.error !== undefined)) {
    const w = pending.get(frame.id);
    if (!w) return;
    pending.delete(frame.id);
    w.resolve(frame.error ? { __error: frame.error } : frame.result);
    return;
  }
  if (frame.method) serverPushes.push(frame.method);
};

ws.onopen = async () => {
  const init = await rpc("initialize", {
    protocolVersion: 1,
    clientCapabilities: { fs: { readTextFile: true, writeTextFile: true } },
    clientInfo: { name: "acp-probe", version: "0.1.0" },
  });
  console.log("== initialize ==");
  console.log(short(init));

  const probes = [
    ["session/list", {}],
    ["session/list", { cwd: process.env.HOME }],
    ["session/new", { cwd: process.env.HOME + "/nofy-build", mcpServers: [] }],
    ["session/load", { sessionId: "nonexistent", cwd: process.env.HOME }],
    ["session/set_mode", { sessionId: "x", modeId: "default" }],
    ["session/set_model", { sessionId: "x", modelId: "qwen3.8-max" }],
    ["session/cancel", { sessionId: "x" }],
    ["session/prompt", { sessionId: "x", prompt: [] }],
    ["authenticate", { methodId: "oauth" }],
    ["fs/read_text_file", { path: "/etc/hosts", line: 0, limit: 1 }],
    ["terminal/create", {}],
    ["_nofy/session_summaries/workspace_list", {}],
    ["_nofy/sessions/changed", {}],
    ["_nofy/config/read", {}],
    ["_nofy/config/write", {}],
    ["_nofy/models/list", {}],
    ["config/get", {}],
    ["models/list", {}],
  ];
  for (const [method, params] of probes) {
    const r = await rpc(method, params);
    console.log(`== ${method} ${short(params)} ==`);
    console.log(short(r));
  }
  console.log("== server pushes seen during probe ==");
  console.log(JSON.stringify([...new Set(serverPushes)]));
  ws.close();
  process.exit(0);
};

ws.onerror = () => { console.log("WS ERROR"); process.exit(2); };
setTimeout(() => { console.log("overall timeout"); process.exit(4); }, 120000);
