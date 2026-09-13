/**
 * 开发模式：renderer 走 vite dev server（HMR），main/preload 预构建后交给 electron。
 *
 * 为什么 main 不做热替换：Electron 主进程热重载等于重启整个 app，连带重启内核
 * 子进程——那比等一次 build 慢，还会打断真实会话。故改了 main/preload 就重跑
 * pnpm dev；改 renderer 立即热更。
 *
 *   NOFY_WORKSPACE=/path/to/repo pnpm dev      # 指定工作区（session/new 的 cwd）
 *   NOFY_ISOLATED_HOME=1 pnpm dev              # 隔离 ~/.nofy（演示审批流用）
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const app = join(here, "..");
const VITE = join(app, "node_modules", ".bin", "vite");
const ELECTRON = join(app, "node_modules", ".bin", "electron");
const PORT = 5183;
const DEV_URL = "http://127.0.0.1:" + String(PORT) + "/";
const READY_TIMEOUT_MS = 30_000;

for (const [what, p] of [
  ["vite", VITE],
  ["electron", ELECTRON],
] as const) {
  if (!existsSync(p)) {
    console.error("找不到 " + what + " 可执行文件: " + p + " —— 先 pnpm install（electron 还需 node install.js 下载 dist）");
    process.exit(1);
  }
}

function build(config: string): void {
  const r = spawnSync(VITE, ["build", "--config", config], { cwd: app, stdio: "inherit" });
  if (r.status !== 0) {
    console.error("构建失败: " + config);
    process.exit(r.status ?? 1);
  }
}

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError = "";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
      lastError = "HTTP " + String(res.status);
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("dev server 未在 " + String(timeoutMs) + "ms 内就绪: " + url + " (" + lastError + ")");
}

async function main(): Promise<number> {
  build("vite.main.config.ts");
  build("vite.preload.config.ts");

  const vite = spawn(VITE, ["--config", "vite.renderer.config.ts"], {
    cwd: app,
    stdio: ["ignore", "pipe", "inherit"],
    env: process.env,
  });
  vite.stdout?.pipe(process.stdout);

  const shutdown = (code: number): void => {
    if (vite.exitCode === null) vite.kill("SIGTERM");
    process.exit(code);
  };
  vite.on("exit", (code) => {
    console.error("dev server 退出 code=" + String(code));
    shutdown(code ?? 1);
  });

  try {
    await waitForServer(DEV_URL, READY_TIMEOUT_MS);
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    shutdown(1);
    return 1;
  }

  const electron = spawn(ELECTRON, ["."], {
    cwd: app,
    stdio: "inherit",
    env: { ...process.env, NOFY_DEV_SERVER_URL: DEV_URL },
  });
  electron.on("exit", (code, signal) => {
    console.log("electron 退出 code=" + String(code) + " signal=" + String(signal));
    shutdown(code ?? 0);
  });
  for (const sig of ["SIGINT", "SIGTERM"] as const) {
    process.on(sig, () => {
      electron.kill(sig);
      shutdown(0);
    });
  }
  return 0;
}

main().catch((e: unknown) => {
  console.error("dev 启动失败:", e instanceof Error ? e.stack : String(e));
  process.exit(1);
});
