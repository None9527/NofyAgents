// WS-ENUM probe 2: session/list scope check
import WebSocket from "ws";
const ws = new WebSocket("ws://127.0.0.1:9800/ws?server-key=nofy-desktop");
let id = 0;
const pending = new Map();
function rpc(method, params) {
  const mid = ++id;
  return new Promise((resolve, reject) => {
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ jsonrpc: "2.0", id: mid, method, params }));
  });
}
ws.on("message", (data) => {
  const f = JSON.parse(String(data));
  if (f.id != null && pending.has(f.id)) {
    const p = pending.get(f.id);
    pending.delete(f.id);
    f.error ? p.reject(new Error(JSON.stringify(f.error))) : p.resolve(f.result);
  }
});
ws.on("open", async () => {
  try {
    await rpc("initialize", {
      protocolVersion: 1,
      clientCapabilities: { fs: { readTextFile: false, writeTextFile: false }, elicitation: { form: {}, url: {} } },
      clientInfo: { name: "probe2", version: "0.0.1" },
    });
    const res = await rpc("session/list", {});
    const sessions = res?.sessions ?? [];
    console.log("session/list total:", sessions.length);
    const cwds = new Set(sessions.map((s) => s.cwd));
    console.log("cwds:", [...cwds].join(" | "));
    console.log("sample:", JSON.stringify(sessions[0] ?? null).slice(0, 400));
    const zimg = sessions.filter((s) => s.cwd === "/home/none/Z-Image");
    console.log("Z-Image sessions in list:", zimg.length, zimg.map((s) => s.sessionId));
  } catch (e) {
    console.error("FAILED", e.message);
  } finally {
    ws.close();
    process.exit(0);
  }
});
ws.on("error", (e) => { console.error("ws error", e.message); process.exit(1); });
