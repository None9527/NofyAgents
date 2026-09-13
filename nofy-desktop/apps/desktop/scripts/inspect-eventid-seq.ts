import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const recs = readFileSync(join(here, "..", "..", "..", "docs", "fixtures", "golden-turn.jsonl"), "utf8")
  .trim().split("\n").map((l) => JSON.parse(l) as { t: number; frame: Record<string, unknown> });
function isObj(v: unknown): v is Record<string, unknown> { return typeof v === "object" && v !== null && !Array.isArray(v); }
const t0 = recs[0]?.t ?? 0;
console.log("");
console.log("══ 带 eventId 的事件，按到达顺序（seq = eventId 尾号）");
let prev = -1;
for (const r of recs) {
  const f = r.frame;
  if (f["kind"] !== "notification") continue;
  const p = isObj(f["params"]) ? f["params"] : {};
  const u = isObj(p["update"]) ? p["update"] : null;
  const meta = isObj(p["_meta"]) ? p["_meta"] : {};
  const eid = typeof meta["eventId"] === "string" ? meta["eventId"] : null;
  if (eid === null) continue;
  const i = eid.lastIndexOf("-");
  const seq = Number(eid.slice(i + 1));
  const disc = u !== null ? String(u["sessionUpdate"] ?? "-") : "-";
  const flag = seq <= prev ? "  ← **会被单一高水位误丢**" : "";
  console.log("  " + String(r.t - t0).padStart(6) + "ms  seq=" + String(seq).padStart(3) + "  " + String(f["method"]).padEnd(20) + disc.padEnd(28) + flag);
  if (seq > prev) prev = seq;
}
console.log("");
console.log("══ available_commands_update 的实际数组长度");
for (const r of recs) {
  const f = r.frame;
  if (f["kind"] !== "notification") continue;
  const p = isObj(f["params"]) ? f["params"] : {};
  const u = isObj(p["update"]) ? p["update"] : null;
  if (u === null || u["sessionUpdate"] !== "available_commands_update") continue;
  const meta = isObj(p["_meta"]) ? p["_meta"] : {};
  const up = isObj(meta["updateParams"]) ? meta["updateParams"] : {};
  console.log("  eventId=" + String(meta["eventId"]) + "  availableCommands.length=" + String((u["availableCommands"] as unknown[] | undefined)?.length) + "  updateParams.commandsCount=" + String(up["commandsCount"]));
}
console.log("");
console.log("══ tool_call / tool_call_update 的 title 与 eventId");
for (const r of recs) {
  const f = r.frame;
  if (f["kind"] !== "notification") continue;
  const p = isObj(f["params"]) ? f["params"] : {};
  const u = isObj(p["update"]) ? p["update"] : null;
  if (u === null) continue;
  const d = String(u["sessionUpdate"]);
  if (d !== "tool_call" && d !== "tool_call_update") continue;
  const meta = isObj(p["_meta"]) ? p["_meta"] : {};
  console.log("  " + d.padEnd(18) + " eventId=" + String(meta["eventId"]).padEnd(16) + " title=" + JSON.stringify(u["title"]) + " kind=" + JSON.stringify(u["kind"] ?? null));
}

