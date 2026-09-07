// Probe round 7 — P1a regression: host 自有内核连接的垂直路径（进程级）。
//
// 在**纯 Node** 里加载 host 侧连接模块（与 host 进程同形：stdio 私有子进程），
// 验证阶段 B 所依赖的全部原语：initialize / modelState / 会话列表 / 新建 /
// prompt 流式（session/update 事件）/ 停止（cancel 通知）/ 关闭回收。
// renderer 合同映射（P1b）不在本探针范围。
//
// usage: node desktop/scripts/acp-probe7.mjs

const { ensureHostKernelClient } = await import("../src/out/host/seam/kernel-client-host.js");

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}
const short = (v, n = 300) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s && s.length > n ? s.slice(0, n) + "…" : s;
};
function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

console.log("== acp-probe7: host-owned kernel connection (vertical path) ==");

const client = await ensureHostKernelClient().catch((e) => {
  console.log("FATAL: ensureHostKernelClient failed:", e?.message);
  process.exit(2);
});
const pid = client.child?.pid;

check("host client initialized over stdio child", client.initialized && client.endpointMode === "stdio-child", `pid=${pid}`);
const models = (client.modelState?.availableModels ?? []).map((m) => m?.modelId);
check("modelState from initialize", models.length > 0, `models=[${models.join(", ")}]`);

/* 会话列表（标准 ACP session/list） */
let list0 = [];
try {
  const r = await client.rpc("session/list", { cwd: process.env.HOME + "/nofy-build" }, 8000);
  list0 = r?.sessions ?? r ?? [];
  check("session/list returns array", Array.isArray(list0), `${list0.length} sessions`);
} catch (e) {
  check("session/list returns array", false, e?.message);
}

/* 新建 + 流式 + 停止 */
const sess = await client.rpc("session/new", { cwd: process.env.HOME + "/nofy-build", mcpServers: [] });
const sid = sess.sessionId;
check("session/new returns sessionId", typeof sid === "string" && sid.length > 0, sid);

const chunks = [];
const kinds = {};
// ACP SessionNotification 线形：{sessionId, update:{sessionUpdate, content}}（嵌套于 update）。
// 推理模型前段可能只发 agent_thought_chunk，故流式证据按块种类统计。
const onUpdate = (p) => {
  const u = p?.update ?? p;
  const k = u?.sessionUpdate;
  if (!k) return;
  kinds[k] = (kinds[k] ?? 0) + 1;
  if (k === "agent_message_chunk" || k === "agent_thought_chunk") chunks.push(String(u.content?.text ?? ""));
};
client.on("update", onUpdate);

const promptP = client.rpc("session/prompt", {
  sessionId: sid,
  prompt: [{ type: "text", text: "写一篇 3000 字的关于人工智能历史的文章，要非常详细。" }],
});
await new Promise((r) => setTimeout(r, 6000));
check(
  "streaming chunks received (message/thought)",
  chunks.length > 0,
  `${chunks.length} chunks kinds=${short(kinds)} text=${short(chunks.join("").slice(0, 40))}`,
);

const t0 = Date.now();
const sent = client.cancel(sid);
const res = await Promise.race([promptP, new Promise((r) => setTimeout(() => r({ __timeout: true }), 15000))]);
check(
  "stop via cancel notification settles cancelled",
  sent && res?.stopReason === "cancelled" && Date.now() - t0 < 5000,
  `stopReason=${res?.stopReason} settled=${Date.now() - t0}ms`,
);
client.off("update", onUpdate);

/* 列表含新会话 */
try {
  const r = await client.rpc("session/list", { cwd: process.env.HOME + "/nofy-build" }, 8000);
  const ids = (r?.sessions ?? []).map((s) => s.sessionId ?? s.id);
  check("new session appears in session/list", ids.includes(sid), `${ids.length} sessions`);
} catch (e) {
  check("new session appears in session/list", false, e?.message);
}

await client.rpc("session/close", { sessionId: sid }).catch(() => {});

/* 关闭回收 */
client.close();
let dead = false;
for (let i = 0; i < 25 && !dead; i++) {
  await new Promise((r) => setTimeout(r, 200));
  dead = !pidAlive(pid);
}
check("child reaped after close (stdin EOF)", dead, `pid=${pid}`);

const failed = results.filter((r) => !r.ok);
console.log(`\n== probe7 summary: ${results.length - failed.length}/${results.length} passed ==`);
process.exit(failed.length ? 1 : 0);
