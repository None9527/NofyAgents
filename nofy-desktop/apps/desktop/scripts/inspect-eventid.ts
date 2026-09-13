import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const recs = readFileSync(join(here, "..", "..", "..", "docs", "fixtures", "golden-turn.jsonl"), "utf8")
  .trim().split("\n").map((l) => JSON.parse(l) as { t: number; frame: Record<string, unknown> });
const tally = new Map<string, { withId: number; withoutId: number }>();
for (const r of recs) {
  const f = r.frame;
  if (f["kind"] !== "notification") continue;
  const p = (f["params"] ?? {}) as Record<string, unknown>;
  const u = (p["update"] ?? null) as Record<string, unknown> | null;
  const kind = String(f["method"]) + (u && typeof u["sessionUpdate"] === "string" ? "#" + u["sessionUpdate"] : "");
  const meta = (p["_meta"] ?? {}) as Record<string, unknown>;
  const has = typeof meta["eventId"] === "string";
  const e = tally.get(kind) ?? { withId: 0, withoutId: 0 };
  if (has) e.withId++; else e.withoutId++;
  tally.set(kind, e);
}
console.log("");
console.log("══ _meta.eventId 覆盖率（按 method#discriminator）");
for (const [k, v] of [...tally.entries()].sort()) {
  console.log("  " + k.padEnd(52) + " withId=" + String(v.withId).padStart(2) + "  withoutId=" + String(v.withoutId).padStart(2));
}

