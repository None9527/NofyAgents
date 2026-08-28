// nofy kernel supervisor — D5c (desktop wiring seam)
//
// 发现-否则-启动 对称逻辑（产品模型，用户确认）：
//   1. env NOFY_SOCKET（unix socket 路径）→ 探针附着
//   2. 应用数据目录 socket 文件 → 探针附着
//   3. ws://127.0.0.1:9800 探针 → 附着（standalone daemon 优先附着，不另起）
//   4. 否则 spawn `nofy agent serve --bind 127.0.0.1:9800 --secret ...`
// TODO(D5c+): 当前 nofy 二进制 `agent serve` 仅支持 TCP bind，不支持 unix
//   socket listen；故 1/2 仅探针记档，实际走 standalone 9800。待内核支持
//   `--listen unix:<path>` 后启用 1/2 附着/内嵌子进程 unix socket 形态。
// 父退子收：main 退出（exit/SIGINT/SIGTERM）时 kill 由桌面 spawn 的内核；
// 防双 kernel：pidfile + 端口探针；陈旧 pidfile（我侧 spawn 的）启动时回收。

import { spawn } from "node:child_process";
import { connect as netConnect } from "node:net";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));

export const KERNEL_PORT = Number(process.env.NOFY_KERNEL_PORT || 9800);
export const KERNEL_SECRET = process.env.NOFY_KERNEL_SECRET || "nofy-desktop";
export const KERNEL_WS_URL = `ws://127.0.0.1:${KERNEL_PORT}/ws?server-key=${KERNEL_SECRET}`;
export const NOFY_BIN = process.env.NOFY_BIN || `${homedir()}/.local/bin/nofy`;

const DATA_DIR = process.env.NOFY_DESKTOP_DIR || join(homedir(), ".local", "share", "nofy-desktop");
const STATE_PATH = join(DATA_DIR, "kernel.json");
const SOCKET_PATH = join(DATA_DIR, "kernel.sock"); // TODO(D5c+): 二进制支持 unix socket 后启用

function log(...args) {
  console.log("[nofy-supervisor]", ...args);
}

function ensureDataDir() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}

function probeTcp(port, host = "127.0.0.1", timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = netConnect({ port, host });
    const done = (open) => {
      socket.destroy();
      resolve(open);
    };
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
    setTimeout(() => done(false), timeoutMs);
  });
}

function probeUnixSocket(path, timeoutMs = 800) {
  // TODO(D5c+): nofy 二进制暂不 listen unix socket；探针保留供后续启用。
  if (!path) return Promise.resolve(false);
  try {
    if (!fs.existsSync(path)) return Promise.resolve(false);
  } catch {
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    const socket = netConnect({ path });
    const done = (open) => {
      socket.destroy();
      resolve(open);
    };
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
    setTimeout(() => done(false), timeoutMs);
  });
}

function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
  } catch {
    return null;
  }
}

function writeState(state) {
  ensureDataDir();
  try {
    fs.writeFileSync(STATE_PATH, JSON.stringify({ ...state, savedAt: Date.now() }));
  } catch (e) {
    log("write state failed", e?.message);
  }
}

let child = null;
let disposed = false;

function reapChild() {
  if (child && !child.killed) {
    try {
      child.kill("SIGTERM");
    } catch {}
  }
}

// 父退子收
process.on("exit", reapChild);
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sig, () => {
    reapChild();
    process.exit(0);
  });
}

async function waitForPort(port, tries = 40, everyMs = 500) {
  for (let i = 0; i < tries; i++) {
    if (await probeTcp(port)) return true;
    await new Promise((r) => setTimeout(r, everyMs));
  }
  return false;
}

function spawnKernel() {
  ensureDataDir();
  log(`spawning nofy kernel: ${NOFY_BIN} agent serve --bind 127.0.0.1:${KERNEL_PORT}`);
  child = spawn(NOFY_BIN, ["agent", "serve", "--bind", `127.0.0.1:${KERNEL_PORT}`, "--secret", KERNEL_SECRET], {
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
    env: { ...process.env },
  });
  child.stdout?.on("data", (d) => log("[kernel]", String(d).trim().slice(0, 300)));
  child.stderr?.on("data", (d) => log("[kernel!]", String(d).trim().slice(0, 300)));
  child.on("exit", (code, signal) => {
    log(`kernel exited (code=${code} signal=${signal})`);
    child = null;
  });
  child.unref();
  writeState({ pid: child.pid, url: KERNEL_WS_URL, secret: KERNEL_SECRET, mode: "desktop-spawned", port: KERNEL_PORT });
  return child;
}

/**
 * 发现序：NOFY_SOCKET → 应用数据 socket → ws 9800 → spawn。
 * 返回 { url, secret, mode, child }；mode ∈ env-unix|appdata-unix|attach-9800|spawned。
 */
export async function ensureKernel() {
  if (disposed) return { url: KERNEL_WS_URL, secret: KERNEL_SECRET, mode: "disposed", child: null };

  // 1. env NOFY_SOCKET
  const envSock = process.env.NOFY_SOCKET?.trim();
  if (envSock && (await probeUnixSocket(envSock))) {
    // TODO(D5c+): ACP-over-unix-socket 传输待内核支持；当前仅记档不启用。
    log(`NOFY_SOCKET=${envSock} probe ok (TODO: unix transport not yet supported by kernel; falling through)`);
  }

  // 2. 应用数据 socket 文件
  if (await probeUnixSocket(SOCKET_PATH)) {
    log(`app-data socket ${SOCKET_PATH} probe ok (TODO: unix transport not yet supported; falling through)`);
  }

  // 防双 kernel：陈旧 pidfile 回收（仅回收桌面自起的）
  const state = readState();
  if (state?.mode === "desktop-spawned" && state.pid && !pidAlive(state.pid)) {
    log(`stale kernel pidfile (pid=${state.pid}); ignoring`);
    try {
      fs.unlinkSync(STATE_PATH);
    } catch {}
  }

  // 3. ws 9800（standalone 优先附着）
  if (await probeTcp(KERNEL_PORT)) {
    log(`attaching existing kernel on :${KERNEL_PORT}`);
    writeState({ pid: state?.pid ?? null, url: KERNEL_WS_URL, secret: KERNEL_SECRET, mode: "attach-9800", port: KERNEL_PORT });
    return { url: KERNEL_WS_URL, secret: KERNEL_SECRET, mode: "attach-9800", child: null };
  }

  // 4. spawn
  spawnKernel();
  const up = await waitForPort(KERNEL_PORT);
  if (!up) log("WARNING: kernel did not open port within 20s");
  return { url: KERNEL_WS_URL, secret: KERNEL_SECRET, mode: "spawned", child };
}

export function disposeKernel() {
  disposed = true;
  reapChild();
}

export const seamInfo = {
  brand: "nofy",
  agentTransport: "acp-ws",
  url: KERNEL_WS_URL,
  auth: "local",
  scopeParam: "task", // TODO(助手路): session scope 'task'|'os'，kernel 层预留，UI 不动
};

// 兼容 D5b seam 形状（brand/agentTransport/url/auth）
export default seamInfo;

void here;
