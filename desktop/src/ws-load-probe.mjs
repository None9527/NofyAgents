// probe session/load replay for Z-Image session
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
let updates = 0, replayed = false;
ws.on("message", (data) => {
  const f = JSON.parse(String(data));
  if (f.id != null && pending.has(f.id)) {
    const p = pending.get(f.id);
    pending.delete(f.id);
    f.error ? p.reject(new Error(JSON.stringify(f.error))) : p.resolve(f.result);
    return;
  }
  if (f.method === "session/update") {
    updates++;
    if (updates <= 3) console.log("update:", f.params?.update?.sessionUpdate, String(f.params?.sessionId).slice(0, 8));
  } else if (f.method === "_nofy/replayed") {
    replayed = true;
    console.log("replayed:", JSON.stringify(f.params));
  } else if (f.method) {
    console.log("notification:", f.method);
  }
});
ws.on("open", async () => {
  try {
    await rpc("initialize", {
      protocolVersion: 1,
      clientCapabilities: { fs: { readTextFile: false, writeTextFile: false }, elicitation: { form: {}, url: {} } },
      clientInfo: { name: "load-probe", version: "0.0.1" },
    });
    console.log("initialized");
    const t0 = Date.now();
    const res = await rpc("session/load", { sessionId: "01a03f76-a524-79a0-aede-7c5a91839ca7", cwd: "/home/none/Z-Image", mcpServers: [] });
    console.log("load result after", Date.now() - t0, "ms:", JSON.stringify(res).slice(0, 200));
    await new Promise((r) => setTimeout(r, 6000));
    console.log("total updates:", updates, "replayed:", replayed);
  } catch (e) {
    console.error("FAILED", e.message);
  } finally {
    ws.close();
    process.exit(0);
  }
});
ws.on("error", (e) => { console.error("ws error", e.message); process.exit(1); });
