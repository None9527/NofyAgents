/**
 * 回合收尾信号盘点：turn_completed / prompt_complete / prompt 响应，三者的
 * stopReason 各是什么、各发了几次。
 *
 * 用途：判定「拒绝权限」「用户取消」等路径是否仍发 turn_completed。
 * 若不发，投影层只从 turn_completed 取 stopReason 就会留下**上一轮的陈旧值**，
 * UI 会一直显示「工作中」——正是旧路 D11「运行期无停止控件」那一类体感。
 *
 * 跑法：node apps/desktop/scripts/inspect-turn-end.ts [夹具名]
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const name = process.argv[2] ?? "golden-turn.jsonl";
const path = join(here, "..", "..", "..", "docs", "fixtures", name);
const recs = readFileSync(path, "utf8").trim().split("\n").map((l) => JSON.parse(l) as Record<string, unknown>);
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

console.log("");
console.log("══ " + name + "  回合收尾信号");
let tc = 0;
let pc = 0;
for (const r of recs) {
  const f = isObj(r["frame"]) ? r["frame"] : {};
  const kind = String(f["kind"]);
  if (kind === "notification") {
    const method = String(f["method"]);
    const p = isObj(f["params"]) ? f["params"] : {};
    const u = isObj(p["update"]) ? p["update"] : null;
    const d = u !== null ? String(u["sessionUpdate"] ?? "") : "";
    if (d === "turn_completed") {
      tc++;
      console.log("  turn_completed  #" + String(tc) + "  stop_reason=" + JSON.stringify(u?.["stop_reason"]) + "  prompt_id=" + JSON.stringify(u?.["prompt_id"]));
    } else if (d === "pending_interaction" || d === "interaction_resolved") {
      console.log("  " + d.padEnd(22) + " tool_call_id=" + JSON.stringify(u?.["tool_call_id"]) + " kind=" + JSON.stringify(u?.["kind"] ?? null));
    }
    if (method === "_nofy/session/prompt_complete") {
      pc++;
      console.log("  prompt_complete #" + String(pc) + "  stopReason=" + JSON.stringify(p["stopReason"]));
    }
  }
  if (kind === "response" && isObj(f["result"]) && typeof f["result"]["stopReason"] === "string") {
    console.log("  prompt response(id=" + String(f["id"]) + ")  stopReason=" + JSON.stringify(f["result"]["stopReason"]));
  }
}
console.log("");
console.log("  totals: turn_completed=" + String(tc) + "  prompt_complete=" + String(pc));
if (tc === 0) console.log("  ⚠ 本轮**没有** turn_completed —— 投影层若只认它，stopReason 会留在上一轮的值");

