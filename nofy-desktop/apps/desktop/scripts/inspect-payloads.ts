/**
 * 逐事件种类打印一个**真实载荷样本**（键名 + 类型 + 短值），供投影层照实实现。
 *
 * 纪律（PLAN.md §5）：「一条不落、一条不造」。投影层的字段名必须来自这里，
 * 不得来自旧文档的转述——本轮已经证明旧文档在判别字段的嵌套层级上就是错的
 * （session-events-measured.md §1）。
 *
 * 跑法：node apps/desktop/scripts/inspect-payloads.ts [夹具]
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeNotification } from "../renderer/core/events.ts";
import type { NormalizedEvent } from "../renderer/core/events.ts";

const here = dirname(fileURLToPath(import.meta.url));
const target = process.argv[2] ?? join(here, "..", "..", "..", "docs", "fixtures", "golden-turn.jsonl");
type Rec = { t: number; frame: Record<string, unknown> };
const recs = readFileSync(target, "utf8").trim().split("\n").map((l) => JSON.parse(l) as Rec);

function kindOf(ev: NormalizedEvent): string {
  if (ev.type === "session-update") return "su:" + ev.kind;
  if (ev.type === "ext-notification") return "ext:" + ev.kind;
  return ev.type;
}
function desc(v: unknown, depth: number): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return v.length === 0 ? "[]空" : "[" + desc(v[0], depth + 1) + "]×" + String(v.length);
  if (typeof v === "object") {
    if (depth >= 2) return "{…}";
    const e = Object.entries(v as Record<string, unknown>);
    return "{" + e.map(([k, x]) => k + ":" + desc(x, depth + 1)).join(", ") + "}";
  }
  if (typeof v === "string") return "str(" + (v.length > 40 ? v.slice(0, 40) + "…" : v) + ")";
  if (typeof v === "number") return "num(" + String(v) + ")";
  return typeof v;
}

const first = new Map<string, Record<string, unknown>>();
const counts = new Map<string, number>();
for (const r of recs) {
  const f = r.frame;
  if (f["kind"] !== "notification") continue;
  const ev = normalizeNotification(String(f["method"]), f["params"]);
  const k = kindOf(ev);
  counts.set(k, (counts.get(k) ?? 0) + 1);
  if (!first.has(k)) {
    const payload =
      ev.type === "session-update" || ev.type === "ext-notification" ? ev.update
      : ev.type === "prompt-complete" || ev.type === "queue-changed" || ev.type === "sessions-changed"
        || ev.type === "models-update" || ev.type === "settings-update" || ev.type === "mcp"
        || ev.type === "unknown" ? (ev.params as Record<string, unknown>)
      : {};
    first.set(k, payload);
  }
}

console.log("");
console.log("夹具:", target.split("/").pop());
console.log("");
for (const [k, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
  const p = first.get(k) ?? {};
  console.log("══ " + k + "  ×" + String(n));
  console.log("   update/params: " + desc(p, 0));
}
// session/update 的 _meta 信封也打一份
for (const r of recs) {
  const f = r.frame;
  if (f["kind"] !== "notification" || String(f["method"]) !== "session/update") continue;
  const p = f["params"] as Record<string, unknown>;
  console.log("");
  console.log("══ session/update 的 params._meta 信封");
  console.log("   " + desc(p["_meta"], 0));
  break;
}

