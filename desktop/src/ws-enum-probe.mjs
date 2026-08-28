// WS-ENUM probe: verify ACP workspace_list ext method against live kernel
import WebSocket from "ws";

const url = "ws://127.0.0.1:9800/ws?server-key=nofy-desktop";
const ws = new WebSocket(url);
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
    if (f.error) p.reject(new Error(JSON.stringify(f.error)));
    else p.resolve(f.result);
  }
});

ws.on("open", async () => {
  try {
    await rpc("initialize", {
      protocolVersion: 1,
      clientCapabilities: { fs: { readTextFile: false, writeTextFile: false }, elicitation: { form: {}, url: {} } },
      clientInfo: { name: "ws-enum-probe", version: "0.0.1" },
    });
    console.log("initialized");
    const res = await rpc("_nofy/session_summaries/workspace_list", {});
    const keys = Object.keys(res?.all_sessions ?? {});
    console.log("workspaces:", keys.length);
    for (const k of keys) {
      const sessions = res.all_sessions[k];
      console.log(`- ${k} (${sessions.length} sessions)`);
      for (const s of sessions.slice(0, 4)) {
        console.log(`    ${s.info?.id} | title=${JSON.stringify(s.generated_title ?? null)} | summary=${JSON.stringify((s.session_summary ?? "").slice(0, 40))} | updated=${s.updated_at}`);
      }
    }
    const zimg = res?.all_sessions?.["/home/none/Z-Image"];
    console.log("Z-Image target session:", JSON.stringify(zimg?.find((s) => s.info?.id === "01a03f76-a524-79a0-aede-7c5a91839ca7") ?? null, null, 1).slice(0, 800));
  } catch (e) {
    console.error("FAILED", e.message);
  } finally {
    ws.close();
    process.exit(0);
  }
});
ws.on("error", (e) => {
  console.error("ws error", e.message);
  process.exit(1);
});
