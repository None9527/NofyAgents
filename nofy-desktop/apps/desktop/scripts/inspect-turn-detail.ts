/**
 * 一次性追问：golden-turn 里的判别字段分布与文本落点。
 * 结论要写进 docs/contract/session-events-measured.md。
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, "..", "..", "..", "docs", "fixtures", "golden-turn.jsonl");
type Rec = { t: number; frame: Record<string, unknown> };
const recs = readFileSync(target, "utf8").trim().split("\n").map((l) => JSON.parse(l) as Rec);
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const tally = new Map<string, number>();
let textChars = 0;
const textPieces: string[] = [];
const t0 = recs[0]?.t ?? 0;

for (const r of recs) {
  const f = r.frame;
  if (f["kind"] !== "notification") continue;
  const m = String(f["method"]);
  const p = isObj(f["params"]) ? f["params"] : {};
  const u = isObj(p["update"]) ? p["update"] : null;
  const disc = u !== null ? String(u["sessionUpdate"] ?? "(no sessionUpdate)") : "(no update obj)";
  const key = m + "  →  update.sessionUpdate=" + disc;
  tally.set(key, (tally.get(key) ?? 0) + 1);
  if (u !== null && (disc === "agent_message_chunk" || disc === "agent_thought_chunk" || disc === "user_message_chunk")) {
    const c = u["content"];
    if (isObj(c) && typeof c["text"] === "string") {
      textChars += c["text"].length;
      textPieces.push(c["text"]);
    }
  }
}

console.log("");
console.log("══ 判别字段分布（method → params.update.sessionUpdate）");
for (const [k, n] of [...tally.entries()].sort((a, b) => b[1] - a[1])) {
  console.log("  " + String(n).padStart(3) + "  " + k);
}
console.log("");
console.log("══ 文本落点：agent/thought/user chunk 累计 " + String(textChars) + " 字符");
console.log("  拼接结果: " + JSON.stringify(textPieces.join("").slice(0, 300)));
console.log("");
console.log("══ 时间轴（相对首帧 ms）");
for (const r of recs) {
  const f = r.frame;
  if (f["kind"] !== "notification") continue;
  const p = isObj(f["params"]) ? f["params"] : {};
  const u = isObj(p["update"]) ? p["update"] : null;
  const meta = isObj(p["_meta"]) ? p["_meta"] : {};
  console.log(
    "  " + String(r.t - t0).padStart(6) + "ms  " +
    String(f["method"]).padEnd(30) +
    (u !== null ? String(u["sessionUpdate"] ?? "-") : "-").padEnd(26) +
    "eventId=" + String(meta["eventId"] ?? "-").slice(0, 20) +
    (meta["updateType"] !== undefined ? "  updateType=" + String(meta["updateType"]) : ""),
  );
}

