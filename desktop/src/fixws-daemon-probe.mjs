// FIX-WS probe: daemon workspace_list ground truth
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
      clientInfo: { name: "fixws-probe", version: "0.0.1" },
    });
    const res = await rpc("_nofy/session_summaries/workspace_list", {});
    const all = res?.all_sessions ?? {};
    const keys = Object.keys(all);
    console.log("workspace_list workspaces:", keys.length);
    for (const k of keys.filter((k) => !k.startsWith("/tmp"))) {
      console.log(" -", k, "sessions:", (all[k] ?? []).length);
    }
    const zimg = all["/home/none/Z-Image"] ?? [];
    for (const s of zimg) {
      console.log("ZIMG:", s?.info?.id, "| gen:", JSON.stringify(s?.generated_title ?? null), "| sum:", JSON.stringify((s?.session_summary ?? "").slice(0, 40)), "| upd:", s?.updated_at);
    }
  } catch (e) {
    console.error("FAILED", e.message);
  } finally {
    ws.close();
    process.exit(0);
  }
});
ws.on("error", (e) => { console.error("ws error", e.message); process.exit(1); });
