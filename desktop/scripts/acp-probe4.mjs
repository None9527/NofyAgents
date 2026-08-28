// Probe round 4: verify session/cancel as a NOTIFICATION interrupts a live prompt,
// and capture the PromptResponse stopReason + final updates.
const url = process.argv[2] ?? "ws://127.0.0.1:9803/ws?server-key=nofy-desktop";
const ws = new WebSocket(url);
let nextId = 1;
const pending = new Map();
const frames = [];

function rpc(method, params, timeoutMs = 60000) {
  return new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, { resolve, method });
    ws.send(JSON.stringify({ jsonrpc: "2.0", id, method, params }));
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); resolve({ __timeout: true }); }
    }, timeoutMs);
  });
}
function notify(method, params) {
  ws.send(JSON.stringify({ jsonrpc: "2.0", method, params }));
}

ws.onmessage = (ev) => {
  let f; try { f = JSON.parse(String(ev.data)); } catch { return; }
  frames.push({ t: Date.now(), f });
  if (f.id != null && (f.result !== undefined || f.error !== undefined)) {
    const w = pending.get(f.id);
    if (!w) return;
    pending.delete(f.id);
    w.resolve(f.error ? { __error: f.error } : f.result);
  }
};

ws.onopen = async () => {
  await rpc("initialize", {
    protocolVersion: 1,
    clientCapabilities: { fs: { readTextFile: false, writeTextFile: false } },
    clientInfo: { name: "acp-probe4", version: "0.1.0" },
  });
  const sess = await rpc("session/new", { cwd: process.env.HOME + "/nofy-build", mcpServers: [] });
  const sid = sess.sessionId;
  console.log("session:", sid);

  const t0 = Date.now();
  const promptP = rpc("session/prompt", {
    sessionId: sid,
    prompt: [{ type: "text", text: "写一篇 3000 字的关于人工智能历史的文章，要非常详细。" }],
  });
  // let it stream for 4s then cancel
  await new Promise((r) => setTimeout(r, 4000));
  console.log("sending session/cancel NOTIFICATION at +4s");
  notify("session/cancel", { sessionId: sid });
  const res = await promptP;
  console.log("prompt settled after", Date.now() - t0, "ms:", JSON.stringify(res).slice(0, 500));

  const kinds = {};
  for (const { f } of frames) {
    if (f.method === "session/update") {
      const k = f.params?.update?.sessionUpdate;
      kinds[k] = (kinds[k] ?? 0) + 1;
    } else if (f.method) {
      kinds[f.method] = (kinds[f.method] ?? 0) + 1;
    }
  }
  console.log("frame kinds:", JSON.stringify(kinds, null, 1));
  await rpc("session/close", { sessionId: sid });
  ws.close();
  process.exit(0);
};
ws.onerror = () => { console.log("WS ERROR"); process.exit(2); };
setTimeout(() => { console.log("overall timeout"); process.exit(4); }, 90000);
