/**
 * 量清「冷启动载入历史会话时，标题与各会话元数据从哪来」。
 *
 * 动机（replay-dedup-measured.md §2）：`session_info_update`（带 title）与
 * `session_summary_generated`（带 session_summary）**都不在回放集里**，
 * 所以新进程 `session/load` 一个历史会话时收不到标题事件。
 * 标题必须从某个**读路径**取——本探针把所有候选读路径的响应形状一次量清，
 * 不靠猜也不靠旧文档。
 *
 * 候选：session/load 响应 · session/list · _nofy/session/info ·
 *       _nofy/session_summaries/{session_list, workspace_list} ·
 *       _nofy/sessions/list（活体 roster）
 *
 * 跑法：node apps/desktop/scripts/probe-session-shapes.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AGENT_METHOD, EXT_REQUEST, EXT_UNVERIFIED_PARAMS } from "@nofy-desktop/acp";
import { getKernel } from "../main/acp/connection.ts";
import { createIsolatedNofyHome } from "../main/kernel/test-home.ts";
import { installReapHooks, setKernelEnv, shutdownKernel, spawnKernelChild } from "../main/kernel/supervisor.ts";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, "..", "..", "..", "docs", "contract", "session-read-shapes.json");
const PROMPT = "Reply with exactly one word: OK. Do not use any tool.";

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
/** 只留键名与类型/短值，避免把用户数据或密钥写进文档。 */
function shape(v: unknown, depth = 0): unknown {
  if (v === null) return "null";
  if (Array.isArray(v)) return v.length === 0 ? "[]空" : [shape(v[0], depth + 1), "…len=" + String(v.length)];
  if (typeof v === "object") {
    if (depth >= 3) return "{…}";
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) out[k] = shape(x, depth + 1);
    return out;
  }
  if (typeof v === "string") return "str(" + (v.length > 48 ? v.slice(0, 48) + "…" : v) + ")";
  if (typeof v === "number" || typeof v === "boolean") return typeof v + "(" + String(v) + ")";
  return typeof v;
}
/** 把任何层级的标题类字段挑出来，便于直接对比各读路径。 */
function findTitleFields(v: unknown, path = "", out: Record<string, unknown> = {}): Record<string, unknown> {
  if (isObj(v)) {
    for (const [k, x] of Object.entries(v)) {
      const p = path === "" ? k : path + "." + k;
      if (/title|summary|name/i.test(k) && (typeof x === "string" || typeof x === "number")) out[p] = x;
      findTitleFields(x, p, out);
    }
  } else if (Array.isArray(v)) {
    v.slice(0, 2).forEach((x, i) => findTitleFields(x, path + "[" + String(i) + "]", out));
  }
  return out;
}

async function main(): Promise<number> {
  installReapHooks();
  const home = createIsolatedNofyHome({ copyConfig: true, configOverrides: { "ui.permission_mode": "default" } });
  const ws = mkdtempSync(join(tmpdir(), "nofy-desktop-shape-ws-"));
  setKernelEnv({ ...process.env, NOFY_HOME: home.path });
  await writeFile(join(ws, "marker.txt"), "shape probe\n", "utf8");

  const conn = getKernel();
  conn.attachChild(spawnKernelChild());
  await conn.ready(20_000);
  const ms = conn.modelState;
  const modelId = isObj(ms) ? String(ms["currentModelId"] ?? "") : "";
  console.log("");
  console.log("── 会话读路径形状探针 ──");
  console.log("  model:", modelId || "(none)");
  if (modelId.length === 0) throw new Error("no model");

  const created = await conn.rpc(AGENT_METHOD.newSession, { cwd: ws, mcpServers: [], _meta: { modelId } }, 30_000);
  const sessionId = isObj(created) ? String(created["sessionId"] ?? "") : "";
  console.log("  sessionId:", sessionId.slice(0, 12));

  // 跑一轮，让内核生成标题（session_summary_generated）
  let stop = "(none)";
  try {
    const r = await conn.rpc(AGENT_METHOD.prompt, { sessionId, prompt: [{ type: "text", text: PROMPT }] }, 120_000);
    if (isObj(r)) stop = String(r["stopReason"] ?? "(none)");
  } catch (e) {
    stop = "ERR " + (e instanceof Error ? e.message : String(e));
  }
  console.log("  prompt stopReason:", stop);

  const report: Record<string, { ok: boolean; error?: string; shape?: unknown; titleFields?: Record<string, unknown> }> = {};
  const probe = async (label: string, fn: () => Promise<unknown>) => {
    try {
      const v = await fn();
      report[label] = { ok: true, shape: shape(v), titleFields: findTitleFields(v) };
      console.log("");
      console.log("══ " + label + "  ✓");
      console.log("   标题类字段:", JSON.stringify(report[label].titleFields));
      console.log("   形状:", JSON.stringify(report[label].shape)?.slice(0, 900));
    } catch (e) {
      report[label] = { ok: false, error: e instanceof Error ? e.message : String(e) };
      console.log("");
      console.log("══ " + label + "  ✗ " + report[label].error);
    }
  };

  await probe("session/load", () =>
    conn.rpc(AGENT_METHOD.loadSession, { sessionId, cwd: ws, mcpServers: [], _meta: { noReplay: true } }, 30_000));
  await probe("session/list", () => conn.rpc(AGENT_METHOD.listSessions, {}, 30_000));
  await probe("_nofy/session/info", () => conn.ext(EXT_REQUEST.sessionInfo, { sessionId }, 30_000));
  // 下面三条属 EXT_UNVERIFIED_PARAMS：内核有分派臂但实测调不通
  //（Invalid params / Method not found）。探针的职责就是把正确参数量出来。
  await probe("_nofy/session/state", () => conn.ext(EXT_UNVERIFIED_PARAMS.sessionState, { sessionId }, 30_000));
  await probe("_nofy/session_summaries/session_list", () =>
    conn.ext(EXT_UNVERIFIED_PARAMS.summariesSessionList, { cwd: ws }, 30_000));
  await probe("_nofy/session_summaries/workspace_list", () =>
    conn.ext(EXT_REQUEST.summariesWorkspaceList, {}, 30_000));
  await probe("_nofy/sessions/list (roster)", () => conn.ext(EXT_REQUEST.sessionsList, {}, 30_000));
  await probe("_nofy/session/load_history", () =>
    conn.ext(EXT_UNVERIFIED_PARAMS.sessionLoadHistory, { sessionId, limit: 5 }, 30_000));

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), kernelAgentVersion: conn.agentVersion, stopReason: stop, report }, null, 2) + "\n");
  console.log("");
  console.log("→ 写入", OUT);

  conn.close();
  shutdownKernel();
  setKernelEnv(null);
  home.cleanup();
  rmSync(ws, { recursive: true, force: true });
  const okCount = Object.values(report).filter((r) => r.ok).length;
  console.log("── 可用读路径: " + String(okCount) + "/" + String(Object.keys(report).length) + " ──");
  return 0;
}

main()
  .then((c) => { process.exitCode = c; setTimeout(() => process.exit(c), 150).unref(); })
  .catch((e) => { console.error("CRASHED:", e instanceof Error ? e.stack : String(e)); shutdownKernel(); setKernelEnv(null); process.exit(1); });


