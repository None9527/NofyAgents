// CDP console capture for the zfork Electron shell.
// Usage: node scripts/cdp-console.mjs [port] [seconds]
// Subscribes to console + exception events, reloads the page, prints events.
const port = Number(process.argv[2] ?? 9333);
const seconds = Number(process.argv[3] ?? 12);

const list = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json());
const page = list.find((t) => t.type === "page") ?? list[0];
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
}

ws.onmessage = (ev) => {
  const msg = JSON.parse(String(ev.data));
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
    return;
  }
  if (msg.method === "Runtime.consoleAPICalled") {
    const text = (msg.params.args ?? [])
      .map((a) => a.value ?? a.description ?? a.unserializableValue ?? "")
      .join(" ")
      .slice(0, 500);
    console.log(`[console.${msg.params.type}] ${text}`);
  } else if (msg.method === "Runtime.exceptionThrown") {
    const d = msg.params.exceptionDetails;
    console.log(`[exception] ${d.text} ${d.exception?.description ?? ""}`.slice(0, 600));
  } else if (msg.method === "Log.entryAdded") {
    console.log(`[log.${msg.params.entry.level}] ${msg.params.entry.text}`.slice(0, 400));
  }
};

ws.onopen = async () => {
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Page.enable");
  if (process.argv[4] !== "noreload") await send("Page.reload", { ignoreCache: true });
  setTimeout(() => {
    ws.close();
    process.exit(0);
  }, seconds * 1000);
};
