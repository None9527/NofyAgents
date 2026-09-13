/**
 * 内核子进程监督——**全应用恰好一个 nofy agent stdio 子进程**。
 *
 * 裁定 B（PLAN.md §1）：单内核归 Electron main 所有，workspace 只是 cwd 参数、
 * 不是进程单位。继承缺陷 I1/I2/I5（三套内核、config.toml 三写者、垃圾工作区
 * 独占内核）在此结构性消失。
 *
 * 移植自 seam/kernel-supervisor.js 的 spawnStdioChild + reapChild（行为等价），
 * 并**删除**全部 serve 模式脚手架：pidfile、TCP/unix socket 探针、attach-9800、
 * KERNEL_SECRET、NOFY_KERNEL_ATTACH、MAIN_KERNEL_ENABLED。
 * 理由：serve 有单客户端约束（server.rs:314-334）且需 secret 发现（旧路 D1 成因）；
 * 内核自身的 headless/leader 入口已 bail 并指向 agent stdio。
 */
import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { log, warn } from "../lib/log.ts";
import { resolveKernelBin } from "./bin.ts";

/** 存活的内核子进程。不变量：size ≤ 1。 */
const live = new Set<ChildProcess>();

let reaped = false;

/**
 * 子进程环境覆盖。测试用它注入 NOFY_HOME 做隔离
 * （内核侧支持见 crates/codegen/nofy-config/src/paths.rs:35）。
 * 应用运行期不设，保持继承 process.env。
 */
let envOverride: NodeJS.ProcessEnv | null = null;

export function setKernelEnv(env: NodeJS.ProcessEnv | null): void {
  envOverride = env;
}

/** 验收门 5（PLAN.md §7）用：全应用内核子进程数。 */
export function kernelChildCount(): number {
  return live.size;
}

/** 当前存活子进程的 pid（无则 undefined）。 */
export function kernelChildPid(): number | undefined {
  for (const c of live) return c.pid ?? undefined;
  return undefined;
}

function reap(): void {
  if (reaped) return;
  reaped = true;
  for (const c of live) {
    if (c.exitCode === null && c.signalCode === null) {
      try {
        c.kill("SIGTERM");
      } catch {
        /* 已死，忽略 */
      }
    }
  }
}

/**
 * 父退子收。
 * stdio 拓扑下 stdin EOF 本身就会让内核关停；macOS 无 PR_SET_PDEATHSIG，
 * 故再兜底一次显式 SIGTERM（旧路同一处注释）。
 */
export function installReapHooks(): void {
  process.on("exit", reap);
  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
    process.on(sig, () => {
      reap();
      process.exit(0);
    });
  }
}

export type SpawnOptions = {
  /** 覆盖二进制路径（测试用）。默认走 resolveKernelBin()。 */
  bin?: string;
  /** 子进程环境。优先级：opts.env > setKernelEnv() > process.env。 */
  env?: NodeJS.ProcessEnv;
};

/**
 * 派生桌面私有的内核协议子进程。
 * stdout = 协议行（行式 JSON-RPC），stderr = 日志。
 *
 * **stderr 必须被消费**，否则管道写满会背压堵死子进程——消费责任在调用方
 * （connection.ts 会 resume），此处只保证不丢弃。
 */
export function spawnKernelChild(opts: SpawnOptions = {}): ChildProcess {
  if (live.size >= 1) {
    // 不变量守卫：绝不派生第二个内核（继承缺陷 I1 的直接防线）
    throw new Error(
      "kernel child already exists (pid=" + [...live].map((c) => String(c.pid)).join(",") + "); single-kernel invariant violated",
    );
  }
  const bin = opts.bin ?? resolveKernelBin();
  const env = opts.env ?? envOverride ?? process.env;
  const home = env["NOFY_HOME"];
  log("spawning kernel:", bin, "agent stdio", home ? "(NOFY_HOME=" + home + ")" : "(NOFY_HOME unset → ~/.nofy)");
  const child = spawn(bin, ["agent", "stdio"], {
    stdio: ["pipe", "pipe", "pipe"],
    detached: false,
    env,
  });
  live.add(child);
  child.on("exit", (code, signal) => {
    log("kernel child exited pid=" + String(child.pid) + " code=" + String(code) + " signal=" + String(signal));
    live.delete(child);
  });
  child.on("error", (e) => {
    warn("kernel child spawn error:", e?.message);
    live.delete(child);
  });
  return child;
}

/** 主动关停（关闭 stdin → 内核自行收尾；再兜底 SIGTERM）。 */
export function shutdownKernel(): void {
  for (const c of [...live]) {
    try {
      c.stdin?.end();
    } catch {
      /* ignore */
    }
  }
  reap();
  reaped = false;
  live.clear();
}

