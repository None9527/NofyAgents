// nofy kernel supervisor — D5c (desktop wiring seam)
//
// P0.5 拓扑（默认）：桌面**私有 stdio 协议子进程**——spawn `nofy agent stdio`，
// 行式 JSON-RPC over 继承管道。无端口、无 secret、天然单父客户端、父死子亡
// （stdin EOF 即子进程关停；macOS 无 PDEATHSIG，另在进程退出钩子兜底 kill）。
// 内核自身注释即点名该形态的父方含 nofy-desktop（nofy-shell agent/app.rs
// run_stdio_agent 文档）。TUI 为进程内内嵌 agent，二者仅共享 ~/.nofy 磁盘存储。
//
// attach-serve（显式 opt-in，NOFY_KERNEL_ATTACH=1）：旧的发现-否则-启动 对称逻辑，
// 供确需共享一个活内核的场景（headless 自动化/SDK/开发期热内核）：
//   1. env NOFY_SOCKET（unix socket 路径）→ 探针附着（内核暂不支持，记档）
//   2. 应用数据目录 socket 文件 → 探针附着（同上）
//   3. ws://127.0.0.1:<port> 探针 → 附着（standalone 优先附着，不另起）
//   4. 否则 spawn `nofy agent serve --bind ... --secret ...`（常驻，不随桌面退出）
// 注意 attach 形态受 §2.3 单客户端约束与 secret 契约（D1）限制，故不作默认。
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
/** attach-serve 为显式 opt-in（P0.5）；默认拓扑是私有 stdio 子进程。 */
export const ATTACH_SERVE = process.env.NOFY_KERNEL_ATTACH === "1" || process.env.NOFY_KERNEL_ATTACH === "true";
/**
 * P1a：应用内内核连接归 **host 进程自有**（host↔内核 stdio 直连）。main 侧单例
 * 仅服务于探针/诊断（probe5/6），须显式 NOFY_MAIN_KERNEL=1 开启；应用默认不派生
 * main 侧子进程，避免与 host 的子进程并存成第二个内核实例。
 */
export const MAIN_KERNEL_ENABLED =
  ATTACH_SERVE || process.env.NOFY_MAIN_KERNEL === "1" || process.env.NOFY_MAIN_KERNEL === "true";

function resolveNofyBin() {
  const candidates = [
    process.env.NOFY_BIN,
    `${homedir()}/.local/bin/nofy`,
    // 开发期兜底：本仓库构建产物（seam → 仓库根 = 五级上）
    join(here, "..", "..", "..", "..", "..", "target", "release", "nofy"),
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  return candidates[0] || `${homedir()}/.local/bin/nofy`;
}
export const NOFY_BIN = resolveNofyBin();

// host 的 agent runtime 命令解析（resolveDefaultZCodeAgentCommand）在 ZCODE_AGENT_SERVER_COMMAND
// 置位时只取 {command,args,cwd}、丢掉 env，故无法借它注入 ELECTRON_RUN_AS_NODE；
// 这里解析一个真实存在的 node 解释器给适配器进程用。找不到时返回 null（调用方须显式降级，
// 不得写死一个不存在的路径——那会把「未配置」变成 spawn ENOENT，见 D6）。
function resolveNodeBin() {
  const explicit = process.env.NOFY_NODE_BIN;
  if (explicit && fs.existsSync(explicit)) return explicit;
  if (!process.versions.electron && fs.existsSync(process.execPath)) return process.execPath;
  const fromPath = String(process.env.PATH || "")
    .split(":")
    .filter(Boolean)
    .map((dir) => join(dir, "node"));
  const fallbacks = ["/opt/homebrew/bin/node", "/usr/local/bin/node", "/usr/bin/node"];
  for (const c of [...fromPath, ...fallbacks]) {
    try {
      if (fs.existsSync(c)) fs.accessSync(c, fs.constants.X_OK);
      else continue;
      return c;
    } catch {}
  }
  return null;
}
export const NODE_BIN = resolveNodeBin();

const DATA_DIR = process.env.NOFY_DESKTOP_DIR || join(homedir(), ".local", "share", "nofy-desktop");
const STATE_PATH = join(DATA_DIR, "kernel.json");
const SOCKET_PATH = join(DATA_DIR, "kernel.sock"); // TODO(D5c+): 二进制支持 unix socket 后启用

function log(...args) {
  // 必须走 stderr：本模块被 acp-agent-adapter 导入，而适配器的 **stdout 就是 ZCode Protocol
  // 线路**——任何 stdout 写入都会被 host 的帧解析器当成协议帧（实测 D9：
  // "protocol_parse_error: Unexpected token 'o', \"[nofy-superv\"… is not valid JSON" ⇒ 传输被关闭）。
  console.error("[nofy-supervisor]", ...args);
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
const stdioChildren = new Set();

function reapChild() {
  if (child && !child.killed) {
    try {
      child.kill("SIGTERM");
    } catch {}
  }
  // macOS 无 PR_SET_PDEATHSIG：stdio 子进程除 stdin EOF 外再兜底一次显式回收
  for (const c of stdioChildren) {
    if (!c.killed) {
      try {
        c.kill("SIGTERM");
      } catch {}
    }
  }
}

/**
 * P0.5 默认拓扑：派生桌面私有的内核协议子进程（`nofy agent stdio`）。
 * 不监听端口、不需要 secret；stdout=协议行、stderr=日志（消费方防背压）。
 */
export function spawnStdioChild() {
  const bin = NOFY_BIN;
  if (!fs.existsSync(bin)) {
    return Promise.reject(new Error(`nofy binary not found: ${bin} (set NOFY_BIN)`));
  }
  log(`spawning nofy kernel (stdio child): ${bin} agent stdio`);
  const c = spawn(bin, ["agent", "stdio"], {
    stdio: ["pipe", "pipe", "pipe"],
    detached: false,
    env: { ...process.env },
  });
  stdioChildren.add(c);
  c.on("exit", (code, signal) => {
    log(`kernel stdio child exited (pid=${c.pid} code=${code} signal=${signal})`);
    stdioChildren.delete(c);
  });
  c.on("error", (e) => {
    log(`kernel stdio child error: ${e?.message}`);
    stdioChildren.delete(c);
  });
  return Promise.resolve(c);
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
 * A1-A：single-flight——多调用方（index.js 启动序 / NofyKernelClient 单例）共享
 * 同一次发现，避免并发 ensure 双 spawn。
 */
let ensureInflight = null;
export function ensureKernel() {
  ensureInflight ??= doEnsureKernel().finally(() => {
    ensureInflight = null;
  });
  return ensureInflight;
}

async function doEnsureKernel() {
  if (disposed) return { url: KERNEL_WS_URL, secret: KERNEL_SECRET, mode: "disposed", child: null };

  // 0a. P1a：应用内默认不在 main 派生内核（连接归 host 自有）；探针显式开启
  if (!MAIN_KERNEL_ENABLED) {
    return { url: null, secret: null, mode: "disabled", child: null };
  }

  // 0b. 默认拓扑（P0.5）：私有 stdio 子进程；不探针、不附着、不常驻
  if (!ATTACH_SERVE) {
    const c = await spawnStdioChild();
    return { url: null, secret: null, mode: "stdio-child", child: c, respawn: spawnStdioChild };
  }

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
