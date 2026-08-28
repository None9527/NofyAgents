// One-command real-backend dev: ensures `nofy agent serve` is running, then
// starts Vite with VITE_WS_URL/VITE_CWD injected so the bare URL connects to
// the real agent (no ?ws= needed, no mock).
import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.GROK_WEB_PORT || 9800);
const SECRET = process.env.GROK_WEB_SECRET || "devsecret";
const CWD = process.env.GROK_WEB_CWD || resolve(here, "../..");
const NOFY_BIN = process.env.NOFY_BIN || `${homedir()}/.local/bin/nofy`;
const WS_URL = `ws://127.0.0.1:${PORT}/ws?server-key=${SECRET}`;

function portOpen(port) {
  return new Promise((resolveFn) => {
    const socket = createConnection({ port, host: "127.0.0.1" });
    const done = (open) => {
      socket.destroy();
      resolveFn(open);
    };
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
    setTimeout(() => done(false), 1500);
  });
}

const children = [];
const cleanup = () => {
  for (const child of children) {
    try {
      child.kill("SIGTERM");
    } catch {}
  }
};
process.on("exit", cleanup);
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

if (await portOpen(PORT)) {
  console.log(`[dev] agent serve already running on :${PORT}`);
} else {
  console.log(`[dev] starting nofy agent serve on :${PORT}`);
  const serve = spawn(NOFY_BIN, ["agent", "serve", "--bind", `127.0.0.1:${PORT}`, "--secret", SECRET], {
    stdio: ["ignore", "inherit", "inherit"],
  });
  serve.on("exit", (code) => {
    console.log(`[dev] agent serve exited (${code})`);
    process.exit(code ?? 0);
  });
  children.push(serve);
  for (let i = 0; i < 40 && !(await portOpen(PORT)); i++) {
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!(await portOpen(PORT))) {
    console.error("[dev] agent serve failed to start");
    process.exit(1);
  }
}

console.log(`[dev] backend: ${WS_URL}`);
console.log(`[dev] workspace: ${CWD}`);

const vite = spawn("npx", ["vite"], {
  cwd: resolve(here, ".."),
  stdio: "inherit",
  env: { ...process.env, VITE_WS_URL: WS_URL, VITE_CWD: CWD },
});
children.push(vite);
vite.on("exit", (code) => process.exit(code ?? 0));
