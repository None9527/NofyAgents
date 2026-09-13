import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(here, "..", "..", "..", "docs", "fixtures", "golden-turn.jsonl"), "utf8");
const SECRET = /sk-[A-Za-z0-9_-]{8,}|"(api_?key|apiKey|bearer|access_?token|refresh_?token|password|secret)"\s*:/gi;
const m = raw.match(SECRET) ?? [];
const tally = new Map<string, number>();
for (const x of m) {
  // 只显示模式，不显示真值
  const shown = x.startsWith("sk-") ? "sk-<REDACTED-LEN-" + String(x.length) + ">" : x;
  tally.set(shown, (tally.get(shown) ?? 0) + 1);
}
console.log("");
console.log("══ 密钥模式命中（只列模式与次数，不打印真值）");
for (const [k, n] of [...tally.entries()].sort((a, b) => b[1] - a[1])) console.log("  " + String(n).padStart(3) + "  " + k);
console.log("");
const PATHS = /\/Users\/[A-Za-z0-9._-]+|%2FUsers%2F[A-Za-z0-9._%-]+/g;
const pm = raw.match(PATHS) ?? [];
const pt = new Map<string, number>();
for (const x of pm) pt.set(x.slice(0, 40), (pt.get(x.slice(0, 40)) ?? 0) + 1);
console.log("══ 真实路径命中 top");
for (const [k, n] of [...pt.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log("  " + String(n).padStart(4) + "  " + k);
console.log("");
const ID = /"(hostname|agentId|agentInstanceId)"\s*:\s*"[^"]*"/g;
const im = raw.match(ID) ?? [];
console.log("══ 身份字段命中次数:", String(im.length), "（值不打印）");
const T = /"(generated_title|session_summary|title)"\s*:/g;
console.log("══ 标题/摘要字段命中次数:", String((raw.match(T) ?? []).length));

