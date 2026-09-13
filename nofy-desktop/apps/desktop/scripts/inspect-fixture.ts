/**
 * 夹具检查器——把录到的真事件形状摊开看。
 *
 * 为什么需要：PORTING-PLAN §2.3 把 session/update 的判别字段写作 sessionUpdate，
 * 但 golden-turn 录制实测 23 条 session/update 的 params 顶层**没有**这个键
 * （record-turn 的事件账里全是 update:?）。字段名必须以录到的真帧为准，
 * 不能以旧文档为准——这正是 PLAN.md §5「一条不落、一条不造」的前提。
 *
 * 跑法：node apps/desktop/scripts/inspect-fixture.ts [夹具路径]
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const target = process.argv[2] ?? join(here, "..", "..", "..", "docs", "fixtures", "golden-turn.jsonl");

type Rec = { t: number; frame: Record<string, unknown> };
const recs = readFileSync(target, "utf8").trim().split("\n").map((l) => JSON.parse(l) as Rec);

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function shape(v: unknown, depth = 0): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "[" + (v.length > 0 ? shape(v[0], depth + 1) : "") + "]×" + String(v.length);
  if (typeof v === "object" && depth < 2) {
    return "{" + Object.entries(v as Record<string, unknown>).map(([k, x]) => k + ":" + shape(x, depth + 1)).join(", ") + "}";
  }
  if (typeof v === "string") return "str(" + (v.length > 24 ? v.slice(0, 24) + "…" : v) + ")";
  return typeof v;
}

console.log("");
console.log("夹具:", target);
console.log("帧数:", String(recs.length));

// 按 method 分组，每组给出 params 的顶层键集与第一个样本
const byMethod = new Map<string, Rec[]>();
for (const r of recs) {
  const f = r.frame;
  const kind = String(f["kind"]);
  const m = kind === "notification" || kind === "server-request" ? String(f["method"]) : kind === "response" ? "response(id=" + String(f["id"]) + ")" : kind;
  const arr = byMethod.get(m) ?? [];
  arr.push(r);
  byMethod.set(m, arr);
}

for (const [m, list] of [...byMethod.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log("");
  console.log("══ " + m + "  ×" + String(list.length));
  const params = list.map((r) => (isObj(r.frame["params"]) ? r.frame["params"] : null));
  const keySets = new Map<string, number>();
  for (const p of params) {
    if (p === null) continue;
    const k = Object.keys(p).sort().join(",");
    keySets.set(k, (keySets.get(k) ?? 0) + 1);
  }
  for (const [k, n] of keySets) console.log("   顶层键 ×" + String(n) + ": " + (k || "(empty)"));
  const first = list[0];
  if (first !== undefined) {
    if (first.frame["kind"] === "response") {
      console.log("   result 形状: " + shape(first.frame["result"]));
    } else {
      console.log("   params 形状: " + shape(first.frame["params"]));
    }
  }
  // 对 session/update 与 session_notification：把判别字段的取值分布摊出来
  if (m === "session/update" || m === "_nofy/session_notification") {
    const tally = new Map<string, number>();
    for (const p of params) {
      if (p === null) continue;
      for (const cand of ["sessionUpdate", "type", "kind", "update", "event", "tag", "notification"]) {
        const v = p[cand];
        if (typeof v === "string") {
          const key = cand + "=" + v;
          tally.set(key, (tally.get(key) ?? 0) + 1);
        }
      }
    }
    if (tally.size > 0) {
      console.log("   判别字段取值分布:");
      for (const [k, n] of [...tally.entries()].sort((a, b) => b[1] - a[1])) console.log("     " + String(n).padStart(3) + "  " + k);
    }
  }
}

