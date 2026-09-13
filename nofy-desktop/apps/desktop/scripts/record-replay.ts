/**
 * S1b 续：录制**重连 + 回放**夹具，定死去重语义。
 *
 * 为什么要录这个（PLAN §13 把它排到补夹具的第一位）：
 * 目前去重高水位只有一条证据——「同一 epoch 内 eventId 序号严格单调 0→27」
 * （session-events-measured.md §8.3）。而「重连后内核重放持久轨时序号如何」
 * **完全未实测**。录制事故已经演示过序号回退的后果：整批事件被静默丢弃。
 * 在拿到数据之前不给去重加 epoch 重置，因为那会破坏真 replay 的去重。
 *
 * 三段：
 *   live    —— 建会话 + 跑一轮极简 prompt（不用工具 ⇒ 不触发权限），产生持久历史
 *   replay  —— SIGKILL 内核 → 自动重派生（走已验证的恢复路径）→ session/load，
 *              记录响应前回放的全部帧
 *   noreplay—— 同一会话再 load 一次并带 _meta.noReplay:true，验证抑制
 *
 * 顺带定死两件事：
 *   - `_meta["nofy/replayed"]` 到底存不存在（我们判定它是 _meta 键而非方法名，
 *     依据是 pager 客户端侧源码；这里从线路上正面验证）
 *   - `_nofy/replayed` 这个方法名是否真会出现（判定：不会）
 *
 * 跑法：node apps/desktop/scripts/record-replay.ts [--keep]
 */
import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AGENT_METHOD } from "@nofy-desktop/acp";
import type { InboundFrame } from "@nofy-desktop/acp";
import { getKernel } from "../main/acp/connection.ts";
import { createIsolatedNofyHome } from "../main/kernel/test-home.ts";
import { newRedactStats, redactLine } from "../main/lib/redact.ts";
import {
  installReapHooks,
  kernelChildCount,
  setKernelEnv,
  shutdownKernel,
  spawnKernelChild,
} from "../main/kernel/supervisor.ts";

const here = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = join(here, "..", "..", "..", "docs", "fixtures");
const OUT = join(FIXTURE_DIR, "golden-replay.jsonl");
const KEEP = process.argv.includes("--keep");
const TURN_TIMEOUT_MS = 120_000;
const PROMPT = "Reply with exactly one word: OK. Do not use any tool. Do not modify any file.";

const gates: Array<[string, boolean, string]> = [];
function gate(name: string, ok: boolean, detail: string): void {
  gates.push([name, ok, detail]);
  console.log((ok ? "  PASS  " : "  FAIL  ") + name + "  —  " + detail);
}
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 等连接确实断开。
 *
 * 必须在 SIGKILL 之后、ready() 之前调用：`ready()` 在「进程已死但 exit 事件
 * 尚未派发」的窗口里会用陈旧结果立即返回（实测 pid1===pid2、随后 session/load
 * 以 "kernel child exited" 失败）。
 */
async function waitForDisconnect(c: { isOpen: () => boolean; on: (e: "status", fn: (s: { connected: boolean }) => void) => () => void }, timeoutMs = 8_000): Promise<void> {
  if (!c.isOpen()) return;
  await new Promise<void>((resolve, reject) => {
    const off = c.on("status", (s) => {
      if (!s.connected) {
        off();
        resolve();
      }
    });
    setTimeout(() => {
      off();
      reject(new Error("disconnect not observed within " + String(timeoutMs) + "ms"));
    }, timeoutMs);
  });
}

async function main(): Promise<number> {
  installReapHooks();
  await mkdir(FIXTURE_DIR, { recursive: true });
  // 必须先截断（appendFile 是追加语义）——见 record-permission.ts 同处注释的事故记录
  await writeFile(OUT, "");

  const home = createIsolatedNofyHome({ copyConfig: true, configOverrides: { "ui.permission_mode": "default" } });
  const ws = mkdtempSync(join(tmpdir(), "nofy-desktop-replay-ws-"));
  setKernelEnv({ ...process.env, NOFY_HOME: home.path });

  console.log("");
  console.log("── 重连+回放 夹具录制 ───────────────────────────────────");
  console.log("  NOFY_HOME :", home.path);
  console.log("  config    :", String(home.configCopied ?? "(none)"), " permission_mode=default");

  const conn = getKernel();
  const uuidMap = new Map<string, string>();
  const stats = newRedactStats();
  let phase: "live" | "replay" | "noreplay" = "live";
  let frames = 0;
  const perPhase = { live: 0, replay: 0, noreplay: 0 };
  const eventIds = { live: [] as string[], replay: [] as string[], noreplay: [] as string[] };
  let sawReplayedMetaKey = 0;
  let sawReplayedMethod = 0;

  conn.on("frame", (f: InboundFrame) => {
    frames++;
    perPhase[phase]++;
    // 采集 eventId 与 _meta["nofy/replayed"] 的出现情况（脱敏前采，避免占位符干扰判定）
    if (f.kind === "notification") {
      if (f.method === "_nofy/replayed") sawReplayedMethod++;
      const p = isObj(f.params) ? f.params : {};
      const meta = isObj(p["_meta"]) ? p["_meta"] : null;
      if (meta !== null && meta["nofy/replayed"] !== undefined) sawReplayedMetaKey++;
      const eid = meta !== null ? meta["eventId"] : undefined;
      if (typeof eid === "string") eventIds[phase].push(eid);
    }
    void appendFile(OUT, redactLine(JSON.stringify({ t: Date.now(), phase, frame: f }), uuidMap, stats) + "\n");
  });

  /* ── 段 1：live ── */
  conn.attachChild(spawnKernelChild());
  await conn.ready(20_000);
  // 注意：conn.ready() 返回的是 **InitializeResult**（modelState 在其 _meta 里），
  // 而 conn.modelState 是连接对象上的 getter（已替你取好 _meta.modelState）。
  // 初版在此写成 (await conn.ready()).modelState ⇒ 恒为 undefined、currentModelId 空。
  const ms = conn.modelState;
  const modelId = isObj(ms) ? String(ms["currentModelId"] ?? "") : "";
  gate("前置：有可用模型", modelId.length > 0, "currentModelId=" + (modelId || "(empty)"));
  if (modelId.length === 0) throw new Error("no model");

  const created = await conn.rpc(AGENT_METHOD.newSession, { cwd: ws, mcpServers: [], _meta: { modelId } }, 30_000);
  const sessionId = isObj(created) ? String(created["sessionId"] ?? "") : "";
  gate("session/new 成功", sessionId.length > 0, "sessionId=" + sessionId.slice(0, 12));
  if (sessionId.length === 0) throw new Error("session/new failed");

  let stopLive = "(none)";
  try {
    const r = await conn.rpc(AGENT_METHOD.prompt, { sessionId, prompt: [{ type: "text", text: PROMPT }] }, TURN_TIMEOUT_MS);
    if (isObj(r)) stopLive = String(r["stopReason"] ?? "(none)");
  } catch (e) {
    stopLive = "ERROR: " + (e instanceof Error ? e.message : String(e));
  }
  await wait(300);
  console.log("  [live] stopReason=" + stopLive + " frames=" + String(perPhase.live) + " eventIds=" + String(eventIds.live.length));
  gate("live 轮次跑通并产生持久历史", stopLive === "end_turn" && eventIds.live.length > 0,
    "stopReason=" + stopLive + " eventIds=" + String(eventIds.live.length));

  /* ── 段 2：SIGKILL → 自动重派生 → session/load 回放 ── */
  const pid1 = conn.kernelPid;
  console.log("  → SIGKILL 内核 pid=" + String(pid1) + "，等断连后自动重派生");
  process.kill(pid1 as number, "SIGKILL");
  await waitForDisconnect(conn);
  await conn.ready(25_000);
  const pid2 = conn.kernelPid;
  gate("重连成功且换了进程", pid2 !== undefined && pid2 !== pid1, "pid1=" + String(pid1) + " pid2=" + String(pid2));
  gate("重连后仍是单内核", kernelChildCount() === 1, "count=" + String(kernelChildCount()));

  phase = "replay";
  const replayStart = frames;
  let loadOk = false;
  let loadErr = "";
  try {
    await conn.rpc(AGENT_METHOD.loadSession, { sessionId, cwd: ws, mcpServers: [] }, 60_000);
    loadOk = true;
  } catch (e) {
    loadErr = e instanceof Error ? e.message : String(e);
  }
  await wait(400);
  const replayFramesBeforeResponse = frames - replayStart;
  console.log("  [replay] frames=" + String(perPhase.replay) + " eventIds=" + String(eventIds.replay.length) + " loadOk=" + String(loadOk) + (loadErr ? " err=" + loadErr : ""));
  gate("session/load 成功", loadOk, loadOk ? "ok" : loadErr);
  gate("load 响应前确有回放帧", perPhase.replay > 1, "replayFrames=" + String(perPhase.replay) + "（含 load 响应本身）");
  void replayFramesBeforeResponse;

  /* ── 段 3：noReplay 抑制 ── */
  phase = "noreplay";
  let noReplayOk = false;
  try {
    await conn.rpc(AGENT_METHOD.loadSession, { sessionId, cwd: ws, mcpServers: [], _meta: { noReplay: true } }, 60_000);
    noReplayOk = true;
  } catch (e) {
    console.log("  [noreplay] err:", e instanceof Error ? e.message : String(e));
  }
  await wait(300);
  console.log("  [noreplay] frames=" + String(perPhase.noreplay) + " eventIds=" + String(eventIds.noreplay.length));
  gate("_meta.noReplay:true 被接受", noReplayOk, "ok=" + String(noReplayOk));
  // noReplay 抑制的是**转录回放**，不是让整次调用完全静默：实测 load 自身仍会
  // 产生 1 个新事件（seq 高于 live 的 max）。故断言「远少于回放」而非「为零」。
  gate("_meta.noReplay:true 确实抑制了转录回放",
    eventIds.noreplay.length <= 1 && eventIds.noreplay.length < eventIds.replay.length,
    "noreplay=" + String(eventIds.noreplay.length) + " vs replay=" + String(eventIds.replay.length));

  /* ── 去重语义的核心结论 ── */
  console.log("");
  console.log("── 去重语义实测 ──");
  const liveSet = new Set(eventIds.live);
  const overlap = eventIds.replay.filter((x) => liveSet.has(x)).length;
  const novel = eventIds.replay.filter((x) => !liveSet.has(x)).length;
  // 只打印序号尾段，不把真 sessionId 打到控制台（夹具本身已脱敏，日志也该干净）
  const seqs = (ids: string[]) => ids.map((x) => x.slice(x.lastIndexOf("-") + 1)).join(",");
  console.log("  live   eventIds:", String(eventIds.live.length), " seq:", seqs(eventIds.live).slice(0, 80));
  console.log("  replay eventIds:", String(eventIds.replay.length), " seq:", seqs(eventIds.replay).slice(0, 80));
  console.log("  与 live 重合:", String(overlap), " 新出现:", String(novel));
  console.log("  _meta 里 nofy/replayed 键出现次数:", String(sawReplayedMetaKey));
  console.log("  _nofy/replayed 作为方法名出现次数:", String(sawReplayedMethod));
  // 实测结论（见 docs/contract/replay-dedup-measured.md）：回放**不是**原样重发全部——
  //   · 重合部分＝持久轨上已存在的事件，seq 全部 ≤ live 的 max（会被高水位正确丢弃）
  //   · 新增部分＝load 自身产生的新事件，seq 全部 > live 的 max（会被正确应用）
  //   · 且**乱序到达**（实测 2,4,3,7,5,8,…）
  // ⇒ 单一高水位是对的，但判据不是「全部重合」，而是「重合的都 ≤ max、新增的都 > max」。
  const seqOf = (id: string) => Number(id.slice(id.lastIndexOf("-") + 1));
  const liveMax = eventIds.live.reduce((m, x) => Math.max(m, seqOf(x)), -1);
  const badOverlap = eventIds.replay.filter((x) => liveSet.has(x) && seqOf(x) > liveMax);
  const badNovel = eventIds.replay.filter((x) => !liveSet.has(x) && seqOf(x) <= liveMax);
  gate("回放 eventId 与高水位语义自洽（重合≤liveMax、新增>liveMax）",
    eventIds.replay.length > 0 && overlap > 0 && badOverlap.length === 0 && badNovel.length === 0,
    "liveMax=" + String(liveMax) + " overlap=" + String(overlap) + " novel=" + String(novel)
    + " badOverlap=" + String(badOverlap.length) + " badNovel=" + String(badNovel.length));
  gate("回放确会乱序到达（投影层不得假定有序）",
    eventIds.replay.some((x, i) => i > 0 && seqOf(x) < seqOf(eventIds.replay[i - 1] as string)),
    "seq 序列=" + eventIds.replay.map(seqOf).join(","));
  gate("_nofy/replayed 不是方法名（全流零出现）", sawReplayedMethod === 0, "count=" + String(sawReplayedMethod));

  console.log("");
  console.log("[diagnostics]", JSON.stringify(conn.diag));
  stats.distinctUuids = uuidMap.size;
  console.log("[脱敏账]", JSON.stringify(stats));
  gate("夹具已写出", frames > 20, "frames=" + String(frames) + " → docs/fixtures/golden-replay.jsonl");
  gate("零坏帧", conn.diag.malformed === 0, "malformed=" + String(conn.diag.malformed));

  conn.close();
  shutdownKernel();
  setKernelEnv(null);
  await wait(400);
  if (!KEEP) {
    home.cleanup();
    rmSync(ws, { recursive: true, force: true });
  }
  gate("收尾无孤儿内核", kernelChildCount() === 0, "count=" + String(kernelChildCount()));

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
    console.error("REPLAY RECORD CRASHED:", e instanceof Error ? e.stack : String(e));
    shutdownKernel();
    setKernelEnv(null);
    process.exit(1);
  });





