/**
 * 恢复 smoke：内核进程被强杀后，连接层能否察觉、清账、并自动重派生。
 *
 * 参照 codex-web 的 app-server-recovery-smoke 这一类门的**思路**（代码独立编写；
 * 该项目 license 为 UNLICENSED，不得复制）。对我们尤其要紧：旧路 D6 的教训是
 * 「解释器路径错 → 全会话面 EPIPE 闸死」——进程级故障会静默变成 UI 死锁。
 *
 * 全程用隔离 NOFY_HOME，不打真 ~/.nofy，可重复进 CI。
 */
import { EXT_REQUEST } from "@nofy-desktop/acp";
import { KernelConnection } from "../main/acp/connection.ts";
import { createIsolatedNofyHome } from "../main/kernel/test-home.ts";
import {
  installReapHooks,
  kernelChildCount,
  setKernelEnv,
  shutdownKernel,
  spawnKernelChild,
} from "../main/kernel/supervisor.ts";

const gates: Array<[string, boolean, string]> = [];
function gate(name: string, ok: boolean, detail: string): void {
  gates.push([name, ok, detail]);
  console.log((ok ? "  PASS  " : "  FAIL  ") + name + "  —  " + detail);
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main(): Promise<number> {
  installReapHooks();
  const home = createIsolatedNofyHome();
  setKernelEnv({ ...process.env, NOFY_HOME: home.path });
  console.log("");
  console.log("── 恢复 smoke（NOFY_HOME=" + home.path + "）─────────────────");

  const c = new KernelConnection();
  // 重连延迟设得比「断连相」的观察窗口长，好让两相分别可断言：
  // 第一相（< RECONNECT_MS）验清账，第二相验重派生。
  const RECONNECT_MS = 2_500;
  c.reconnectMs = RECONNECT_MS;
  const statuses: boolean[] = [];
  c.on("status", (s) => statuses.push(s.connected));

  c.attachChild(spawnKernelChild());
  const first = await c.ready(15_000);
  const pid1 = c.kernelPid;
  gate("初次握手成功", first !== null && pid1 !== undefined, "pid=" + String(pid1));
  gate("单内核不变量", kernelChildCount() === 1, "count=" + String(kernelChildCount()));

  // 强杀内核（SIGKILL：不给它优雅退出的机会，最坏情况）
  console.log("  → SIGKILL pid=" + String(pid1));
  process.kill(pid1 as number, "SIGKILL");

  // 挂一个必然悬挂的请求，验证它被 reject 而不是永远吊着
  const inflight = c.rpc(EXT_REQUEST.sessionInfo, { sessionId: "nonexistent" }, 20_000);
  let rejected: string | null = null;
  void inflight.catch((e: unknown) => {
    rejected = e instanceof Error ? e.message : String(e);
  });

  // 第一相：断连已察觉、账已清，且重连尚未发生
  await wait(600);
  gate("察觉断连并发出 status:false", statuses.includes(false), "statuses=" + JSON.stringify(statuses));
  gate("悬挂请求被 reject（不永久吊着）", rejected !== null, String(rejected ?? "(still pending)"));
  gate("清账：initialized 与 isOpen 均为假", c.isInitialized === false && c.isOpen() === false,
    "isInitialized=" + String(c.isInitialized) + " isOpen=" + String(c.isOpen()));
  gate("断连时不残留未应答的内核请求", statuses.length >= 2, "statuses=" + JSON.stringify(statuses));

  // 等自动重连（scheduleReconnect → 重新派生子进程 → 重新握手）
  let pid2: number | undefined;
  try {
    await c.ready(15_000);
    pid2 = c.kernelPid;
  } catch (e) {
    console.log("  reconnect failed:", e instanceof Error ? e.message : String(e));
  }
  gate("自动重派生并重新握手", pid2 !== undefined && pid2 !== pid1, "pid1=" + String(pid1) + " pid2=" + String(pid2));
  gate("重连后仍只有一个内核", kernelChildCount() === 1, "count=" + String(kernelChildCount()));

  // 重连后链路真的可用（不是假活）
  let usable = false;
  let wsCount = -1;
  try {
    const wl = await c.ext(EXT_REQUEST.summariesWorkspaceList, {}, 10_000);
    usable = true;
    const all = (wl as Record<string, unknown>)["all_sessions"];
    wsCount = all && typeof all === "object" ? Object.keys(all).length : -1;
  } catch (e) {
    console.log("  post-reconnect call failed:", e instanceof Error ? e.message : String(e));
  }
  gate("重连后扩展请求可用", usable, "workspace_list ok, workspaces=" + String(wsCount));
  gate("隔离生效（新 home 无历史会话）", wsCount === 0, "workspaces=" + String(wsCount) + "（真 home 是 5）");

  c.close();
  shutdownKernel();
  setKernelEnv(null);
  await wait(400);
  gate("收尾无孤儿内核", kernelChildCount() === 0, "count=" + String(kernelChildCount()));
  home.cleanup();

  const failed = gates.filter((g) => !g[1]);
  console.log("");
  console.log("── 结果: " + String(gates.length - failed.length) + "/" + String(gates.length) + " PASS ──");
  for (const f of failed) console.log("   FAILED:", f[0], "—", f[2]);
  return failed.length === 0 ? 0 : 1;
}

main()
  .then((code) => {
    process.exitCode = code;
    setTimeout(() => process.exit(code), 100).unref();
  })
  .catch((e) => {
    console.error("RECOVERY SMOKE CRASHED:", e instanceof Error ? e.stack : String(e));
    shutdownKernel();
    setKernelEnv(null);
    process.exit(1);
  });



