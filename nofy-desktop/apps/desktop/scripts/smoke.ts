/**
 * S1 验收 smoke（PLAN.md §12.2）。
 *
 *   node apps/desktop/scripts/smoke.ts              # 默认：隔离 NOFY_HOME，可重复进 CI
 *   node apps/desktop/scripts/smoke.ts --home=real  # 打真 ~/.nofy，用于演示单内核多工作区
 *
 * 隔离依据：crates/codegen/nofy-config/src/paths.rs:35 的 nofy_home() 读 $NOFY_HOME。
 * 隔离生效的**可观测证据**：workspace_list 返回 0 个工作区（真库是 5 个 / 82 会话）。
 *
 * 验收门：
 *   ① initialize 拿到 modelState 与 availableCommands
 *   ② 全应用恰好一个 nofy agent stdio 子进程（PLAN.md §7 验收门 5）
 *   ③ NOFY_HOME 隔离真生效（或 real 模式下单内核枚举多工作区——继承缺陷 I1/I5 的反证）
 *   ④ 入站帧全量录制到 docs/fixtures/，零坏帧
 *   ⑤ 退出后子进程被回收，不留孤儿内核
 */
import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AGENT_METHOD, EXT_REQUEST } from "@nofy-desktop/acp";
import type { InboundFrame } from "@nofy-desktop/acp";
import { ensureKernel, getKernel } from "../main/acp/connection.ts";
import { createIsolatedNofyHome } from "../main/kernel/test-home.ts";
import {
  installReapHooks,
  kernelChildCount,
  setKernelEnv,
  shutdownKernel,
} from "../main/kernel/supervisor.ts";

const here = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = join(here, "..", "..", "..", "docs", "fixtures");
const REAL_MODE = process.argv.includes("--home=real");

const gates: Array<[string, boolean, string]> = [];
function gate(name: string, ok: boolean, detail: string): void {
  gates.push([name, ok, detail]);
  console.log((ok ? "  PASS  " : "  FAIL  ") + name + "  —  " + detail);
}
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function keys(v: unknown): string[] {
  return isObj(v) ? Object.keys(v) : [];
}
function summarizeModelState(ms: unknown): string {
  if (!isObj(ms)) return "modelState 缺失或非对象: " + typeof ms;
  const parts: string[] = ["keys=" + keys(ms).join(",")];
  for (const k of keys(ms)) {
    const v = ms[k];
    if (!Array.isArray(v)) continue;
    parts.push(k + "[" + String(v.length) + "]");
    const ids = v
      .map((m) => (isObj(m) ? String(m["id"] ?? m["model"] ?? m["modelId"] ?? "?") : String(m)))
      .slice(0, 12);
    if (ids.length > 0) parts.push("  ids=" + ids.join("|"));
  }
  return parts.join("  ");
}

async function main(): Promise<number> {
  installReapHooks();
  await mkdir(FIXTURE_DIR, { recursive: true });

  const home = REAL_MODE ? null : createIsolatedNofyHome();
  if (home !== null) setKernelEnv({ ...process.env, NOFY_HOME: home.path });

  const tag = REAL_MODE ? "real" : "isolated";
  const fixturePath = join(FIXTURE_DIR, "smoke-" + tag + "-" + new Date().toISOString().replace(/[:.]/g, "-") + ".jsonl");

  // 录制必须在 connect 之前挂上，否则丢掉握手帧
  const conn = getKernel();
  let recorded = 0;
  conn.on("frame", (f: InboundFrame) => {
    recorded++;
    void appendFile(fixturePath, JSON.stringify({ t: Date.now(), frame: f }) + "\n");
  });
  const unhandledSeen: string[] = [];
  conn.on("unhandled", (u) => unhandledSeen.push(u.kind + " " + u.method));
  const malformedSeen: string[] = [];
  conn.on("malformed", (m) => malformedSeen.push(m.reason));

  console.log("");
  console.log("── S1 验收 smoke（home=" + tag + (home ? " " + home.path : "") + "）──────────");

  const init = await ensureKernel(15_000);
  const snap = init.snapshot();

  console.log("");
  console.log("[initialize]");
  console.log("  agentVersion   :", String(snap["agentVersion"] ?? "(none)"));
  console.log("  kernelPid      :", String(snap["kernelPid"] ?? "(none)"));
  console.log("  authMethods    :", JSON.stringify(snap["authMethods"]));
  console.log("  agentCaps keys :", keys(snap["agentCapabilities"]).join(",") || "(none)");
  console.log("  availableCmds  :", String(JSON.stringify(snap["availableCommands"])).slice(0, 300));
  console.log("  modelState     :", summarizeModelState(snap["modelState"]));
  if (home !== null) console.log("  config copied  :", String(home.configCopied ?? "(none — hermetic)"));

  gate("① initialize 拿到 modelState", isObj(snap["modelState"]), summarizeModelState(snap["modelState"]).slice(0, 100));
  gate("① initialize 拿到 availableCommands", snap["availableCommands"] !== null, String(JSON.stringify(snap["availableCommands"])).slice(0, 100));
  gate("② 恰好一个内核子进程", kernelChildCount() === 1, "count=" + String(kernelChildCount()) + " pid=" + String(snap["kernelPid"] ?? "?"));

  console.log("");
  console.log("[workspace enumeration via the SAME single kernel]");
  let wsCount = -1;
  let sessionCount = -1;
  try {
    const wl = await init.ext(EXT_REQUEST.summariesWorkspaceList, {}, 10_000);
    const all = isObj(wl) ? wl["all_sessions"] : null;
    if (isObj(all)) {
      wsCount = Object.keys(all).length;
      sessionCount = Object.values(all).reduce<number>((n, v) => n + (Array.isArray(v) ? v.length : 0), 0);
      console.log("  workspaces:", String(wsCount), " sessions:", String(sessionCount));
      for (const cwd of Object.keys(all).slice(0, 6)) {
        const arr = all[cwd];
        console.log("   -", cwd, "(" + String(Array.isArray(arr) ? arr.length : 0) + " sessions)");
      }
    } else {
      console.log("  unexpected shape:", String(JSON.stringify(wl)).slice(0, 200));
    }
  } catch (e) {
    console.log("  ERROR:", e instanceof Error ? e.message : String(e));
  }

  if (REAL_MODE) {
    // 单内核枚举多工作区 = 继承缺陷 I1/I5（每工作区一个内核）的正面反证
    gate("③ 单内核枚举多工作区", wsCount > 0, "workspaces=" + String(wsCount) + " sessions=" + String(sessionCount));
  } else {
    // 隔离生效的可观测证据：全新 home 不该有任何历史会话（真库是 5 / 82）
    gate("③ NOFY_HOME 隔离生效", wsCount === 0 && sessionCount === 0, "workspaces=" + String(wsCount) + " sessions=" + String(sessionCount) + "（真库为 5/82）");
  }

  console.log("");
  console.log("[session/list]");
  try {
    const sl = await init.rpc(AGENT_METHOD.listSessions, {}, 10_000);
    console.log("  shape:", Array.isArray(sl) ? "array[" + String(sl.length) + "]" : typeof sl, " keys:", keys(sl).slice(0, 6).join(","));
  } catch (e) {
    console.log("  ERROR:", e instanceof Error ? e.message : String(e));
  }

  console.log("");
  console.log("[diagnostics]");
  console.log("  ", JSON.stringify(init.diag));
  if (unhandledSeen.length > 0) console.log("   unhandled:", [...new Set(unhandledSeen)].join(", "));
  if (malformedSeen.length > 0) console.log("   malformed:", [...new Set(malformedSeen)].join(", "));
  gate("④ 帧已录制", recorded > 0, "frames=" + String(recorded) + " → docs/fixtures/");
  gate("④ 零坏帧", malformedSeen.length === 0, malformedSeen.length === 0 ? "clean" : malformedSeen.join(","));

  const pid = conn.kernelPid;
  init.close();
  shutdownKernel();
  setKernelEnv(null);
  await new Promise((r) => setTimeout(r, 600));
  let alive = false;
  if (typeof pid === "number") {
    try {
      process.kill(pid, 0);
      alive = true;
    } catch {
      alive = false;
    }
  }
  gate("⑤ 子进程已回收（无孤儿内核）", !alive && kernelChildCount() === 0, "pid=" + String(pid ?? "?") + " alive=" + String(alive) + " count=" + String(kernelChildCount()));

  if (home !== null) home.cleanup();

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
    console.error("");
    console.error("SMOKE CRASHED:", e instanceof Error ? e.stack : String(e));
    shutdownKernel();
    setKernelEnv(null);
    process.exit(1);
  });



