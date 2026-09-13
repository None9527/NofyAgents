/**
 * 对账：我们的 EXT 手写表 vs 内核源码提取的 kernel-ext-usage.json。
 *
 * 跑法：node packages/acp/scripts/report-ext-usage.ts
 * 输出四类差异：
 *   MISCLASSIFIED —— 我们有、内核也有，但**种类/方向判错**（最危险：会导致等一个永不到来的响应）
 *   MISSING       —— 内核有、我们没登记（能力盲区）
 *   UNSUPPORTED   —— 我们有、内核生产码里找不到构造点（可能在 constOnly，也可能真不存在）
 *   OK            —— 一致
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EXT } from "../src/methods.ts";

const here = dirname(fileURLToPath(import.meta.url));
const evPath = join(here, "..", "schema", "kernel-ext-usage.json");

type Evidence = {
  counts: Record<string, number>;
  buckets: {
    clientRequest: Record<string, string[]>;
    clientNotification: Record<string, string[]>;
    kernelRequest: Record<string, string[]>;
    kernelEvent: Record<string, string[]>;
  };
  constOnly: string[];
  sitesSha256: string;
};
const ev = JSON.parse(readFileSync(evPath, "utf8")) as Evidence;

/** 我们的 EXT 值都带 _nofy/ 前缀；内核源码里的名字不带。 */
const strip = (wire: string) => wire.replace(/^_/, "");

// 我们当前把 EXT 全部当「一个平面表」，靠注释分方向。这里按注释语义**声明**我们的意图，
// 以便与证据对账。意图来源＝methods.ts 的分节注释（EVENT / REQUEST / SERVER_REQUEST）。
const OUR_INTENT: Record<string, "kernelEvent" | "clientRequest" | "kernelRequest"> = {
  // 事件：内核 → 客户端
  sessionNotification: "kernelEvent",
  sessionUpdate: "kernelEvent",
  sessionUpdatesChunk: "kernelEvent",
  sessionsChanged: "kernelEvent",
  queueChanged: "kernelEvent",
  modelsUpdate: "kernelEvent",
  settingsUpdate: "kernelEvent",
  replayed: "kernelEvent",
  announcementsUpdate: "kernelEvent",
  gitHeadChanged: "kernelEvent",
  taskBackgrounded: "kernelEvent",
  taskCompleted: "kernelEvent",
  monitorEvent: "kernelEvent",
  sessionInterjection: "kernelEvent",
  followUps: "kernelEvent",
  mcpServersUpdated: "kernelEvent",
  mcpInitProgress: "kernelEvent",
  mcpToolsChanged: "kernelEvent",
  mcpServerStatus: "kernelEvent",
  mcpInitialized: "kernelEvent",
  scheduledTaskCreated: "kernelEvent",
  scheduledTaskFired: "kernelEvent",
  scheduledTaskDeleted: "kernelEvent",
  scheduledTaskInjectPrompt: "kernelEvent",
  // 请求：客户端 → 内核
  sessionInfo: "clientRequest",
  sessionList: "clientRequest",
  sessionState: "clientRequest",
  sessionRename: "clientRequest",
  sessionDelete: "clientRequest",
  sessionFork: "clientRequest",
  sessionUsage: "clientRequest",
  sessionUpdates: "clientRequest",
  sessionLoadHistory: "clientRequest",
  sessionSearch: "clientRequest",
  summariesWorkspaceList: "clientRequest",
  summariesWorkspaceListRecent: "clientRequest",
  summariesSessionList: "clientRequest",
  sessionsList: "clientRequest",
  interject: "clientRequest",
  btw: "clientRequest",
  recap: "clientRequest",
  rewindPoints: "clientRequest",
  rewindExecute: "clientRequest",
  compactConversation: "clientRequest",
  togglePlanMode: "clientRequest",
  commandsList: "clientRequest",
  workflowsList: "clientRequest",
  promptHistory: "clientRequest",
  reloadModels: "clientRequest",
  // 请求：内核 → 客户端（需应答）
  askUserQuestion: "kernelRequest",
  exitPlanMode: "kernelRequest",
  mcpElicit: "kernelRequest",
  mcpSdkCall: "kernelRequest",
};

/**
 * 归类查询，**与提取器同一套优先规则**：内核侧构造优先。
 * 例：nofy/session/update 同时在 kernelEvent（replay.rs:80/114 上线）与
 * clientNotification（pager 的 subagent_{lifecycle,activity}.rs 本地重建同形状）里；
 * 取先匹配的会误判成 clientNotification，故必须内核侧优先。
 */
function whereIs(name: string): string | null {
  for (const k of ["kernelRequest", "kernelEvent", "clientRequest", "clientNotification"] as const) {
    if (ev.buckets[k][name] !== undefined) return k;
  }
  return null;
}

/** 分派侧兜底：内核**接受**该精确名（match 臂），即使找不到字面量构造点。 */
function isDispatched(name: string): boolean {
  return (ev as unknown as { dispatched?: Record<string, string[]> }).dispatched?.[name] !== undefined;
}
/** 分派侧兜底：命中某个 starts_with 前缀族。 */
function isDispatchedPrefix(name: string): string | null {
  const fam = (ev as unknown as { dispatchedPrefix?: Record<string, string[]> }).dispatchedPrefix ?? {};
  for (const p of Object.keys(fam)) {
    if (name.startsWith(p)) return p;
  }
  return null;
}

const ok: string[] = [];
const misclassified: Array<[string, string, string]> = [];
const unsupported: string[] = [];

for (const [key, wire] of Object.entries(EXT)) {
  const bare = strip(wire);
  const intent = OUR_INTENT[key];
  const actual = whereIs(bare);
  if (intent === undefined) {
    unsupported.push(key + " (" + wire + ") —— OUR_INTENT 未声明，脚本需更新");
    continue;
  }
  if (actual === null) {
    // 无字面量构造点，但内核分派表认它 ⇒ 仍是真请求（pager 经常量/helper 发）。
    // 实测：nofy/session_summaries/workspace_list 由 handlers/session.rs:204 分派，
    // 且我们的 smoke 用 rpc() 调它拿到过真响应。
    if (isDispatched(bare)) {
      const kind = intent === "kernelRequest" ? "kernelRequest" : "clientRequest";
      ok.push(key + " —— 无构造点但内核分派（按 " + kind + " 归类）");
      continue;
    }
    const fam = isDispatchedPrefix(bare);
    if (fam !== null) {
      ok.push(key + " —— 命中前缀族 " + fam + "（二级 handler 分派）");
      continue;
    }
    if (ev.constOnly.includes(bare) || ev.constOnly.includes(wire)) {
      ok.push(key + " —— 仅常量定义（经 helper 发送或内核内部用）");
      continue;
    }
    unsupported.push(key + " (" + wire + ")");
    continue;
  }
  if (actual === intent) {
    ok.push(key + " → " + actual);
  } else {
    misclassified.push([key + " (" + wire + ")", "我们当作 " + intent, "内核实为 " + actual]);
  }
}

// 内核有、我们没登记
const ours = new Set(Object.values(EXT).map(strip));
const missing: Array<[string, string]> = [];
for (const k of ["clientRequest", "clientNotification", "kernelRequest", "kernelEvent"] as const) {
  for (const n of Object.keys(ev.buckets[k])) {
    if (!ours.has(n)) missing.push([n, k]);
  }
}

console.log("");
console.log("══ EXT 对账（证据 sitesSha256=" + ev.sitesSha256.slice(0, 12) + "）");
console.log("");
console.log("MISCLASSIFIED  " + String(misclassified.length) + " 条 —— 方向/种类判错，最危险");
for (const m of misclassified) console.log("   ✗ " + m[0] + "  " + m[1] + " / " + m[2]);
console.log("");
console.log("UNSUPPORTED    " + String(unsupported.length) + " 条 —— 内核生产码无构造点");
for (const u of unsupported) console.log("   ? " + u);
console.log("");
console.log("MISSING        " + String(missing.length) + " 条 —— 内核有、我们没登记（能力盲区）");
for (const m of missing.sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]))) {
  console.log("   + " + m[0].padEnd(48) + m[1]);
}
console.log("");
console.log("OK             " + String(ok.length) + " 条");
console.log("");
console.log("结论：MISCLASSIFIED 必须立刻改（会导致等一个永不到来的响应，或把请求当通知发丢）；");
console.log("      MISSING 按 P1–P8 需要逐步登记，不必一次补全；UNSUPPORTED 逐条查 constOnly 或复核。");
process.exit(misclassified.length > 0 ? 1 : 0);


