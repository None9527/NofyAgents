// Probe round 5 — A1 Track A regression: NofyKernelClient singleton (main-seam).
//
// Imports the REAL main-process seam modules (out/main/seam/) and runs them in
// plain Node against the live kernel — production path: kernel-supervisor
// discovers-or-launches, singleton connects + initializes, workspace enumeration
// (absorbed workspace-registry logic) runs over the SAME single WS.
//
// Checks:
//   1. initialize handshake with _meta.clientIdentifier=nofy-desktop (PORTING-PLAN §2.1)
//   2. modelState from initialize._meta.modelState (§2.4)
//   3. live roster via _nofy/sessions/list (§2.2)
//   4. _nofy/* extension round-trips: prefix normalization + negative control
//      (no-underscore wire name must yield -32601, §2.2)
//   5. workspace enumeration via singleton (ACP main path / dir-scan fallback)
//   6. whole-process WS count to the kernel == 1 (lsof self-measurement, §2.3)
//   7. session/cancel: request form → -32601 (the old acp-client.js bug, §2.5.1);
//      notification form → prompt settles fast with stopReason "cancelled" (§2.1)
//
// usage: node desktop/scripts/acp-probe5.mjs [port]     (default: NOFY_KERNEL_PORT or 9803)

import { execFileSync } from "node:child_process";

const port = Number(process.argv[2] ?? process.env.NOFY_KERNEL_PORT ?? 9803);
process.env.NOFY_KERNEL_PORT = String(port); // supervisor reads at import time

// dynamic import AFTER env is set (kernel-supervisor snapshots NOFY_KERNEL_PORT)
const { ensureNofyKernelClient } = await import("../src/out/main/seam/nofy-kernel-client.js");
const { createWorkspaceEnumeration } = await import("../src/out/main/seam/workspace-enum.js");

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}
const short = (v, n = 500) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s && s.length > n ? s.slice(0, n) + "…" : s;
};

function wsCountToKernel() {
  // lsof: this process's TCP connections to the kernel port
  let out = "";
  try {
    out = execFileSync("lsof", ["-nP", `-iTCP:${port}`, "-a", "-p", String(process.pid)], {
      encoding: "utf8",
    });
  } catch {
    return { count: -1, raw: "(lsof failed)" };
  }
  const established = out.split("\n").filter((l) => l.includes("(ESTABLISHED)"));
  return { count: established.length, raw: out.trim() };
}

console.log(`== acp-probe5: singleton regression against kernel port ${port} ==`);

/* ── 1. endpoint discovery + initialize handshake ─────────────────────── */
const client = await ensureNofyKernelClient().catch((e) => {
  console.log("FATAL: ensureNofyKernelClient failed:", e?.message);
  process.exit(2);
});
console.log("endpoint:", client.url, "mode:", client.endpointMode);
check("endpoint discovered via kernel-supervisor", !!client.url && !!client.endpointMode, client.endpointMode);

const sentMeta = client.initializeParams?._meta;
check(
  "initialize sent _meta.clientIdentifier=nofy-desktop",
  sentMeta?.clientIdentifier === "nofy-desktop",
  short(sentMeta, 120),
);
const init = client.initializeResult ?? {};
check("initialize returned agentCapabilities", !!init.agentCapabilities, short(init.agentCapabilities, 200));
check("initialize returned authMethods", Array.isArray(init.authMethods) && init.authMethods.length > 0, short(init.authMethods, 160));
console.log("agentVersion:", init._meta?.agentVersion ?? init.agentVersion ?? "?");

/* ── 2. modelState (§2.4: model table comes from the kernel only) ─────── */
const modelState = client.modelState;
const models = modelState?.availableModels ?? modelState?.models ?? [];
const modelIds = models.map?.((m) => m?.modelId ?? m?.id) ?? [];
check("initialize._meta.modelState retrieved", !!modelState, short(modelState, 400));
check("modelState lists models", modelIds.length > 0, `current=${modelState?.currentModelId} models=[${modelIds.join(", ")}]`);

/* ── 3. live roster (§2.2 nofy/sessions/list) ─────────────────────────── */
try {
  const roster = await client.ext("nofy/sessions/list", {}, 8000);
  const body = roster?.result ?? roster; // 实测响应形如 { result: { sessions: [...] } }
  const entries = body?.sessions ?? body?.roster ?? (Array.isArray(body) ? body : []);
  check("roster fetch (_nofy/sessions/list)", Array.isArray(entries), `${entries.length} entries; sample=${short(entries[0] ?? body, 220)}`);
} catch (e) {
  check("roster fetch (_nofy/sessions/list)", false, e?.message);
}

/* ── 4. _nofy/* extension round-trips (§2.2 underscore prefix, both dirs) ── */
try {
  const r1 = await client.ext("session_summaries/workspace_list", {}, 8000); // bare → _nofy/ added
  const wsCount = Object.keys(r1?.all_sessions ?? {}).length;
  check("ext round-trip: bare name auto-prefixed", !!r1?.all_sessions, `${wsCount} workspaces via _nofy/session_summaries/workspace_list`);
} catch (e) {
  check("ext round-trip: bare name auto-prefixed", false, e?.message);
}
try {
  const r2 = await client.ext("_nofy/session_summaries/workspace_list", {}, 8000); // idempotent
  check("ext round-trip: already-prefixed idempotent", !!r2?.all_sessions);
} catch (e) {
  check("ext round-trip: already-prefixed idempotent", false, e?.message);
}
try {
  await client.rpc("nofy/session_summaries/workspace_list", {}); // no underscore on the wire
  check("negative control: extension without '_' prefix rejected", false, "unexpectedly succeeded");
} catch (e) {
  check("negative control: extension without '_' prefix rejected", e?.code === -32601, `code=${e?.code} ${e?.message}`);
}

/* ── 5. workspace enumeration over the singleton (absorbed registry) ──── */
const enumeration = createWorkspaceEnumeration(client);
const snap = await enumeration.listKnownWorkspaces({ refresh: true }).catch((e) => ({ error: e?.message, workspaces: [], source: "error" }));
check("workspace enumeration via singleton", snap.source === "acp" && snap.workspaces.length > 0, `source=${snap.source} workspaces=${snap.workspaces.length}`);
if (snap.workspaces[0]) {
  const w = snap.workspaces[0];
  console.log("top workspace:", w.path, `(${w.sessions.length} sessions; first title=${short(w.sessions[0]?.title, 60)})`);
  const lazy = await enumeration.listWorkspaceSessions(w.path).catch((e) => ({ error: e?.message }));
  check("lazy per-workspace sessions", Array.isArray(lazy.sessions), `sessions=${lazy.sessions?.length} source=${lazy.source}`);
}

/* ── 6. whole-process WS count to the kernel (§2.3 single-client) ─────── */
const ws1 = wsCountToKernel();
check("WS count to kernel == 1 (singleton + enumeration active)", ws1.count === 1, `count=${ws1.count}\n${ws1.raw}`);

/* ── 7. cancel semantics (§2.1 / §2.5.1) ──────────────────────────────── */
const cwd = process.env.HOME + "/nofy-build";
const sess = await client.rpc("session/new", { cwd, mcpServers: [] });
const sid = sess.sessionId;
console.log("cancel-test session:", sid);

const t0 = Date.now();
const promptP = client.rpc("session/prompt", {
  sessionId: sid,
  prompt: [{ type: "text", text: "写一篇 3000 字的关于人工智能历史的文章，要非常详细。" }],
});
await new Promise((r) => setTimeout(r, 3500));

// 7a. negative control: cancel as REQUEST must fail with -32601 (old acp-client.js bug)
try {
  await client.rpc("session/cancel", { sessionId: sid });
  check("negative control: session/cancel as request rejected", false, "unexpectedly succeeded");
} catch (e) {
  check("negative control: session/cancel as request rejected", e?.code === -32601, `code=${e?.code} ${e?.message}`);
}

// 7b. correct form: cancel as NOTIFICATION
const sentCancelAt = Date.now();
const sent = client.cancel(sid);
check("session/cancel sent as notification", sent);
const res = await Promise.race([promptP, new Promise((r) => setTimeout(() => r({ __timeout: true }), 15000))]);
const settleMs = Date.now() - sentCancelAt;
check(
  "prompt settled cancelled after notification",
  sent && res?.stopReason === "cancelled" && settleMs < 5000,
  `stopReason=${res?.stopReason} settled=${settleMs}ms _meta=${short(res?._meta, 160)}`,
);
console.log("prompt total elapsed:", Date.now() - t0, "ms");

await client.rpc("session/close", { sessionId: sid }).catch(() => {});

/* ── 8. final WS count (nothing leaked) ───────────────────────────────── */
const ws2 = wsCountToKernel();
check("WS count still == 1 after session lifecycle", ws2.count === 1, `count=${ws2.count}`);

/* ── summary ──────────────────────────────────────────────────────────── */
const failed = results.filter((r) => !r.ok);
console.log(`\n== probe5 summary: ${results.length - failed.length}/${results.length} passed ==`);
process.exit(failed.length ? 1 : 0);
