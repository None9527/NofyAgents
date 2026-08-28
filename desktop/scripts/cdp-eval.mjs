// Tiny CDP evaluator for the zfork Electron shell.
// Usage: node scripts/cdp-eval.mjs [port] '<expression>'
// Connects to the first page target and prints the evaluation result.
const port = Number(process.argv[2] ?? 9333);
const expr = process.argv[3] ?? "document.title";

const list = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json());
const page = list.find((t) => t.type === "page") ?? list[0];
if (!page) {
  console.error("no target");
  process.exit(1);
}

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
  }
};

ws.onopen = async () => {
  try {
    const res = await send("Runtime.evaluate", {
      expression: `(async()=>{ return ${expr}; })()`,
      awaitPromise: true,
      returnByValue: true,
      timeout: 15000,
    });
    if (res.exceptionDetails) {
      console.error("EXCEPTION:", JSON.stringify(res.exceptionDetails, null, 2));
      process.exit(2);
    }
    console.log(JSON.stringify(res.result.value ?? null, null, 2));
    ws.close();
    process.exit(0);
  } catch (err) {
    console.error("ERR", String(err));
    process.exit(3);
  }
};

setTimeout(() => {
  console.error("timeout waiting for CDP");
  process.exit(4);
}, 20000);
