// Probe round 6 — P0.5 regression: 桌面私有 stdio 子进程拓扑（默认形态）。
//
// 与 acp-probe5（WS/attach 形态基线）互补。本探针**不钉 attach**，走默认拓扑：
// supervisor 派生 `nofy agent stdio` 私有子进程，NofyKernelClient 经继承管道说
// 行式 JSON-RPC。为证明「不依赖任何 serve/端口」，把 NOFY_KERNEL_PORT 指到一个
// 无人监听的端口——stdio 形态根本不用端口，成功即证独立性。
//
// Checks:
//   1. endpoint mode = stdio-child 且 url == null（不附着、不常驻）
//   2. 子进程确为 `nofy agent stdio`（ps 实证）
//   3. initialize 握手（clientIdentifier=nofy-desktop）+ agentCapabilities/authMethods
//   4. modelState（initialize._meta.modelState，§2.4）
//   5. _nofy/* 扩展往返 + 负对照（无下划线 ⇒ -32601，§2.2）
//   6. 本进程对内核端口零 TCP 连接（单客户端约束在 stdio 形态下结构性免除）
//   7. session/cancel：request 形 ⇒ -32601（负对照）；notification 形 ⇒ 快速 cancelled
//   8. 父死子亡：client.close()（stdin EOF）后子进程在 5s 内退出
//
// usage: node desktop/scripts/acp-probe6.mjs

import { execFileSync } from "node:child_process";

// 无人监听的端口：attach 形态在此必败，stdio 形态不受影响
process.env.NOFY_KERNEL_PORT = process.env.NOFY_KERNEL_PORT || "9899";
delete process.env.NOFY_KERNEL_ATTACH;

const { ensureNofyKernelClient } = await import("../src/out/main/seam/nofy-kernel-client.js");

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}
const short = (v, n = 400) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s && s.length > n ? s.slice(0, n) + "…" : s;
};
function psCommand(pid) {
  try {
    return execFileSync("ps", ["-p", String(pid), "-o", "command="], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}
function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
function tcpCountTo(port) {
  try {
    const out = execFileSync("lsof", ["-nP", `-iTCP:${port}`, "-a", "-p", String(process.pid)], { encoding: "utf8" });
    return out.split("\n").filter((l) => l.includes("(ESTABLISHED)")).length;
  } catch {
    return 0;
  }
}

console.log(`== acp-probe6: stdio-child topology (kernel port env=${process.env.NOFY_KERNEL_PORT}, unlistened by design) ==`);

const client = await ensureNofyKernelClient().catch((e) => {
  console.log("FATAL: ensureNofyKernelClient failed:", e?.message);
  process.exit(2);
});

/* ── 1/2. 拓扑形状 ─────────────────────────────────────────────── */
check("endpoint mode = stdio-child", client.endpointMode === "stdio-child", client.endpointMode);
check("no WS url (不附着/不常驻)", client.url == null, String(client.url));
const pid = client.child?.pid;
const cmd = pid ? psCommand(pid) : "";
check("child is `nofy agent stdio`", /agent stdio/.test(cmd), `pid=${pid} cmd=${cmd.slice(0, 90)}`);

/* ── 3/4. 握手与模型表 ─────────────────────────────────────────── */
check("initialize sent clientIdentifier=nofy-desktop", client.initializeParams?._meta?.clientIdentifier === "nofy-desktop");
const init = client.initializeResult ?? {};
check("initialize returned agentCapabilities", !!init.agentCapabilities, short(init.agentCapabilities, 160));
check("initialize returned authMethods", Array.isArray(init.authMethods) && init.authMethods.length > 0, short(init.authMethods, 120));
const models = (client.modelState?.availableModels ?? client.modelState?.models ?? []).map((m) => m?.modelId ?? m?.id);
check("modelState lists models", models.length > 0, `current=${client.modelState?.currentModelId} models=[${models.join(", ")}]`);

/* ── 5. 扩展往返 + 负对照 ──────────────────────────────────────── */
try {
  const r1 = await client.ext("session_summaries/workspace_list", {}, 8000);
  check("ext round-trip (bare name auto-prefixed)", !!r1?.all_sessions, `${Object.keys(r1?.all_sessions ?? {}).length} workspaces`);
} catch (e) {
  check("ext round-trip (bare name auto-prefixed)", false, e?.message);
}
try {
  await client.rpc("nofy/session_summaries/workspace_list", {});
  check("negative control: no-underscore ext rejected", false, "unexpectedly succeeded");
} catch (e) {
  check("negative control: no-underscore ext rejected", e?.code === -32601, `code=${e?.code}`);
}

/* ── 6. 零 TCP 依赖 ────────────────────────────────────────────── */
check("zero TCP connections from this process to kernel port", tcpCountTo(process.env.NOFY_KERNEL_PORT) === 0, `port=${process.env.NOFY_KERNEL_PORT}`);

/* ── 7. cancel 语义 ────────────────────────────────────────────── */
const cwd = process.env.HOME + "/nofy-build";
const sess = await client.rpc("session/new", { cwd, mcpServers: [] });
const sid = sess.sessionId;
const promptP = client.rpc("session/prompt", {
  sessionId: sid,
  prompt: [{ type: "text", text: "写一篇 3000 字的关于人工智能历史的文章，要非常详细。" }],
});
await new Promise((r) => setTimeout(r, 3500));
try {
  await client.rpc("session/cancel", { sessionId: sid });
  check("negative control: session/cancel as request rejected", false, "unexpectedly succeeded");
} catch (e) {
  check("negative control: session/cancel as request rejected", e?.code === -32601, `code=${e?.code}`);
}
const t0 = Date.now();
const sent = client.cancel(sid);
const res = await Promise.race([promptP, new Promise((r) => setTimeout(() => r({ __timeout: true }), 15000))]);
check(
  "prompt settled cancelled after notification",
  sent && res?.stopReason === "cancelled" && Date.now() - t0 < 5000,
  `stopReason=${res?.stopReason} settled=${Date.now() - t0}ms`,
);

/* ── 8. 父死子亡（stdin EOF） ──────────────────────────────────── */
client.close();
let dead = false;
for (let i = 0; i < 25 && !dead; i++) {
  await new Promise((r) => setTimeout(r, 200));
  dead = !pidAlive(pid);
}
check("child exits after client.close() (stdin EOF)", dead, `pid=${pid} alive=${!dead}`);

const failed = results.filter((r) => !r.ok);
console.log(`\n== probe6 summary: ${results.length - failed.length}/${results.length} passed ==`);
process.exit(failed.length ? 1 : 0);
