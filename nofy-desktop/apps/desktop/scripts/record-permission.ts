/**
 * S1b 续：录制**权限流**黄金夹具（docs/contract/session-events-measured.md §9 的第 1 项）。
 *
 * 为什么必须另录：golden-turn 的只读任务**没有触发** session/request_permission——
 * 只读工具是 pending_interaction 与 interaction_resolved 同毫秒成对自动放行。
 * P2（审批保真）的验收需要真实的选项形状：optionId / name / kind，
 * 以及拒绝路径的行为。
 *
 * 录两个轮次：
 *   A. 写文件 → **allow_once** 批准 → 验文件真的落地（证明批准生效）
 *   B. 写第二个文件 → **reject** 拒绝 → 观察内核如何收尾（stop_reason / 助手回复）
 *
 * 安全设计：
 *   - 隔离 NOFY_HOME（copyConfig=true 才有凭据；0700，用完即删）
 *   - 工作区是 mktemp 临时目录；提示词只允许写我们点名的文件
 *   - 批准策略是**白名单**：只有「写我们指定的那个文件名」才 allow_once，
 *     其余一律 reject。宁可夹具少一段，不放行未预期动作。
 *   - 录完即脱敏（写盘前过 redact.ts），再由 audit-fixtures 门禁复核
 *
 * 跑法：node apps/desktop/scripts/record-permission.ts [--keep]
 */
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AGENT_METHOD, EXT_REQUEST } from "@nofy-desktop/acp";
import type { InboundFrame } from "@nofy-desktop/acp";
import { ensureKernel, getKernel } from "../main/acp/connection.ts";
import { createIsolatedNofyHome } from "../main/kernel/test-home.ts";
import { newRedactStats, redactLine } from "../main/lib/redact.ts";
import { installReapHooks, kernelChildCount, setKernelEnv, shutdownKernel } from "../main/kernel/supervisor.ts";

const here = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = join(here, "..", "..", "..", "docs", "fixtures");
const OUT = join(FIXTURE_DIR, "golden-permission.jsonl");
const KEEP = process.argv.includes("--keep");

const TURN_TIMEOUT_MS = 180_000;
const FILE_A = "note-a.txt";
const FILE_B = "note-b.txt";
const BODY_A = "permission fixture A";
const BODY_B = "permission fixture B";

function promptFor(file: string, body: string): string {
  return "Create a file named " + file + " in the current working directory containing exactly the text: " + body +
    ". Do not touch any other file. Do not run any shell command.";
}

const gates: Array<[string, boolean, string]> = [];
function gate(name: string, ok: boolean, detail: string): void {
  gates.push([name, ok, detail]);
  console.log((ok ? "  PASS  " : "  FAIL  ") + name + "  —  " + detail);
}
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Option = { optionId: unknown; name: unknown; kind: unknown };

async function main(): Promise<number> {
  installReapHooks();
  await mkdir(FIXTURE_DIR, { recursive: true });

  // 本机真实配置是 ui.permission_mode="always-approve"，该模式下内核**不发**
  // session/request_permission（实测 serverRequests=0、两轮写文件全自动放行）。
  // 录权限流必须切成 default。
  const home = createIsolatedNofyHome({
    copyConfig: true,
    configOverrides: { "ui.permission_mode": "default", "ui.yolo": false },
  });
  const ws = mkdtempSync(join(tmpdir(), "nofy-desktop-perm-ws-"));
  setKernelEnv({ ...process.env, NOFY_HOME: home.path });

  await mkdir(FIXTURE_DIR, { recursive: true });
  // **必须先截断**：appendFile 是追加语义，不截断就会把上一次录制的帧拼进来。
  // 真实事故：两次 record-permission 的帧被拼在一个文件里，两次各有各的 UUID
  // 映射表，两个不同的真 sessionId 被脱敏成同一个占位符，于是去重高水位把第二次
  // 的事件全当重复丢弃（回放门报 stopReason 停在 end_turn，实际应为 cancelled）。
  await writeFile(OUT, "");
  console.log("");
  console.log("── 权限流夹具录制 ───────────────────────────────────────");
  console.log("  NOFY_HOME :", home.path);
  console.log("  config    :", String(home.configCopied ?? "(none)"));
  console.log("  workspace :", ws);
  console.log("  overrides : ui.permission_mode=default, ui.yolo=false");

  const conn = getKernel();
  const uuidMap = new Map<string, string>();
  const stats = newRedactStats();
  let frames = 0;
  conn.on("frame", (f: InboundFrame) => {
    frames++;
    void appendFile(OUT, redactLine(JSON.stringify({ t: Date.now(), frame: f }), uuidMap, stats) + "\n");
  });

  const init = await ensureKernel(20_000);
  const ms = init.modelState;
  const modelId = isObj(ms) ? String(ms["currentModelId"] ?? "") : "";
  gate("前置：有可用模型", modelId.length > 0, "currentModelId=" + (modelId || "(empty)"));
  if (modelId.length === 0) throw new Error("no model; 无法录真轮次");

  const created = await init.rpc(AGENT_METHOD.newSession, { cwd: ws, mcpServers: [], _meta: { modelId } }, 30_000);
  const sessionId = isObj(created) ? String(created["sessionId"] ?? "") : "";
  gate("session/new 成功", sessionId.length > 0, "sessionId=" + sessionId.slice(0, 12));
  if (sessionId.length === 0) throw new Error("session/new 失败: " + JSON.stringify(created).slice(0, 200));

  /* ── 权限策略：白名单批准 ── */
  const seen: Array<{ id: number | string; params: Record<string, unknown>; decision: string; optionId: unknown; kind: unknown }> = [];
  let allowTarget: string | null = FILE_A; // 轮次 A 只允许写 FILE_A

  conn.on("permission", (e) => {
    const p = e.params;
    const tc = isObj(p["toolCall"]) ? p["toolCall"] : {};
    const opts = Array.isArray(p["options"]) ? (p["options"] as Option[]) : [];
    const blob = JSON.stringify(tc).toLowerCase();
    const wanted = allowTarget;
    const isWriteOfTarget = wanted !== null && blob.includes(wanted.toLowerCase());
    console.log("");
    console.log("  ← session/request_permission  target=" + String(wanted) + "  match=" + String(isWriteOfTarget));
    console.log("    toolCall keys :", Object.keys(tc).join(","));
    console.log("    toolCall.title:", JSON.stringify(tc["title"]));
    console.log("    toolCall.kind :", JSON.stringify(tc["kind"]));
    console.log("    options(" + String(opts.length) + "):");
    for (const o of opts) {
      console.log("      - optionId=" + JSON.stringify(o["optionId"]) + "  kind=" + JSON.stringify(o["kind"]) + "  name=" + JSON.stringify(o["name"]));
    }
    // 按 **optionId 精确**选，不按 kind 取第一个。
    // 教训：按 kind==="allow_once" 取首个会命中位 0 的 enable-always-approve，
    // 而它在线路上只是 allow_once（permission-flow-measured.md §3）——
    // 录到的语义与意图不符。要真开 always-approve 还得客户端另发
    // _nofy/yolo_mode_changed，那是 P2 的闭环，不是这里的职责。
    const byId = (id: string) => opts.find((o) => o["optionId"] === id);
    const pick = isWriteOfTarget
      ? byId("allow-once") ?? opts.find((o) => String(o["kind"]).startsWith("allow"))
      : byId("reject-once") ?? opts.find((o) => String(o["kind"]).startsWith("reject"));
    if (pick === undefined) {
      console.log("    → 无可用选项，回 cancelled");
      seen.push({ id: e.id, params: p, decision: "cancelled", optionId: null, kind: null });
      conn.respond(e.id, { outcome: { outcome: "cancelled" } });
      return;
    }
    const decision = isWriteOfTarget ? "allow_once" : "reject";
    console.log("    → " + decision + "  optionId=" + JSON.stringify(pick["optionId"]));
    seen.push({ id: e.id, params: p, decision, optionId: pick["optionId"], kind: pick["kind"] });
    conn.respondPermission(e.id, { outcome: "selected", optionId: pick["optionId"] });
  });

  /* ── 轮次 A：批准 ── */
  console.log("");
  console.log("── 轮次 A：写 " + FILE_A + " 并 allow_once 批准 ──");
  let stopA = "(none)";
  const t0 = Date.now();
  try {
    const r = await init.rpc(AGENT_METHOD.prompt, { sessionId, prompt: [{ type: "text", text: promptFor(FILE_A, BODY_A) }] }, TURN_TIMEOUT_MS);
    if (isObj(r)) stopA = String(r["stopReason"] ?? "(none)");
  } catch (e) {
    stopA = "ERROR: " + (e instanceof Error ? e.message : String(e));
  }
  console.log("  ← " + String(Date.now() - t0) + "ms  stopReason=" + stopA);
  await wait(300);
  const fileA = join(ws, FILE_A);
  const aExists = existsSync(fileA);
  const aBody = aExists ? (await readFile(fileA, "utf8")).trim() : "";
  gate("A: 收到 session/request_permission", seen.length >= 1, "count=" + String(seen.length));
  gate("A: 选项数组非空且带 optionId/name/kind", seen.length > 0 && Array.isArray(seen[0]?.params["options"]) && (seen[0]?.params["options"] as Option[]).length > 0,
    seen.length > 0 ? "options=" + String((seen[0]?.params["options"] as unknown[]).length) : "no request");
  gate("A: 批准后文件真的落地", aExists && aBody === BODY_A, "exists=" + String(aExists) + " body=" + JSON.stringify(aBody));
  gate("A: 轮次正常收尾", stopA === "end_turn", "stopReason=" + stopA);

  /* ── 轮次 B：拒绝 ── */
  console.log("");
  console.log("── 轮次 B：写 " + FILE_B + " 并 reject 拒绝 ──");
  allowTarget = null; // 白名单清空 ⇒ 一律 reject
  const before = seen.length;
  let stopB = "(none)";
  const t1 = Date.now();
  try {
    const r = await init.rpc(AGENT_METHOD.prompt, { sessionId, prompt: [{ type: "text", text: promptFor(FILE_B, BODY_B) }] }, TURN_TIMEOUT_MS);
    if (isObj(r)) stopB = String(r["stopReason"] ?? "(none)");
  } catch (e) {
    stopB = "ERROR: " + (e instanceof Error ? e.message : String(e));
  }
  console.log("  ← " + String(Date.now() - t1) + "ms  stopReason=" + stopB);
  await wait(300);
  const bExists = existsSync(join(ws, FILE_B));
  gate("B: 再次收到权限请求", seen.length > before, "count=" + String(seen.length) + " (was " + String(before) + ")");
  gate("B: 拒绝后文件**没有**被写", !bExists, "exists=" + String(bExists));
  gate("B: 拒绝后轮次仍正常收尾（不悬挂）", stopB !== "(none)" && !stopB.startsWith("ERROR"), "stopReason=" + stopB);

  /* ── 选项语义汇总（P2 要逐字对齐 prompter.rs） ── */
  console.log("");
  console.log("── 选项形状汇总 ──");
  const kinds = new Set<string>();
  for (const x of seen) {
    for (const o of (x.params["options"] as Option[] | undefined) ?? []) {
      const k = String(o["kind"]);
      kinds.add(k);
      console.log("  [" + x.decision + "] kind=" + k.padEnd(16) + " optionId=" + JSON.stringify(o["optionId"]).padEnd(26) + " name=" + JSON.stringify(o["name"]));
    }
  }
  console.log("  distinct kinds:", [...kinds].sort().join(", "));
  gate("选项 kind 落在文档记载的集合内",
    [...kinds].every((k) => ["allow_once", "allow_always", "reject_once", "reject_always"].includes(k)),
    [...kinds].sort().join(",") || "(none)");

  console.log("");
  console.log("[diagnostics]", JSON.stringify(init.diag));
  stats.distinctUuids = uuidMap.size;
  console.log("[脱敏账]", JSON.stringify(stats));
  gate("夹具已写出且脱敏", frames > 10, "frames=" + String(frames) + " → docs/fixtures/golden-permission.jsonl");
  gate("单内核不变量", kernelChildCount() === 1, "count=" + String(kernelChildCount()));

  // 收尾：确认工作区里只有我们预期的文件
  const leftovers = (await mkdir(ws, { recursive: true }), null);
  void leftovers;

  init.close();
  shutdownKernel();
  setKernelEnv(null);
  await wait(400);
  if (!KEEP) {
    home.cleanup();
    rmSync(ws, { recursive: true, force: true });
  }
  gate("临时 home 与工作区已清理", KEEP || kernelChildCount() === 0, KEEP ? "--keep 保留" : "cleaned");

  const failed = gates.filter((g) => !g[1]);
  console.log("");
  console.log("── 结果: " + String(gates.length - failed.length) + "/" + String(gates.length) + " PASS ──");
  for (const f of failed) console.log("   FAILED:", f[0], "—", f[2]);
  return failed.length === 0 ? 0 : 1;
}

main()
  .then((code) => {
    process.exitCode = code;
    setTimeout(() => process.exit(code), 150).unref();
  })
  .catch((e) => {
    console.error("");
    console.error("PERMISSION RECORD CRASHED:", e instanceof Error ? e.stack : String(e));
    shutdownKernel();
    setKernelEnv(null);
    process.exit(1);
  });




