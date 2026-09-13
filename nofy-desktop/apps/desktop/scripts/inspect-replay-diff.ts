/**
 * 对照 live 与 replay 两段的 eventId 集合，列出「回放中新增」的事件是什么。
 * 用途：判定 replay 段多出来的块是内核真发了新事件，还是投影层重复应用。
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
type Rec = { t: number; phase?: string; frame: Record<string, unknown> };
const recs = readFileSync(join(here, "..", "..", "..", "docs", "fixtures", "golden-replay.jsonl"), "utf8")
  .trim().split("\n").map((l) => JSON.parse(l) as Rec);
function isObj(v: unknown): v is Record<string, unknown> { return typeof v === "object" && v !== null && !Array.isArray(v); }

type Row = { phase: string; seq: number; method: string; disc: string; extra: string };
const rows: Row[] = [];
for (const r of recs) {
  const f = r.frame;
  if (f["kind"] !== "notification") continue;
  const p = isObj(f["params"]) ? f["params"] : {};
  const u = isObj(p["update"]) ? p["update"] : null;
  const meta = isObj(p["_meta"]) ? p["_meta"] : {};
  const eid = typeof meta["eventId"] === "string" ? meta["eventId"] : null;
  rows.push({
    phase: String(r.phase ?? "?"),
    seq: eid === null ? -1 : Number(eid.slice(eid.lastIndexOf("-") + 1)),
    method: String(f["method"]),
    disc: u !== null ? String(u["sessionUpdate"] ?? "-") : "-",
    extra: u !== null && typeof u["event_name"] === "string" ? "event_name=" + String(u["event_name"]) : "",
  });
}
const liveSeqs = new Set(rows.filter((x) => x.phase === "live" && x.seq >= 0).map((x) => x.seq));
console.log("");
console.log("══ live 段（带 eventId）");
for (const x of rows.filter((r2) => r2.phase === "live" && r2.seq >= 0)) console.log("  seq=" + String(x.seq).padStart(3) + "  " + x.method.padEnd(28) + x.disc.padEnd(24) + x.extra);
console.log("");
console.log("══ replay 段（带 eventId）  [NEW] = live 里没有的 seq");
for (const x of rows.filter((r2) => r2.phase === "replay" && r2.seq >= 0)) {
  console.log("  seq=" + String(x.seq).padStart(3) + (liveSeqs.has(x.seq) ? "      " : " [NEW]") + "  " + x.method.padEnd(28) + x.disc.padEnd(24) + x.extra);
}
console.log("");
console.log("══ replay 段**不带** eventId 的通知（不参与去重）");
const noId = rows.filter((r2) => r2.phase === "replay" && r2.seq < 0);
const tally = new Map<string, number>();
for (const x of noId) { const k = x.method + "#" + x.disc; tally.set(k, (tally.get(k) ?? 0) + 1); }
for (const [k, n] of [...tally.entries()].sort()) console.log("  " + String(n).padStart(3) + "  " + k);
console.log("");
console.log("══ live 段不带 eventId 的通知");
const tally2 = new Map<string, number>();
for (const x of rows.filter((r2) => r2.phase === "live" && r2.seq < 0)) { const k = x.method + "#" + x.disc; tally2.set(k, (tally2.get(k) ?? 0) + 1); }
for (const [k, n] of [...tally2.entries()].sort()) console.log("  " + String(n).padStart(3) + "  " + k);

