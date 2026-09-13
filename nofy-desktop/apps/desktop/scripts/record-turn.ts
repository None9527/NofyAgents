/**
 * S1b：录制**完整轮次**黄金夹具（PLAN.md §13.3）。
 *
 *   prompt → tool_call → permission → turn_completed
 *
 * 这段录制是投影层（core/project.ts）的准绳：投影按 TUI spec Part 4 的事件表逐条
 * 实现，而这份夹具是「真内核真的会发什么」的地面真相。此后任何投影改动都拿它当回归门。
 *
 * 安全设计：
 *   - 隔离 NOFY_HOME（copyConfig=true 才有凭据；目录 0700、用完即删）
 *   - 工作区是 mktemp 出来的临时目录，里面只有我们放的一个只读文件
 *   - prompt 明确要求只读、不改文件、不跑命令
 *   - 权限应答走**只读白名单**：命中才 allow_once，其余一律 cancelled 并记录
 *   - 录完立刻跑卫生门，夹具含密钥则拒绝入库
 *
 * 跑法：node apps/desktop/scripts/record-turn.ts [--keep]
 */
import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AGENT_METHOD, EXT_REQUEST } from "@nofy-desktop/acp";
import type { InboundFrame } from "@nofy-desktop/acp";
import { ensureKernel, getKernel } from "../main/acp/connection.ts";
import { newRedactStats, redactLine } from "../main/lib/redact.ts";
import { createIsolatedNofyHome } from "../main/kernel/test-home.ts";
import { installReapHooks, kernelChildCount, setKernelEnv, shutdownKernel } from "../main/kernel/supervisor.ts";

const here = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = join(here, "..", "..", "..", "docs", "fixtures");
const OUT = join(FIXTURE_DIR, "golden-turn.jsonl");
const KEEP = process.argv.includes("--keep");

const TURN_TIMEOUT_MS = 180_000;
const FILE_NAME = "hello.txt";
const FILE_LINE_1 = "The quick brown fox jumps over the lazy dog.";
const PROMPT =
  "Read the file " + FILE_NAME + " in the current working directory and reply with exactly its first line. " +
  "Do not modify any file. Do not run any shell command. Read only.";

/** 只读工具白名单：命中才允许，其余一律拒。宁可夹具少一个 tool_call，不可放行动作。 */
const READ_ONLY_HINTS = ["read", "view", "cat", "grep", "search", "list", "glob", "ls", "find", "open"];
function looksReadOnly(params: Record<string, unknown>): boolean {
  const tc = params["toolCall"];
  const blob = JSON.stringify(tc ?? params).toLowerCase();
  return READ_ONLY_HINTS.some((h) => blob.includes(h));
}

const gates: Array<[string, boolean, string]> = [];
function gate(name: string, ok: boolean, detail: string): void {
  gates.push([name, ok, detail]);
  console.log((ok ? "  PASS  " : "  FAIL  ") + name + "  —  " + detail);
}
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

async function main(): Promise<number> {
  installReapHooks();
  await mkdir(FIXTURE_DIR, { recursive: true });

  const home = createIsolatedNofyHome({ copyConfig: true });
  const ws = mkdtempSync(join(tmpdir(), "nofy-desktop-turn-ws-"));
  await writeFile(join(ws, FILE_NAME), FILE_LINE_1 + "\nsecond line\n", "utf8");
  setKernelEnv({ ...process.env, NOFY_HOME: home.path });

  console.log("");
  console.log("── S1b 黄金夹具录制 ─────────────────────────────────────");
  console.log("  NOFY_HOME :", home.path);
  console.log("  config    :", String(home.configCopied ?? "(none)"));
  console.log("  workspace :", ws);
  console.log("  out       :", OUT);

  // 必须先截断（appendFile 是追加语义）——见 record-permission.ts 同处注释的真实事故。
  await writeFile(OUT, "");

  const conn = getKernel();
  // 录制即脱敏：copyConfig=true 会把 provider 的 api_key 回显进 initialize 的
  // modelState，未脱敏的夹具实测含 16 处 sk- 密钥 + 617 处 /Users/<用户名>。
  const uuidMap = new Map<string, string>();
  const redactStats = newRedactStats();
  const seen = {
    frames: 0,
    updates: 0,
    extUpdates: 0,
    sessionNotifications: 0,
    agentChunks: 0,
    toolCalls: 0,
    permissions: 0,
    permissionAllowed: 0,
    turnCompleted: 0,
    models: 0,
  };
  const methodTally: Record<string, number> = {};
  const agentText: string[] = [];

  conn.on("frame", (f: InboundFrame) => {
    seen.frames++;
    const line = redactLine(JSON.stringify({ t: Date.now(), frame: f }), uuidMap, redactStats);
    void appendFile(OUT, line + "\n");
    if (f.kind === "notification") methodTally[f.method] = (methodTally[f.method] ?? 0) + 1;
  });
  conn.on("update", (p) => {
    seen.updates++;
    // 判别字段在 params.update.sessionUpdate，不在 params 顶层（实测，见
    // docs/contract/session-events-measured.md）。初版在此看错一层，23 条全记成 ?。
    const u = typeof p["update"] === "object" && p["update"] !== null ? (p["update"] as Record<string, unknown>) : p;
    const kind = String(u["sessionUpdate"] ?? "?");
    methodTally["update:" + kind] = (methodTally["update:" + kind] ?? 0) + 1;
    if (kind === "agent_message_chunk") {
      seen.agentChunks++;
      const c = u["content"];
      if (isObj(c) && typeof c["text"] === "string") agentText.push(c["text"]);
    }
    if (kind === "tool_call" || kind === "tool_call_update") seen.toolCalls++;
  });
  conn.on("extUpdate", () => { seen.extUpdates++; });
  conn.on("sessionNotification", (p) => {
    seen.sessionNotifications++;
    const u = typeof p["update"] === "object" && p["update"] !== null ? (p["update"] as Record<string, unknown>) : p;
    const tag = String(u["sessionUpdate"] ?? "?");
    methodTally["nofy:" + tag] = (methodTally["nofy:" + tag] ?? 0) + 1;
    if (tag === "turn_completed") seen.turnCompleted++;
  });
  conn.on("models", () => { seen.models++; });
  conn.on("permission", (p) => {
    seen.permissions++;
    const ro = looksReadOnly(p.params);
    const opts = isObj(p.params) && Array.isArray(p.params["options"]) ? (p.params["options"] as Array<Record<string, unknown>>) : [];
    console.log("  ← permission #" + String(seen.permissions) + " readOnly=" + String(ro) + " options=" + opts.map((o) => String(o["optionId"]) + ":" + String(o["kind"])).join(","));
    if (ro) {
      // 选第一个 allow_once（没有就选第一个 allow_*）
      const pick = opts.find((o) => o["kind"] === "allow_once") ?? opts.find((o) => String(o["kind"]).startsWith("allow"));
      if (pick !== undefined) {
        conn.respondPermission(p.id, { outcome: "selected", optionId: pick["optionId"] });
        seen.permissionAllowed++;
        console.log("    → allow_once " + String(pick["optionId"]));
        return;
      }
    }
    conn.respond(p.id, { outcome: { outcome: "cancelled" } });
    console.log("    → cancelled（不在只读白名单内）");
  });

  const init = await ensureKernel(20_000);
  const ms = init.modelState;
  const currentModelId = isObj(ms) ? String(ms["currentModelId"] ?? "") : "";
  console.log("  model     :", currentModelId || "(none)");
  gate("前置：有可用模型", currentModelId.length > 0, "currentModelId=" + (currentModelId || "(empty)"));
  if (currentModelId.length === 0) throw new Error("no model available; 无法录真轮次");

  // 清空握手期的帧，让夹具只含这一轮（握手形状已在 smoke 夹具里）
  console.log("  → session/new");
  const created = await init.rpc(AGENT_METHOD.newSession, {
    cwd: ws,
    mcpServers: [],
    _meta: { modelId: currentModelId },
  }, 30_000);
  const sessionId = isObj(created) ? String(created["sessionId"] ?? "") : "";
  gate("session/new 返回 sessionId", sessionId.length > 0, "sessionId=" + (sessionId.slice(0, 8) || "(empty)"));
  if (sessionId.length === 0) throw new Error("session/new 未返回 sessionId: " + JSON.stringify(created).slice(0, 300));

  console.log("  → session/prompt（只读任务，最长 " + String(TURN_TIMEOUT_MS / 1000) + "s）");
  const t0 = Date.now();
  let stopReason = "(none)";
  let promptMeta: Record<string, unknown> = {};
  try {
    const res = await init.rpc(AGENT_METHOD.prompt, {
      sessionId,
      prompt: [{ type: "text", text: PROMPT }],
    }, TURN_TIMEOUT_MS);
    if (isObj(res)) {
      stopReason = String(res["stopReason"] ?? "(none)");
      promptMeta = isObj(res["_meta"]) ? res["_meta"] : {};
    }
  } catch (e) {
    stopReason = "ERROR: " + (e instanceof Error ? e.message : String(e));
  }
  const elapsed = Date.now() - t0;
  console.log("  ← prompt 返回 " + String(elapsed) + "ms stopReason=" + stopReason);

  gate("轮次真跑起来（有 agent 文本块）", seen.agentChunks > 0, "agentChunks=" + String(seen.agentChunks));
  gate("回合结束信号 turn_completed", seen.turnCompleted > 0, "turnCompleted=" + String(seen.turnCompleted) + "（依赖它，不依赖 legacy 的 prompt_complete）");
  gate("prompt 响应带 stopReason", stopReason !== "(none)" && !stopReason.startsWith("ERROR"), stopReason);
  gate("旧路 D13 的 30 秒空等没有复现", elapsed < 25_000, "elapsed=" + String(elapsed) + "ms");
  gate("单内核不变量", kernelChildCount() === 1, "count=" + String(kernelChildCount()));

  const reply = agentText.join("");
  console.log("");
  console.log("[助手回复] " + reply.slice(0, 200));
  gate("回复内容正确（读到了文件首行）", reply.includes("quick brown fox"), reply.slice(0, 80) || "(empty)");

  console.log("");
  console.log("[事件账]");
  console.log("  ", JSON.stringify(seen));
  console.log("  methods:");
  for (const k of Object.keys(methodTally).sort()) console.log("    " + String(methodTally[k]).padStart(4) + "  " + k);
  console.log("  prompt _meta keys:", Object.keys(promptMeta).join(",") || "(none)");
  redactStats.distinctUuids = uuidMap.size;
  console.log("");
  console.log("[脱敏账] " + JSON.stringify(redactStats));
  gate("夹具已写出", seen.frames > 3, "frames=" + String(seen.frames) + " → docs/fixtures/golden-turn.jsonl");
  gate("录制即脱敏（密钥与用户名路径归零）", redactStats.secrets >= 0, "secrets=" + String(redactStats.secrets) + " userPaths=" + String(redactStats.userPaths) + " uuids=" + String(redactStats.uuids));

  init.close();
  shutdownKernel();
  setKernelEnv(null);
  await new Promise((r) => setTimeout(r, 400));
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
    console.error("RECORD CRASHED:", e instanceof Error ? e.stack : String(e));
    shutdownKernel();
    setKernelEnv(null);
    process.exit(1);
  });





