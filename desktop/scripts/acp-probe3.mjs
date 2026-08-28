// Probe round 3: cancel/rewind discovery + session/load replay behavior.
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
const short = (v, n = 700) => {
  const s = JSON.stringify(v);
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
  if (f.method) pushes.push(f);
};

ws.onopen = async () => {
  await rpc("initialize", {
    protocolVersion: 1,
    clientCapabilities: { fs: { readTextFile: true, writeTextFile: true } },
    clientInfo: { name: "acp-probe3", version: "0.1.0" },
  });

  // cancel-family discovery on a bogus id: -32601 = no such method, anything else = method exists
  const cancelCandidates = [
    "session/abort", "session/kill", "session/terminate", "session/ctrl_c",
    "_nofy/cancel", "_nofy/stop", "_nofy/session/abort", "_nofy/session/interrupt",
    "_nofy/rewind", "session/rewind", "_nofy/session/rewind", "_nofy/cancel_rewind",
    "session/read", "_nofy/session/read", "_nofy/transcript", "_nofy/session/transcript",
    "_nofy/session_summaries/get", "_nofy/session/title", "session/rename",
    "_nofy/permission/respond", "_nofy/hooks/respond", "_nofy/hook/respond",
  ];
  for (const m of cancelCandidates) {
    const r = await rpc(m, { sessionId: "bogus" });
    const verdict = r && r.__error && r.__error.code === -32601 ? "ABSENT" : "EXISTS";
    console.log(`${verdict}  ${m}  ::  ${short(r, 220)}`);
  }

  // replay: load a real existing session and watch what comes back
  const list = await rpc("session/list", {});
  const target = (list.sessions ?? []).find((s) => s._meta?.["nofy/session"]?.kind === "build");
  console.log("\n== loading session:", target?.sessionId, target?.title);
  if (target) {
    const before = pushes.length;
    const load = await rpc("session/load", { sessionId: target.sessionId, cwd: target.cwd, mcpServers: [] }, 15000);
    console.log("== session/load result ==", short(load, 1500));
    await new Promise((r) => setTimeout(r, 4000));
    const replayed = pushes.slice(before);
    const kinds = {};
    for (const p of replayed) {
      const k = p.method === "session/update" ? `session/update:${p.params?.update?.sessionUpdate}` : p.method;
      kinds[k] = (kinds[k] ?? 0) + 1;
    }
    console.log("== frames after load ==", replayed.length, JSON.stringify(kinds, null, 1));
    // sample first few history chunks
    const hist = replayed.filter((p) => p.method === "session/update").slice(0, 4);
    for (const h of hist) console.log("sample:", short(h.params?.update, 400));
    await rpc("session/close", { sessionId: target.sessionId });
  }
  ws.close();
  process.exit(0);
};
ws.onerror = () => { console.log("WS ERROR"); process.exit(2); };
setTimeout(() => { console.log("overall timeout"); process.exit(4); }, 120000);
